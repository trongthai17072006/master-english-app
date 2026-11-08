import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { SessionRecord, WordProgressRecord, getLocalDateString } from './learningStorage';
import { VOCAB_DATABASE } from '../data/vocabularyData';
import {
  setActiveAuthUser,
  getActiveAuthUser,
  OWNER_EMAIL
} from '../utils/userStorageScope';

export const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send'
];

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
SCOPES.forEach(scope => provider.addScope(scope));

// Flag to indicate if we are in the middle of a sign-in flow.
let isSigningIn = false;
// Cache the access token strictly in memory (never in localStorage or sessionStorage).
let cachedAccessToken: string | null = null;

// Deduplication set for auto-triggered session emails (prevents StrictMode / re-render duplicate sends)
const emailedSessionIdsMemory = new Set<string>();
const EMAILED_SESSIONS_STORAGE_KEY = 'master_english_emailed_sessions_v1';
const RECIPIENT_EMAIL_STORAGE_KEY = 'master_english_report_recipient_v1';

function hasSessionBeenEmailed(sessionId: string): boolean {
  if (emailedSessionIdsMemory.has(sessionId)) return true;
  try {
    const raw = sessionStorage.getItem(EMAILED_SESSIONS_STORAGE_KEY);
    if (raw) {
      const arr: string[] = JSON.parse(raw);
      return Array.isArray(arr) && arr.includes(sessionId);
    }
  } catch {}
  return false;
}

function markSessionEmailed(sessionId: string): void {
  emailedSessionIdsMemory.add(sessionId);
  try {
    const raw = sessionStorage.getItem(EMAILED_SESSIONS_STORAGE_KEY);
    const arr: string[] = raw ? JSON.parse(raw) : [];
    if (!arr.includes(sessionId)) {
      arr.push(sessionId);
      sessionStorage.setItem(EMAILED_SESSIONS_STORAGE_KEY, JSON.stringify(arr));
    }
  } catch {}
}

export function getSavedRecipientEmail(fallbackEmail = ''): string {
  const activeUserEmail = (
    auth.currentUser?.email ||
    getActiveAuthUser()?.email ||
    fallbackEmail ||
    ''
  )
    .trim()
    .toLowerCase();

  try {
    const saved = localStorage.getItem(RECIPIENT_EMAIL_STORAGE_KEY);
    if (saved && saved.trim()) {
      const cleanSaved = saved.trim().toLowerCase();
      // Never allow a non-owner account to send reports/verification to the owner's email
      if (activeUserEmail && activeUserEmail !== OWNER_EMAIL && cleanSaved === OWNER_EMAIL) {
        return activeUserEmail;
      }
      return saved.trim();
    }
  } catch {}
  return activeUserEmail || fallbackEmail;
}

export function saveRecipientEmail(email: string): void {
  try {
    if (email && email.trim()) {
      localStorage.setItem(RECIPIENT_EMAIL_STORAGE_KEY, email.trim());
    }
  } catch {}
}

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (user.email) {
        setActiveAuthUser({
          id: user.uid,
          email: user.email,
          name: user.displayName || user.email.split('@')[0],
          provider: 'firebase'
        });
      }
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Không lấy được OAuth access token từ Google.');
    }

    cachedAccessToken = credential.accessToken;
    if (result.user.email) {
      setActiveAuthUser({
        id: result.user.uid,
        email: result.user.email,
        name: result.user.displayName || result.user.email.split('@')[0],
        provider: 'firebase'
      });
      saveRecipientEmail(result.user.email);
    }
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const hasActiveGmailToken = (): boolean => {
  return Boolean(cachedAccessToken);
};

export const getCurrentAuthUser = (): User | null => {
  return auth.currentUser;
};

export const subscribeToFirebaseAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

export interface GmailMessageSummary {
  id: string;
  threadId: string;
  snippet: string;
  subject: string;
  from: string;
  date: string;
}

export async function fetchRecentEmails(maxResults = 6): Promise<GmailMessageSummary[]> {
  const token = await getAccessToken();
  if (!token) throw new Error('NO_ACCESS_TOKEN');

  const listRes = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  if (!listRes.ok) {
    throw new Error(`Gmail API error: ${listRes.status}`);
  }

  const listData = await listRes.json();
  const messages = listData.messages || [];

  const details: GmailMessageSummary[] = await Promise.all(
    messages.map(async (m: { id: string; threadId: string }) => {
      const detailRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (!detailRes.ok) {
        return {
          id: m.id,
          threadId: m.threadId,
          snippet: '',
          subject: '(Không có tiêu đề)',
          from: 'Unknown',
          date: ''
        };
      }
      const d = await detailRes.json();
      const headers: { name: string; value: string }[] = d.payload?.headers || [];
      const getHeader = (name: string) =>
        headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';

      return {
        id: d.id,
        threadId: d.threadId,
        snippet: d.snippet || '',
        subject: getHeader('Subject') || '(Không có tiêu đề)',
        from: getHeader('From') || 'Unknown',
        date: getHeader('Date') || ''
      };
    })
  );

  return details;
}

function encodeBase64Url(str: string): string {
  const utf8Bytes = new TextEncoder().encode(str);
  let binary = '';
  utf8Bytes.forEach(b => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function sendStudyReportEmail(
  toEmail: string,
  subject: string,
  htmlContent: string
): Promise<void> {
  const token = await getAccessToken();
  if (!token) throw new Error('NO_ACCESS_TOKEN');

  const encodedSubject = `=?utf-8?B?${btoa(
    Array.from(new TextEncoder().encode(subject), b => String.fromCharCode(b)).join('')
  )}?=`;

  const rawMime = [
    `To: ${toEmail}`,
    `Subject: ${encodedSubject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset="UTF-8"',
    '',
    htmlContent
  ].join('\r\n');

  const raw = encodeBase64Url(rawMime);

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ raw })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Không thể gửi email (${res.status}): ${errText}`);
  }
}

// ============================================================================
// MAGAZINE EDITORIAL HTML EMAIL BUILDER (PHẦN 10 & PHẦN 11)
// ============================================================================

export interface EditorialEmailInput {
  studentName: string;
  targetBand: string;
  customNote?: string;
  latestSession: SessionRecord | null;
  allSessions: SessionRecord[];
  wordProgressMap: Record<string, WordProgressRecord>;
  currentStreak: number;
  bestStreak: number;
  configuredSessionTargetMinutes: number;
}

export function buildMagazineEditorialEmailHtml(input: EditorialEmailInput): string {
  const {
    studentName,
    targetBand,
    customNote,
    latestSession,
    allSessions,
    wordProgressMap,
    currentStreak,
    bestStreak,
    configuredSessionTargetMinutes
  } = input;

  const now = new Date();
  const reportDateFormatted = now.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  // 1. Session summary data (from latestSession if available, otherwise today's summary)
  const sessionDurationSec = latestSession ? latestSession.durationSeconds : 0;
  const sessionMinutes = Math.floor(sessionDurationSec / 60);
  const sessionRemSec = sessionDurationSec % 60;
  const sessionDurationLabel =
    sessionDurationSec > 0 ? `${sessionMinutes} phút ${sessionRemSec} giây` : '0 phút';

  const sessionTargetMin =
    (latestSession && latestSession.targetMinutes) || configuredSessionTargetMinutes || 45;
  const sessionGoalPercent = Math.min(
    100,
    Math.round((sessionDurationSec / Math.max(1, sessionTargetMin * 60)) * 100)
  );

  const startTimeLabel = latestSession
    ? new Date(latestSession.startTime).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    : '--:--';
  const endTimeLabel = latestSession
    ? new Date(latestSession.endTime).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    : '--:--';

  const sessionWordsMastered = latestSession ? latestSession.wordsMastered.length : 0;
  const sessionWordsReviewed = latestSession ? latestSession.wordsReviewed.length : 0;
  const sessionQuizAns = latestSession ? latestSession.quizQuestionsAnswered : 0;
  const sessionQuizCorr = latestSession ? latestSession.quizQuestionsCorrect : 0;
  const sessionQuizLabel =
    sessionQuizAns > 0
      ? `${sessionQuizCorr}/${sessionQuizAns} câu (${Math.round((sessionQuizCorr / sessionQuizAns) * 100)}%)`
      : 'Chưa làm Quiz trong phiên này';

  // 2. 7-Day Mini Chart Data (Real minutes from last 7 calendar days)
  const dayShortNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const sevenDayRows: { label: string; minutes: number; words: number }[] = [];
  let current7DayTotalSec = 0;

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dStr = getLocalDateString(d);
    const matching = allSessions.filter(s => s.dateString === dStr);
    const sec = matching.reduce((acc, s) => acc + s.durationSeconds, 0);
    current7DayTotalSec += sec;
    const mins = Math.round(sec / 60);
    const words = matching.reduce((acc, s) => acc + s.wordsMastered.length, 0);
    sevenDayRows.push({
      label: `${dayShortNames[d.getDay()]} (${d.getDate()}/${d.getMonth() + 1})`,
      minutes: mins,
      words
    });
  }

  const max7DayMinutes = Math.max(...sevenDayRows.map(r => r.minutes), 0);

  // Build QuickChart URL safely (only non-sensitive numbers & day labels) with Vintage Parchment styling
  const chartColors = sevenDayRows.map(r => {
    if (max7DayMinutes === 0 || r.minutes === 0) return '#DCC9A8';
    if (r.minutes === max7DayMinutes) return '#C92532';
    const ratio = r.minutes / max7DayMinutes;
    if (ratio >= 0.65) return '#991D27';
    if (ratio >= 0.3) return '#8A5A19';
    return '#C9B38E';
  });

  const quickChartConfig = {
    type: 'bar',
    data: {
      labels: sevenDayRows.map(r => r.label),
      datasets: [
        {
          label: 'Phút hành văn',
          data: sevenDayRows.map(r => r.minutes),
          backgroundColor: chartColors,
          borderRadius: 2
        }
      ]
    },
    options: {
      legend: { display: false },
      scales: {
        yAxes: [{ ticks: { beginAtZero: true, fontColor: '#51483D' } }],
        xAxes: [{ ticks: { fontColor: '#181614' } }]
      }
    }
  };
  const quickChartUrl = `https://quickchart.io/chart?w=540&h=190&bkg=%23F1E7D3&c=${encodeURIComponent(
    JSON.stringify(quickChartConfig)
  )}`;

  // 3. Period Comparison (Last 7 days vs Previous 7 days [8..14 days ago])
  let prev7DayTotalSec = 0;
  for (let i = 13; i >= 7; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dStr = getLocalDateString(d);
    const matching = allSessions.filter(s => s.dateString === dStr);
    prev7DayTotalSec += matching.reduce((acc, s) => acc + s.durationSeconds, 0);
  }

  let periodComparisonText =
    'Chưa có dữ liệu của 7 kỳ xuất bản liền trước để tính tỷ lệ đối chiếu.';
  let periodComparisonColor = '#51483D';

  if (prev7DayTotalSec > 0) {
    const diffPct = Math.round(((current7DayTotalSec - prev7DayTotalSec) / prev7DayTotalSec) * 100);
    if (diffPct > 0) {
      periodComparisonText = `Tăng +${diffPct}% thời lượng hành văn so với 7 kỳ tuần trước (${Math.round(
        current7DayTotalSec / 60
      )}m so với ${Math.round(prev7DayTotalSec / 60)}m).`;
      periodComparisonColor = '#181614';
    } else if (diffPct < 0) {
      periodComparisonText = `Giảm ${diffPct}% thời lượng hành văn so với 7 kỳ tuần trước (${Math.round(
        current7DayTotalSec / 60
      )}m so với ${Math.round(prev7DayTotalSec / 60)}m).`;
      periodComparisonColor = '#991D27';
    } else {
      periodComparisonText = `Duy trì nhịp độ ổn định (0% biến động) so với 7 kỳ tuần trước (${Math.round(
        current7DayTotalSec / 60
      )}m).`;
      periodComparisonColor = '#181614';
    }
  }

  // 4. Monthly Goal Progress (Configured target: 300 words & 20 hours [1,200 minutes])
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const monthSessions = allSessions.filter(s => {
    const d = new Date(s.startTime);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });

  const monthUniqueWords = new Set<string>();
  monthSessions.forEach(s => s.wordsMastered.forEach(w => monthUniqueWords.add(w)));
  // Also include words mastered in wordProgressMap during this calendar month
  Object.values(wordProgressMap).forEach(rec => {
    if (rec.status === 'mastered' && rec.firstMasteredAt) {
      const d = new Date(rec.firstMasteredAt);
      if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
        monthUniqueWords.add(rec.wordId);
      }
    }
  });

  const monthWordsCount = monthUniqueWords.size;
  const monthWordsTarget = 300;
  const monthWordsPct = Math.min(100, Math.round((monthWordsCount / monthWordsTarget) * 100));

  const monthStudySec = monthSessions.reduce((acc, s) => acc + s.durationSeconds, 0);
  const monthStudyHours = Number((monthStudySec / 3600).toFixed(2));
  const monthHoursTarget = 20;
  const monthHoursPct = Math.min(100, Math.round((monthStudySec / (monthHoursTarget * 3600)) * 100));

  // 5. Chief Editor Insight (Strictly factual based on real data)
  let mascotInsightText =
    'Hãy duy trì ít nhất 1 kỳ xuất bản mỗi ngày để Tòa Soạn tích lũy đủ dữ liệu phân tích nhịp độ hành văn và tốc độ biên mục tư liệu.';
  if (latestSession && sessionDurationSec > 0) {
    if (sessionWordsMastered > 0) {
      const rate = (sessionWordsMastered / Math.max(1, sessionDurationSec / 60)).toFixed(2);
      mascotInsightText = `Trong kỳ phát hành vừa hoàn tất (${sessionDurationLabel}), tác giả đã nạp mới ${sessionWordsMastered} mục từ (tốc độ thực tế: ${rate} từ/phút) và hiệu đính ${sessionWordsReviewed} mục từ.`;
    } else if (sessionQuizAns > 0) {
      mascotInsightText = `Tác giả đã hoàn thành duyệt ${sessionQuizAns} câu hỏi bản thảo với chỉ số chính xác ${Math.round(
        (sessionQuizCorr / sessionQuizAns) * 100
      )}% trong phiên làm việc ${sessionDurationLabel}.`;
    } else {
      mascotInsightText = `Kỳ làm việc kéo dài ${sessionDurationLabel} đã được ghi sổ lưu trữ. Hãy kết hợp biên mục thuật ngữ hoặc duyệt bản thảo để đo tốc độ hành văn.`;
    }
  }

  // 6. Top 3 words due for review from wordProgressMap
  const candidateReviewWords = Object.values(wordProgressMap)
    .filter(w => w.status === 'reviewing' || w.status === 'learning' || w.status === 'mastered')
    .sort((a, b) => {
      // Prioritize 'reviewing' (previously missed in quiz), then oldest lastReviewedAt
      if (a.status === 'reviewing' && b.status !== 'reviewing') return -1;
      if (b.status === 'reviewing' && a.status !== 'reviewing') return 1;
      return (a.lastReviewedAt || 0) - (b.lastReviewedAt || 0);
    })
    .slice(0, 3)
    .map(rec => {
      const dbEntry = VOCAB_DATABASE.find(
        v => v.id === rec.wordId || v.word.toLowerCase() === rec.word.toLowerCase()
      );
      return {
        word: rec.word || dbEntry?.word || rec.wordId,
        ipa: rec.ipa || dbEntry?.ipa || '',
        meaning: rec.meaning || dbEntry?.meaning || 'Thuật ngữ học thuật IELTS trọng tâm',
        statusLabel:
          rec.status === 'reviewing'
            ? 'Cần hiệu đính khẩn (từng sai khi duyệt bản thảo)'
            : `Đã hiệu đính ${rec.timesReviewed} kỳ`
      };
    });

  const html7DayFallbackRows = sevenDayRows
    .map(r => {
      const barWidthPct = max7DayMinutes > 0 ? Math.round((r.minutes / max7DayMinutes) * 100) : 0;
      const isMax = max7DayMinutes > 0 && r.minutes === max7DayMinutes;
      const barColor = isMax ? '#C92532' : r.minutes > 0 ? '#493B2D' : '#DCC9A8';
      return `
        <tr>
          <td style="padding: 6px 8px; font-family: 'JetBrains Mono', Courier, monospace; font-size: 12px; color: ${
            isMax ? '#C92532' : '#51483D'
          }; font-weight: ${isMax ? '700' : '600'}; width: 100px; border-bottom: 1px dotted #C9B38E;">
            ${r.label}
          </td>
          <td style="padding: 6px 8px; border-bottom: 1px dotted #C9B38E;">
            <div style="width: 100%; background-color: #DCC9A8; border: 1px solid #493B2D; height: 10px; overflow: hidden;">
              <div style="width: ${Math.max(
                barWidthPct,
                r.minutes > 0 ? 6 : 0
              )}%; background-color: ${barColor}; height: 10px;"></div>
            </div>
          </td>
          <td style="padding: 6px 8px; font-family: 'JetBrains Mono', Courier, monospace; font-size: 12px; text-align: right; color: #181614; width: 118px; border-bottom: 1px dotted #C9B38E;">
            <strong>${r.minutes} phút</strong> (+${r.words} từ)
          </td>
        </tr>
      `;
    })
    .join('');

  const escapeHtml = (raw: string): string =>
    String(raw ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const safeStudentName = escapeHtml(studentName);
  const safeCustomNote = customNote ? escapeHtml(customNote) : '';

  const reviewWordsHtml =
    candidateReviewWords.length > 0
      ? candidateReviewWords
          .map(
            (w, idx) => `
          <div style="padding: 12px 14px; background-color: #E9DCC2; border: 1px solid #493B2D; border-left: 4px solid #C92532; margin-bottom: 8px;">
            <div style="font-size: 15px; font-weight: 700; color: #181614; font-family: Georgia, 'Times New Roman', serif;">
              ${idx + 1}. ${escapeHtml(w.word)} <span style="font-family: 'JetBrains Mono', Courier, monospace; font-weight: 400; font-size: 12px; color: #51483D;">${escapeHtml(w.ipa)}</span>
            </div>
            <div style="font-size: 13px; color: #2C2520; margin-top: 3px;">${escapeHtml(w.meaning)}</div>
            <div style="font-size: 11px; font-family: 'JetBrains Mono', Courier, monospace; color: #C92532; font-weight: 700; margin-top: 4px; text-transform: uppercase;">Hồ sơ: ${escapeHtml(w.statusLabel)}</div>
          </div>
        `
          )
          .join('')
      : `<div style="padding: 14px; background-color: #E9DCC2; border: 1px dashed #493B2D; font-size: 13px; color: #51483D; text-align: center; font-style: italic;">
          Hiện chưa có mục từ nào trong Sổ Tay Hiệu Đính cần duyệt lại từ dữ liệu thực tế của bạn.
        </div>`;

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>MASTER ENGLISH • OFFICIAL DISPATCH — Bản Tin Kỳ Xuất Bản</title>
</head>
<body style="margin: 0; padding: 0; background-color: #E9DCC2; font-family: Georgia, 'Times New Roman', Times, serif; color: #181614; line-height: 1.6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #E9DCC2; padding: 24px 10px;">
    <tr>
      <td align="center">
        <!-- Outer Newspaper Sheet Frame -->
        <table role="presentation" width="640" cellspacing="0" cellpadding="0" border="0" style="max-width: 640px; width: 100%; background-color: #F1E7D3; border: 2px solid #181614;">
          
          <!-- TOP VINTAGE NEWSPAPER MASTHEAD STRIP -->
          <tr>
            <td style="background-color: #181614; color: #F1E7D3; padding: 8px 22px; border-bottom: 2px solid #C92532;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="font-family: 'JetBrains Mono', Courier, monospace; font-size: 11px; font-weight: 700; letter-spacing: 1.8px; text-transform: uppercase; color: #F1E7D3;">
                    ★ MASTER ENGLISH • OFFICIAL DISPATCH
                  </td>
                  <td align="right" style="font-family: 'JetBrains Mono', Courier, monospace; font-size: 11px; color: #DCC9A8; text-transform: uppercase; letter-spacing: 1px;">
                    THE VINTAGE ACADEMIC GAZETTE
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 1. EDITORIAL FRONT-PAGE HEADER WITH 19TH-CENTURY ENGRAVING PLATE -->
          <tr>
            <td style="background-color: #E9DCC2; border-bottom: 3px double #493B2D; padding: 22px 26px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td valign="top">
                    <div style="font-family: 'JetBrains Mono', Courier, monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #C92532; font-weight: 700;">
                      TÒA SOẠN HỌC THUẬT • ĐIỆN TÍN LƯU TRỮ SỐ PHÁT HÀNH
                    </div>
                    <h1 style="margin: 6px 0 8px 0; font-size: 24px; line-height: 1.18; color: #181614; font-family: Georgia, 'Times New Roman', Times, serif; font-weight: 900; text-transform: uppercase; letter-spacing: 0.4px;">
                      BẢN TIN KỲ XUẤT BẢN — BÁO CÁO BIÊN TẬP
                    </h1>
                    <div style="font-size: 13px; color: #51483D; border-top: 1px solid #493B2D; padding-top: 6px;">
                      Tổng Biên Tập / Nhà Báo: <strong style="color: #181614;">${safeStudentName}</strong> &nbsp;•&nbsp; Ngày phát hành: <strong style="color: #181614;">${reportDateFormatted}</strong>
                    </div>
                  </td>
                  <td align="right" valign="top" style="width: 135px; padding-left: 12px;">
                    <div style="display: inline-block; background-color: #C92532; color: #F1E7D3; border: 2px solid #181614; font-family: 'JetBrains Mono', Courier, monospace; font-size: 11px; font-weight: 700; padding: 5px 10px; text-transform: uppercase; letter-spacing: 1px; text-align: center;">
                      ACADEMIC
                    </div>
                    <div style="margin-top: 6px; border: 1.5px solid #181614; background-color: #F1E7D3; padding: 3px;">
                      <img src="${typeof window !== 'undefined' ? window.location.origin : ''}/assets/engravings/media_1793811857019_aa8b3c02.jpg" alt="Tower Bridge London Engraving" width="112" style="display: block; width: 112px; height: 64px; object-fit: cover;" />
                      <div style="font-family: 'JetBrains Mono', Courier, monospace; font-size: 8px; color: #51483D; text-transform: uppercase; text-align: center; padding-top: 2px;">
                        FIG. I — PRESS DISPATCH
                      </div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BODY CONTENT -->
          <tr>
            <td style="padding: 24px 26px; background-color: #F1E7D3;">
              ${
                safeCustomNote
                  ? `<div style="margin: 0 0 18px 0; font-size: 14px; color: #181614; background-color: #E9DCC2; padding: 12px 16px; border: 1.5px solid #493B2D; border-left: 5px solid #C92532; font-style: italic;">
                      <strong style="font-style: normal; text-transform: uppercase; font-size: 11px; font-family: 'JetBrains Mono', Courier, monospace; color: #C92532; display: block; margin-bottom: 4px;">Lời Dẫn Biên Tập Viên:</strong>
                      ${safeCustomNote}
                    </div>`
                  : ''
              }

              <!-- SEC. 01 • BẢN TÓM TẮT SỐ PHÁT HÀNH -->
              <div style="background-color: #E9DCC2; border: 2px solid #493B2D; padding: 18px 20px; margin-bottom: 20px;">
                <div style="font-family: 'JetBrains Mono', Courier, monospace; font-size: 12px; text-transform: uppercase; color: #C92532; font-weight: 700; letter-spacing: 1px; border-bottom: 1.5px solid #493B2D; padding-bottom: 6px; margin-bottom: 12px;">
                  SEC. 01 • BẢN TÓM TẮT SỐ PHÁT HÀNH
                </div>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size: 14px; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 6px 0; color: #51483D; border-bottom: 1px dotted #C9B38E;">Thời Lượng Hành Văn:</td>
                    <td style="padding: 6px 0; text-align: right; font-weight: 700; color: #C92532; font-family: 'JetBrains Mono', Courier, monospace; border-bottom: 1px dotted #C9B38E;">${sessionDurationLabel}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #51483D; border-bottom: 1px dotted #C9B38E;">Khung Giờ Phát Sóng / Ghi Sổ:</td>
                    <td style="padding: 6px 0; text-align: right; color: #181614; font-family: 'JetBrains Mono', Courier, monospace; font-weight: 600; border-bottom: 1px dotted #C9B38E;">${startTimeLabel} — ${endTimeLabel}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #51483D; border-bottom: 1px dotted #C9B38E;">Tư Liệu Nạp Mới / Hiệu Đính:</td>
                    <td style="padding: 6px 0; text-align: right; color: #181614; font-weight: 700; border-bottom: 1px dotted #C9B38E;">+${sessionWordsMastered} mục từ mới • ${sessionWordsReviewed} lượt hiệu đính</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #51483D; border-bottom: 1px dotted #C9B38E;">Chỉ Số Duyệt Bản Thảo:</td>
                    <td style="padding: 6px 0; text-align: right; color: #181614; font-weight: 600; border-bottom: 1px dotted #C9B38E;">${sessionQuizLabel}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #51483D;">Chuỗi Kỳ Xuất Bản Liên Tiếp:</td>
                    <td style="padding: 6px 0; text-align: right; color: #C92532; font-weight: 700;">★ ${currentStreak} kỳ liên tiếp (Kỷ lục: ${Math.max(
                      bestStreak,
                      currentStreak
                    )} kỳ)</td>
                  </tr>
                </table>

                <!-- Horizontal Bar for Session Duration vs Target -->
                <div style="margin-top: 14px; padding-top: 12px; border-top: 1.5px dashed #493B2D;">
                  <div style="font-size: 12px; color: #51483D; margin-bottom: 6px; font-family: 'JetBrains Mono', Courier, monospace;">
                    Tiến Độ Hoàn Thành Bản Thảo: <strong style="color: #181614;">${sessionMinutes}/${sessionTargetMin} phút (${sessionGoalPercent}%)</strong>
                  </div>
                  <div style="width: 100%; background-color: #DCC9A8; border: 1px solid #181614; height: 12px; overflow: hidden;">
                    <div style="width: ${Math.max(
                      sessionGoalPercent,
                      sessionDurationSec > 0 ? 4 : 0
                    )}%; background-color: #C92532; height: 12px;"></div>
                  </div>
                </div>
              </div>

              <!-- SEC. 02 • NHỊP ĐỘ 7 KỲ XUẤT BẢN & ĐỐI CHIẾU -->
              <div style="background-color: #F1E7D3; border: 2px solid #493B2D; padding: 18px 20px; margin-bottom: 20px;">
                <div style="font-family: 'JetBrains Mono', Courier, monospace; font-size: 12px; text-transform: uppercase; color: #C92532; font-weight: 700; letter-spacing: 1px; border-bottom: 1.5px solid #493B2D; padding-bottom: 6px; margin-bottom: 8px;">
                  SEC. 02 • NHỊP ĐỘ 7 KỲ XUẤT BẢN QUA &amp; ĐỐI CHIẾU KỲ TRƯỚC
                </div>
                <div style="font-size: 13px; color: ${periodComparisonColor}; margin-bottom: 12px; font-weight: 700; font-style: italic;">
                  ${periodComparisonText}
                </div>

                <!-- QuickChart Image printed onto aged parchment -->
                <div style="text-align: center; margin-bottom: 12px; background-color: #E9DCC2; border: 1px solid #493B2D; padding: 8px;">
                  <img src="${quickChartUrl}" alt="Biểu đồ 7 kỳ xuất bản qua" width="520" style="max-width: 100%; height: auto; display: block; margin: 0 auto;" />
                </div>

                <!-- Always-visible HTML/CSS Table Bar Chart -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse;">
                  ${html7DayFallbackRows}
                </table>
              </div>

              <!-- SEC. 03 • ĐỊNH MỨC ẤN BẢN THÁNG -->
              <div style="background-color: #E9DCC2; border: 2px solid #493B2D; padding: 18px 20px; margin-bottom: 20px;">
                <div style="font-family: 'JetBrains Mono', Courier, monospace; font-size: 12px; text-transform: uppercase; color: #C92532; font-weight: 700; letter-spacing: 1px; border-bottom: 1.5px solid #493B2D; padding-bottom: 6px; margin-bottom: 6px;">
                  SEC. 03 • CHỈ TIÊU ẤN BẢN THÁNG ${now.getMonth() + 1}/${now.getFullYear()}
                </div>
                <p style="margin: 0 0 12px 0; font-size: 12px; color: #51483D; font-style: italic;">
                  Đo lường khối lượng tư liệu tích lũy trong tháng so với định mức tòa soạn (300 mục từ &amp; 20 giờ hành văn).
                </p>

                <div style="margin-bottom: 12px;">
                  <div style="font-size: 13px; color: #181614; margin-bottom: 5px; font-family: 'JetBrains Mono', Courier, monospace;">
                    ✒️ Tư Liệu Đã Biên Mục Trong Tháng: <strong>${monthWordsCount} / ${monthWordsTarget} mục từ (${monthWordsPct}%)</strong>
                  </div>
                  <div style="width: 100%; background-color: #DCC9A8; border: 1px solid #181614; height: 10px; overflow: hidden;">
                    <div style="width: ${Math.max(
                      monthWordsPct,
                      monthWordsCount > 0 ? 3 : 0
                    )}%; background-color: #181614; height: 10px;"></div>
                  </div>
                </div>

                <div>
                  <div style="font-size: 13px; color: #181614; margin-bottom: 5px; font-family: 'JetBrains Mono', Courier, monospace;">
                    ⏳ Thời Lượng Hành Văn Trong Tháng: <strong>${monthStudyHours} / ${monthHoursTarget} giờ (${monthHoursPct}%)</strong>
                  </div>
                  <div style="width: 100%; background-color: #DCC9A8; border: 1px solid #181614; height: 10px; overflow: hidden;">
                    <div style="width: ${Math.max(
                      monthHoursPct,
                      monthStudySec > 0 ? 3 : 0
                    )}%; background-color: #C92532; height: 10px;"></div>
                  </div>
                </div>
              </div>

              <!-- SEC. 04 • LỜI BÌNH CHỦ BÚT -->
              <div style="background-color: #DCC9A8; border: 2px solid #181614; border-left: 6px solid #C92532; padding: 16px 20px; margin-bottom: 20px;">
                <div style="font-family: 'JetBrains Mono', Courier, monospace; font-size: 11px; text-transform: uppercase; color: #C92532; font-weight: 700; letter-spacing: 1px; margin-bottom: 4px;">
                  SEC. 04 • LỜI BÌNH CHỦ BÚT (THẨM ĐỊNH SỐ LIỆU THỰC TẾ)
                </div>
                <div style="font-size: 14px; color: #181614; font-style: italic;">
                  “${mascotInsightText}”
                </div>
              </div>

              <!-- SEC. 05 • MỤC TỪ TRỌNG TÂM CẦN HIỆU ĐÍNH -->
              <div style="background-color: #F1E7D3; border: 2px solid #493B2D; padding: 18px 20px;">
                <div style="font-family: 'JetBrains Mono', Courier, monospace; font-size: 12px; text-transform: uppercase; color: #C92532; font-weight: 700; letter-spacing: 1px; border-bottom: 1.5px solid #493B2D; padding-bottom: 6px; margin-bottom: 12px;">
                  SEC. 05 • MỤC TỪ TRỌNG TÂM CẦN HIỆU ĐÍNH (TỪ SỔ TAY LƯU TRỮ)
                </div>
                ${reviewWordsHtml}
              </div>

            </td>
          </tr>

          <!-- VINTAGE COLOPHON FOOTER -->
          <tr>
            <td style="background-color: #DCC9A8; border-top: 2px solid #181614; padding: 16px 26px; text-align: center; font-size: 12px; color: #51483D;">
              <div style="font-family: 'JetBrains Mono', Courier, monospace; font-size: 11px; font-weight: 700; color: #181614; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 4px;">
                MASTER ENGLISH • TÒA SOẠN BÁO CHÍ HỌC THUẬT CỔ ĐIỂN
              </div>
              Bản tin được tổng hợp từ 100% dữ liệu hành văn thực tế trên hệ thống <strong>MASTER English</strong>.<br/>
              <span style="font-style: italic; color: #181614;">“Better Me. Everyday.”</span>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export interface AutoEmailResult {
  status: 'sent' | 'needs_auth' | 'failed' | 'duplicate_skipped';
  message: string;
  toEmail: string;
  subject: string;
  htmlBody: string;
}

/**
 * Automatically triggers the Magazine Editorial Email report exactly once when a session completes.
 * Never fabricates success if Gmail OAuth token is not active or if the API call fails.
 */
export async function triggerPostSessionAutoEmail(
  input: EditorialEmailInput & { recipientEmail: string }
): Promise<AutoEmailResult> {
  const sessionId = input.latestSession?.id || `manual_${Date.now()}`;
  const toEmail = getSavedRecipientEmail(input.recipientEmail);
  const dateLabel = new Date().toLocaleDateString('vi-VN');
  const subject = `[MASTER ENGLISH • DISPATCH] Bản Tin Kỳ Xuất Bản Ngày ${dateLabel} (${
    input.latestSession ? Math.max(1, Math.round(input.latestSession.durationSeconds / 60)) : 0
  } phút hành văn)`;
  const htmlBody = buildMagazineEditorialEmailHtml(input);

  if (input.latestSession && hasSessionBeenEmailed(sessionId)) {
    return {
      status: 'duplicate_skipped',
      message: 'Báo cáo của phiên học này đã được gửi trước đó.',
      toEmail,
      subject,
      htmlBody
    };
  }

  if (!toEmail) {
    return {
      status: 'failed',
      message:
        'Phiên học đã lưu thành công, nhưng chưa có địa chỉ email người nhận trong Hồ sơ.',
      toEmail: '',
      subject,
      htmlBody
    };
  }

  if (!hasActiveGmailToken()) {
    return {
      status: 'needs_auth',
      message: 'Đã lưu phiên học thành công!',
      toEmail,
      subject,
      htmlBody
    };
  }

  try {
    await sendStudyReportEmail(toEmail, subject, htmlBody);
    if (input.latestSession) {
      markSessionEmailed(sessionId);
    }
    return {
      status: 'sent',
      message: 'Phiên học đã lưu thành công! Báo cáo chi tiết đã được gửi về email của bạn.',
      toEmail,
      subject,
      htmlBody
    };
  } catch (err: any) {
    return {
      status: 'failed',
      message: `Phiên học đã lưu, nhưng gửi email tự động thất bại: ${
        err?.message || 'Lỗi kết nối Gmail API'
      }`,
      toEmail,
      subject,
      htmlBody
    };
  }
}
