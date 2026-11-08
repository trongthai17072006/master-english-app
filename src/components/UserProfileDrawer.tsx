import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, User, Mail, MapPin, Calendar, Award, 
  CreditCard, ShieldCheck, CheckCircle2, Sparkles, 
  Edit3, Save, Camera, Check, Target, Clock, BookOpen,
  Download, Upload, Database, FileCheck2, AlertTriangle, RotateCcw,
  Cloud, CloudOff, LogIn, LogOut, ShieldAlert, RefreshCw, KeyRound,
  ChevronDown, Crown, Plus
} from 'lucide-react';
import { MascotDisplay, MascotPose } from './MascotDisplay';
import { ContentImporterModal } from './ContentImporterModal';
import { AdminGuard } from './AdminGuard';
import { VINTAGE_EDITORIAL_ASSETS, VintageEngravingFrame } from './VintageNewspaperIllustrations';
import { useAdminAccess } from '../utils/adminAuth';
import { loadCustomContentStore, CUSTOM_CONTENT_EVENT } from '../services/customContentStore';
import { useAnalytics, UserProfileData } from '../context/AnalyticsContext';
import {
  getLocalDataSummary,
  downloadBackupJson,
  getLastBackupMeta,
  validateBackupJson,
  restoreFromBackupPayload,
  hasPreRestoreSnapshot,
  rollbackPreRestoreSnapshot,
  BackupDataSummary,
  MasterEnglishBackupPayload,
  LastBackupMeta
} from '../services/backupService';
import {
  supabase,
  signInWithEmailPassword,
  signUpWithEmailPassword,
  signInWithGoogleOAuth,
  signOutSupabase
} from '../services/supabaseClient';
import {
  dataRepository,
  RepositorySnapshot,
  CloudConnectionCheckResult
} from '../services/dataRepository';

interface UserProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSignOutSuccess?: () => void;
}

const AVAILABLE_AVATAR_POSES: { pose: MascotPose; label: string }[] = [
  { pose: 'welcome-heart', label: 'Ôm Sách Nháy Mắt' },
  { pose: 'active-jump', label: 'Nhảy Vui Vẻ' },
  { pose: 'reading-stack', label: 'Chống Cằm Đọc Sách' },
  { pose: 'correct-thumb', label: 'Giơ Ngón Cái Like' },
  { pose: 'sleeping-zzz', label: 'Nằm Ngủ Thảnh Thơi' },
  { pose: 'hug-heart', label: 'Ôm Trái Tim IELTS' },
  { pose: 'teacher-bulb', label: 'Giáo Sư Chỉ Bảng' },
  { pose: 'walking-backpack', label: 'Đeo Balo Đi Học' },
  { pose: 'celebrate-stars', label: 'Reo Hò Sao Sáng' },
  { pose: 'neon-hero', label: 'Neon Hero Đỏ' }
];

export const UserProfileDrawer: React.FC<UserProfileDrawerProps> = ({
  isOpen,
  onClose,
  onSignOutSuccess
}) => {
  const {
    userProfile,
    updateUserProfile,
    profileCompletionPercent,
    totalUniqueMasteredWords,
    totalUniqueWordsInDatabase,
    refreshStorageState
  } = useAnalytics();

  // Local form state
  const [formData, setFormData] = useState<UserProfileData>({ ...userProfile });
  const { isAdminAuthenticated, lockSession } = useAdminAccess(userProfile?.email);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState<boolean>(false);

  // Phase 2: Backup & Restore state
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [localSummary, setLocalSummary] = useState<BackupDataSummary>(() => getLocalDataSummary());
  const [lastBackup, setLastBackup] = useState<LastBackupMeta | null>(() => getLastBackupMeta());
  const [backupNotice, setBackupNotice] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);
  const [inspectedFile, setInspectedFile] = useState<{
    fileName: string;
    payload: MasterEnglishBackupPayload;
    warnings: string[];
  } | null>(null);
  const [canRollback, setCanRollback] = useState<boolean>(() => hasPreRestoreSnapshot());

  // Phase 3: Supabase Auth & DataRepository state
  const [repoSnapshot, setRepoSnapshot] = useState<RepositorySnapshot>(() =>
    dataRepository.getSnapshot()
  );
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authEmail, setAuthEmail] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [authBusy, setAuthBusy] = useState<boolean>(false);
  const [authNotice, setAuthNotice] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);
  const [rlsCheckResult, setRlsCheckResult] = useState<CloudConnectionCheckResult | null>(null);

  // Collapsible Accordion state for Section 3 (Backup) & Section 4 (Cloud) — default collapsed
  const [isBackupExpanded, setIsBackupExpanded] = useState<boolean>(false);
  const [isCloudExpanded, setIsCloudExpanded] = useState<boolean>(false);
  const [isContentImporterOpen, setIsContentImporterOpen] = useState<boolean>(false);
  const [customContentSummary, setCustomContentSummary] = useState(() => {
    const store = loadCustomContentStore();
    return {
      vocabCount: store.customVocab.length,
      structureCount: store.customStructures.length,
      dayOverridesCount: Object.keys(store.customChallengeDays).length
    };
  });

  useEffect(() => {
    const refreshCustom = () => {
      const store = loadCustomContentStore();
      setCustomContentSummary({
        vocabCount: store.customVocab.length,
        structureCount: store.customStructures.length,
        dayOverridesCount: Object.keys(store.customChallengeDays).length
      });
    };
    window.addEventListener(CUSTOM_CONTENT_EVENT, refreshCustom);
    return () => window.removeEventListener(CUSTOM_CONTENT_EVENT, refreshCustom);
  }, []);

  useEffect(() => {
    const unsubscribe = dataRepository.subscribe((snapshot) => {
      setRepoSnapshot(snapshot);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isOpen) {
      setFormData({ ...userProfile });
      setLocalSummary(getLocalDataSummary());
      setLastBackup(getLastBackupMeta());
      setCanRollback(hasPreRestoreSnapshot());
      setRepoSnapshot(dataRepository.getSnapshot());
      const store = loadCustomContentStore();
      setCustomContentSummary({
        vocabCount: store.customVocab.length,
        structureCount: store.customStructures.length,
        dayOverridesCount: Object.keys(store.customChallengeDays).length
      });
    }
  }, [isOpen, userProfile]);

  if (!isOpen) return null;

  const handleSave = () => {
    updateUserProfile(formData);
    setIsEditing(false);
    setLocalSummary(getLocalDataSummary());
  };

  const handleSelectAvatar = (pose: MascotPose) => {
    setFormData(prev => ({ ...prev, avatarPose: pose, customAvatarUrl: '' }));
    setShowAvatarPicker(false);
  };

  const handleExportBackup = () => {
    try {
      const { fileName, payload } = downloadBackupJson();
      setLocalSummary(payload.summary);
      setLastBackup(getLastBackupMeta());
      setBackupNotice({
        type: 'success',
        text: `Đã tải file "${fileName}" về máy thành công! Dữ liệu trên trình duyệt được giữ nguyên 100%.`
      });
    } catch (err: any) {
      setBackupNotice({
        type: 'error',
        text: `Không thể xuất file sao lưu: ${err?.message || 'Lỗi không xác định'}`
      });
    }
  };

  const handleSelectBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const rawText = typeof reader.result === 'string' ? reader.result : '';
      const result = validateBackupJson(rawText);
      if (!result.valid || !result.payload) {
        setInspectedFile(null);
        setBackupNotice({
          type: 'error',
          text: result.error || 'File sao lưu không hợp lệ.'
        });
      } else {
        setInspectedFile({
          fileName: file.name,
          payload: result.payload,
          warnings: result.warnings || []
        });
        setBackupNotice({
          type: 'info',
          text: `Đã kiểm tra file "${file.name}" — Cấu trúc dữ liệu hợp lệ 100%. Bạn có thể xem bảng đối chiếu bên dưới.`
        });
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleConfirmRestore = (mode: 'merge' | 'overwrite') => {
    if (!inspectedFile) return;
    const res = restoreFromBackupPayload(inspectedFile.payload, mode);
    if (res.success) {
      refreshStorageState();
      if (inspectedFile.payload.data.master_english_user_profile_v2) {
        updateUserProfile(inspectedFile.payload.data.master_english_user_profile_v2);
        setFormData(inspectedFile.payload.data.master_english_user_profile_v2);
      }
      setLocalSummary(res.updatedSummary);
      setCanRollback(hasPreRestoreSnapshot());
      setInspectedFile(null);
      setBackupNotice({
        type: 'success',
        text: res.message
      });
    } else {
      setBackupNotice({
        type: 'error',
        text: res.message
      });
    }
  };

  const handleRollbackRestore = () => {
    const res = rollbackPreRestoreSnapshot();
    if (res.success) {
      refreshStorageState();
      setLocalSummary(getLocalDataSummary());
      setBackupNotice({
        type: 'success',
        text: res.message
      });
    } else {
      setBackupNotice({
        type: 'error',
        text: res.message
      });
    }
  };

  // Phase 3: Supabase Auth & Connection Handlers
  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim() || !authPassword) {
      setAuthNotice({
        type: 'error',
        text: 'Vui lòng nhập đầy đủ Email và Mật khẩu (tối thiểu 6 ký tự).'
      });
      return;
    }

    setAuthBusy(true);
    setAuthNotice(null);
    try {
      const res =
        authMode === 'signin'
          ? await signInWithEmailPassword(authEmail, authPassword)
          : await signUpWithEmailPassword(authEmail, authPassword, formData.name);

      setAuthNotice({
        type: res.success ? 'success' : 'error',
        text: res.message
      });
      if (res.success && !res.requiresEmailConfirmation) {
        setAuthPassword('');
        const nextEmail = res.user?.email || authEmail.trim().toLowerCase();
        const nextName =
          res.user?.user_metadata?.full_name ||
          res.user?.user_metadata?.name ||
          formData.name ||
          nextEmail.split('@')[0];
        updateUserProfile({
          ...formData,
          name: nextName,
          email: nextEmail
        });
        refreshStorageState();
      }
    } finally {
      setAuthBusy(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthBusy(true);
    setAuthNotice(null);
    try {
      if (!supabase) {
        const res = await signInWithGoogleOAuth();
        setAuthNotice({
          type: res.success ? 'info' : 'error',
          text: res.message
        });
        return;
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) {
        setAuthNotice({
          type: 'error',
          text: `Không thể khởi tạo Google OAuth: ${error.message}`
        });
      } else if (data?.url) {
        setAuthNotice({
          type: 'info',
          text: 'Đang chuyển hướng sang cổng xác thực Google...'
        });
      }
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSignOutCloud = async () => {
    setAuthBusy(true);
    setAuthNotice(null);
    try {
      const res = await signOutSupabase();
      setRlsCheckResult(null);
      setAuthNotice({
        type: res.success ? 'info' : 'error',
        text: res.message
      });
      onSignOutSuccess?.();
    } finally {
      setAuthBusy(false);
    }
  };

  const handleVerifyCloudSchema = async () => {
    setAuthBusy(true);
    setAuthNotice(null);
    try {
      const res = await dataRepository.verifyCloudSchemaAndRLS();
      setRlsCheckResult(res);
      setAuthNotice({
        type: res.tablesReady ? 'success' : res.reachable ? 'info' : 'error',
        text: res.message
      });
    } finally {
      setAuthBusy(false);
    }
  };

  // Phase 4: Full 2-Way Cloud Migration & Sync Handler
  const handleSyncAllWithCloud = async () => {
    setAuthBusy(true);
    setAuthNotice(null);
    try {
      const res = await dataRepository.syncAllDataWithCloud('manual');
      refreshStorageState();
      setLocalSummary(getLocalDataSummary());
      setRepoSnapshot(dataRepository.getSnapshot());
      setAuthNotice({
        type: res.success ? 'success' : 'error',
        text: res.message
      });
    } finally {
      setAuthBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-[#181614]/70 backdrop-blur-xs">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="w-full max-w-lg h-full bg-[#E9DCC2] border-l-2 border-[#181614] shadow-[-8px_0px_28px_rgba(24,22,20,0.45)] p-5 sm:p-6 overflow-y-auto space-y-4 flex flex-col justify-between text-[#181614]"
      >
        <div className="space-y-4">
          {/* Vintage Newspaper Academic Dossier Masthead */}
          <div className="border-b-2 border-[#181614] pb-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-[10px] font-oswald uppercase tracking-[0.2em] text-[#51483D] border-b border-[#493B2D]/40 pb-1.5">
              <span className="font-bold text-[#C92532]">PRESS CREDENTIALS &amp; EDITOR DOSSIER</span>
              <span>MASTER ENGLISH NEWSROOM</span>
            </div>

            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <div className="relative cursor-pointer group shrink-0" onClick={() => setShowAvatarPicker(true)}>
                  <div className="w-15 h-15 sm:w-16 sm:h-16 rounded-[2px] bg-[#F1E7D3] border-2 border-[#181614] shadow-[2px_2px_0px_#181614] flex items-center justify-center overflow-hidden">
                    <img
                      src={VINTAGE_EDITORIAL_ASSETS.mascot.graduationCap}
                      alt="Tổng Biên Tập MASTER English"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover scale-[1.12] object-center block"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#C92532] border border-[#181614] rounded-[2px] text-[#F1E7D3] flex items-center justify-center">
                    <Camera className="w-3 h-3" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base sm:text-lg font-black text-[#181614] font-serif leading-snug uppercase">
                    HỒ SƠ TỔNG BIÊN TẬP &amp; THẺ NHÀ BÁO
                  </h2>
                  <p className="text-[11px] font-serif italic text-[#51483D] mt-0.5 leading-snug">
                    "Thông tin định danh, cấp bậc bút lực (EXP) và dấu ấn thành tựu tại tòa soạn."
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[#2C2520]">
                    <span className="text-[#2E5A36] font-bold uppercase tracking-wider">★ Thẻ Nhà Báo Chính Thức</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums font-bold text-[#C92532]">
                      {formData.targetBand}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums font-semibold text-[#181614]">
                      {localSummary.pdfStructuresLearnedCount}/77 quy chuẩn
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Đóng hồ sơ"
                className="p-2 rounded-[2px] text-[#2C2520] hover:text-[#181614] bg-[#F1E7D3] border border-[#181614] hover:border-[#C92532] transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* AVATAR PICKER POPUP */}
          <AnimatePresence>
            {showAvatarPicker && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-[#F1E7D3] border-2 border-[#181614] rounded-[2px] shadow-[3px_3px_0px_#181614] space-y-3"
              >
                <div className="flex items-center justify-between border-b border-[#493B2D]/40 pb-2">
                  <span className="text-xs font-oswald font-bold uppercase tracking-wider text-[#181614]">
                    Chọn Ấn Bản Chân Dung Học Thuật
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAvatarPicker(false)}
                    className="text-xs font-bold text-[#C92532] hover:underline cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {AVAILABLE_AVATAR_POSES.map((item, idx) => {
                    const woodcutList = [
                      VINTAGE_EDITORIAL_ASSETS.mascot.graduationCap,
                      VINTAGE_EDITORIAL_ASSETS.mascot.glassesBook,
                      VINTAGE_EDITORIAL_ASSETS.mascot.compass,
                      VINTAGE_EDITORIAL_ASSETS.mascot.dictionaryArmchair,
                      VINTAGE_EDITORIAL_ASSETS.mascot.writingQuill,
                      VINTAGE_EDITORIAL_ASSETS.mascot.oilLamp,
                      VINTAGE_EDITORIAL_ASSETS.mascot.scroll,
                      VINTAGE_EDITORIAL_ASSETS.mascot.telescope,
                      VINTAGE_EDITORIAL_ASSETS.mascot.nearBooks,
                      VINTAGE_EDITORIAL_ASSETS.mascot.sleepingBook,
                    ];
                    const imgSrc = woodcutList[idx % woodcutList.length];
                    return (
                      <button
                        key={item.pose}
                        type="button"
                        onClick={() => handleSelectAvatar(item.pose)}
                        className={`p-1.5 rounded-[2px] border flex flex-col items-center justify-center transition-all cursor-pointer ${
                          formData.avatarPose === item.pose
                            ? 'border-[#C92532] bg-[#E8B7AC]/55 shadow-[1px_1px_0px_#181614]'
                            : 'border-[#181614] bg-[#E9DCC2] hover:bg-[#DCC9A8]'
                        }`}
                        title={item.label}
                      >
                        <div className="w-11 h-11 border border-[#181614] overflow-hidden bg-[#F1E7D3]">
                          <img
                            src={imgSrc}
                            alt={item.label}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover scale-[1.12] object-center block"
                          />
                        </div>
                        <span className="text-[10px] font-bold text-[#181614] truncate w-full text-center mt-1">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Profile Completion Bar (Editorial Hairline Block) */}
          <div className="p-3.5 bg-[#F1E7D3] border border-[#493B2D] rounded-[2px] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-oswald font-bold uppercase tracking-wider text-[#181614]">
                Mức độ hoàn thiện hồ sơ học thuật
              </span>
              <span className="font-mono tabular-nums text-xs font-extrabold text-[#C92532]">
                {profileCompletionPercent}% hoàn tất
              </span>
            </div>
            <div className="w-full h-2 bg-[#DCC9A8] border border-[#493B2D] rounded-[2px] overflow-hidden">
              <div
                className="h-full bg-[#C92532] transition-all duration-500"
                style={{ width: `${profileCompletionPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-[#51483D] font-serif italic">
              {profileCompletionPercent < 100
                ? 'Hãy điền đủ thông tin cá nhân và mục tiêu học tập để đạt 100% hồ sơ hoàn thiện.'
                : 'Hồ sơ của bạn đã hoàn thiện 100% và đồng bộ với mục tiêu luyện thi IELTS.'}
            </p>
          </div>

          {/* Form Content: Thông Tin Cá Nhân & Dữ Liệu Học Tập */}
          <div className="space-y-4">
            {/* Action Bar: Chế độ Chỉnh sửa */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-oswald font-bold uppercase tracking-wider text-[#51483D]">
                Cài đặt hồ sơ và dữ liệu học tập
              </span>
              <button
                type="button"
                onClick={() => {
                  if (isEditing) {
                    handleSave();
                  } else {
                    setIsEditing(true);
                  }
                }}
                className={`text-xs font-bold px-3 py-1.5 rounded-[2px] border transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isEditing
                    ? 'bg-[#C92532] text-[#F1E7D3] border-[#181614] shadow-[2px_2px_0px_#181614]'
                    : 'bg-[#F1E7D3] border-[#493B2D] text-[#C92532] hover:border-[#181614]'
                }`}
              >
                {isEditing ? (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Lưu thay đổi</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Chỉnh sửa hồ sơ</span>
                  </>
                )}
              </button>
            </div>

            {/* Khối 1 & 2: Editorial Divided Surface */}
            <div className="bg-[#F1E7D3] border border-[#493B2D] rounded-[2px] divide-y divide-[#493B2D]/40 text-xs">
              {/* Khối 1: Thông Tin Cá Nhân */}
              <div className="p-4 space-y-3">
                <div className="font-oswald font-bold uppercase tracking-wider text-[#C92532] text-xs flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>1. Thông tin cá nhân</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#51483D]">Họ và tên</label>
                    {isEditing ? (
                      <input
                        type="text"
                        placeholder="Nhập họ và tên của bạn..."
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-1.5 bg-[#E9DCC2] border border-[#493B2D] rounded-[2px] text-xs text-[#181614] focus:outline-hidden focus:border-[#C92532]"
                      />
                    ) : formData.name.trim() ? (
                      <div className="font-bold text-[#181614]">{formData.name}</div>
                    ) : (
                      <div className="italic text-[#796B59] text-[11px]">
                        Chưa thiết lập — Bấm Chỉnh sửa hồ sơ để điền
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#51483D]">Email liên hệ</label>
                    {isEditing ? (
                      <input
                        type="email"
                        placeholder="Nhập địa chỉ email..."
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-1.5 bg-[#E9DCC2] border border-[#493B2D] rounded-[2px] text-xs text-[#181614] focus:outline-hidden focus:border-[#C92532]"
                      />
                    ) : formData.email.trim() ? (
                      <div className="font-medium text-[#181614] truncate">{formData.email}</div>
                    ) : (
                      <div className="italic text-[#796B59] text-[11px]">
                        Chưa thiết lập — Bấm Chỉnh sửa hồ sơ để điền
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-[#493B2D]/30">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#51483D]">Giới tính</label>
                    {isEditing ? (
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-[#E9DCC2] border border-[#493B2D] rounded-[2px] text-xs text-[#181614] focus:outline-hidden focus:border-[#C92532]"
                      >
                        <option value="">-- Chọn --</option>
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                        <option value="Khác">Khác</option>
                      </select>
                    ) : formData.gender.trim() ? (
                      <div className="font-medium text-[#181614]">{formData.gender}</div>
                    ) : (
                      <div className="italic text-[#796B59] text-[11px]">Chưa thiết lập</div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#51483D]">Ngày sinh</label>
                    {isEditing ? (
                      <input
                        type="text"
                        placeholder="DD/MM/YYYY"
                        value={formData.dob}
                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-[#E9DCC2] border border-[#493B2D] rounded-[2px] text-xs text-[#181614] focus:outline-hidden focus:border-[#C92532]"
                      />
                    ) : formData.dob.trim() ? (
                      <div className="font-mono tabular-nums font-medium text-[#181614]">{formData.dob}</div>
                    ) : (
                      <div className="italic text-[#796B59] text-[11px]">Chưa thiết lập</div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#51483D]">Địa điểm</label>
                    {isEditing ? (
                      <input
                        type="text"
                        placeholder="Tỉnh / Thành phố"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-[#E9DCC2] border border-[#493B2D] rounded-[2px] text-xs text-[#181614] focus:outline-hidden focus:border-[#C92532]"
                      />
                    ) : formData.location.trim() ? (
                      <div className="font-medium text-[#181614] truncate">{formData.location}</div>
                    ) : (
                      <div className="italic text-[#796B59] text-[11px]">Chưa thiết lập</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Khối 2: Dữ Liệu & Mục Tiêu Học Tập */}
              <div className="p-4 space-y-3">
                <div className="font-oswald font-bold uppercase tracking-wider text-[#C92532] text-xs flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" />
                  <span>2. Dữ liệu và mục tiêu học tập</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#51483D]">Phân loại người học</label>
                    {isEditing ? (
                      <select
                        value={formData.studentCategory}
                        onChange={(e) => setFormData({ ...formData, studentCategory: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-[#E9DCC2] border border-[#493B2D] rounded-[2px] text-xs text-[#181614] focus:outline-hidden focus:border-[#C92532]"
                      >
                        <option value="">-- Chọn phân loại --</option>
                        <option value="Sinh viên Đại học">Sinh viên Đại học</option>
                        <option value="Học sinh THPT">Học sinh THPT</option>
                        <option value="Người đi làm">Người đi làm</option>
                        <option value="Giảng viên / Luyện thi">Giảng viên / Luyện thi</option>
                      </select>
                    ) : formData.studentCategory.trim() ? (
                      <div className="font-medium text-[#181614]">{formData.studentCategory}</div>
                    ) : (
                      <div className="italic text-[#796B59] text-[11px]">Chưa thiết lập</div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#51483D]">Mục tiêu bài thi</label>
                    {isEditing ? (
                      <select
                        value={formData.examTarget}
                        onChange={(e) => setFormData({ ...formData, examTarget: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-[#E9DCC2] border border-[#493B2D] rounded-[2px] text-xs text-[#181614] focus:outline-hidden focus:border-[#C92532]"
                      >
                        <option value="IELTS Academic">IELTS Academic</option>
                        <option value="IELTS General">IELTS General</option>
                        <option value="TOEFL iBT">TOEFL iBT</option>
                        <option value="GMAT / GRE">GMAT / GRE</option>
                      </select>
                    ) : (
                      <div className="font-medium text-[#181614]">{formData.examTarget}</div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-[#493B2D]/30">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#51483D]">Mức điểm mục tiêu</label>
                    {isEditing ? (
                      <select
                        value={formData.targetBand}
                        onChange={(e) => setFormData({ ...formData, targetBand: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-[#E9DCC2] border border-[#493B2D] rounded-[2px] text-xs font-bold text-[#C92532] focus:outline-hidden focus:border-[#C92532]"
                      >
                        <option value="BAND 7.0+">BAND 7.0+</option>
                        <option value="BAND 7.5+">BAND 7.5+</option>
                        <option value="BAND 8.0+">BAND 8.0+</option>
                      </select>
                    ) : (
                      <div className="font-mono tabular-nums font-bold text-[#C92532]">{formData.targetBand}</div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#51483D]">Từ học / phiên</label>
                    {isEditing ? (
                      <input
                        type="number"
                        min="5"
                        max="50"
                        value={formData.wordsPerSessionGoal}
                        onChange={(e) => setFormData({ ...formData, wordsPerSessionGoal: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 bg-[#E9DCC2] border border-[#493B2D] rounded-[2px] font-mono tabular-nums text-xs text-[#181614] focus:outline-hidden focus:border-[#C92532]"
                      />
                    ) : (
                      <div className="font-bold text-[#181614]">
                        <span className="font-mono tabular-nums">{formData.wordsPerSessionGoal}</span> từ
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#51483D]">Thời lượng / ngày</label>
                    {isEditing ? (
                      <input
                        type="number"
                        min="15"
                        max="180"
                        value={formData.dailyStudyMinutesGoal}
                        onChange={(e) => setFormData({ ...formData, dailyStudyMinutesGoal: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 bg-[#E9DCC2] border border-[#493B2D] rounded-[2px] font-mono tabular-nums text-xs text-[#181614] focus:outline-hidden focus:border-[#C92532]"
                      />
                    ) : (
                      <div className="font-bold text-[#181614]">
                        <span className="font-mono tabular-nums">{formData.dailyStudyMinutesGoal}</span> phút
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Nút Nạp / Mở rộng dữ liệu thu gọn duy nhất */}
            <button
              type="button"
              onClick={() => setIsContentImporterOpen(true)}
              className="w-full py-2.5 px-3 bg-[#C92532] hover:bg-[#991D27] text-[#F1E7D3] border border-[#181614] shadow-[2px_2px_0px_#181614] text-xs font-oswald font-bold uppercase tracking-wider rounded-[2px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>+ Nạp / Mở rộng dữ liệu</span>
            </button>

            {/* Khối 3: Sao Lưu & Bảo Toàn Dữ Liệu (.JSON) */}
            <div className="bg-[#F1E7D3] border border-[#493B2D] rounded-[2px] text-xs overflow-hidden transition-all">
              <button
                type="button"
                onClick={() => setIsBackupExpanded((prev) => !prev)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#E9DCC2] transition-colors cursor-pointer"
              >
                <div className="font-oswald font-bold uppercase tracking-wider text-[#C92532] text-xs flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 shrink-0" />
                  <span>3. Sao lưu và bảo toàn dữ liệu (.JSON)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[#2E5A36]">
                    {lastBackup ? 'Đã sao lưu' : 'Sẵn sàng'}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#51483D] transition-transform duration-200 ${
                      isBackupExpanded ? 'rotate-180 text-[#C92532]' : ''
                    }`}
                  />
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isBackupExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-3 border-t border-[#493B2D]/40 space-y-3">
                      <div className="grid grid-cols-5 divide-x divide-[#493B2D]/40 border border-[#493B2D] bg-[#E9DCC2] rounded-[2px] text-center">
                        <div className="py-2 px-1">
                          <div className="font-mono tabular-nums font-bold text-xs text-[#181614]">
                            {localSummary.completedSessionsCount}
                          </div>
                          <div className="text-[10px] text-[#51483D] font-medium truncate">Phiên học</div>
                        </div>
                        <div className="py-2 px-1">
                          <div className="font-mono tabular-nums font-bold text-xs text-[#181614]">
                            {localSummary.wordProgressCount}
                          </div>
                          <div className="text-[10px] text-[#51483D] font-medium truncate">Từ SRS</div>
                        </div>
                        <div className="py-2 px-1 bg-[#E8B7AC]/35">
                          <div className="font-mono tabular-nums font-bold text-xs text-[#C92532]">
                            {localSummary.pdfStructuresLearnedCount}/77
                          </div>
                          <div className="text-[10px] text-[#991D27] font-semibold truncate">Cấu trúc</div>
                        </div>
                        <div className="py-2 px-1">
                          <div className="font-mono tabular-nums font-bold text-xs text-[#181614]">
                            {localSummary.challengeCompletedDaysCount}/60
                          </div>
                          <div className="text-[10px] text-[#51483D] font-medium truncate">Ngày 60d</div>
                        </div>
                        <div className="py-2 px-1">
                          <div className="font-mono tabular-nums font-bold text-xs text-[#181614]">
                            {localSummary.mistakesCount}
                          </div>
                          <div className="text-[10px] text-[#51483D] font-medium truncate">Lỗi sai</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#51483D]">
                        <span>
                          Đã lưu: <strong className="font-mono tabular-nums text-[#181614]">{localSummary.pdfStructuresSavedCount}</strong> cấu trúc
                          {' · '}
                          Sổ tay câu tự đặt: <strong className="font-mono tabular-nums text-[#181614]">{localSummary.pdfStructuresNotesCount}</strong> câu
                        </span>
                        {lastBackup && (
                          <span className="font-mono tabular-nums text-[#2E5A36]">{lastBackup.checksum}</span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={handleExportBackup}
                          className="w-full py-2 px-3 bg-[#C92532] hover:bg-[#991D27] text-[#F1E7D3] border border-[#181614] text-xs font-bold rounded-[2px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 shrink-0" />
                          <span>Tải bản sao lưu (.JSON)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full py-2 px-3 bg-[#E9DCC2] hover:bg-[#DCC9A8] text-[#181614] border border-[#493B2D] hover:border-[#181614] text-xs font-bold rounded-[2px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5 text-[#C92532] shrink-0" />
                          <span>Khôi phục từ file</span>
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".json,application/json"
                          onChange={handleSelectBackupFile}
                          className="hidden"
                        />
                      </div>

                      {backupNotice && (
                        <div
                          className={`p-2.5 rounded-[2px] border text-[11px] flex items-start gap-2 ${
                            backupNotice.type === 'success'
                              ? 'bg-[#DCE6D5] border-[#2E5A36] text-[#2E5A36]'
                              : backupNotice.type === 'error'
                              ? 'bg-[#E8B7AC]/45 border-[#991D27] text-[#991D27]'
                              : 'bg-[#E9DCC2] border-[#493B2D] text-[#181614]'
                          }`}
                        >
                          {backupNotice.type === 'success' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#2E5A36]" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 leading-relaxed font-medium">{backupNotice.text}</div>
                        </div>
                      )}

                      {inspectedFile && (
                        <div className="p-3 bg-[#E9DCC2] border border-[#493B2D] rounded-[2px] space-y-2.5">
                          <div className="flex items-center justify-between border-b border-[#493B2D]/40 pb-1.5">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <FileCheck2 className="w-3.5 h-3.5 text-[#2E5A36] shrink-0" />
                              <span className="font-bold text-[#181614] text-[11px] truncate">
                                {inspectedFile.fileName}
                              </span>
                            </div>
                            <span className="font-mono text-[10px] font-bold text-[#2E5A36] shrink-0">
                              {inspectedFile.payload.checksum}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 divide-x divide-y divide-[#493B2D]/40 border border-[#493B2D] bg-[#F1E7D3] rounded-[2px] text-[11px]">
                            <div className="p-2 flex justify-between">
                              <span className="text-[#51483D]">Phiên:</span>
                              <span className="font-mono tabular-nums font-bold text-[#181614]">
                                {inspectedFile.payload.summary.completedSessionsCount}
                              </span>
                            </div>
                            <div className="p-2 flex justify-between">
                              <span className="text-[#51483D]">Từ SRS:</span>
                              <span className="font-mono tabular-nums font-bold text-[#181614]">
                                {inspectedFile.payload.summary.wordProgressCount}
                              </span>
                            </div>
                            <div className="p-2 flex justify-between bg-[#E8B7AC]/35">
                              <span className="text-[#991D27] font-semibold">Cấu trúc:</span>
                              <span className="font-mono tabular-nums font-bold text-[#C92532]">
                                {inspectedFile.payload.summary.pdfStructuresLearnedCount}/77
                              </span>
                            </div>
                            <div className="p-2 flex justify-between">
                              <span className="text-[#51483D]">60 Ngày:</span>
                              <span className="font-mono tabular-nums font-bold text-[#181614]">
                                {inspectedFile.payload.summary.challengeCompletedDaysCount}/60
                              </span>
                            </div>
                            <div className="p-2 flex justify-between">
                              <span className="text-[#51483D]">Sổ tay câu:</span>
                              <span className="font-mono tabular-nums font-bold text-[#181614]">
                                {inspectedFile.payload.summary.pdfStructuresNotesCount}
                              </span>
                            </div>
                            <div className="p-2 flex justify-between">
                              <span className="text-[#51483D]">Lỗi sai:</span>
                              <span className="font-mono tabular-nums font-bold text-[#181614]">
                                {inspectedFile.payload.summary.mistakesCount}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                            <button
                              type="button"
                              onClick={() => {
                                setInspectedFile(null);
                                setBackupNotice({
                                  type: 'success',
                                  text: 'File hợp lệ 100%. Đã đóng bảng kiểm tra.'
                                });
                              }}
                              className="py-1.5 px-2 bg-[#2E5A36] hover:opacity-90 text-[#F1E7D3] font-bold rounded-[2px] transition-all text-[11px] cursor-pointer"
                            >
                              Chỉ xác minh
                            </button>
                            <button
                              type="button"
                              onClick={() => handleConfirmRestore('merge')}
                              className="py-1.5 px-2 bg-[#C92532] hover:bg-[#991D27] text-[#F1E7D3] font-bold rounded-[2px] transition-all text-[11px] cursor-pointer"
                            >
                              Hợp nhất dữ liệu
                            </button>
                            <button
                              type="button"
                              onClick={() => handleConfirmRestore('overwrite')}
                              className="py-1.5 px-2 bg-[#F1E7D3] hover:bg-[#DCC9A8] text-[#51483D] border border-[#493B2D] font-bold rounded-[2px] transition-all text-[11px] cursor-pointer"
                            >
                              Ghi đè toàn bộ
                            </button>
                          </div>
                        </div>
                      )}

                      {canRollback && (
                        <div className="flex items-center justify-end">
                          <button
                            type="button"
                            onClick={handleRollbackRestore}
                            className="text-[11px] font-bold text-[#51483D] hover:text-[#C92532] flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Hoàn tác khôi phục vừa rồi</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Khối 4: Tài Khoản & Đồng Bộ Cloud */}
            <div className="bg-[#F1E7D3] border border-[#493B2D] rounded-[2px] text-xs overflow-hidden transition-all">
              <button
                type="button"
                onClick={() => setIsCloudExpanded((prev) => !prev)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#E9DCC2] transition-colors cursor-pointer"
              >
                <div className="font-oswald font-bold uppercase tracking-wider text-[#C92532] text-xs flex items-center gap-1.5">
                  {repoSnapshot.configStatus.isConfigured ? (
                    <Cloud className="w-3.5 h-3.5 text-[#2E5A36] shrink-0" />
                  ) : (
                    <CloudOff className="w-3.5 h-3.5 text-[#51483D] shrink-0" />
                  )}
                  <span>4. Đồng bộ Cloud 2 chiều</span>
                </div>

                <div className="flex items-center gap-2">
                  {repoSnapshot.authState === 'authenticated' ? (
                    <span className="text-[11px] font-bold text-[#2E5A36]">
                      Đã kết nối Cloud
                    </span>
                  ) : repoSnapshot.configStatus.isConfigured ? (
                    <span className="text-[11px] font-bold text-[#C92532]">
                      Sẵn sàng kết nối
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-[#51483D]">
                      Lưu cục bộ
                    </span>
                  )}
                  <ChevronDown
                    className={`w-4 h-4 text-[#51483D] transition-transform duration-200 ${
                      isCloudExpanded ? 'rotate-180 text-[#C92532]' : ''
                    }`}
                  />
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isCloudExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-3 border-t border-[#493B2D]/40 space-y-2.5">
                      {repoSnapshot.configStatus.securityWarning && (
                        <div className="p-2.5 rounded-[2px] bg-[#E8B7AC]/45 border border-[#991D27] text-[#991D27] text-[11px] flex items-start gap-2">
                          <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <div className="leading-relaxed font-medium">
                            {repoSnapshot.configStatus.securityWarning}
                          </div>
                        </div>
                      )}

                      {repoSnapshot.configStatus.isConfigured ? (
                        <>
                          {repoSnapshot.authState === 'authenticated' && repoSnapshot.user ? (
                            <div className="p-3 bg-[#E9DCC2] border border-[#493B2D] rounded-[2px] space-y-2.5">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="w-2 h-2 rounded-[2px] bg-[#2E5A36] shrink-0" />
                                  <span className="text-xs font-bold text-[#181614] truncate">
                                    {repoSnapshot.user.email}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  disabled={authBusy}
                                  onClick={handleSignOutCloud}
                                  className="px-2.5 py-1 text-[11px] font-bold text-[#51483D] hover:text-[#C92532] bg-[#F1E7D3] border border-[#493B2D] rounded-[2px] transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                                >
                                  <LogOut className="w-3 h-3" />
                                  <span>Đăng xuất</span>
                                </button>
                              </div>

                              <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#493B2D]/30">
                                <div className="text-[11px] text-[#51483D] truncate">
                                  {repoSnapshot.lastSyncReport
                                    ? `Lần cuối: ${repoSnapshot.lastSyncReport.syncedAtLocal} · ${localSummary.pdfStructuresLearnedCount}/77 cấu trúc`
                                    : `Cấu trúc: ${localSummary.pdfStructuresLearnedCount}/77 · Tự động lưu 2 chiều`}
                                </div>

                                <button
                                  type="button"
                                  disabled={authBusy || repoSnapshot.syncStatus === 'syncing'}
                                  onClick={handleSyncAllWithCloud}
                                  className="py-1.5 px-3 bg-[#C92532] hover:bg-[#991D27] disabled:opacity-60 text-[#F1E7D3] border border-[#181614] text-xs font-bold rounded-[2px] transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                                >
                                  <RefreshCw
                                    className={`w-3 h-3 ${
                                      authBusy || repoSnapshot.syncStatus === 'syncing'
                                        ? 'animate-spin'
                                        : ''
                                    }`}
                                  />
                                  <span>
                                    {repoSnapshot.syncStatus === 'syncing'
                                      ? 'Đang đồng bộ...'
                                      : 'Đồng bộ ngay'}
                                  </span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2.5 pt-0.5">
                              <div className="grid grid-cols-2 gap-1 p-1 bg-[#E9DCC2] border border-[#493B2D] rounded-[2px]">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAuthMode('signin');
                                    setAuthNotice(null);
                                  }}
                                  className={`py-1.5 rounded-[2px] text-xs font-bold transition-colors cursor-pointer ${
                                    authMode === 'signin'
                                      ? 'bg-[#C92532] text-[#F1E7D3]'
                                      : 'text-[#51483D] hover:text-[#181614]'
                                  }`}
                                >
                                  Đăng nhập
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAuthMode('signup');
                                    setAuthNotice(null);
                                  }}
                                  className={`py-1.5 rounded-[2px] text-xs font-bold transition-colors cursor-pointer ${
                                    authMode === 'signup'
                                      ? 'bg-[#C92532] text-[#F1E7D3]'
                                      : 'text-[#51483D] hover:text-[#181614]'
                                  }`}
                                >
                                  Tạo tài khoản
                                </button>
                              </div>

                              <form onSubmit={handleEmailAuthSubmit} className="space-y-2">
                                <input
                                  type="email"
                                  required
                                  placeholder="Email tài khoản..."
                                  value={authEmail}
                                  onChange={(e) => setAuthEmail(e.target.value)}
                                  className="w-full px-3 py-1.5 bg-[#E9DCC2] border border-[#493B2D] rounded-[2px] text-xs text-[#181614] focus:outline-hidden focus:border-[#C92532]"
                                />
                                <input
                                  type="password"
                                  required
                                  minLength={6}
                                  placeholder="Mật khẩu (tối thiểu 6 ký tự)..."
                                  value={authPassword}
                                  onChange={(e) => setAuthPassword(e.target.value)}
                                  className="w-full px-3 py-1.5 bg-[#E9DCC2] border border-[#493B2D] rounded-[2px] text-xs text-[#181614] focus:outline-hidden focus:border-[#C92532]"
                                />
                                <div className="grid grid-cols-2 gap-2 pt-0.5">
                                  <button
                                    type="submit"
                                    disabled={authBusy}
                                    className="w-full py-2 px-3 bg-[#C92532] hover:bg-[#991D27] disabled:opacity-60 text-[#F1E7D3] border border-[#181614] text-xs font-bold rounded-[2px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                                  >
                                    <LogIn className="w-3.5 h-3.5 shrink-0" />
                                    <span>
                                      {authBusy
                                        ? 'Đang xử lý...'
                                        : authMode === 'signin'
                                        ? 'Đăng nhập Cloud'
                                        : 'Đăng ký Cloud'}
                                    </span>
                                  </button>

                                  <button
                                    type="button"
                                    disabled={authBusy}
                                    onClick={handleGoogleSignIn}
                                    className="w-full py-2 px-3 bg-[#F1E7D3] hover:bg-[#DCC9A8] disabled:opacity-60 text-[#181614] border border-[#493B2D] text-xs font-bold rounded-[2px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                                  >
                                    <KeyRound className="w-3.5 h-3.5 text-[#C92532] shrink-0" />
                                    <span>Đăng nhập Google</span>
                                  </button>
                                </div>
                              </form>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="p-3 bg-[#E9DCC2] border border-[#493B2D] rounded-[2px] text-[11px] text-[#51483D]">
                          Chưa cấu hình biến môi trường Cloud. Toàn bộ dữ liệu (bao gồm {localSummary.pdfStructuresLearnedCount}/77 cấu trúc ngữ pháp) đang được bảo toàn trực tiếp trên trình duyệt và qua file .JSON.
                        </div>
                      )}

                      {authNotice && (
                        <div
                          className={`p-2.5 rounded-[2px] border text-[11px] flex items-start gap-2 ${
                            authNotice.type === 'success'
                              ? 'bg-[#DCE6D5] border-[#2E5A36] text-[#2E5A36]'
                              : authNotice.type === 'error'
                              ? 'bg-[#E8B7AC]/45 border-[#991D27] text-[#991D27]'
                              : 'bg-[#E9DCC2] border-[#493B2D] text-[#181614]'
                          }`}
                        >
                          {authNotice.type === 'success' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#2E5A36]" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 leading-relaxed font-medium">{authNotice.text}</div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Khối 5: 19th-Century ROYAL ACADEMY LIFETIME PRESS PASS / FELLOWSHIP CERTIFICATE */}
            <div
              className="relative w-full rounded-[2px] bg-[#DCC9A8] border-2 border-[#181614] p-1.5 shadow-[4px_4px_0px_#181614] select-none overflow-hidden"
              style={{ backgroundImage: 'var(--fiber), var(--grain)' }}
            >
              {/* Double Ink Engraving Inner Frame */}
              <div className="relative border border-[#181614] bg-[#F1E7D3]/90 p-4 sm:p-5 flex flex-col justify-between gap-4">
                {/* Ornamental Corner Rules */}
                <span className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-[#C92532] pointer-events-none" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-[#C92532] pointer-events-none" />
                <span className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-[#C92532] pointer-events-none" />
                <span className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-[#C92532] pointer-events-none" />

                {/* Top Header Row: Royal Academy Title + Wax-Seal LIFETIME FELLOW Stamp */}
                <div className="flex items-start justify-between gap-3 border-b-2 border-[#181614] pb-2.5">
                  <div>
                    <div className="flex items-center gap-1.5 text-[#C92532]">
                      <Crown className="w-4 h-4 shrink-0" />
                      <span className="font-oswald text-xs font-bold uppercase tracking-[0.14em]">
                        ROYAL ACADEMY • MASTER VIP MEMBER
                      </span>
                    </div>
                    <h4 className="font-serif font-black text-base sm:text-lg text-[#181614] tracking-tight mt-0.5">
                      Chứng Nhận Học Giả Danh Dự Trọn Đời
                    </h4>
                  </div>

                  {/* Crimson Editorial Wax-Seal Stamp */}
                  <div className="px-2.5 py-1 bg-[#C92532] text-[#F1E7D3] border border-[#181614] shadow-[2px_2px_0px_#181614] font-oswald text-[11px] font-bold uppercase tracking-widest shrink-0">
                    LIFETIME FELLOW
                  </div>
                </div>

                {/* Middle Row: Press Pass Serial & Holder Details (Left) + Woodcut Scholar Cat Engraving (Right) */}
                <div className="grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-8 space-y-2">
                    <div className="inline-block px-2.5 py-1 bg-[#E9DCC2] border border-[#181614] font-mono text-xs sm:text-sm font-black tracking-[0.14em] text-[#181614]">
                      No. 0000-8899 • ARCHIVAL PASS
                    </div>

                    <div className="space-y-0.5 pt-1">
                      <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#2C2520]">
                        CHỦ SỞ HỮU ẤN CHƯƠNG (FELLOW HOLDER):
                      </span>
                      <div className="font-serif font-black text-sm sm:text-base uppercase tracking-wide text-[#181614] truncate">
                        {(formData.name || formData.email?.split('@')[0] || 'HỌC VIÊN MỚI').toUpperCase()}
                      </div>
                    </div>

                    <p className="text-xs font-serif italic text-[#2C2520]">
                      “Được cấp toàn quyền truy cập kho 3,666+ từ vựng học thuật, 77 cấu trúc Band 8.0+ và Lộ trình 60 ngày.”
                    </p>
                  </div>

                  {/* Right: Woodcut Scholar Cat Wearing Mortarboard Cap */}
                  <div className="col-span-4 flex justify-end">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 border-2 border-[#181614] bg-[#E9DCC2] shadow-[2px_2px_0px_#181614] overflow-hidden shrink-0">
                      <img
                        src={VINTAGE_EDITORIAL_ASSETS.mascot.graduationCap}
                        alt="Royal Academy Scholar Cat"
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover scale-[1.12] object-center block"
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Archival Verification Bar */}
                <div className="pt-2 border-t border-dashed border-[#181614] flex items-center justify-between gap-2 text-xs font-mono font-bold">
                  <span className="text-[#2E5A36]">★ VERIFIED BY MASTER ENGLISH BOARD</span>
                  <span className="text-[#C92532] uppercase tracking-wider">HẠN DÙNG: TRỌN ĐỜI</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t-2 border-[#181614] space-y-2">
          {isEditing ? (
            <button
              type="button"
              onClick={handleSave}
              className="w-full py-3 bg-[#C92532] hover:bg-[#991D27] active:scale-[0.98] text-[#F1E7D3] border border-[#181614] shadow-[2px_2px_0px_#181614] text-xs font-oswald font-bold uppercase tracking-wider rounded-[2px] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>LƯU HỒ SƠ &amp; ÁP DỤNG NGAY</span>
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-[#F1E7D3] border border-[#181614] shadow-[2px_2px_0px_#181614] hover:bg-[#DCC9A8] text-[#181614] text-xs font-oswald font-bold uppercase tracking-wider rounded-[2px] transition-all cursor-pointer"
              >
                ĐÓNG HỒ SƠ
              </button>
              <button
                type="button"
                onClick={handleSignOutCloud}
                className="w-full py-2.5 bg-[#181614] hover:bg-[#C92532] text-[#F1E7D3] border border-[#181614] shadow-[2px_2px_0px_#C92532] text-xs font-oswald font-bold uppercase tracking-wider rounded-[2px] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>ĐĂNG XUẤT</span>
              </button>
            </div>
          )}
        </div>
      </motion.div>

      <ContentImporterModal
        isOpen={isContentImporterOpen}
        onClose={() => setIsContentImporterOpen(false)}
        defaultTab="vocab"
      />
    </div>
  );
};
