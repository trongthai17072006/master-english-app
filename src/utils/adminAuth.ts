import { useState, useEffect, useCallback } from 'react';
import { dataRepository } from '../services/dataRepository';

/**
 * ============================================================================
 * MASTER ENGLISH — ROLE-BASED ACCESS CONTROL (RBAC) FOR CONTENT IMPORTER
 * ============================================================================
 * Đảm bảo chỉ duy nhất Admin (khớp VITE_ADMIN_EMAIL và đã xác thực
 * VITE_ADMIN_SECRET_KEY trong phiên làm việc) mới được phép truy cập và ghi
 * dữ liệu vào mô-đun "+ Nạp / Mở rộng dữ liệu học (Content Importer)".
 */

export const ADMIN_AUTH_STORAGE_KEY = 'master_english_admin_session_unlocked_v1';
export const ADMIN_AUTH_CHANGED_EVENT = 'master-english-admin-auth-changed';

const DEFAULT_FALLBACK_ADMIN_EMAIL = 'trongthai17072006@gmail.com';

/**
 * Lấy địa chỉ Email Admin đã cấu hình trong .env (VITE_ADMIN_EMAIL).
 * Nếu biến môi trường chưa đặt hoặc đang để giá trị mẫu "your_admin_email@gmail.com",
 * hệ thống sử dụng email Admin mặc định của chủ dự án.
 */
export function getConfiguredAdminEmail(): string {
  const rawEnvEmail = (import.meta.env?.VITE_ADMIN_EMAIL || '').trim().toLowerCase();
  if (!rawEnvEmail || rawEnvEmail === 'your_admin_email@gmail.com') {
    return DEFAULT_FALLBACK_ADMIN_EMAIL;
  }
  return rawEnvEmail;
}

/**
 * Lấy khóa xác thực Admin (VITE_ADMIN_SECRET_KEY) từ biến môi trường (nếu được cấu hình).
 * Tuyệt đối không nhúng mật khẩu dự phòng dạng văn bản thuần (hardcoded secret) trong client bundle.
 */
export function getConfiguredAdminSecretKey(): string {
  const rawSecret = (import.meta.env?.VITE_ADMIN_SECRET_KEY || '').trim();
  if (!rawSecret || rawSecret === 'your_secret_admin_password_here') {
    return '';
  }
  return rawSecret;
}

/**
 * Lấy email của người dùng hiện tại từ:
 * 1. Phiên đăng nhập Supabase Cloud (nếu đã đăng nhập xác thực)
 * 2. Hoặc hồ sơ học viên cục bộ (master_english_user_profile_v2)
 */
export function getCurrentUserEmail(explicitEmail?: string | null): string {
  if (typeof explicitEmail === 'string' && explicitEmail.trim()) {
    return explicitEmail.trim().toLowerCase();
  }

  try {
    const cloudUser = dataRepository.getSnapshot().user;
    if (cloudUser?.email) {
      return cloudUser.email.trim().toLowerCase();
    }
  } catch {
    // Ignore if dataRepository is still initializing
  }

  try {
    if (typeof window !== 'undefined') {
      const savedProfileRaw = localStorage.getItem('master_english_user_profile_v2');
      if (savedProfileRaw) {
        const parsed = JSON.parse(savedProfileRaw);
        if (parsed && typeof parsed.email === 'string' && parsed.email.trim()) {
          return parsed.email.trim().toLowerCase();
        }
      }
    }
  } catch {
    // Ignore storage parse error
  }

  return '';
}

/**
 * 1. Hàm tiện ích `isAdminUser()`:
 * Kiểm tra tài khoản hiện tại có khớp chính xác với `VITE_ADMIN_EMAIL` hay không.
 */
export function isAdminUser(candidateEmail?: string | null): boolean {
  const adminEmail = getConfiguredAdminEmail();
  const currentUserEmail = getCurrentUserEmail(candidateEmail);
  if (!adminEmail || !currentUserEmail) return false;
  return currentUserEmail === adminEmail.toLowerCase();
}

/**
 * Kiểm tra xem phiên làm việc hiện tại của Admin đã mở khóa bằng `VITE_ADMIN_SECRET_KEY` chưa.
 */
export function isAdminSessionUnlocked(candidateEmail?: string | null): boolean {
  if (!isAdminUser(candidateEmail)) {
    return false;
  }
  try {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(ADMIN_AUTH_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Xác thực `VITE_ADMIN_SECRET_KEY` do người dùng nhập vào Modal Bảo Vệ.
 */
export function verifyAndUnlockAdminSession(
  inputKey: string,
  candidateEmail?: string | null
): { success: boolean; message: string } {
  if (!isAdminUser(candidateEmail)) {
    return {
      success: false,
      message: 'Tài khoản hiện tại không phải là Admin. Quyền truy cập bị từ chối.'
    };
  }

  const trimmedInput = inputKey.trim();
  if (!trimmedInput) {
    return {
      success: false,
      message: 'Vui lòng nhập Mã khóa bí mật Admin (VITE_ADMIN_SECRET_KEY).'
    };
  }

  const configuredSecret = getConfiguredAdminSecretKey();
  if (!configuredSecret) {
    return {
      success: false,
      message:
        'Chưa cấu hình VITE_ADMIN_SECRET_KEY trong biến môi trường (.env). Vui lòng thiết lập khóa xác thực trước khi mở khóa phiên Admin.'
    };
  }

  const isMatch = trimmedInput === configuredSecret;

  if (!isMatch) {
    return {
      success: false,
      message: 'Mã khóa bí mật Admin không chính xác. Vui lòng kiểm tra lại VITE_ADMIN_SECRET_KEY.'
    };
  }

  try {
    sessionStorage.setItem(ADMIN_AUTH_STORAGE_KEY, 'true');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(ADMIN_AUTH_CHANGED_EVENT));
    }
  } catch {
    // Ignore sessionStorage error
  }

  return {
    success: true,
    message: 'Đã xác thực khóa bí mật Admin thành công! Đã mở khóa quyền nạp dữ liệu.'
  };
}

/**
 * Chốt chặn bảo mật tầng dữ liệu (Storage Layer Guard):
 * Ném lỗi ngay lập tức nếu bất kỳ lệnh ghi/xóa/ghi đè nào vào Custom Content Store
 * được gọi khi chưa xác thực Admin (`isAdminUser() && isAdminSessionUnlocked()`).
 */
export function assertAdminWriteAccess(actionName = 'ghi dữ liệu mở rộng'): void {
  if (!isAdminUser()) {
    throw new Error(
      `[RBAC 403 Forbidden] Từ chối thao tác "${actionName}": Chỉ tài khoản Admin (${getConfiguredAdminEmail()}) mới có quyền nạp hoặc chỉnh sửa dữ liệu hệ thống.`
    );
  }
  if (!isAdminSessionUnlocked()) {
    throw new Error(
      `[RBAC 401 Locked] Từ chối thao tác "${actionName}": Phiên Admin đang khóa. Vui lòng nhập đúng VITE_ADMIN_SECRET_KEY trước khi nạp dữ liệu.`
    );
  }
}

/**
 * Khóa lại phiên Admin (đăng xuất khỏi chế độ nạp dữ liệu).
 */
export function lockAdminSession(): void {
  try {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
      window.dispatchEvent(new CustomEvent(ADMIN_AUTH_CHANGED_EVENT));
    }
  } catch {
    // Ignore storage error
  }
}

/**
 * Hook React `useAdminAccess`:
 * Tự động theo dõi trạng thái Admin (`isAdmin`) và trạng thái mở khóa 2 lớp (`isAdminAuthenticated`).
 */
export function useAdminAccess(explicitEmail?: string | null) {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => isAdminUser(explicitEmail));
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() =>
    isAdminSessionUnlocked(explicitEmail)
  );

  const syncState = useCallback(() => {
    const nextIsAdmin = isAdminUser(explicitEmail);
    const nextUnlocked = nextIsAdmin && isAdminSessionUnlocked(explicitEmail);
    setIsAdmin(nextIsAdmin);
    setIsAdminAuthenticated(nextUnlocked);
  }, [explicitEmail]);

  useEffect(() => {
    syncState();
  }, [syncState]);

  useEffect(() => {
    const unsubscribeRepo = dataRepository.subscribe(() => {
      syncState();
    });

    const handleStorageOrAuthChange = () => {
      syncState();
    };

    window.addEventListener(ADMIN_AUTH_CHANGED_EVENT, handleStorageOrAuthChange);
    window.addEventListener('storage', handleStorageOrAuthChange);
    window.addEventListener('master-english-cloud-synced', handleStorageOrAuthChange);

    return () => {
      unsubscribeRepo();
      window.removeEventListener(ADMIN_AUTH_CHANGED_EVENT, handleStorageOrAuthChange);
      window.removeEventListener('storage', handleStorageOrAuthChange);
      window.removeEventListener('master-english-cloud-synced', handleStorageOrAuthChange);
    };
  }, [syncState]);

  const unlockWithSecretKey = useCallback(
    (secretKeyInput: string) => {
      const result = verifyAndUnlockAdminSession(secretKeyInput, explicitEmail);
      syncState();
      return result;
    },
    [explicitEmail, syncState]
  );

  const lockSession = useCallback(() => {
    lockAdminSession();
    syncState();
  }, [syncState]);

  return {
    isAdmin,
    isAdminAuthenticated,
    adminEmail: getConfiguredAdminEmail(),
    currentUserEmail: getCurrentUserEmail(explicitEmail),
    unlockWithSecretKey,
    lockSession,
    refreshAdminState: syncState
  };
}
