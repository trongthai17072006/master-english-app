import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Lock,
  Mail,
  KeyRound,
  User as UserIcon,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  BookOpen,
  RefreshCw
} from 'lucide-react';
import {
  supabase,
  signInWithEmailPassword,
  signUpWithEmailPassword,
  sendPasswordResetEmail,
  resendConfirmationEmail
} from '../services/supabaseClient';

export interface EditorialAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (userInfo: { id?: string; email: string; name?: string; provider: 'supabase' | 'firebase' }) => void;
  pendingIntentLabel?: string | null;
  initialMode?: 'signin' | 'signup';
}

export const EditorialAuthModal: React.FC<EditorialAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  pendingIntentLabel,
  initialMode = 'signin'
}) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [pendingConfirmationEmail, setPendingConfirmationEmail] = useState<string | null>(null);
  const [notice, setNotice] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setNotice(null);
      setBusy(false);
      setResendingEmail(false);
      setPendingConfirmationEmail(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleResendConfirmation = async () => {
    const targetEmail = (pendingConfirmationEmail || email).trim();
    if (!targetEmail) {
      setNotice({
        type: 'error',
        text: 'Vui lòng nhập địa chỉ Gmail để gửi lại mã xác nhận.'
      });
      return;
    }
    setResendingEmail(true);
    try {
      const res = await resendConfirmationEmail(targetEmail);
      setNotice({
        type: res.success ? 'success' : 'error',
        text: res.message
      });
    } finally {
      setResendingEmail(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setNotice({
        type: 'error',
        text: 'Vui lòng nhập địa chỉ Email hợp lệ.'
      });
      return;
    }

    if (mode === 'reset') {
      setBusy(true);
      try {
        const res = await sendPasswordResetEmail(cleanEmail);
        setNotice({
          type: res.success ? 'success' : 'error',
          text: res.message
        });
      } finally {
        setBusy(false);
      }
      return;
    }

    if (!password || password.length < 6) {
      setNotice({
        type: 'error',
        text: 'Mật khẩu phải có tối thiểu 6 ký tự.'
      });
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setNotice({
        type: 'error',
        text: 'Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại.'
      });
      return;
    }

    setBusy(true);
    try {
      if (mode === 'signin') {
        const res = await signInWithEmailPassword(cleanEmail, password);
        if (!res.success) {
          if (res.requiresEmailConfirmation) {
            setPendingConfirmationEmail(cleanEmail);
          }
          setNotice({
            type: 'error',
            text:
              res.message.includes('Invalid login credentials')
                ? 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại hoặc chuyển sang tab Đăng ký.'
                : res.message
          });
          return;
        }

        setPendingConfirmationEmail(null);
        setNotice({
          type: 'success',
          text: 'Đăng nhập thành công! Đang mở khóa Không Gian Học Tập...'
        });
        const displayName =
          res.user?.user_metadata?.full_name ||
          res.user?.user_metadata?.name ||
          cleanEmail.split('@')[0];
        onAuthSuccess({
          id: res.user?.id,
          email: res.user?.email || cleanEmail,
          name: displayName,
          provider: 'supabase'
        });
      } else {
        const cleanName = fullName.trim() || cleanEmail.split('@')[0];
        const res = await signUpWithEmailPassword(cleanEmail, password, cleanName);
        if (!res.success) {
          if (res.requiresEmailConfirmation) {
            setPendingConfirmationEmail(cleanEmail);
          }
          setNotice({
            type: 'error',
            text: res.message
          });
          return;
        }

        if (res.session || res.user) {
          setPendingConfirmationEmail(null);
          setNotice({
            type: 'success',
            text: 'Đăng ký tài khoản thành công! Đang khởi tạo hồ sơ mới (Lv.1)...'
          });
          onAuthSuccess({
            id: res.user?.id,
            email: res.user?.email || cleanEmail,
            name: cleanName,
            provider: 'supabase'
          });
        } else {
          setPendingConfirmationEmail(cleanEmail);
          setNotice({
            type: 'info',
            text:
              res.message ||
              `Vui lòng kiểm tra hộp thư Gmail (${cleanEmail}) bao gồm cả mục Spam/Quảng cáo để xác nhận tài khoản.`
          });
        }
      }
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleLogin = async () => {
    setBusy(true);
    setNotice(null);
    try {
      if (!supabase) {
        setNotice({
          type: 'error',
          text: 'Chưa cấu hình kết nối Supabase. Vui lòng dùng Email & Mật khẩu.'
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
        setNotice({
          type: 'error',
          text: `Không thể khởi tạo Google OAuth: ${error.message}`
        });
      } else if (data?.url) {
        setNotice({
          type: 'info',
          text: 'Đang chuyển hướng sang cổng xác thực Google...'
        });
      }
    } catch (err: any) {
      setNotice({
        type: 'error',
        text: err?.message || 'Không thể đăng nhập bằng Google. Vui lòng thử lại.'
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#181614]/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-[480px] bg-[#f4efe6] text-[#1a1a1a] border-[3px] border-[#1a1a1a] shadow-[8px_8px_0px_#1a1a1a] rounded-[2px] overflow-hidden select-none"
          style={{ backgroundImage: 'var(--fiber), var(--grain)' }}
        >
          {/* Top Vintage Newspaper Dateline Strip */}
          <div className="bg-[#1a1a1a] text-[#f4efe6] px-4 py-2 border-b-2 border-[#b91c1c] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[11px] font-oswald uppercase tracking-[0.16em] font-bold">
              <span className="inline-block w-2 h-2 bg-[#b91c1c]" />
              <span>THE ACADEMIC EDITORIAL • PRESS CREDENTIALS</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng cửa sổ đăng nhập"
              className="p-1 text-[#f4efe6]/80 hover:text-white hover:bg-[#b91c1c] rounded-[2px] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 sm:p-6 space-y-4">
            {/* Editorial Masthead Header */}
            <div className="text-center border-b-2 border-[#1a1a1a] pb-4 space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E9DCC2] border border-[#1a1a1a] text-[11px] font-mono font-bold uppercase tracking-wider text-[#b91c1c]">
                <Lock className="w-3.5 h-3.5" />
                <span>CỔNG XÁC THỰC ĐỘC GIẢ CHÍNH THỨC</span>
              </div>

              <h2 className="font-serif font-black text-2xl sm:text-[26px] tracking-tight uppercase text-[#1a1a1a] leading-none pt-1">
                MASTER ENGLISH
              </h2>
              <p className="text-xs font-serif italic text-[#51483D]">
                “Better Me. Everyday.” — Không gian học thuật IELTS 8.0+ &amp; Kho 3,666+ thuật ngữ.
              </p>

              {/* Intercepted Destination Banner */}
              {pendingIntentLabel && (
                <div className="mt-2.5 p-2.5 bg-[#E9DCC2] border-[1.5px] border-[#1a1a1a] border-l-4 border-l-[#b91c1c] text-left flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#51483D] font-bold">
                      Đích đến sau khi đăng nhập:
                    </div>
                    <div className="text-xs font-oswald font-bold uppercase text-[#b91c1c] truncate flex items-center gap-1.5 mt-0.5">
                      <BookOpen className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{pendingIntentLabel}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-[#1a1a1a] text-[#f4efe6] font-mono text-[10px] font-bold uppercase shrink-0">
                    Tự động mở
                  </span>
                </div>
              )}
            </div>

            {/* Mode Switcher Tabs (Sign In / Sign Up) */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#E9DCC2] border-2 border-[#1a1a1a]">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setNotice(null);
                }}
                className={`py-2 text-xs font-oswald font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  mode === 'signin'
                    ? 'bg-[#b91c1c] text-[#f4efe6] border border-[#1a1a1a] shadow-[2px_2px_0px_#1a1a1a]'
                    : 'text-[#1a1a1a] hover:bg-[#DCC9A8]'
                }`}
              >
                Đăng Nhập
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setNotice(null);
                }}
                className={`py-2 text-xs font-oswald font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-[#b91c1c] text-[#f4efe6] border border-[#1a1a1a] shadow-[2px_2px_0px_#1a1a1a]'
                    : 'text-[#1a1a1a] hover:bg-[#DCC9A8]'
                }`}
              >
                Đăng Ký Thẻ Mới
              </button>
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleFormSubmit} className="space-y-3">
              {mode === 'signup' && (
                <div className="space-y-1">
                  <label className="block text-[11px] font-oswald font-bold uppercase tracking-wider text-[#1a1a1a]">
                    Bút danh / Họ và tên
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-[#51483D] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Nhập họ tên của bạn..."
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-[#FAF6EE] border-2 border-[#1a1a1a] text-xs font-medium text-[#1a1a1a] focus:outline-none focus:border-[#b91c1c]"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-[11px] font-oswald font-bold uppercase tracking-wider text-[#1a1a1a]">
                  Địa chỉ Email học viên
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#51483D] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="hocvien@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#FAF6EE] border-2 border-[#1a1a1a] text-xs font-medium text-[#1a1a1a] focus:outline-none focus:border-[#b91c1c]"
                  />
                </div>
              </div>

              {mode !== 'reset' && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-oswald font-bold uppercase tracking-wider text-[#1a1a1a]">
                      Mật khẩu bảo mật
                    </label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode('reset');
                          setNotice(null);
                        }}
                        className="text-[11px] font-serif italic text-[#b91c1c] hover:underline cursor-pointer"
                      >
                        Quên mật khẩu?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-[#51483D] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                      placeholder="Tối thiểu 6 ký tự..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-[#FAF6EE] border-2 border-[#1a1a1a] text-xs font-medium text-[#1a1a1a] focus:outline-none focus:border-[#b91c1c]"
                    />
                  </div>
                </div>
              )}

              {mode === 'signup' && (
                <div className="space-y-1">
                  <label className="block text-[11px] font-oswald font-bold uppercase tracking-wider text-[#1a1a1a]">
                    Xác nhận lại mật khẩu
                  </label>
                  <div className="relative">
                    <ShieldCheck className="w-4 h-4 text-[#51483D] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      placeholder="Nhập lại mật khẩu..."
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-[#FAF6EE] border-2 border-[#1a1a1a] text-xs font-medium text-[#1a1a1a] focus:outline-none focus:border-[#b91c1c]"
                    />
                  </div>
                </div>
              )}

              {/* Notice / Error Alert + Resend Verification Email Button */}
              {notice && (
                <div
                  className={`p-3 border-2 text-xs space-y-2 ${
                    notice.type === 'success'
                      ? 'bg-[#DCE6D5] border-[#2E5A36] text-[#1E3F24]'
                      : notice.type === 'error'
                        ? 'bg-[#F5D0C5] border-[#b91c1c] text-[#7F1D1D]'
                        : 'bg-[#E9DCC2] border-[#1a1a1a] text-[#1a1a1a]'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {notice.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#2E5A36]" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#b91c1c]" />
                    )}
                    <span className="font-medium leading-relaxed">{notice.text}</span>
                  </div>

                  {(pendingConfirmationEmail || (mode === 'signup' && email.trim())) && (
                    <div className="pt-1.5 border-t border-[#1a1a1a]/20 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-serif italic text-[#51483D]">
                        Kiểm tra hộp thư đến hoặc mục Spam/Quảng cáo:
                      </span>
                      <button
                        type="button"
                        disabled={resendingEmail}
                        onClick={handleResendConfirmation}
                        className="px-2.5 py-1 bg-[#FAF6EE] hover:bg-[#E9DCC2] text-[#1a1a1a] border border-[#1a1a1a] font-oswald text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <RefreshCw className={`w-3 h-3 text-[#b91c1c] ${resendingEmail ? 'animate-spin' : ''}`} />
                        <span>{resendingEmail ? 'Đang gửi...' : 'Gửi lại mã xác nhận qua Gmail'}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Primary Submit Button */}
              <button
                type="submit"
                disabled={busy}
                className="w-full py-2.5 px-4 bg-[#b91c1c] hover:bg-[#991b1b] disabled:opacity-60 text-[#f4efe6] border-2 border-[#1a1a1a] shadow-[4px_4px_0px_#1a1a1a] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none font-oswald text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>
                  {busy
                    ? 'ĐANG XÁC THỰC HỒ SƠ...'
                    : mode === 'signin'
                      ? 'ĐĂNG NHẬP & VÀO TÒA SOẠN'
                      : mode === 'signup'
                        ? 'ĐĂNG KÝ & MỞ KHÓA NGAY'
                        : 'GỬI LIÊN KẾT KHÔI PHỤC'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {mode === 'reset' && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setNotice(null);
                  }}
                  className="w-full py-1.5 text-xs font-bold text-[#51483D] hover:text-[#1a1a1a] underline cursor-pointer"
                >
                  ← Quay lại Đăng nhập
                </button>
              )}
            </form>

            {/* Divider */}
            {mode !== 'reset' && (
              <>
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-[#1a1a1a]/30" />
                  <span className="flex-shrink mx-3 text-[10px] font-mono uppercase tracking-widest text-[#51483D] font-bold">
                    HOẶC XÁC THỰC NHANH
                  </span>
                  <div className="flex-grow border-t border-[#1a1a1a]/30" />
                </div>

                {/* Google OAuth Button */}
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleGoogleLogin}
                  className="w-full py-2.5 px-4 bg-[#FAF6EE] hover:bg-[#E9DCC2] disabled:opacity-60 text-[#1a1a1a] border-2 border-[#1a1a1a] shadow-[3px_3px_0px_#1a1a1a] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none font-oswald text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#b91c1c]" />
                  <span>Tiếp tục với tài khoản Google</span>
                </button>
              </>
            )}

            {/* Editorial Footer Note */}
            <div className="pt-2 border-t border-dashed border-[#1a1a1a]/40 text-center">
              <p className="text-[11px] font-serif italic text-[#51483D]">
                Toàn bộ tiến độ từ vựng, chuỗi Streak và lộ trình 60 ngày được bảo toàn và đồng bộ tự động theo tài khoản của bạn.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
