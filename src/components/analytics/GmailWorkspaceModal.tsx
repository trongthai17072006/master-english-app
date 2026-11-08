import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Mail, Send, Inbox, RefreshCw, CheckCircle2, AlertTriangle, LogOut, Sparkles, Eye
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logout,
  fetchRecentEmails,
  sendStudyReportEmail,
  buildMagazineEditorialEmailHtml,
  getSavedRecipientEmail,
  saveRecipientEmail,
  GmailMessageSummary
} from '../../services/gmailService';
import { useAnalytics } from '../../context/AnalyticsContext';

interface GmailWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportSummary: {
    periodLabel: string;
    studyTimeFormatted: string;
    sessionsCount: number;
    wordsMasteredCount: number;
    quizAccuracy: string;
    efficiency: string;
    streak: number;
  };
  isDarkMode?: boolean;
}

export const GmailWorkspaceModal: React.FC<GmailWorkspaceModalProps> = ({
  isOpen,
  onClose,
  reportSummary
}) => {
  const {
    completedSessions,
    wordProgressMap,
    realStreak,
    bestStreak,
    lastCompletedSession,
    userProfile,
    lastEmailReportStatus,
    isAutoSendingEmail,
    retryLastSessionEmail,
    showToast
  } = useAnalytics();

  const [needsAuth, setNeedsAuth] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'send-report' | 'preview' | 'inbox'>('send-report');

  // Email sending state
  const [recipientEmail, setRecipientEmail] = useState<string>(() =>
    getSavedRecipientEmail(userProfile.email || '')
  );
  const [emailSubject, setEmailSubject] = useState<string>(
    `[MASTER ENGLISH • DISPATCH] Bản Tin Kỳ Xuất Bản — Báo Cáo Biên Tập (${reportSummary.periodLabel})`
  );
  const [customNote, setCustomNote] = useState<string>(
    'Bản tin tổng hợp 100% số liệu hành văn và biên mục thực nghiệm từ Tòa Soạn Học Thuật MASTER English.'
  );
  const [showConfirmSendModal, setShowConfirmSendModal] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sendSuccess, setSendSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Inbox state
  const [emails, setEmails] = useState<GmailMessageSummary[]>([]);
  const [isLoadingEmails, setIsLoadingEmails] = useState<boolean>(false);

  useEffect(() => {
    setEmailSubject(
      `[MASTER ENGLISH • DISPATCH] Bản Tin Kỳ Xuất Bản — Báo Cáo Biên Tập (${reportSummary.periodLabel})`
    );
  }, [reportSummary.periodLabel]);

  useEffect(() => {
    if (!recipientEmail && userProfile.email) {
      setRecipientEmail(getSavedRecipientEmail(userProfile.email));
    }
  }, [userProfile.email, recipientEmail]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    const unsubscribe = initAuth(
      (authedUser) => {
        setUser(authedUser);
        setNeedsAuth(false);
        if (!recipientEmail && authedUser.email) {
          setRecipientEmail(authedUser.email);
          saveRecipientEmail(authedUser.email);
        }
      },
      () => {
        setUser(null);
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  // Build Vintage Newspaper Editorial HTML Preview from real data
  const editorialHtmlPreview = useMemo(() => {
    const targetSession = lastCompletedSession || completedSessions[0] || null;
    return buildMagazineEditorialEmailHtml({
      studentName: userProfile.name || 'Nhà Báo MASTER English',
      targetBand: userProfile.targetBand || 'BAND 7.0+',
      customNote,
      latestSession: targetSession,
      allSessions: completedSessions,
      wordProgressMap,
      currentStreak: realStreak,
      bestStreak,
      configuredSessionTargetMinutes: userProfile.dailyStudyMinutesGoal || 45
    });
  }, [
    lastCompletedSession,
    completedSessions,
    wordProgressMap,
    realStreak,
    bestStreak,
    userProfile,
    customNote
  ]);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setErrorMsg(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setNeedsAuth(false);
        if (result.user.email) {
          setRecipientEmail(result.user.email);
          saveRecipientEmail(result.user.email);
        }
        // If there was a pending post-session auto-email waiting for OAuth, trigger retry automatically!
        if (lastEmailReportStatus?.status === 'needs_auth') {
          await retryLastSessionEmail();
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Đăng nhập Google không thành công. Vui lòng thử lại.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLoadInbox = async () => {
    setIsLoadingEmails(true);
    setErrorMsg(null);
    try {
      const list = await fetchRecentEmails(6);
      setEmails(list);
    } catch (err: any) {
      if (err?.message === 'NO_ACCESS_TOKEN') {
        setNeedsAuth(true);
      } else {
        setErrorMsg('Không thể tải hộp thư Gmail. Vui lòng kiểm tra quyền truy cập.');
      }
    } finally {
      setIsLoadingEmails(false);
    }
  };

  useEffect(() => {
    if (isOpen && !needsAuth && activeTab === 'inbox') {
      handleLoadInbox();
    }
  }, [isOpen, needsAuth, activeTab]);

  const handleRequestSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail.trim()) {
      setErrorMsg('Vui lòng nhập địa chỉ email người nhận.');
      return;
    }
    saveRecipientEmail(recipientEmail.trim());
    setErrorMsg(null);
    setShowConfirmSendModal(true);
  };

  const handleConfirmedSendEmail = async () => {
    setShowConfirmSendModal(false);
    setIsSending(true);
    setErrorMsg(null);
    setSendSuccess(false);

    try {
      saveRecipientEmail(recipientEmail.trim());
      await sendStudyReportEmail(recipientEmail.trim(), emailSubject.trim(), editorialHtmlPreview);
      setSendSuccess(true);
      showToast('Phiên học đã lưu thành công! Báo cáo chi tiết đã được gửi về email của bạn.');
      setTimeout(() => setSendSuccess(false), 5000);
    } catch (err: any) {
      if (err?.message === 'NO_ACCESS_TOKEN') {
        setNeedsAuth(true);
        setErrorMsg('Phiên OAuth Gmail đã hết hạn hoặc chưa kết nối. Vui lòng đăng nhập Google để gửi.');
      } else {
        setErrorMsg(err?.message || 'Gửi email thất bại. Vui lòng thử lại.');
      }
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#181614]/65 backdrop-blur-xs"
        />

        {/* Modal Container in Vintage Newspaper Editorial */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="relative w-full max-w-3xl rounded-[2px] border-2 border-[#181614] bg-[#E9DCC2] text-[#181614] shadow-[8px_8px_0_rgba(24,22,20,0.4)] overflow-hidden z-10"
        >
          {/* Header — Synchronized with Editorial Email Dispatch */}
          <div className="relative p-5 sm:p-6 bg-[#F1E7D3] border-b-2 border-[#493B2D] flex items-center justify-between gap-4 overflow-hidden">
            <div
              className="pointer-events-none select-none absolute right-0 top-0 bottom-0 w-[42%] overflow-hidden z-0"
              style={{
                WebkitMaskImage:
                  'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.45) 22%, black 42%, black 100%)',
                maskImage:
                  'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.45) 22%, black 42%, black 100%)',
              }}
            >
              <img
                src="/assets/engravings/media_1793811857019_aa8b3c02.jpg"
                alt="Tower Bridge London Engraving"
                className="w-full h-full object-cover object-center mix-blend-multiply opacity-85"
                style={{ filter: 'contrast(1.12) sepia(0.14)' }}
              />
            </div>

            <div className="relative z-10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-[2px] bg-[#C92532] border border-[#181614] flex items-center justify-center text-[#F1E7D3] shadow-[2px_2px_0px_#181614] shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono uppercase tracking-[0.18em] font-bold text-[#C92532]">
                    MASTER ENGLISH • OFFICIAL DISPATCH
                  </span>
                  <span className="px-1.5 py-0.5 bg-[#181614] text-[#F1E7D3] font-mono text-[10px] font-bold uppercase tracking-wider">
                    ACADEMIC
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-serif font-extrabold text-[#181614] uppercase tracking-tight">
                  Bản Tin Kỳ Xuất Bản — Báo Cáo Biên Tập (Gmail)
                </h2>
                <p className="text-xs text-[#51483D]">
                  Tự động tổng hợp và phát hành công văn HTML Báo Chí Cổ Điển sau mỗi kỳ làm việc hoàn tất.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng cửa sổ"
              className="relative z-10 p-2 rounded-[2px] border border-[#181614] bg-[#E9DCC2] text-[#181614] hover:bg-[#C92532] hover:text-[#F1E7D3] transition-colors cursor-pointer shadow-[2px_2px_0px_#181614]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 sm:p-6 space-y-5 max-h-[82vh] overflow-y-auto">
            {/* Auto-trigger status notice if present */}
            {lastEmailReportStatus && (
              <div
                className={`p-3.5 rounded-[2px] border text-xs flex flex-wrap items-center justify-between gap-3 ${
                  lastEmailReportStatus.status === 'sent'
                    ? 'bg-[#DCE6D5] border-[#2E5A36] text-[#2E5A36]'
                    : 'bg-[#DCC9A8] border-[#991D27] text-[#991D27]'
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {lastEmailReportStatus.status === 'sent' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{lastEmailReportStatus.message}</span>
                </div>
                {lastEmailReportStatus.status !== 'sent' && !needsAuth && (
                  <button
                    type="button"
                    disabled={isAutoSendingEmail}
                    onClick={() => void retryLastSessionEmail()}
                    className="px-3 py-1.5 rounded-[2px] bg-[#C92532] border border-[#181614] text-[#F1E7D3] font-bold text-xs cursor-pointer hover:bg-[#991D27]"
                  >
                    {isAutoSendingEmail ? 'Đang gửi lại...' : 'Thử Gửi Lại Ngay'}
                  </button>
                )}
              </div>
            )}

            {errorMsg && (
              <div className="p-3.5 rounded-[2px] bg-[#E8B7AC]/50 border border-[#991D27] text-xs text-[#991D27] font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-[2px] bg-[#DCC9A8] border border-[#493B2D]">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setActiveTab('send-report')}
                  className={`px-3.5 py-1.5 rounded-[2px] border text-xs font-mono uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'send-report'
                      ? 'bg-[#C92532] text-[#F1E7D3] border-[#181614]'
                      : 'bg-[#F1E7D3] text-[#51483D] border-[#493B2D] hover:bg-[#E9DCC2]'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Cấu Hình &amp; Phát Hành Bản Tin</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-3.5 py-1.5 rounded-[2px] border text-xs font-mono uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'preview'
                      ? 'bg-[#C92532] text-[#F1E7D3] border-[#181614]'
                      : 'bg-[#F1E7D3] text-[#51483D] border-[#493B2D] hover:bg-[#E9DCC2]'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Xem Trước Bản Tin Báo Chí</span>
                </button>
                {!needsAuth && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('inbox')}
                    className={`px-3.5 py-1.5 rounded-[2px] border text-xs font-mono uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'inbox'
                        ? 'bg-[#C92532] text-[#F1E7D3] border-[#181614]'
                        : 'bg-[#F1E7D3] text-[#51483D] border-[#493B2D] hover:bg-[#E9DCC2]'
                    }`}
                  >
                    <Inbox className="w-3.5 h-3.5" />
                    <span>Hộp Thư Gần Đây</span>
                  </button>
                )}
              </div>

              {!needsAuth && user && (
                <div className="flex items-center gap-2 text-xs pr-2">
                  <span className="w-2 h-2 rounded-full bg-[#2E5A36]" />
                  <span className="text-[#181614] font-mono font-bold text-[11px]">{user.email}</span>
                  <button
                    type="button"
                    onClick={async () => {
                      await logout();
                      setNeedsAuth(true);
                    }}
                    className="p-1 text-[#51483D] hover:text-[#C92532] cursor-pointer"
                    title="Đăng xuất Gmail"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {activeTab === 'preview' ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[#51483D] px-1">
                  <span>
                    Bản xem trước trực tiếp mẫu <strong>BẢN TIN KỲ XUẤT BẢN — BÁO CÁO BIÊN TẬP</strong> (HTML inline CSS chuẩn Gmail):
                  </span>
                </div>
                <div
                  className="rounded-[2px] border-2 border-[#493B2D] bg-[#E9DCC2] p-3 max-h-[55vh] overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: editorialHtmlPreview }}
                />
              </div>
            ) : needsAuth ? (
              <div className="p-6 sm:p-8 rounded-[2px] bg-[#F1E7D3] border-2 border-[#493B2D] text-center space-y-4">
                <div className="w-14 h-14 rounded-[2px] bg-[#C92532] border border-[#181614] text-[#F1E7D3] flex items-center justify-center mx-auto shadow-[2px_2px_0px_#181614]">
                  <Mail className="w-7 h-7" />
                </div>
                <div className="space-y-1.5 max-w-lg mx-auto">
                  <h3 className="text-lg font-serif font-extrabold text-[#181614]">
                    Cấu Hình Nhận Bản Tin Tự Động &amp; Kết Nối Gmail OAuth
                  </h3>
                  <p className="text-xs text-[#51483D] leading-relaxed">
                    Sau khi bạn đăng nhập Google và cấp quyền Gmail API (chỉ lưu token trong bộ nhớ phiên làm việc để bảo mật tuyệt đối), mỗi khi kết thúc phiên làm việc trên đồng hồ Tòa Soạn, hệ thống sẽ <strong>tự động gửi Bản Tin Kỳ Xuất Bản</strong> về địa chỉ email bên dưới.
                  </p>
                </div>

                {/* Allow saving recipient email address even before OAuth */}
                <div className="max-w-md mx-auto text-left space-y-1.5 pt-2">
                  <label className="block text-xs font-mono uppercase tracking-wider font-bold text-[#181614]">
                    Địa chỉ Email nhận bản tin tự động sau mỗi kỳ xuất bản:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={recipientEmail}
                      onChange={e => {
                        setRecipientEmail(e.target.value);
                        saveRecipientEmail(e.target.value);
                      }}
                      placeholder={userProfile.email || "hocvien@gmail.com"}
                      className="flex-1 px-3.5 py-2 rounded-[2px] border border-[#493B2D] bg-[#E9DCC2] text-xs text-[#181614] focus:outline-none focus:border-[#C92532]"
                    />
                  </div>
                </div>

                <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isLoggingIn}
                    className="gsi-material-button"
                  >
                    <div className="gsi-material-button-state"></div>
                    <div className="gsi-material-button-content-wrapper">
                      <div className="gsi-material-button-icon">
                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                          <path fill="none" d="M0 0h48v48H0z"></path>
                        </svg>
                      </div>
                      <span className="gsi-material-button-contents">
                        {isLoggingIn ? 'Đang kết nối...' : 'Sign in with Google'}
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className="px-4 py-2 rounded-[2px] bg-[#E9DCC2] hover:bg-[#DCC9A8] border border-[#493B2D] text-xs font-mono uppercase tracking-wider font-bold text-[#181614] flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#C92532]" />
                    <span>Xem Trước Nội Dung Bản Tin</span>
                  </button>
                </div>
              </div>
            ) : activeTab === 'send-report' ? (
              <form onSubmit={handleRequestSend} className="space-y-4 bg-[#F1E7D3] p-5 rounded-[2px] border border-[#493B2D]">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider font-bold text-[#181614] mb-1">
                    Email nhận Bản Tin Kỳ Xuất Bản (tự động &amp; thủ công)
                  </label>
                  <input
                    type="email"
                    required
                    value={recipientEmail}
                    onChange={e => {
                      setRecipientEmail(e.target.value);
                      saveRecipientEmail(e.target.value);
                    }}
                    placeholder="nhap-email@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-[2px] border border-[#493B2D] bg-[#E9DCC2] text-xs text-[#181614] focus:outline-none focus:border-[#C92532]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider font-bold text-[#181614] mb-1">
                    Tiêu đề Công Văn / Email
                  </label>
                  <input
                    type="text"
                    required
                    value={emailSubject}
                    onChange={e => setEmailSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-[2px] border border-[#493B2D] bg-[#E9DCC2] text-xs text-[#181614] focus:outline-none focus:border-[#C92532]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider font-bold text-[#181614] mb-1">
                    Lời dẫn Biên Tập Viên đính kèm đầu trang báo cáo
                  </label>
                  <textarea
                    rows={2}
                    value={customNote}
                    onChange={e => setCustomNote(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-[2px] border border-[#493B2D] bg-[#E9DCC2] text-xs text-[#181614] focus:outline-none focus:border-[#C92532]"
                  />
                </div>

                {/* Preview Summary Box */}
                <div className="p-3.5 rounded-[2px] bg-[#E9DCC2] border-2 border-[#493B2D] text-xs space-y-1.5">
                  <div className="font-bold text-[#C92532] flex items-center justify-between border-b border-[#493B2D]/40 pb-1.5">
                    <span className="flex items-center gap-1.5 font-mono uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" /> SEC. 01 • Bản Tóm Tắt Số Phát Hành ({reportSummary.periodLabel}):
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('preview')}
                      className="text-[11px] underline text-[#C92532] font-bold cursor-pointer"
                    >
                      Mở xem trước Bản Tin HTML
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] text-[#51483D] font-mono">
                    <div>⏱️ Thời Lượng Hành Văn: <strong className="text-[#181614]">{reportSummary.studyTimeFormatted}</strong></div>
                    <div>✒️ Tư Liệu Nạp Mới / Hiệu Đính: <strong className="text-[#181614]">+{reportSummary.wordsMasteredCount} mục từ</strong></div>
                    <div>🎯 Chỉ Số Duyệt Bản Thảo: <strong className="text-[#181614]">{reportSummary.quizAccuracy}</strong></div>
                    <div>★ Chuỗi Kỳ Xuất Bản Liên Tiếp: <strong className="text-[#C92532]">{reportSummary.streak} kỳ</strong></div>
                  </div>
                </div>

                {sendSuccess && (
                  <div className="p-3 rounded-[2px] bg-[#DCE6D5] border border-[#2E5A36] text-[#2E5A36] text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Kỳ xuất bản đã lưu thành công! Bản tin chi tiết đã được gửi về email của bạn.</span>
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={isSending}
                    className="px-5 py-2.5 rounded-[2px] bg-[#C92532] hover:bg-[#991D27] border-2 border-[#181614] shadow-[2px_2px_0px_#181614] text-[#F1E7D3] text-xs font-mono uppercase tracking-wider font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSending ? 'Đang phát hành...' : 'Phát Hành Bản Tin Qua Gmail'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3 bg-[#F1E7D3] p-5 rounded-[2px] border border-[#493B2D]">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#796B59]">
                    6 Email Gần Nhất Trong Hộp Thư
                  </h4>
                  <button
                    type="button"
                    onClick={handleLoadInbox}
                    disabled={isLoadingEmails}
                    className="text-xs font-mono font-bold text-[#C92532] flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingEmails ? 'animate-spin' : ''}`} />
                    <span>Làm mới</span>
                  </button>
                </div>

                {isLoadingEmails ? (
                  <div className="py-8 text-center text-xs text-[#796B59] italic font-serif">
                    Đang tải danh sách email từ Gmail...
                  </div>
                ) : emails.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#796B59] italic font-serif">
                    Không tìm thấy email nào trong hộp thư.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {emails.map(msg => (
                      <div
                        key={msg.id}
                        className="p-3 rounded-[2px] bg-[#E9DCC2] border border-[#493B2D] text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-serif font-extrabold text-[#181614] truncate">
                            {msg.subject}
                          </span>
                          <span className="font-mono text-[10px] text-[#796B59] shrink-0">
                            {msg.date ? new Date(msg.date).toLocaleDateString('vi-VN') : ''}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-[#C92532] truncate">{msg.from}</div>
                        <p className="text-[11px] text-[#51483D] line-clamp-1">
                          {msg.snippet}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mandatory Confirmation Modal before manual sending */}
          <AnimatePresence>
            {showConfirmSendModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[#181614]/65 backdrop-blur-xs flex items-center justify-center p-4 z-30"
              >
                <div className="bg-[#F1E7D3] border-2 border-[#181614] rounded-[2px] p-6 max-w-md w-full space-y-4 shadow-[6px_6px_0_rgba(24,22,20,0.4)]">
                  <h3 className="text-base font-serif font-extrabold text-[#181614]">
                    Xác nhận gửi Báo cáo Magazine Editorial qua Gmail?
                  </h3>
                  <p className="text-xs text-[#51483D] leading-relaxed">
                    Hệ thống sẽ gửi email HTML định dạng Magazine Editorial từ tài khoản <strong>{user?.email}</strong> tới địa chỉ{' '}
                    <strong>{recipientEmail}</strong> với tiêu đề:
                    <br />
                    <span className="italic font-serif text-[#C92532]">"{emailSubject}"</span>
                  </p>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowConfirmSendModal(false)}
                      className="px-4 py-2 rounded-[2px] border border-[#493B2D] bg-[#E9DCC2] text-xs font-mono uppercase tracking-wider font-bold text-[#51483D] hover:bg-[#DCC9A8] cursor-pointer"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmedSendEmail}
                      className="px-4 py-2 rounded-[2px] bg-[#C92532] hover:bg-[#991D27] border border-[#181614] text-[#F1E7D3] text-xs font-mono uppercase tracking-wider font-bold cursor-pointer"
                    >
                      Xác nhận gửi
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
