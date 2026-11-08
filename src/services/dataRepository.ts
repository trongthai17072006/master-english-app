import { User } from '@supabase/supabase-js';
import {
  getSupabaseClient,
  getSupabaseConfigStatus,
  isSupabaseConfigured,
  SupabaseConfigStatus
} from './supabaseClient';
import {
  SessionRecord,
  ActiveSessionState,
  WordProgressRecord,
  STORAGE_KEYS as LEARNING_KEYS
} from './learningStorage';
import { MistakeRecord, UserStats } from '../utils/storage';
import {
  ChallengeProgressData,
  DayCompletionStatus,
  WritingSubmissionRecord
} from '../utils/challengeStorage';
import { deepNormalizeText } from '../utils/textNormalization';
import { getActiveAuthUser, setActiveAuthUser } from '../utils/userStorageScope';

/**
 * MASTER ENGLISH IELTS — DATA REPOSITORY & 2-WAY CLOUD SYNC SERVICE (PHASE 4)
 *
 * Cơ chế hoạt động Giai đoạn 4:
 * 1. Dual-Write (Local-First + Cloud Write-Through):
 *    - Mọi thao tác học tập đều ghi tức thì (0ms) vào các khóa localStorage hiện có.
 *    - Đồng thời đẩy bất đồng bộ lên Supabase Cloud (nếu đã đăng nhập) hoặc xếp vào
 *      hàng đợi ngoại tuyến `master_english_pending_sync_v1`.
 * 2. Two-Way Non-Destructive Merge (`syncAllDataWithCloud`):
 *    - Kéo (Pull) toàn bộ dữ liệu từ 8 bảng Supabase của `auth.uid()`.
 *    - Hợp nhất (Merge) thông minh với dữ liệu trên trình duyệt theo ID ổn định,
 *      timestamp mới nhất và giá trị lũy kế cao nhất (tuyệt đối không làm mất phiên học,
 *      từ vựng SRS, lỗi sai hay bài viết 60 ngày).
 *    - Lưu bản hợp nhất vào localStorage, phát sự kiện `master-english-cloud-synced`
 *      để cập nhật UI tức thì, và đẩy (Push) bản hợp nhất hoàn chỉnh lên Cloud.
 * 3. Tự động đồng bộ khi đăng nhập, khi có mạng trở lại (`online`), và khi chuyển đổi
 *    giữa các thiết bị / tab (`visibilitychange`).
 */

export type RepositoryAuthState = 'local_mode' | 'unauthenticated' | 'authenticated';
export type RepositorySyncStatus =
  | 'local_only'
  | 'idle'
  | 'checking'
  | 'syncing'
  | 'synced'
  | 'offline_pending'
  | 'error';

export interface PendingSyncMutation {
  id: string;
  entity:
    | 'user_profile'
    | 'study_session'
    | 'active_session'
    | 'word_progress'
    | 'mistakes_notebook'
    | 'user_stats'
    | 'challenge_60'
    | 'workspace_todos';
  recordId: string;
  updatedAt: number;
  payload: any;
}

export interface CloudSyncSummaryReport {
  syncedAt: string;
  syncedAtLocal: string;
  sessionsSynced: number;
  wordsSynced: number;
  mistakesSynced: number;
  challengeDaysSynced: number;
  todosSynced: number;
  structuresSynced?: number;
  trigger: 'manual' | 'auto_login' | 'online_recovery' | 'visibility_refresh';
}

export interface RepositorySnapshot {
  configStatus: SupabaseConfigStatus;
  authState: RepositoryAuthState;
  syncStatus: RepositorySyncStatus;
  user: {
    id: string;
    email: string;
    provider: string;
  } | null;
  pendingSyncCount: number;
  lastSyncedAt: string | null;
  lastSyncReport: CloudSyncSummaryReport | null;
  lastError: string | null;
}

export interface CloudConnectionCheckResult {
  reachable: boolean;
  authenticated: boolean;
  tablesReady: boolean;
  checkedTables: { table: string; ok: boolean; error?: string }[];
  message: string;
}

export interface WorkspaceTodoRecord {
  id: number;
  text: string;
  date: string;
  done: boolean;
}

const PENDING_SYNC_STORAGE_KEY = 'master_english_pending_sync_v1';
const LAST_SYNC_META_STORAGE_KEY = 'master_english_last_cloud_sync_meta_v1';
const PROFILE_UPDATED_AT_KEY = 'master_english_profile_updated_at_v1';

type RepositoryListener = (snapshot: RepositorySnapshot) => void;

function safeReadJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return deepNormalizeText(JSON.parse(raw)) as T;
  } catch {
    return fallback;
  }
}

class DataRepositoryService {
  private listeners: Set<RepositoryListener> = new Set();
  private currentUser: User | null = null;
  private syncStatus: RepositorySyncStatus = isSupabaseConfigured() ? 'idle' : 'local_only';
  private lastError: string | null = null;
  private isSyncingNow = false;
  private lastAutoSyncTimestamp = 0;
  private initialized = false;

  constructor() {
    this.initSubscriptions();
  }

  private initSubscriptions(): void {
    if (this.initialized) return;
    this.initialized = true;

    const client = getSupabaseClient();
    if (!client) {
      this.syncStatus = 'local_only';
      return;
    }

    // 1. Kiểm tra phiên đăng nhập hiện có
    client.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) {
          this.lastError = error.message;
        }
        const prevUserId = this.currentUser?.id;
        this.currentUser = data.session?.user ?? null;
        if (this.currentUser) {
          setActiveAuthUser({
            id: this.currentUser.id,
            email: this.currentUser.email || '',
            name:
              (this.currentUser.user_metadata?.full_name as string) ||
              (this.currentUser.user_metadata?.name as string),
            provider: 'supabase'
          });
        }
        this.updateSyncStatusFromQueue();
        this.notifyListeners();

        if (this.currentUser && this.currentUser.id !== prevUserId) {
          void this.syncAllDataWithCloud('auto_login');
        }
      })
      .catch((err) => {
        this.lastError = err?.message || 'Không thể kiểm tra phiên đăng nhập';
        this.notifyListeners();
      });

    // 2. Lắng nghe thay đổi trạng thái đăng nhập (Sign In / Sign Out / Token Refresh)
    client.auth.onAuthStateChange((event, session) => {
      const prevUserId = this.currentUser?.id;
      this.currentUser = session?.user ?? null;
      if (this.currentUser) {
        setActiveAuthUser({
          id: this.currentUser.id,
          email: this.currentUser.email || '',
          name:
            (this.currentUser.user_metadata?.full_name as string) ||
            (this.currentUser.user_metadata?.name as string),
          provider: 'supabase'
        });
      }
      this.updateSyncStatusFromQueue();
      this.notifyListeners();

      if (
        this.currentUser &&
        (event === 'SIGNED_IN' || (event === 'INITIAL_SESSION' && this.currentUser.id !== prevUserId))
      ) {
        void this.syncAllDataWithCloud('auto_login');
      }
    });

    // 3. Tự động đồng bộ khi trình duyệt có mạng trở lại hoặc chuyển đổi thiết bị/tab
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        if (this.currentUser && isSupabaseConfigured()) {
          void this.syncAllDataWithCloud('online_recovery');
        }
      });

      document.addEventListener('visibilitychange', () => {
        if (
          document.visibilityState === 'visible' &&
          this.currentUser &&
          isSupabaseConfigured() &&
          Date.now() - this.lastAutoSyncTimestamp > 45_000
        ) {
          void this.syncAllDataWithCloud('visibility_refresh');
        }
      });
    }
  }

  private updateSyncStatusFromQueue(): void {
    if (!isSupabaseConfigured()) {
      this.syncStatus = 'local_only';
      return;
    }
    const pending = this.getPendingQueue();
    if (pending.length > 0) {
      this.syncStatus = 'offline_pending';
    } else if (this.syncStatus === 'local_only') {
      this.syncStatus = 'idle';
    }
  }

  public getPendingQueue(): PendingSyncMutation[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(PENDING_SYNC_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private savePendingQueue(queue: PendingSyncMutation[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(PENDING_SYNC_STORAGE_KEY, JSON.stringify(queue));
      this.updateSyncStatusFromQueue();
      this.notifyListeners();
    } catch (err) {
      console.error('[DataRepository] Không thể lưu hàng đợi đồng bộ:', err);
    }
  }

  public enqueueMutation(mutation: Omit<PendingSyncMutation, 'id'>): void {
    const queue = this.getPendingQueue();
    const compositeId = `${mutation.entity}:${mutation.recordId}`;
    const existingIdx = queue.findIndex((item) => item.id === compositeId);

    const nextItem: PendingSyncMutation = {
      ...mutation,
      id: compositeId
    };

    if (existingIdx >= 0) {
      if (nextItem.updatedAt >= queue[existingIdx].updatedAt) {
        queue[existingIdx] = nextItem;
      }
    } else {
      queue.push(nextItem);
    }

    this.savePendingQueue(queue);
  }

  public getLastSyncMeta(): { lastSyncedAt: string | null; report: CloudSyncSummaryReport | null } {
    if (typeof window === 'undefined') return { lastSyncedAt: null, report: null };
    try {
      const raw = localStorage.getItem(LAST_SYNC_META_STORAGE_KEY);
      if (!raw) return { lastSyncedAt: null, report: null };
      const parsed = JSON.parse(raw);
      return {
        lastSyncedAt: parsed?.lastSyncedAt || null,
        report: parsed?.report || null
      };
    } catch {
      return { lastSyncedAt: null, report: null };
    }
  }

  private saveLastSyncMeta(isoTime: string, report: CloudSyncSummaryReport): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(
        LAST_SYNC_META_STORAGE_KEY,
        JSON.stringify({ lastSyncedAt: isoTime, report })
      );
    } catch {
      // Ignore storage error
    }
  }

  public getSnapshot(): RepositorySnapshot {
    const configStatus = getSupabaseConfigStatus();
    const activeScopedUser = getActiveAuthUser();
    const effectiveUser = this.currentUser
      ? {
          id: this.currentUser.id,
          email: this.currentUser.email || '',
          provider:
            (this.currentUser?.app_metadata?.provider as string) ||
            (this.currentUser?.identities?.[0]?.provider as string) ||
            'email'
        }
      : activeScopedUser
        ? {
            id: activeScopedUser.id,
            email: activeScopedUser.email,
            provider: activeScopedUser.provider
          }
        : null;

    let authState: RepositoryAuthState = 'local_mode';
    if (configStatus.isConfigured || effectiveUser) {
      authState = effectiveUser ? 'authenticated' : 'unauthenticated';
    }

    const meta = this.getLastSyncMeta();

    return {
      configStatus,
      authState,
      syncStatus: this.syncStatus,
      user: effectiveUser,
      pendingSyncCount: this.getPendingQueue().length,
      lastSyncedAt: meta.lastSyncedAt,
      lastSyncReport: meta.report,
      lastError: this.lastError
    };
  }

  public subscribe(listener: RepositoryListener): () => void {
    this.listeners.add(listener);
    listener(this.getSnapshot());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const snapshot = this.getSnapshot();
    this.listeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch (err) {
        console.error('[DataRepository] Listener error:', err);
      }
    });
  }

  private dispatchCloudSyncEvent(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('master-english-cloud-synced'));
    }
  }

  /**
   * Kiểm tra thực tế kết nối tới Supabase & xác nhận 8 bảng dữ liệu đã được tạo + bật RLS.
   */
  public async verifyCloudSchemaAndRLS(): Promise<CloudConnectionCheckResult> {
    const client = getSupabaseClient();
    if (!client || !isSupabaseConfigured()) {
      return {
        reachable: false,
        authenticated: false,
        tablesReady: false,
        checkedTables: [],
        message:
          'Ứng dụng đang ở Local Mode. Vui lòng cấu hình VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY trước khi kiểm tra kết nối Cloud.'
      };
    }

    this.syncStatus = 'checking';
    this.lastError = null;
    this.notifyListeners();

    const tablesToCheck = [
      'user_profiles',
      'study_sessions',
      'active_sessions',
      'word_progress',
      'mistakes_notebook',
      'user_stats',
      'challenge_60_progress',
      'workspace_todos'
    ];

    const checkedTables: { table: string; ok: boolean; error?: string }[] = [];

    try {
      const { data: sessionData, error: sessionError } = await client.auth.getSession();
      if (sessionError) {
        this.syncStatus = 'error';
        this.lastError = sessionError.message;
        this.notifyListeners();
        return {
          reachable: false,
          authenticated: false,
          tablesReady: false,
          checkedTables: [],
          message: `Không thể kết nối tới Supabase Auth: ${sessionError.message}`
        };
      }

      const isAuthenticated = Boolean(sessionData.session?.user);

      for (const table of tablesToCheck) {
        const { error } = await client.from(table).select('*', { head: true, count: 'exact' }).limit(1);
        if (error) {
          checkedTables.push({
            table,
            ok: false,
            error: error.message
          });
        } else {
          checkedTables.push({
            table,
            ok: true
          });
        }
      }

      const allReady = checkedTables.every((t) => t.ok);
      this.syncStatus = allReady ? (this.getPendingQueue().length > 0 ? 'offline_pending' : 'idle') : 'error';
      if (!allReady) {
        const failedNames = checkedTables
          .filter((t) => !t.ok)
          .map((t) => t.table)
          .join(', ');
        this.lastError = `Chưa tìm thấy hoặc chưa cấp quyền RLS cho bảng: ${failedNames}`;
      }
      this.notifyListeners();

      return {
        reachable: true,
        authenticated: isAuthenticated,
        tablesReady: allReady,
        checkedTables,
        message: allReady
          ? isAuthenticated
            ? 'Kết nối Supabase thành công! Tất cả 8 bảng dữ liệu và chính sách bảo mật RLS đều đã sẵn sàng.'
            : 'Kết nối Supabase thành công! Tất cả 8 bảng đã sẵn sàng. Hãy đăng nhập tài khoản để đồng bộ dữ liệu theo user_id.'
          : 'Đã kết nối tới Supabase nhưng một số bảng chưa tồn tại. Vui lòng chạy file /supabase/schema.sql trong Supabase SQL Editor.'
      };
    } catch (err: any) {
      this.syncStatus = 'error';
      this.lastError = err?.message || 'Lỗi mạng khi kiểm tra kết nối Supabase';
      this.notifyListeners();
      return {
        reachable: false,
        authenticated: false,
        tablesReady: false,
        checkedTables,
        message: `Không thể kết nối tới Supabase: ${err?.message || 'Lỗi mạng'}`
      };
    }
  }

  // ==========================================================================
  // THUẬT TOÁN HỢP NHẤT (MERGE) CHỐNG GHI ĐÈ & CHỐNG TRÙNG LẶP
  // ==========================================================================

  public mergeStudySessions(
    localSessions: SessionRecord[],
    cloudSessions: SessionRecord[]
  ): SessionRecord[] {
    const map = new Map<string, SessionRecord>();
    for (const s of cloudSessions) {
      if (s && s.id) {
        map.set(s.id, s);
      }
    }
    for (const s of localSessions) {
      if (!s || !s.id) continue;
      const existing = map.get(s.id);
      if (!existing) {
        map.set(s.id, s);
      } else {
        const localEnd = Number(s.endTime || 0);
        const cloudEnd = Number(existing.endTime || 0);
        const localDur = Number(s.durationSeconds || 0);
        const cloudDur = Number(existing.durationSeconds || 0);
        if (localEnd >= cloudEnd && localDur >= cloudDur) {
          map.set(s.id, s);
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => b.startTime - a.startTime);
  }

  public mergeWordProgress(
    localProgress: Record<string, WordProgressRecord>,
    cloudProgress: Record<string, WordProgressRecord>
  ): Record<string, WordProgressRecord> {
    const merged: Record<string, WordProgressRecord> = { ...cloudProgress };
    for (const [wordId, localRec] of Object.entries(localProgress)) {
      if (!localRec || !wordId) continue;
      const cloudRec = merged[wordId];
      if (!cloudRec) {
        merged[wordId] = localRec;
      } else {
        const localTime = Number(localRec.lastReviewedAt || 0);
        const cloudTime = Number(cloudRec.lastReviewedAt || 0);
        const base = localTime >= cloudTime ? localRec : cloudRec;
        const other = localTime >= cloudTime ? cloudRec : localRec;

        // Hợp nhất lịch sử tương tác không trùng timestamp
        const historyMap = new Map<string, any>();
        for (const h of [...(other.history || []), ...(base.history || [])]) {
          if (h && h.timestamp) {
            historyMap.set(`${h.timestamp}_${h.action}`, h);
          }
        }

        merged[wordId] = {
          ...base,
          ipa: base.ipa || other.ipa,
          meaning: base.meaning || other.meaning,
          level: base.level || other.level,
          timesReviewed: Math.max(localRec.timesReviewed || 0, cloudRec.timesReviewed || 0),
          firstMasteredAt: base.firstMasteredAt || other.firstMasteredAt || null,
          history: Array.from(historyMap.values()).sort((a, b) => a.timestamp - b.timestamp)
        };
      }
    }
    return merged;
  }

  public mergeMistakes(
    localMistakes: MistakeRecord[],
    cloudMistakes: MistakeRecord[]
  ): MistakeRecord[] {
    const map = new Map<string, MistakeRecord>();
    const seenQuestions = new Map<string, string>();

    for (const m of cloudMistakes) {
      if (!m || !m.id) continue;
      map.set(m.id, m);
      if (m.question) seenQuestions.set(m.question, m.id);
    }

    for (const m of localMistakes) {
      if (!m || !m.id) continue;
      const existingIdByQ = m.question ? seenQuestions.get(m.question) : undefined;
      const targetId = existingIdByQ || m.id;
      const existing = map.get(targetId);
      if (!existing || (m.timestamp || 0) >= (existing.timestamp || 0)) {
        map.set(targetId, { ...m, id: targetId });
        if (m.question) seenQuestions.set(m.question, targetId);
      }
    }
    return Array.from(map.values()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }

  public mergeUserStats(localStats: UserStats, cloudStats: UserStats): UserStats {
    return {
      quizzesTaken: Math.max(localStats.quizzesTaken || 0, cloudStats.quizzesTaken || 0),
      totalQuestionsAnswered: Math.max(
        localStats.totalQuestionsAnswered || 0,
        cloudStats.totalQuestionsAnswered || 0
      ),
      correctAnswers: Math.max(localStats.correctAnswers || 0, cloudStats.correctAnswers || 0),
      bestStreak: Math.max(localStats.bestStreak || 0, cloudStats.bestStreak || 0),
      currentStreak: Math.max(localStats.currentStreak || 0, cloudStats.currentStreak || 0)
    };
  }

  public mergeChallengeProgress(
    localData: ChallengeProgressData,
    cloudData: ChallengeProgressData
  ): ChallengeProgressData {
    const mergedStatuses: Record<number, DayCompletionStatus> = { ...(cloudData.dayStatuses || {}) };
    for (const [dayStr, localSt] of Object.entries(localData.dayStatuses || {})) {
      const day = Number(dayStr);
      const cloudSt = mergedStatuses[day];
      if (!cloudSt) {
        mergedStatuses[day] = localSt;
      } else {
        const vocab = Boolean(localSt?.vocab || cloudSt?.vocab);
        const writing = Boolean(localSt?.writing || cloudSt?.writing);
        const speaking = Boolean(localSt?.speaking || cloudSt?.speaking);
        const completedAt =
          vocab && writing
            ? Math.min(
                localSt?.completedAt || Number.MAX_SAFE_INTEGER,
                cloudSt?.completedAt || Number.MAX_SAFE_INTEGER
              )
            : undefined;
        mergedStatuses[day] = {
          vocab,
          writing,
          speaking,
          completedAt: completedAt === Number.MAX_SAFE_INTEGER ? Date.now() : completedAt
        };
      }
    }

    const mergedDrafts: Record<number, any> = {};
    for (const [dayStr, cloudDraft] of Object.entries(cloudData.writingDrafts || {})) {
      const day = Number(dayStr);
      if (!Number.isFinite(day)) continue;
      mergedDrafts[day] = cloudDraft;
    }
    for (const [dayStr, localDraft] of Object.entries(localData.writingDrafts || {})) {
      const day = Number(dayStr);
      if (!Number.isFinite(day)) continue;
      const cloudDraft = mergedDrafts[day];
      if (!cloudDraft) {
        mergedDrafts[day] = localDraft;
      } else {
        const localSaved = Number(localDraft?.lastSaved || 0);
        const cloudSaved = Number(cloudDraft?.lastSaved || 0);
        if (localSaved >= cloudSaved && (localDraft?.text || '').trim().length > 0) {
          mergedDrafts[day] = localDraft;
        }
      }
    }

    const mergedSpeakingDrafts: Record<number, any> = {};
    for (const [dayStr, cloudSpk] of Object.entries(cloudData.speakingDrafts || {})) {
      const day = Number(dayStr);
      if (!Number.isFinite(day)) continue;
      mergedSpeakingDrafts[day] = cloudSpk;
    }
    for (const [dayStr, localSpk] of Object.entries(localData.speakingDrafts || {})) {
      const day = Number(dayStr);
      if (!Number.isFinite(day)) continue;
      const cloudSpk = mergedSpeakingDrafts[day];
      if (!cloudSpk || Number(localSpk?.lastSaved || 0) >= Number(cloudSpk?.lastSaved || 0)) {
        mergedSpeakingDrafts[day] = localSpk;
      }
    }

    const mergedHistory: Record<number, WritingSubmissionRecord[]> = {};
    for (const [dayStr, cloudList] of Object.entries(cloudData.writingHistory || {})) {
      const day = Number(dayStr);
      if (!Number.isFinite(day)) continue;
      mergedHistory[day] = Array.isArray(cloudList) ? cloudList : [];
    }
    for (const [dayStr, localList] of Object.entries(localData.writingHistory || {})) {
      const day = Number(dayStr);
      if (!Number.isFinite(day)) continue;
      const cloudList = mergedHistory[day] || [];
      const byId = new Map<string, WritingSubmissionRecord>();
      for (const item of [...cloudList, ...(localList || [])]) {
        if (item && item.id) {
          byId.set(item.id, item);
        }
      }
      mergedHistory[day] = Array.from(byId.values()).sort(
        (a, b) => (b.submittedAt || 0) - (a.submittedAt || 0)
      );
    }

    const mergedSpeakingHistory: Record<number, WritingSubmissionRecord[]> = {};
    for (const [dayStr, cloudList] of Object.entries(cloudData.speakingHistory || {})) {
      const day = Number(dayStr);
      if (!Number.isFinite(day)) continue;
      mergedSpeakingHistory[day] = Array.isArray(cloudList) ? cloudList : [];
    }
    for (const [dayStr, localList] of Object.entries(localData.speakingHistory || {})) {
      const day = Number(dayStr);
      if (!Number.isFinite(day)) continue;
      const cloudList = mergedSpeakingHistory[day] || [];
      const byId = new Map<string, WritingSubmissionRecord>();
      for (const item of [...cloudList, ...(localList || [])]) {
        if (item && item.id) {
          byId.set(item.id, item);
        }
      }
      mergedSpeakingHistory[day] = Array.from(byId.values()).sort(
        (a, b) => (b.submittedAt || 0) - (a.submittedAt || 0)
      );
    }

    const mergedVocab = Array.from(
      new Set([...(cloudData.masteredVocabIds || []), ...(localData.masteredVocabIds || [])])
    );

    return {
      activeDay: Math.max(localData.activeDay || 1, cloudData.activeDay || 1),
      dayStatuses: mergedStatuses,
      writingDrafts: mergedDrafts,
      speakingDrafts: mergedSpeakingDrafts,
      writingHistory: mergedHistory,
      speakingHistory: mergedSpeakingHistory,
      masteredVocabIds: mergedVocab,
      streak: Math.max(localData.streak || 0, cloudData.streak || 0),
      lastActiveDate:
        (localData.lastActiveDate || '') >= (cloudData.lastActiveDate || '')
          ? localData.lastActiveDate
          : cloudData.lastActiveDate
    };
  }

  public mergeWorkspaceTodos(
    localTodos: WorkspaceTodoRecord[],
    cloudTodos: WorkspaceTodoRecord[]
  ): WorkspaceTodoRecord[] {
    const map = new Map<number, WorkspaceTodoRecord>();
    for (const t of cloudTodos) {
      if (t && typeof t.id === 'number') {
        map.set(t.id, t);
      }
    }
    for (const t of localTodos) {
      if (!t || typeof t.id !== 'number') continue;
      const existing = map.get(t.id);
      if (!existing) {
        map.set(t.id, t);
      } else {
        map.set(t.id, {
          ...t,
          done: Boolean(t.done || existing.done)
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.id - b.id);
  }

  public mergeSavedWords(
    localSaved: Array<{ wordId: string; word: string; savedAt: number }>,
    cloudSaved: Array<{ wordId: string; word: string; savedAt: number }>
  ): Array<{ wordId: string; word: string; savedAt: number }> {
    const map = new Map<string, { wordId: string; word: string; savedAt: number }>();
    for (const item of cloudSaved || []) {
      if (item && item.wordId) {
        map.set(item.wordId, item);
      }
    }
    for (const item of localSaved || []) {
      if (!item || !item.wordId) continue;
      const existing = map.get(item.wordId);
      if (!existing || Number(item.savedAt || 0) >= Number(existing.savedAt || 0)) {
        map.set(item.wordId, {
          wordId: item.wordId,
          word: item.word || existing?.word || item.wordId,
          savedAt: Math.max(Number(item.savedAt || 0), Number(existing?.savedAt || 0))
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.savedAt - a.savedAt);
  }

  public mergeCustomContentStore(
    localStore: {
      customVocab?: any[];
      customStructures?: any[];
      customChallengeDays?: Record<string, any>;
      customCollocations?: any[];
      lastUpdated?: number;
    },
    cloudStore: {
      customVocab?: any[];
      customStructures?: any[];
      customChallengeDays?: Record<string, any>;
      customCollocations?: any[];
      lastUpdated?: number;
    }
  ) {
    const vocabMap = new Map<string, any>();
    for (const v of [...(cloudStore?.customVocab || []), ...(localStore?.customVocab || [])]) {
      if (v && (v.id || v.word)) {
        vocabMap.set(String(v.id || v.word), v);
      }
    }

    const structMap = new Map<string, any>();
    for (const s of [
      ...(cloudStore?.customStructures || []),
      ...(localStore?.customStructures || [])
    ]) {
      if (s && (s.id || s.structureName)) {
        structMap.set(String(s.id || s.structureName), s);
      }
    }

    const mergedDays: Record<number, any> = {};
    for (const [k, val] of Object.entries(cloudStore?.customChallengeDays || {})) {
      const d = Number(k);
      if (Number.isFinite(d) && val) mergedDays[d] = val;
    }
    for (const [k, val] of Object.entries(localStore?.customChallengeDays || {})) {
      const d = Number(k);
      if (!Number.isFinite(d) || !val) continue;
      const existing = mergedDays[d];
      if (!existing || Number(val.updatedAt || 0) >= Number(existing.updatedAt || 0)) {
        mergedDays[d] = val;
      }
    }

    const collocMap = new Map<string, any>();
    for (const c of [
      ...(cloudStore?.customCollocations || []),
      ...(localStore?.customCollocations || [])
    ]) {
      if (c && (c.id || c.sentence)) {
        collocMap.set(String(c.id || c.sentence), c);
      }
    }

    return {
      version: 1,
      customVocab: Array.from(vocabMap.values()),
      customStructures: Array.from(structMap.values()),
      customChallengeDays: mergedDays,
      customCollocations: Array.from(collocMap.values()),
      lastUpdated: Math.max(
        Number(localStore?.lastUpdated || 0),
        Number(cloudStore?.lastUpdated || 0),
        Date.now()
      )
    };
  }

  // ==========================================================================
  // ĐỒNG BỘ 2 CHIỀU TOÀN DIỆN (PULL + MERGE + PUSH) — PHASE 4 CORE
  // ==========================================================================

  public async syncAllDataWithCloud(
    trigger: CloudSyncSummaryReport['trigger'] = 'manual'
  ): Promise<{
    success: boolean;
    message: string;
    report?: CloudSyncSummaryReport;
  }> {
    const client = getSupabaseClient();
    if (!client || !isSupabaseConfigured()) {
      return {
        success: false,
        message: 'Ứng dụng đang ở Local Mode (chưa cấu hình Supabase). Dữ liệu vẫn được bảo toàn trên trình duyệt.'
      };
    }

    if (!this.currentUser) {
      const { data } = await client.auth.getSession();
      this.currentUser = data.session?.user ?? null;
    }

    if (!this.currentUser) {
      return {
        success: false,
        message: 'Vui lòng đăng nhập tài khoản Cloud trong mục Hồ Sơ trước khi đồng bộ dữ liệu.'
      };
    }

    if (this.isSyncingNow) {
      return {
        success: false,
        message: 'Hệ thống đang thực hiện đồng bộ dữ liệu, vui lòng đợi trong giây lát...'
      };
    }

    this.isSyncingNow = true;
    this.syncStatus = 'syncing';
    this.lastError = null;
    this.notifyListeners();

    const userId = this.currentUser.id;

    try {
      // ----------------------------------------------------------------------
      // BƯỚC 1: KÉO (PULL) DỮ LIỆU HIỆN CÓ TỪ 8 BẢNG SUPABASE CỦA USER
      // ----------------------------------------------------------------------
      const [
        profileRes,
        sessionsRes,
        activeSessionRes,
        wordProgressRes,
        mistakesRes,
        statsRes,
        challengeRes,
        todosRes
      ] = await Promise.all([
        client.from('user_profiles').select('*').eq('user_id', userId).maybeSingle(),
        client.from('study_sessions').select('*').eq('user_id', userId),
        client.from('active_sessions').select('*').eq('user_id', userId).maybeSingle(),
        client.from('word_progress').select('*').eq('user_id', userId),
        client.from('mistakes_notebook').select('*').eq('user_id', userId),
        client.from('user_stats').select('*').eq('user_id', userId).maybeSingle(),
        client.from('challenge_60_progress').select('*').eq('user_id', userId).maybeSingle(),
        client.from('workspace_todos').select('*').eq('user_id', userId)
      ]);

      const firstError =
        profileRes.error ||
        sessionsRes.error ||
        activeSessionRes.error ||
        wordProgressRes.error ||
        mistakesRes.error ||
        statsRes.error ||
        challengeRes.error ||
        todosRes.error;

      if (firstError) {
        throw new Error(firstError.message);
      }

      // ----------------------------------------------------------------------
      // BƯỚC 2: ĐỌC DỮ LIỆU LOCAL & HỢP NHẤT (MERGE) KHÔNG MẤT DỮ LIỆU
      // ----------------------------------------------------------------------

      // 2.1. Study Sessions (`master_english_sessions_v2`)
      const localSessions = safeReadJson<SessionRecord[]>(LEARNING_KEYS.SESSIONS, []);
      const cloudSessions: SessionRecord[] = (sessionsRes.data || []).map((row: any) => ({
        id: row.id,
        startTime: Number(row.start_time || 0),
        endTime: Number(row.end_time || 0),
        durationSeconds: Number(row.duration_seconds || 0),
        targetMinutes: Number(row.target_minutes || 45),
        dateString: row.date_string || '',
        topics: Array.isArray(row.topics) ? row.topics : [],
        wordsMastered: Array.isArray(row.words_mastered) ? row.words_mastered : [],
        wordsReviewed: Array.isArray(row.words_reviewed) ? row.words_reviewed : [],
        quizQuestionsAnswered: Number(row.quiz_questions_answered || 0),
        quizQuestionsCorrect: Number(row.quiz_questions_correct || 0),
        flashcardsFlipped: Number(row.flashcards_flipped || 0),
        mistakesResolved: Number(row.mistakes_resolved || 0),
        status: 'completed'
      }));
      const mergedSessions = this.mergeStudySessions(localSessions, cloudSessions);
      localStorage.setItem(LEARNING_KEYS.SESSIONS, JSON.stringify(mergedSessions));

      // 2.2. Active Session (`master_english_active_session_v2`)
      const localActive = safeReadJson<ActiveSessionState | null>(LEARNING_KEYS.ACTIVE_SESSION, null);
      const cloudActiveRow = activeSessionRes.data;
      let mergedActive: ActiveSessionState | null = localActive;
      if (
        !localActive &&
        cloudActiveRow &&
        cloudActiveRow.is_active &&
        cloudActiveRow.payload &&
        cloudActiveRow.payload.id
      ) {
        mergedActive = deepNormalizeText(cloudActiveRow.payload);
        localStorage.setItem(LEARNING_KEYS.ACTIVE_SESSION, JSON.stringify(mergedActive));
      } else if (
        localActive &&
        cloudActiveRow?.payload?.id === localActive.id &&
        Number(cloudActiveRow.last_active_timestamp || 0) > Number(localActive.lastActiveTimestamp || 0)
      ) {
        mergedActive = deepNormalizeText(cloudActiveRow.payload);
        localStorage.setItem(LEARNING_KEYS.ACTIVE_SESSION, JSON.stringify(mergedActive));
      }

      // 2.3. Word Progress (`master_english_word_progress_v2` & `leximaster_mastered_words_v1`)
      const localWordMap = safeReadJson<Record<string, WordProgressRecord>>(
        LEARNING_KEYS.WORD_PROGRESS,
        {}
      );
      const cloudWordMap: Record<string, WordProgressRecord> = {};
      for (const row of wordProgressRes.data || []) {
        if (!row || !row.word_id) continue;
        cloudWordMap[row.word_id] = {
          wordId: row.word_id,
          word: row.word || row.word_id,
          ipa: row.ipa || undefined,
          meaning: row.meaning || undefined,
          level: row.level || undefined,
          status: (row.status as WordProgressRecord['status']) || 'learning',
          timesReviewed: Number(row.times_reviewed || 0),
          firstMasteredAt: row.first_mastered_at ? Number(row.first_mastered_at) : null,
          lastReviewedAt: Number(row.last_reviewed_at || 0),
          history: Array.isArray(row.history) ? row.history : []
        };
      }
      const mergedWordMap = this.mergeWordProgress(localWordMap, cloudWordMap);
      localStorage.setItem(LEARNING_KEYS.WORD_PROGRESS, JSON.stringify(mergedWordMap));

      const localMasteredIds = safeReadJson<string[]>('leximaster_mastered_words_v1', []);
      const cloudMasteredIds = Array.isArray(profileRes.data?.mastered_words_v1)
        ? (profileRes.data.mastered_words_v1 as string[])
        : [];
      const srsMasteredIds = Object.keys(mergedWordMap).filter(
        (id) => mergedWordMap[id]?.status === 'mastered'
      );
      const mergedMasteredIds = Array.from(
        new Set([...localMasteredIds, ...cloudMasteredIds, ...srsMasteredIds])
      );
      localStorage.setItem('leximaster_mastered_words_v1', JSON.stringify(mergedMasteredIds));

      // 2.4. Mistakes Notebook (`leximaster_mistakes_v1`)
      const localMistakes = safeReadJson<MistakeRecord[]>('leximaster_mistakes_v1', []);
      const cloudMistakes: MistakeRecord[] = (mistakesRes.data || []).map((row: any) => ({
        id: row.id,
        wordId: row.raw_payload?.wordId,
        question: row.question || '',
        userAnswer: row.user_answer || '',
        correctAnswer: row.correct_answer || '',
        explanation: row.explanation || '',
        sourceMode: row.category || row.raw_payload?.sourceMode || 'Quiz',
        timestamp: Number(row.timestamp || 0)
      }));
      const mergedMistakes = this.mergeMistakes(localMistakes, cloudMistakes);
      localStorage.setItem('leximaster_mistakes_v1', JSON.stringify(mergedMistakes));

      // 2.5. User Stats (`leximaster_stats_v1`)
      const defaultStats: UserStats = {
        quizzesTaken: 0,
        totalQuestionsAnswered: 0,
        correctAnswers: 0,
        bestStreak: 0,
        currentStreak: 0
      };
      const localStats = safeReadJson<UserStats>('leximaster_stats_v1', defaultStats);
      const cloudStats: UserStats = statsRes.data
        ? {
            quizzesTaken: Number(statsRes.data.quizzes_taken || 0),
            totalQuestionsAnswered: Number(statsRes.data.total_questions_answered || 0),
            correctAnswers: Number(statsRes.data.correct_answers || 0),
            bestStreak: Number(statsRes.data.best_streak || 0),
            currentStreak: Number(statsRes.data.current_streak || 0)
          }
        : defaultStats;
      const mergedStats = this.mergeUserStats(localStats, cloudStats);
      localStorage.setItem('leximaster_stats_v1', JSON.stringify(mergedStats));

      // 2.6. 60-Day Challenge (`ielts_60_day_challenge_state_v1`)
      const emptyChallenge: ChallengeProgressData = {
        activeDay: 1,
        dayStatuses: {},
        writingDrafts: {},
        writingHistory: {},
        masteredVocabIds: [],
        streak: 0,
        lastActiveDate: ''
      };
      const localChallenge = safeReadJson<ChallengeProgressData>(
        'ielts_60_day_challenge_state_v1',
        emptyChallenge
      );
      const rawCloudWritingDrafts = (challengeRes.data?.writing_drafts || {}) as Record<string, any>;
      const rawCloudWritingHistory = (challengeRes.data?.writing_history || {}) as Record<string, any>;
      const { __speakingDrafts: embeddedSpeakingDrafts, ...cleanCloudWritingDrafts } =
        rawCloudWritingDrafts;
      const { __speakingHistory: embeddedSpeakingHistory, ...cleanCloudWritingHistory } =
        rawCloudWritingHistory;

      const cloudChallenge: ChallengeProgressData = challengeRes.data
        ? {
            activeDay: Number(challengeRes.data.active_day || 1),
            dayStatuses: challengeRes.data.day_statuses || {},
            writingDrafts: cleanCloudWritingDrafts,
            speakingDrafts:
              challengeRes.data.speaking_drafts || embeddedSpeakingDrafts || {},
            writingHistory: cleanCloudWritingHistory,
            speakingHistory:
              challengeRes.data.speaking_history || embeddedSpeakingHistory || {},
            masteredVocabIds: Array.isArray(challengeRes.data.mastered_vocab_ids)
              ? challengeRes.data.mastered_vocab_ids
              : [],
            streak: Number(challengeRes.data.streak || 0),
            lastActiveDate: challengeRes.data.last_active_date || ''
          }
        : emptyChallenge;
      const mergedChallenge = this.mergeChallengeProgress(localChallenge, cloudChallenge);
      localStorage.setItem('ielts_60_day_challenge_state_v1', JSON.stringify(mergedChallenge));

      // 2.7. Workspace Todos (`master_english_workspace_todos_v1`)
      const localTodos = safeReadJson<WorkspaceTodoRecord[]>(
        'master_english_workspace_todos_v1',
        []
      );
      const cloudTodos: WorkspaceTodoRecord[] = (todosRes.data || []).map((row: any) => ({
        id: Number(row.todo_id),
        text: row.text || '',
        date: row.date || 'Hôm nay',
        done: Boolean(row.done)
      }));
      const mergedTodos = this.mergeWorkspaceTodos(localTodos, cloudTodos);
      if (mergedTodos.length > 0) {
        localStorage.setItem('master_english_workspace_todos_v1', JSON.stringify(mergedTodos));
      }

      // 2.8. User Profile & Preferences (`master_english_user_profile_v2`, theme, card_status, report_recipient)
      const localProfile = safeReadJson<Record<string, any>>(LEARNING_KEYS.USER_PROFILE, {});
      const localProfileUpdatedAt = Number(localStorage.getItem(PROFILE_UPDATED_AT_KEY) || 0);
      const cloudProfileRow = profileRes.data;
      const cloudProfileUpdatedAt = Number(cloudProfileRow?.client_updated_at || 0);

      let mergedProfile = { ...localProfile };
      if (cloudProfileRow) {
        const cloudProfileObj = {
          ...(cloudProfileRow.profile_payload || {}),
          name: cloudProfileRow.name || localProfile.name,
          email: cloudProfileRow.email || localProfile.email || this.currentUser.email,
          gender: cloudProfileRow.gender || localProfile.gender,
          dob: cloudProfileRow.dob || localProfile.dob,
          location: cloudProfileRow.location || localProfile.location,
          studentCategory: cloudProfileRow.student_category || localProfile.studentCategory,
          currentLevel: cloudProfileRow.current_level || localProfile.currentLevel,
          examTarget: cloudProfileRow.exam_target || localProfile.examTarget,
          targetBand: cloudProfileRow.target_band || localProfile.targetBand,
          wordsPerSessionGoal: Number(
            cloudProfileRow.words_per_session_goal || localProfile.wordsPerSessionGoal || 15
          ),
          dailyStudyMinutesGoal: Number(
            cloudProfileRow.daily_study_minutes_goal || localProfile.dailyStudyMinutesGoal || 45
          ),
          avatarPose: cloudProfileRow.avatar_pose || localProfile.avatarPose || 'welcome-heart',
          customAvatarUrl: cloudProfileRow.custom_avatar_url ?? localProfile.customAvatarUrl ?? ''
        };

        mergedProfile =
          cloudProfileUpdatedAt > localProfileUpdatedAt
            ? { ...localProfile, ...cloudProfileObj }
            : { ...cloudProfileObj, ...localProfile };

        localStorage.setItem(LEARNING_KEYS.USER_PROFILE, JSON.stringify(mergedProfile));
      }

      const localTheme =
        localStorage.getItem(LEARNING_KEYS.THEME) ||
        cloudProfileRow?.theme_preference ||
        'light';
      localStorage.setItem(LEARNING_KEYS.THEME, localTheme);
      localStorage.setItem(LEARNING_KEYS.THEME_LEGACY, localTheme);

      const localCardStatus = safeReadJson<Record<string, any>>('leximaster_card_status_v1', {});
      const cloudCardStatus =
        cloudProfileRow?.card_status_v1 && typeof cloudProfileRow.card_status_v1 === 'object'
          ? cloudProfileRow.card_status_v1
          : {};

      // 2.9. 77 Grammar Structures State (Learned, Saved, Active Position, Custom Sentence Notes)
      const localPdfSaved = safeReadJson<string[]>('master_english_pdf_lib_saved_v1', []);
      const localPdfLearned = safeReadJson<string[]>('master_english_pdf_lib_learned_v2', []);
      const localPdfActive =
        localStorage.getItem('master_english_pdf_lib_active_v2') || 'pdf-item-1';
      const localPdfNotes = safeReadJson<any[]>('master_english_pdf_lib_notes_v1', []);

      const cloudPdfState =
        cloudProfileRow?.profile_payload?.pdfStructuresState ||
        cloudCardStatus?.__pdfStructuresState ||
        {};

      const mergedPdfSaved = Array.from(
        new Set([
          ...(Array.isArray(cloudPdfState.savedIds) ? cloudPdfState.savedIds : []),
          ...localPdfSaved
        ])
      );
      const mergedPdfLearned = Array.from(
        new Set([
          ...(Array.isArray(cloudPdfState.learnedIds) ? cloudPdfState.learnedIds : []),
          ...localPdfLearned
        ])
      );
      const mergedPdfActive =
        localPdfActive && localPdfActive !== 'pdf-item-1'
          ? localPdfActive
          : cloudPdfState.activeStructureId || localPdfActive || 'pdf-item-1';

      const pdfNoteMap = new Map<string, any>();
      if (Array.isArray(cloudPdfState.userNotes)) {
        cloudPdfState.userNotes.forEach((n: any) => {
          if (n && n.id) pdfNoteMap.set(n.id, n);
        });
      }
      localPdfNotes.forEach((n: any) => {
        if (n && n.id) pdfNoteMap.set(n.id, n);
      });
      const mergedPdfNotes = Array.from(pdfNoteMap.values());

      localStorage.setItem('master_english_pdf_lib_saved_v1', JSON.stringify(mergedPdfSaved));
      localStorage.setItem('master_english_pdf_lib_learned_v2', JSON.stringify(mergedPdfLearned));
      localStorage.setItem('master_english_pdf_lib_active_v2', mergedPdfActive);
      localStorage.setItem('master_english_pdf_lib_notes_v1', JSON.stringify(mergedPdfNotes));

      const mergedPdfStructuresState = {
        savedIds: mergedPdfSaved,
        learnedIds: mergedPdfLearned,
        activeStructureId: mergedPdfActive,
        userNotes: mergedPdfNotes,
        updatedAt: Date.now()
      };

      const mergedCardStatus = {
        ...cloudCardStatus,
        ...localCardStatus,
        __pdfStructuresState: mergedPdfStructuresState
      };
      localStorage.setItem('leximaster_card_status_v1', JSON.stringify(mergedCardStatus));

      mergedProfile = {
        ...mergedProfile,
        pdfStructuresState: mergedPdfStructuresState
      };
      localStorage.setItem(LEARNING_KEYS.USER_PROFILE, JSON.stringify(mergedProfile));

      const localRecipient = localStorage.getItem('master_english_report_recipient_v1');
      if (!localRecipient && cloudProfileRow?.report_recipient?.email) {
        localStorage.setItem(
          'master_english_report_recipient_v1',
          cloudProfileRow.report_recipient.email
        );
      }

      // ----------------------------------------------------------------------
      // BƯỚC 3: ĐẨY (PUSH) BẢN HỢP NHẤT HOÀN CHỈNH LÊN 8 BẢNG SUPABASE CLOUD
      // ----------------------------------------------------------------------

      // 3.1. Upsert user_profiles
      const reportRecipientEmail =
        localStorage.getItem('master_english_report_recipient_v1') ||
        mergedProfile.email ||
        this.currentUser.email ||
        '';
      await client.from('user_profiles').upsert(
        {
          user_id: userId,
          name: mergedProfile.name || 'Học Viên IELTS',
          email: mergedProfile.email || this.currentUser.email || '',
          gender: mergedProfile.gender || 'Nam',
          dob: mergedProfile.dob || '',
          location: mergedProfile.location || 'Việt Nam',
          student_category: mergedProfile.studentCategory || 'Sinh viên Đại học',
          current_level: mergedProfile.currentLevel || 'Upper-Intermediate (Band 7.0)',
          exam_target: mergedProfile.examTarget || 'IELTS Academic',
          target_band: mergedProfile.targetBand || 'BAND 7.0+',
          words_per_session_goal: Number(mergedProfile.wordsPerSessionGoal || 15),
          daily_study_minutes_goal: Number(mergedProfile.dailyStudyMinutesGoal || 45),
          avatar_pose: mergedProfile.avatarPose || 'welcome-heart',
          custom_avatar_url: mergedProfile.customAvatarUrl || '',
          theme_preference: localTheme,
          report_recipient: { email: reportRecipientEmail },
          mastered_words_v1: mergedMasteredIds,
          card_status_v1: mergedCardStatus,
          profile_payload: mergedProfile,
          client_updated_at: Math.max(localProfileUpdatedAt, cloudProfileUpdatedAt, Date.now())
        },
        { onConflict: 'user_id' }
      );

      // 3.2. Upsert study_sessions
      if (mergedSessions.length > 0) {
        const sessionRows = mergedSessions.map((s) => ({
          user_id: userId,
          id: s.id,
          start_time: s.startTime,
          end_time: s.endTime,
          duration_seconds: s.durationSeconds,
          target_minutes: s.targetMinutes || 45,
          date_string: s.dateString,
          topics: s.topics || [],
          words_mastered: s.wordsMastered || [],
          words_reviewed: s.wordsReviewed || [],
          quiz_questions_answered: s.quizQuestionsAnswered || 0,
          quiz_questions_correct: s.quizQuestionsCorrect || 0,
          flashcards_flipped: s.flashcardsFlipped || 0,
          mistakes_resolved: s.mistakesResolved || 0,
          status: s.status || 'completed',
          raw_payload: s
        }));
        await client.from('study_sessions').upsert(sessionRows, { onConflict: 'user_id,id' });
      }

      // 3.3. Upsert active_sessions
      await client.from('active_sessions').upsert(
        {
          user_id: userId,
          session_id: mergedActive?.id || null,
          is_active: Boolean(mergedActive),
          payload: mergedActive,
          last_active_timestamp: mergedActive?.lastActiveTimestamp || Date.now()
        },
        { onConflict: 'user_id' }
      );

      // 3.4. Upsert word_progress
      const wordEntries = Object.values(mergedWordMap);
      if (wordEntries.length > 0) {
        const wordRows = wordEntries.map((w) => ({
          user_id: userId,
          word_id: w.wordId,
          word: w.word,
          ipa: w.ipa || '',
          meaning: w.meaning || '',
          level: w.level || '',
          status: w.status || 'learning',
          times_reviewed: w.timesReviewed || 0,
          first_mastered_at: w.firstMasteredAt || null,
          last_reviewed_at: w.lastReviewedAt || Date.now(),
          history: w.history || [],
          raw_payload: w
        }));
        await client.from('word_progress').upsert(wordRows, { onConflict: 'user_id,word_id' });
      }

      // 3.5. Upsert mistakes_notebook
      if (mergedMistakes.length > 0) {
        const mistakeRows = mergedMistakes.map((m) => ({
          user_id: userId,
          id: m.id,
          question: m.question || '',
          user_answer: m.userAnswer || '',
          correct_answer: m.correctAnswer || '',
          explanation: m.explanation || '',
          category: m.sourceMode || 'Quiz',
          timestamp: m.timestamp || Date.now(),
          raw_payload: m
        }));
        await client.from('mistakes_notebook').upsert(mistakeRows, { onConflict: 'user_id,id' });
      }

      // 3.6. Upsert user_stats
      await client.from('user_stats').upsert(
        {
          user_id: userId,
          quizzes_taken: mergedStats.quizzesTaken || 0,
          total_questions_answered: mergedStats.totalQuestionsAnswered || 0,
          correct_answers: mergedStats.correctAnswers || 0,
          best_streak: mergedStats.bestStreak || 0,
          current_streak: mergedStats.currentStreak || 0,
          client_updated_at: Date.now()
        },
        { onConflict: 'user_id' }
      );

      // 3.7. Upsert challenge_60_progress (preserve __speakingDrafts & __speakingHistory)
      await client.from('challenge_60_progress').upsert(
        {
          user_id: userId,
          active_day: mergedChallenge.activeDay || 1,
          streak: mergedChallenge.streak || 0,
          last_active_date: mergedChallenge.lastActiveDate || '',
          day_statuses: mergedChallenge.dayStatuses || {},
          writing_drafts: {
            ...(mergedChallenge.writingDrafts || {}),
            __speakingDrafts: mergedChallenge.speakingDrafts || {}
          },
          writing_history: {
            ...(mergedChallenge.writingHistory || {}),
            __speakingHistory: mergedChallenge.speakingHistory || {}
          },
          mastered_vocab_ids: mergedChallenge.masteredVocabIds || [],
          client_updated_at: Date.now()
        },
        { onConflict: 'user_id' }
      );

      // 3.8. Upsert workspace_todos
      if (mergedTodos.length > 0) {
        const todoRows = mergedTodos.map((t) => ({
          user_id: userId,
          todo_id: t.id,
          text: t.text,
          date: t.date || 'Hôm nay',
          done: Boolean(t.done)
        }));
        await client.from('workspace_todos').upsert(todoRows, { onConflict: 'user_id,todo_id' });
      }

      // ----------------------------------------------------------------------
      // BƯỚC 4: XÓA HÀNG ĐỢI OFFLINE, LƯU BÁO CÁO & CẬP NHẬT UI TỨC THÌ
      // ----------------------------------------------------------------------
      const now = new Date();
      const isoNow = now.toISOString();
      const localNow = now.toLocaleString('vi-VN', { hour12: false });

      const completedChallengeDays = Object.values(mergedChallenge.dayStatuses || {}).filter(
        (st: any) => st && st.vocab && st.writing
      ).length;

      const report: CloudSyncSummaryReport = {
        syncedAt: isoNow,
        syncedAtLocal: localNow,
        sessionsSynced: mergedSessions.length,
        wordsSynced: Math.max(wordEntries.length, mergedMasteredIds.length),
        mistakesSynced: mergedMistakes.length,
        challengeDaysSynced: completedChallengeDays,
        todosSynced: mergedTodos.length,
        structuresSynced: mergedPdfLearned.length,
        trigger
      };

      this.savePendingQueue([]);
      this.saveLastSyncMeta(isoNow, report);
      this.lastAutoSyncTimestamp = Date.now();
      this.syncStatus = 'synced';
      this.isSyncingNow = false;
      this.notifyListeners();
      this.dispatchCloudSyncEvent();

      return {
        success: true,
        report,
        message: `Đồng bộ 2 chiều hoàn tất lúc ${localNow}! Đã đồng bộ ${report.sessionsSynced} phiên học, ${report.wordsSynced} từ SRS, ${mergedPdfLearned.length}/77 cấu trúc ngữ pháp, ${report.challengeDaysSynced}/60 ngày thử thách và ${report.mistakesSynced} lỗi sai.`
      };
    } catch (err: any) {
      this.isSyncingNow = false;
      this.syncStatus = 'error';
      this.lastError = err?.message || 'Lỗi đồng bộ dữ liệu với Supabase Cloud';
      this.notifyListeners();
      return {
        success: false,
        message: `Không thể đồng bộ Cloud: ${this.lastError}. Dữ liệu trên trình duyệt vẫn được giữ nguyên 100%.`
      };
    }
  }

  // ==========================================================================
  // REAL-TIME WRITE-THROUGH METHODS (GỌI TỰ ĐỘNG KHI NGƯỜI DÙNG HỌC TẬP)
  // ==========================================================================

  public async syncCompletedSession(session: SessionRecord): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client || !this.currentUser) {
      this.enqueueMutation({
        entity: 'study_session',
        recordId: session.id,
        updatedAt: session.endTime || Date.now(),
        payload: session
      });
      return false;
    }

    try {
      this.syncStatus = 'syncing';
      this.notifyListeners();

      const { error } = await client.from('study_sessions').upsert(
        {
          user_id: this.currentUser.id,
          id: session.id,
          start_time: session.startTime,
          end_time: session.endTime,
          duration_seconds: session.durationSeconds,
          target_minutes: session.targetMinutes || 45,
          date_string: session.dateString,
          topics: session.topics || [],
          words_mastered: session.wordsMastered || [],
          words_reviewed: session.wordsReviewed || [],
          quiz_questions_answered: session.quizQuestionsAnswered || 0,
          quiz_questions_correct: session.quizQuestionsCorrect || 0,
          flashcards_flipped: session.flashcardsFlipped || 0,
          mistakes_resolved: session.mistakesResolved || 0,
          status: session.status || 'completed',
          raw_payload: session
        },
        { onConflict: 'user_id,id' }
      );

      if (error) throw error;

      this.syncStatus = 'synced';
      this.notifyListeners();
      return true;
    } catch (err: any) {
      this.lastError = err?.message || 'Lỗi đồng bộ phiên học';
      this.enqueueMutation({
        entity: 'study_session',
        recordId: session.id,
        updatedAt: session.endTime || Date.now(),
        payload: session
      });
      return false;
    }
  }

  public async syncActiveSession(activeSession: ActiveSessionState | null): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client || !this.currentUser) return false;

    try {
      const { error } = await client.from('active_sessions').upsert(
        {
          user_id: this.currentUser.id,
          session_id: activeSession?.id || null,
          is_active: Boolean(activeSession),
          payload: activeSession,
          last_active_timestamp: activeSession?.lastActiveTimestamp || Date.now()
        },
        { onConflict: 'user_id' }
      );
      return !error;
    } catch {
      return false;
    }
  }

  public async syncWordProgressRecord(
    record: WordProgressRecord,
    masteredWordIds?: string[]
  ): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client || !this.currentUser) {
      this.enqueueMutation({
        entity: 'word_progress',
        recordId: record.wordId,
        updatedAt: record.lastReviewedAt || Date.now(),
        payload: record
      });
      return false;
    }

    try {
      const userId = this.currentUser.id;
      const { error } = await client.from('word_progress').upsert(
        {
          user_id: userId,
          word_id: record.wordId,
          word: record.word,
          ipa: record.ipa || '',
          meaning: record.meaning || '',
          level: record.level || '',
          status: record.status || 'learning',
          times_reviewed: record.timesReviewed || 0,
          first_mastered_at: record.firstMasteredAt || null,
          last_reviewed_at: record.lastReviewedAt || Date.now(),
          history: record.history || [],
          raw_payload: record
        },
        { onConflict: 'user_id,word_id' }
      );

      if (error) throw error;

      if (masteredWordIds) {
        await client
          .from('user_profiles')
          .update({
            mastered_words_v1: masteredWordIds,
            client_updated_at: Date.now()
          })
          .eq('user_id', userId);
      }

      this.syncStatus = 'synced';
      this.notifyListeners();
      return true;
    } catch {
      this.enqueueMutation({
        entity: 'word_progress',
        recordId: record.wordId,
        updatedAt: record.lastReviewedAt || Date.now(),
        payload: record
      });
      return false;
    }
  }

  public async syncMasteredWordsArray(ids: string[]): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client || !this.currentUser) {
      this.enqueueMutation({
        entity: 'user_profile',
        recordId: 'mastered_words_v1',
        updatedAt: Date.now(),
        payload: ids
      });
      return false;
    }

    try {
      const { error } = await client
        .from('user_profiles')
        .update({
          mastered_words_v1: ids,
          client_updated_at: Date.now()
        })
        .eq('user_id', this.currentUser.id);
      return !error;
    } catch {
      return false;
    }
  }

  public async syncMistakeRecord(record: MistakeRecord): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client || !this.currentUser) {
      this.enqueueMutation({
        entity: 'mistakes_notebook',
        recordId: record.id,
        updatedAt: record.timestamp || Date.now(),
        payload: record
      });
      return false;
    }

    try {
      const { error } = await client.from('mistakes_notebook').upsert(
        {
          user_id: this.currentUser.id,
          id: record.id,
          question: record.question || '',
          user_answer: record.userAnswer || '',
          correct_answer: record.correctAnswer || '',
          explanation: record.explanation || '',
          category: record.sourceMode || 'Quiz',
          timestamp: record.timestamp || Date.now(),
          raw_payload: record
        },
        { onConflict: 'user_id,id' }
      );
      if (error) throw error;
      this.syncStatus = 'synced';
      this.notifyListeners();
      return true;
    } catch {
      this.enqueueMutation({
        entity: 'mistakes_notebook',
        recordId: record.id,
        updatedAt: record.timestamp || Date.now(),
        payload: record
      });
      return false;
    }
  }

  public async deleteMistakeFromCloud(mistakeId: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client || !this.currentUser) return false;
    try {
      const { error } = await client
        .from('mistakes_notebook')
        .delete()
        .eq('user_id', this.currentUser.id)
        .eq('id', mistakeId);
      return !error;
    } catch {
      return false;
    }
  }

  public async clearAllMistakesFromCloud(): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client || !this.currentUser) return false;
    try {
      const { error } = await client
        .from('mistakes_notebook')
        .delete()
        .eq('user_id', this.currentUser.id);
      return !error;
    } catch {
      return false;
    }
  }

  public async syncUserStatsRecord(stats: UserStats): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client || !this.currentUser) {
      this.enqueueMutation({
        entity: 'user_stats',
        recordId: 'stats',
        updatedAt: Date.now(),
        payload: stats
      });
      return false;
    }

    try {
      const { error } = await client.from('user_stats').upsert(
        {
          user_id: this.currentUser.id,
          quizzes_taken: stats.quizzesTaken || 0,
          total_questions_answered: stats.totalQuestionsAnswered || 0,
          correct_answers: stats.correctAnswers || 0,
          best_streak: stats.bestStreak || 0,
          current_streak: stats.currentStreak || 0,
          client_updated_at: Date.now()
        },
        { onConflict: 'user_id' }
      );
      if (error) throw error;
      this.syncStatus = 'synced';
      this.notifyListeners();
      return true;
    } catch {
      this.enqueueMutation({
        entity: 'user_stats',
        recordId: 'stats',
        updatedAt: Date.now(),
        payload: stats
      });
      return false;
    }
  }

  public async syncChallenge60State(data: ChallengeProgressData): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client || !this.currentUser) {
      this.enqueueMutation({
        entity: 'challenge_60',
        recordId: 'challenge_60',
        updatedAt: Date.now(),
        payload: data
      });
      return false;
    }

    try {
      const payloadRow = {
        user_id: this.currentUser.id,
        active_day: data.activeDay || 1,
        streak: data.streak || 0,
        last_active_date: data.lastActiveDate || '',
        day_statuses: data.dayStatuses || {},
        writing_drafts: {
          ...(data.writingDrafts || {}),
          __speakingDrafts: data.speakingDrafts || {}
        },
        writing_history: {
          ...(data.writingHistory || {}),
          __speakingHistory: data.speakingHistory || {}
        },
        mastered_vocab_ids: data.masteredVocabIds || [],
        client_updated_at: Date.now()
      };

      const { error } = await client
        .from('challenge_60_progress')
        .upsert(payloadRow, { onConflict: 'user_id' });

      // Đồng bộ song song lên bảng user_challenge_progress (nếu đã tạo trên Supabase)
      void Promise.resolve(
        client.from('user_challenge_progress').upsert(payloadRow, { onConflict: 'user_id' })
      ).catch(() => {});

      if (error) throw error;
      this.syncStatus = 'synced';
      this.notifyListeners();
      return true;
    } catch {
      this.enqueueMutation({
        entity: 'challenge_60',
        recordId: 'challenge_60',
        updatedAt: Date.now(),
        payload: data
      });
      return false;
    }
  }

  public async syncUserWritingLog(record: WritingSubmissionRecord): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client || !this.currentUser) {
      this.enqueueMutation({
        entity: 'challenge_60',
        recordId: `writing_log_${record.id}`,
        updatedAt: record.submittedAt || Date.now(),
        payload: record
      });
      return false;
    }

    try {
      const { error } = await client.from('user_writing_logs').upsert(
        {
          id: record.id,
          user_id: this.currentUser.id,
          day: record.day,
          task_type: record.taskType || 'writing_task2',
          exam_type: record.examType || 'IELTS & VSTEP',
          prompt: record.prompt || '',
          content: record.text,
          word_count: record.wordCount || 0,
          used_target_vocab: record.usedTargetVocab || [],
          feedback: record.feedback || null,
          submitted_at: record.submittedAt || Date.now()
        },
        { onConflict: 'user_id,id' }
      );
      return !error;
    } catch {
      return false;
    }
  }

  public async syncWorkspaceTodosList(todos: WorkspaceTodoRecord[]): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client || !this.currentUser) {
      this.enqueueMutation({
        entity: 'workspace_todos',
        recordId: 'todos',
        updatedAt: Date.now(),
        payload: todos
      });
      return false;
    }

    try {
      const userId = this.currentUser.id;
      const todoRows = todos.map((t) => ({
        user_id: userId,
        todo_id: t.id,
        text: t.text,
        date: t.date || 'Hôm nay',
        done: Boolean(t.done)
      }));
      if (todoRows.length > 0) {
        const { error } = await client
          .from('workspace_todos')
          .upsert(todoRows, { onConflict: 'user_id,todo_id' });
        if (error) throw error;
      }
      this.syncStatus = 'synced';
      this.notifyListeners();
      return true;
    } catch {
      this.enqueueMutation({
        entity: 'workspace_todos',
        recordId: 'todos',
        updatedAt: Date.now(),
        payload: todos
      });
      return false;
    }
  }

  public async syncUserProfileData(
    profile: Record<string, any>,
    themePreference?: 'light' | 'dark'
  ): Promise<boolean> {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(PROFILE_UPDATED_AT_KEY, String(Date.now()));
      } catch {}
    }

    const client = getSupabaseClient();
    if (!client || !this.currentUser) {
      this.enqueueMutation({
        entity: 'user_profile',
        recordId: 'profile',
        updatedAt: Date.now(),
        payload: { profile, themePreference }
      });
      return false;
    }

    try {
      const userId = this.currentUser.id;
      const currentTheme =
        themePreference ||
        (localStorage.getItem(LEARNING_KEYS.THEME) as 'light' | 'dark') ||
        'light';
      const masteredIds = safeReadJson<string[]>('leximaster_mastered_words_v1', []);
      const cardStatus = safeReadJson<Record<string, any>>('leximaster_card_status_v1', {});
      const reportRecipient =
        localStorage.getItem('master_english_report_recipient_v1') || profile.email || '';

      const { error } = await client.from('user_profiles').upsert(
        {
          user_id: userId,
          name: profile.name || 'Học Viên IELTS',
          email: profile.email || this.currentUser.email || '',
          gender: profile.gender || 'Nam',
          dob: profile.dob || '',
          location: profile.location || 'Việt Nam',
          student_category: profile.studentCategory || 'Sinh viên Đại học',
          current_level: profile.currentLevel || 'Upper-Intermediate (Band 7.0)',
          exam_target: profile.examTarget || 'IELTS Academic',
          target_band: profile.targetBand || 'BAND 7.0+',
          words_per_session_goal: Number(profile.wordsPerSessionGoal || 15),
          daily_study_minutes_goal: Number(profile.dailyStudyMinutesGoal || 45),
          avatar_pose: profile.avatarPose || 'welcome-heart',
          custom_avatar_url: profile.customAvatarUrl || '',
          theme_preference: currentTheme,
          report_recipient: { email: reportRecipient },
          mastered_words_v1: masteredIds,
          card_status_v1: cardStatus,
          profile_payload: profile,
          client_updated_at: Date.now()
        },
        { onConflict: 'user_id' }
      );

      if (error) throw error;
      this.syncStatus = 'synced';
      this.notifyListeners();
      return true;
    } catch {
      this.enqueueMutation({
        entity: 'user_profile',
        recordId: 'profile',
        updatedAt: Date.now(),
        payload: { profile, themePreference }
      });
      return false;
    }
  }

  public async syncPdfStructuresState(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    const savedIds = safeReadJson<string[]>('master_english_pdf_lib_saved_v1', []);
    const learnedIds = safeReadJson<string[]>('master_english_pdf_lib_learned_v2', []);
    const activeStructureId =
      localStorage.getItem('master_english_pdf_lib_active_v2') || 'pdf-item-1';
    const userNotes = safeReadJson<any[]>('master_english_pdf_lib_notes_v1', []);

    const pdfStructuresState = {
      savedIds,
      learnedIds,
      activeStructureId,
      userNotes,
      updatedAt: Date.now()
    };

    try {
      const cardStatus = safeReadJson<Record<string, any>>('leximaster_card_status_v1', {});
      cardStatus.__pdfStructuresState = pdfStructuresState;
      localStorage.setItem('leximaster_card_status_v1', JSON.stringify(cardStatus));

      const profile = safeReadJson<Record<string, any>>(LEARNING_KEYS.USER_PROFILE, {});
      profile.pdfStructuresState = pdfStructuresState;
      localStorage.setItem(LEARNING_KEYS.USER_PROFILE, JSON.stringify(profile));

      return await this.syncUserProfileData(profile);
    } catch {
      return false;
    }
  }
}

export const dataRepository = new DataRepositoryService();
