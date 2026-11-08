import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowUp } from 'lucide-react';
import { AnalyticsProvider, useAnalytics } from './context/AnalyticsContext';
import { FloatingPillNavbar } from './components/FloatingPillNavbar';
import { CinematicSplashHero } from './components/CinematicSplashHero';
import { WarmLightWorkspace, WorkspaceMode } from './components/WarmLightWorkspace';
import { DarkSaaSAnalytics } from './components/DarkSaaSAnalytics';
import { UserProfileDrawer } from './components/UserProfileDrawer';
import { LiveAiTutorModal } from './components/LiveAiTutorModal';
import { SessionSummaryModal } from './components/SessionSummaryModal';
import { FloatingMascotHelper } from './components/FloatingMascotHelper';
import { EditorialAuthModal } from './components/EditorialAuthModal';
import { getSupabaseClient, signOutSupabase } from './services/supabaseClient';
import {
  subscribeToFirebaseAuth,
  getCurrentAuthUser,
  logout as logoutFirebase
} from './services/gmailService';
import { installGlobalSoundListeners } from './utils/soundManager';
import {
  getActiveAuthUser,
  setActiveAuthUser,
  clearActiveAuthUser,
  deriveCleanDisplayName,
  OWNER_EMAIL
} from './utils/userStorageScope';

type AppView = 'home' | 'workspace' | 'analytics';

interface ResolvedRoute {
  view: AppView;
  mode: WorkspaceMode;
  isProtected: boolean;
  label: string;
}

interface PendingAuthIntent {
  view: AppView;
  mode: WorkspaceMode;
  openAiTutor?: boolean;
  openProfile?: boolean;
  label: string;
}

function getWorkspaceModeLabel(mode: WorkspaceMode): string {
  switch (mode) {
    case 'dashboard':
      return 'Trang Chủ Học Tập (Workspace)';
    case 'directory':
      return 'Từ Điển 3,666+ Từ Học Thuật';
    case 'challenge-60':
      return 'Lộ Trình 60 Ngày IELTS';
    case 'speed':
      return 'Từ Vựng Tốc Độ (Speed Quiz)';
    case 'structures':
    case 'structure':
      return 'Cấu Trúc & Ngữ Pháp Band 8.0+';
    case 'flashcards':
      return 'Flashcard 3D Lật Thẻ';
    case 'collocations':
      return 'Collocations & Giới Từ';
    case 'distinctions':
      return 'Phân Biệt Từ Dễ Nhầm';
    case 'matching':
    case 'node-matching':
      return 'Nối Từ Tương Tác';
    case 'context':
      return 'Ngữ Cảnh IELTS Thực Chiến';
    case 'mistakes':
      return 'Ngân Hàng Lỗi Sai';
    default:
      return 'Không Gian Học Tập Mastere';
  }
}

function resolveRouteFromPath(pathname: string): ResolvedRoute {
  const clean = pathname.toLowerCase().replace(/\/+$/, '') || '/';
  if (clean === '/' || clean === '/home') {
    return {
      view: 'home',
      mode: 'dashboard',
      isProtected: false,
      label: 'Trang Bìa Mastere'
    };
  }
  if (clean === '/auth/callback' || clean.startsWith('/auth')) {
    return {
      view: 'workspace',
      mode: 'dashboard',
      isProtected: false,
      label: 'Xác Thực Đăng Nhập Google...'
    };
  }
  if (clean === '/ielts-60-day' || clean === '/challenge-60') {
    return {
      view: 'workspace',
      mode: 'challenge-60',
      isProtected: true,
      label: 'Lộ Trình 60 Ngày IELTS'
    };
  }
  if (clean === '/dictionary' || clean === '/tu-dien') {
    return {
      view: 'workspace',
      mode: 'directory',
      isProtected: true,
      label: 'Từ Điển 3,666+ Từ Học Thuật'
    };
  }
  if (clean === '/analytics' || clean === '/schedule') {
    return {
      view: 'analytics',
      mode: 'dashboard',
      isProtected: true,
      label: 'Analytics Báo Chí & Tiến Độ'
    };
  }
  if (clean === '/dashboard' || clean === '/workspace') {
    return {
      view: 'workspace',
      mode: 'dashboard',
      isProtected: true,
      label: 'Trang Chủ Học Tập (Workspace)'
    };
  }
  // Unknown or protected deep-link defaults to protected workspace dashboard
  return {
    view: 'workspace',
    mode: 'dashboard',
    isProtected: true,
    label: 'Trang Chủ Học Tập (Workspace)'
  };
}

function getPathForState(view: AppView, mode: WorkspaceMode): string {
  if (view === 'home') return '/';
  if (view === 'analytics') return '/analytics';
  if (mode === 'challenge-60') return '/ielts-60-day';
  if (mode === 'directory') return '/dictionary';
  return '/dashboard';
}

function AppContent() {
  const initialRouteRef = useRef<ResolvedRoute>(resolveRouteFromPath(window.location.pathname));

  // Auth states (Supabase Session + Firebase Auth User + Verified Account Registry)
  const [hasSupabaseSession, setHasSupabaseSession] = useState<boolean>(() => {
    const active = getActiveAuthUser();
    return Boolean(active && (active.provider === 'supabase' || active.provider === 'local'));
  });
  const [hasFirebaseUser, setHasFirebaseUser] = useState<boolean>(() => Boolean(getCurrentAuthUser()));
  const [supabaseEmail, setSupabaseEmail] = useState<string>(() => {
    const active = getActiveAuthUser();
    return active && (active.provider === 'supabase' || active.provider === 'local') ? active.email : '';
  });
  const [firebaseEmail, setFirebaseEmail] = useState<string>(() => getCurrentAuthUser()?.email || '');
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);

  const isAuthenticated = hasSupabaseSession || hasFirebaseUser;

  // Always start on 'home' (TRANG BÌA) until auth is verified so unauthenticated users NEVER see a white screen or protected flash
  const [activeView, setActiveView] = useState<AppView>('home');
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>(initialRouteRef.current.mode);

  // Auth Modal & Post-Login Intent Redirect state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [pendingIntent, setPendingIntent] = useState<PendingAuthIntent | null>(null);
  const hasHandledInitialRouteRef = useRef<boolean>(false);

  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isAiTutorOpen, setIsAiTutorOpen] = useState<boolean>(false);
  const [aiTutorData, setAiTutorData] = useState<any>(null);

  const {
    toastMessage,
    isSummaryModalOpen,
    closeSummaryModal,
    lastCompletedSession,
    userProfile,
    updateUserProfile,
    refreshStorageState,
    pauseSession,
    resumeSession,
    setTargetMinutes,
    endAndSaveSession
  } = useAnalytics();

  // Owner-only text selection & copy permission (trongthai17072006@gmail.com)
  const activeAuthEmail = (supabaseEmail || firebaseEmail || (isAuthenticated ? userProfile?.email || '' : ''))
    .toLowerCase()
    .trim();
  const isOwnerAllowedToCopy = isAuthenticated && activeAuthEmail === OWNER_EMAIL;

  useEffect(() => {
    if (isOwnerAllowedToCopy) {
      document.body.classList.add('allow-copy');
    } else {
      document.body.classList.remove('allow-copy');
    }

    const handleCopyOrCut = (e: ClipboardEvent) => {
      if (isOwnerAllowedToCopy) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
    };

    document.addEventListener('copy', handleCopyOrCut);
    document.addEventListener('cut', handleCopyOrCut);
    return () => {
      document.removeEventListener('copy', handleCopyOrCut);
      document.removeEventListener('cut', handleCopyOrCut);
    };
  }, [isOwnerAllowedToCopy]);

  // 0. Initialize global Web Audio peak-sliced sound effects (jack-plug & pageturning)
  useEffect(() => {
    const cleanupSounds = installGlobalSoundListeners();
    return () => cleanupSounds();
  }, []);

  // 1. Check Supabase & Firebase Auth sessions on mount and subscribe to changes
  useEffect(() => {
    let supabaseChecked = false;
    let firebaseChecked = false;

    const markReadyIfBothChecked = () => {
      if (supabaseChecked && firebaseChecked) {
        setIsAuthReady(true);
      }
    };

    const sb = getSupabaseClient();
    let sbSubscription: { unsubscribe: () => void } | null = null;

    if (sb) {
      sb.auth
        .getSession()
        .then(({ data }) => {
          if (data?.session?.user) {
            const u = data.session.user;
            setActiveAuthUser({
              id: u.id,
              email: u.email || '',
              name: u.user_metadata?.full_name || u.user_metadata?.name,
              provider: 'supabase'
            });
            setHasSupabaseSession(true);
            setSupabaseEmail(u.email || '');
            if (
              window.location.pathname.includes('/auth/callback') ||
              window.location.hash.includes('access_token')
            ) {
              setActiveView('workspace');
              setWorkspaceMode('dashboard');
              window.history.replaceState({ view: 'workspace', mode: 'dashboard' }, '', '/dashboard');
            }
          } else {
            const persistedActive = getActiveAuthUser();
            if (persistedActive && (persistedActive.provider === 'supabase' || persistedActive.provider === 'local')) {
              setHasSupabaseSession(true);
              setSupabaseEmail(persistedActive.email);
            } else {
              setHasSupabaseSession(false);
              setSupabaseEmail('');
            }
          }
        })
        .catch(() => {
          const persistedActive = getActiveAuthUser();
          if (persistedActive) {
            setHasSupabaseSession(true);
            setSupabaseEmail(persistedActive.email);
          } else {
            setHasSupabaseSession(false);
            setSupabaseEmail('');
          }
        })
        .finally(() => {
          supabaseChecked = true;
          markReadyIfBothChecked();
        });

      const { data: listener } = sb.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          const u = session.user;
          setActiveAuthUser({
            id: u.id,
            email: u.email || '',
            name: u.user_metadata?.full_name || u.user_metadata?.name,
            provider: 'supabase'
          });
          setHasSupabaseSession(true);
          setSupabaseEmail(u.email || '');

          if (
            window.location.pathname.includes('/auth/callback') ||
            window.location.hash.includes('access_token')
          ) {
            setActiveView('workspace');
            setWorkspaceMode('dashboard');
            window.history.replaceState({ view: 'workspace', mode: 'dashboard' }, '', '/dashboard');
          }
        } else if (event === 'SIGNED_OUT') {
          clearActiveAuthUser();
          setHasSupabaseSession(false);
          setSupabaseEmail('');
          void logoutFirebase();
          setHasFirebaseUser(false);
          setFirebaseEmail('');
        }
      });
      sbSubscription = listener.subscription;
    } else {
      const persistedActive = getActiveAuthUser();
      if (persistedActive) {
        setHasSupabaseSession(true);
        setSupabaseEmail(persistedActive.email);
      }
      supabaseChecked = true;
    }

    const unsubscribeFirebase = subscribeToFirebaseAuth((fbUser) => {
      if (fbUser?.email) {
        setActiveAuthUser({
          id: fbUser.uid,
          email: fbUser.email,
          name: fbUser.displayName || undefined,
          provider: 'firebase'
        });
      }
      setHasFirebaseUser(Boolean(fbUser));
      setFirebaseEmail(fbUser?.email || '');
      if (!firebaseChecked) {
        firebaseChecked = true;
        markReadyIfBothChecked();
      }
    });

    // Safety fallback in case network/IndexedDB takes longer than 600ms
    const fallbackTimer = window.setTimeout(() => {
      setIsAuthReady(true);
    }, 600);

    return () => {
      window.clearTimeout(fallbackTimer);
      sbSubscription?.unsubscribe();
      unsubscribeFirebase();
    };
  }, []);

  // 2. Handle initial URL route once Auth check completes (F5 / Direct Deep Link Protection)
  useEffect(() => {
    if (!isAuthReady || hasHandledInitialRouteRef.current) return;
    hasHandledInitialRouteRef.current = true;

    const initialRoute = initialRouteRef.current;
    if (!initialRoute.isProtected) {
      if (initialRoute.view === 'workspace') {
        setActiveView('workspace');
        setWorkspaceMode(initialRoute.mode);
        return;
      }
      setActiveView('home');
      return;
    }

    if (isAuthenticated) {
      // User is already logged in on F5 -> unlock and render their requested route directly
      setActiveView(initialRoute.view);
      setWorkspaceMode(initialRoute.mode);
    } else {
      // User is NOT logged in and tried to access /dashboard, /dictionary, /ielts-60-day, or /analytics
      // Keep them on TRANG BÌA, save their intent, replace URL to '/', and open the Auth Modal
      setActiveView('home');
      setPendingIntent({
        view: initialRoute.view,
        mode: initialRoute.mode,
        label: initialRoute.label
      });
      window.history.replaceState({ view: 'home', mode: 'dashboard' }, '', '/');
      setIsAuthModalOpen(true);
    }
  }, [isAuthReady, isAuthenticated]);

  // 3. Enforce protection if auth is lost while on a protected view
  useEffect(() => {
    if (isAuthReady && !isAuthenticated && activeView !== 'home') {
      setActiveView('home');
      if (window.location.pathname !== '/' && window.location.pathname !== '/home') {
        window.history.replaceState({ view: 'home', mode: 'dashboard' }, '', '/');
      }
    }
  }, [isAuthReady, isAuthenticated, activeView]);

  // 4. Protected Navigation & Auth Interception
  const navigateApp = useCallback(
    (nextView: AppView, nextMode?: WorkspaceMode, customIntentLabel?: string) => {
      const resolvedMode = nextMode ?? workspaceMode;

      // Public route ('home' / TRANG BÌA) is always accessible
      if (nextView === 'home') {
        setActiveView('home');
        const targetPath = getPathForState('home', resolvedMode);
        if (window.location.pathname !== targetPath && window.location.pathname !== '/home') {
          window.history.pushState({ view: 'home', mode: resolvedMode }, '', targetPath);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // Intercept protected navigation when NOT authenticated
      if (!isAuthenticated) {
        const intentLabel =
          customIntentLabel ||
          (nextView === 'analytics'
            ? 'Analytics Báo Chí & Tiến Độ'
            : getWorkspaceModeLabel(resolvedMode));

        setPendingIntent({
          view: nextView,
          mode: resolvedMode,
          label: intentLabel
        });
        setIsAuthModalOpen(true);
        return;
      }

      // Authenticated navigation
      setActiveView(nextView);
      if (nextMode) {
        setWorkspaceMode(nextMode);
      }
      const targetPath = getPathForState(nextView, resolvedMode);
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ view: nextView, mode: resolvedMode }, '', targetPath);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [isAuthenticated, workspaceMode]
  );

  // 5. Protected AI Tutor & Profile handlers
  const handleProtectedOpenAiTutor = useCallback(
    (tutorData?: any) => {
      if (tutorData) {
        setAiTutorData(tutorData);
      }
      if (!isAuthenticated) {
        setPendingIntent({
          view: activeView === 'home' ? 'workspace' : activeView,
          mode: workspaceMode,
          openAiTutor: true,
          label: 'Cố Vấn Học Thuật AI Tutor'
        });
        setIsAuthModalOpen(true);
        return;
      }
      setIsAiTutorOpen(true);
    },
    [isAuthenticated, activeView, workspaceMode]
  );

  const handleProtectedOpenProfile = useCallback(() => {
    if (!isAuthenticated) {
      setPendingIntent({
        view: 'workspace',
        mode: 'dashboard',
        openProfile: true,
        label: 'Hồ Sơ Học Viên & Thẻ Nhà Báo'
      });
      setIsAuthModalOpen(true);
      return;
    }
    setIsProfileOpen(true);
  }, [isAuthenticated]);

  // 6. Post-Login Intent Redirect: Immediately execute pendingIntent upon successful login/signup
  const handleAuthSuccess = useCallback(
    (userInfo: { id?: string; email: string; name?: string; provider: 'supabase' | 'firebase' }) => {
      // Activate strict user storage namespace BEFORE reading/writing profile
      const activeIdentity = setActiveAuthUser({
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        provider: userInfo.provider
      });

      if (userInfo.provider === 'supabase') {
        setHasSupabaseSession(true);
        if (userInfo.email) setSupabaseEmail(userInfo.email);
      } else {
        setHasFirebaseUser(true);
        if (userInfo.email) setFirebaseEmail(userInfo.email);
      }

      // Read any existing profile strictly from THIS user's isolated namespace
      let existingUserScopedProfile: Record<string, any> = {};
      try {
        const rawScoped = localStorage.getItem('master_english_user_profile_v2');
        if (rawScoped) {
          existingUserScopedProfile = JSON.parse(rawScoped) || {};
        }
      } catch {}

      const resolvedName = deriveCleanDisplayName(
        userInfo.email,
        existingUserScopedProfile.name || userInfo.name || activeIdentity.name
      );
      const resolvedEmail = userInfo.email.trim().toLowerCase();

      updateUserProfile({
        name: resolvedName,
        email: resolvedEmail,
        gender: existingUserScopedProfile.gender || '',
        dob: existingUserScopedProfile.dob || '',
        location: existingUserScopedProfile.location || '',
        studentCategory: existingUserScopedProfile.studentCategory || '',
        currentLevel: existingUserScopedProfile.currentLevel || 'Upper-Intermediate (Band 7.0)',
        examTarget: existingUserScopedProfile.examTarget || 'IELTS Academic',
        targetBand: existingUserScopedProfile.targetBand || 'BAND 7.0+',
        wordsPerSessionGoal: existingUserScopedProfile.wordsPerSessionGoal || 15,
        dailyStudyMinutesGoal: existingUserScopedProfile.dailyStudyMinutesGoal || 45,
        avatarPose: existingUserScopedProfile.avatarPose || 'welcome-heart',
        customAvatarUrl: existingUserScopedProfile.customAvatarUrl || '',
        membership: existingUserScopedProfile.membership || 'MASTER English Lifetime Pro'
      });

      refreshStorageState();
      setIsAuthModalOpen(false);

      const targetIntent = pendingIntent || {
        view: 'workspace' as AppView,
        mode: 'dashboard' as WorkspaceMode,
        label: 'Trang Chủ Học Tập (Workspace)'
      };

      setPendingIntent(null);

      if (targetIntent.openAiTutor) {
        setIsAiTutorOpen(true);
      }
      if (targetIntent.openProfile) {
        setIsProfileOpen(true);
      }

      const destinationView = targetIntent.view === 'home' ? 'workspace' : targetIntent.view;
      const destinationMode = targetIntent.mode || 'dashboard';

      setActiveView(destinationView);
      setWorkspaceMode(destinationMode);

      const targetPath = getPathForState(destinationView, destinationMode);
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ view: destinationView, mode: destinationMode }, '', targetPath);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [pendingIntent, updateUserProfile, refreshStorageState]
  );

  // 7. Global Sign Out: Revoke session, flush active user memory, close drawers, return to TRANG BÌA ('home')
  const handleGlobalSignOut = useCallback(async () => {
    try {
      await Promise.allSettled([signOutSupabase(), logoutFirebase()]);
    } finally {
      clearActiveAuthUser();
      setHasSupabaseSession(false);
      setHasFirebaseUser(false);
      setSupabaseEmail('');
      setFirebaseEmail('');
      setIsProfileOpen(false);
      setIsAiTutorOpen(false);
      setPendingIntent(null);
      setActiveView('home');
      if (window.location.pathname !== '/') {
        window.history.pushState({ view: 'home', mode: 'dashboard' }, '', '/');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    const onPopState = () => {
      const route = resolveRouteFromPath(window.location.pathname);
      if (route.isProtected && !isAuthenticated) {
        setActiveView('home');
        setPendingIntent({
          view: route.view,
          mode: route.mode,
          label: route.label
        });
        window.history.replaceState({ view: 'home', mode: 'dashboard' }, '', '/');
        setIsAuthModalOpen(true);
        return;
      }
      setActiveView(route.view);
      setWorkspaceMode(route.mode);
    };
    const onNavigateTrangNhat = () => {
      navigateApp('home');
    };
    const onGlobalSignOutEvent = () => {
      handleGlobalSignOut();
    };
    window.addEventListener('popstate', onPopState);
    window.addEventListener('navigate-home-trang-nhat', onNavigateTrangNhat);
    window.addEventListener('master-english-sign-out', onGlobalSignOutEvent);
    return () => {
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('navigate-home-trang-nhat', onNavigateTrangNhat);
      window.removeEventListener('master-english-sign-out', onGlobalSignOutEvent);
    };
  }, [navigateApp, isAuthenticated, handleGlobalSignOut]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Ensure browser tab title is always strictly 'Mastere'
  useEffect(() => {
    document.title = 'Mastere';
  }, [activeView, workspaceMode]);

  useEffect(() => {
    const handleOpenTutorWithWord = (e: Event) => {
      const customEvent = e as CustomEvent<{ word?: string; data?: any }>;
      let resolvedData: any = null;
      if (customEvent.detail?.data) {
        resolvedData = customEvent.detail.data;
      } else if (customEvent.detail?.word) {
        resolvedData = {
          title: `Phân tích chuyên sâu: ${customEvent.detail.word}`,
          word1: customEvent.detail.word,
          meaning: 'Từ vựng học thuật IELTS trọng tâm',
          nuanceExplanation: `Từ "${customEvent.detail.word}" thường xuất hiện trong các bài đọc và bài luận IELTS Writing Task 2 mang tính học thuật cao.`,
          writingExample: `Applying "${customEvent.detail.word}" accurately elevates Lexical Resource to Band 7.5+.`,
          speakingExample: `In Speaking Part 3, "${customEvent.detail.word}" demonstrates strong academic register.`,
          commonMistake: 'Chú ý kết hợp đúng giới từ (collocation) đi kèm trong ngữ cảnh học thuật.',
          examTip: 'Ưu tiên sử dụng trong câu chủ đề (Topic Sentence) của đoạn thân bài.'
        };
      }
      handleProtectedOpenAiTutor(resolvedData);
    };

    const handleAiNavigate = (e: Event) => {
      const customEvent = e as CustomEvent<{
        sectionId?: string;
        workspaceMode?: WorkspaceMode | 'analytics' | 'profile';
        filterKeyword?: string;
      }>;
      const mode = customEvent.detail?.workspaceMode;
      if (!mode) return;
      if (mode === 'analytics') {
        navigateApp('analytics');
      } else if (mode === 'profile') {
        handleProtectedOpenProfile();
      } else {
        navigateApp('workspace', mode as WorkspaceMode);
      }
      refreshStorageState();
    };

    const handleAiTimerControl = (e: Event) => {
      const customEvent = e as CustomEvent<{ action?: string; targetMinutes?: number }>;
      const action = customEvent.detail?.action;
      if (action === 'pause') {
        pauseSession();
      } else if (action === 'resume') {
        resumeSession();
      } else if (action === 'change_target' && customEvent.detail?.targetMinutes) {
        setTargetMinutes(customEvent.detail.targetMinutes);
      } else if (action === 'end_and_save') {
        endAndSaveSession();
      }
      refreshStorageState();
    };

    window.addEventListener('open-ai-tutor-word', handleOpenTutorWithWord);
    window.addEventListener('master-english-ai-navigate', handleAiNavigate);
    window.addEventListener('master-english-ai-timer-control', handleAiTimerControl);
    return () => {
      window.removeEventListener('open-ai-tutor-word', handleOpenTutorWithWord);
      window.removeEventListener('master-english-ai-navigate', handleAiNavigate);
      window.removeEventListener('master-english-ai-timer-control', handleAiTimerControl);
    };
  }, [
    handleProtectedOpenAiTutor,
    handleProtectedOpenProfile,
    navigateApp,
    pauseSession,
    resumeSession,
    setTargetMinutes,
    endAndSaveSession,
    refreshStorageState
  ]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Enforce zero-flicker: if unauthenticated, always display 'home' (TRANG BÌA)
  const effectiveView: AppView = isAuthenticated ? activeView : 'home';

  return (
    <div className="min-h-screen flex flex-col relative newspaper-bg text-[#181614] selection:bg-[#C92532] selection:text-[#F1E7D3]">
      {/* Show top newspaper bar on /home splash and /analytics so user can always switch views */}
      {effectiveView !== 'workspace' && (
        <FloatingPillNavbar
          activeView={effectiveView}
          activeWorkspaceMode={workspaceMode}
          onSelectView={(view) => navigateApp(view)}
          onSelectWorkspaceMode={(mode) => navigateApp('workspace', mode)}
          onOpenProfile={handleProtectedOpenProfile}
          onOpenAiTutor={() => handleProtectedOpenAiTutor()}
          isAuthenticated={isAuthenticated}
          onOpenAuthModal={(intentLabel) => {
            setPendingIntent({
              view: 'workspace',
              mode: 'dashboard',
              label: intentLabel || 'Trang Chủ Học Tập (Workspace)'
            });
            setIsAuthModalOpen(true);
          }}
          onSignOut={handleGlobalSignOut}
        />
      )}

      {/* Main Content View Switcher */}
      <main className="flex-grow flex flex-col">
        {effectiveView === 'home' && (
          <CinematicSplashHero
            onEnterWorkspace={(mode) => {
              navigateApp('workspace', mode || 'dashboard');
            }}
            onOpenAnalytics={() => {
              navigateApp('analytics');
            }}
          />
        )}

        {effectiveView === 'workspace' && isAuthenticated && (
          <WarmLightWorkspace
            initialMode={workspaceMode}
            onModeChange={(mode) => {
              setWorkspaceMode(mode);
              const targetPath = getPathForState('workspace', mode);
              if (window.location.pathname !== targetPath) {
                window.history.pushState({ view: 'workspace', mode }, '', targetPath);
              }
            }}
            onOpenAnalytics={() => navigateApp('analytics')}
            onOpenProfile={handleProtectedOpenProfile}
            onOpenTutor={(data) => handleProtectedOpenAiTutor(data)}
          />
        )}

        {effectiveView === 'analytics' && isAuthenticated && (
          <DarkSaaSAnalytics
            onStartPractice={() => {
              navigateApp('workspace', 'dashboard');
            }}
          />
        )}
      </main>

      {/* Vintage Newspaper Editorial Footer */}
      {effectiveView !== 'home' && (
        <footer className="py-5 text-center border-t-2 border-[#493B2D] bg-[#DCC9A8] text-[#181614]" style={{ backgroundImage: 'var(--fiber), var(--grain)' }}>
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-[3px] bg-[#C92532] border border-[#181614] flex items-center justify-center text-[#F1E7D3] font-serif font-bold text-xs">
                M
              </span>
              <span className="font-oswald font-bold text-sm tracking-wider uppercase text-[#181614]">
                MASTER ENGLISH — THE VINTAGE ACADEMIC GAZETTE
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-dm font-semibold text-[#51483D]">
              <button
                type="button"
                onClick={() => navigateApp('home')}
                className="hover:text-[#C92532] underline decoration-[#493B2D] cursor-pointer"
              >
                Trang Bìa (Splash)
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => navigateApp('workspace', 'dashboard')}
                className="hover:text-[#C92532] underline decoration-[#493B2D] cursor-pointer"
              >
                Trang Chủ
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => navigateApp('workspace', 'directory')}
                className="hover:text-[#C92532] underline decoration-[#493B2D] cursor-pointer"
              >
                Từ Điển
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => navigateApp('workspace', 'challenge-60')}
                className="hover:text-[#C92532] underline decoration-[#493B2D] cursor-pointer"
              >
                Lộ Trình 60 Ngày
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => navigateApp('analytics')}
                className="hover:text-[#C92532] underline decoration-[#493B2D] cursor-pointer"
              >
                Analytics
              </button>
            </div>
          </div>
        </footer>
      )}

      {/* Editorial Auth Gate Modal (Rendered over blurred Trang Bìa) */}
      <EditorialAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        pendingIntentLabel={pendingIntent?.label || null}
      />

      {/* User Profile Drawer */}
      <UserProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onSignOutSuccess={handleGlobalSignOut}
      />

      {/* Live AI Tutor Modal */}
      <LiveAiTutorModal
        isOpen={isAiTutorOpen}
        onClose={() => {
          setIsAiTutorOpen(false);
          setAiTutorData(null);
        }}
        data={aiTutorData}
        activeSection={
          effectiveView === 'analytics'
            ? 'bao_cao'
            : isProfileOpen
            ? 'the_nha_bao'
            : workspaceMode
        }
        isQuizActive={effectiveView === 'workspace' && workspaceMode === 'speed'}
      />

      {/* Post-Session Evaluation Modal */}
      <SessionSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={closeSummaryModal}
        session={lastCompletedSession}
        targetWordsPerSession={userProfile.wordsPerSessionGoal || 15}
        onViewAnalytics={() => {
          closeSummaryModal();
          navigateApp('analytics');
        }}
      />

      {/* Floating Mascot Helper */}
      <FloatingMascotHelper
        onOpenTutor={() => handleProtectedOpenAiTutor()}
      />

      {/* Real-time Sync Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-[5px] bg-[#181614] border-2 border-[#C92532] text-[#F1E7D3] text-xs font-oswald tracking-wider uppercase font-bold shadow-[3px_3px_0px_#C92532] flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[#C92532] animate-ping" />
          {toastMessage}
        </div>
      )}

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 w-10 h-10 rounded-[5px] bg-[#C92532] border-2 border-[#181614] text-[#F1E7D3] shadow-[2px_2px_0px_#181614] flex items-center justify-center hover:bg-[#991D27] transition-all cursor-pointer"
          aria-label="Lên đầu trang"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AnalyticsProvider>
      <AppContent />
    </AnalyticsProvider>
  );
}
