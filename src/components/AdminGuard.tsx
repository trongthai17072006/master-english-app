import React from 'react';
import { useAdminAccess } from '../utils/adminAuth';
import { useAnalytics } from '../context/AnalyticsContext';

interface AdminGuardProps {
  children: React.ReactNode;
  /**
   * Nếu requireSecretUnlock = true, chỉ hiển thị khi cả Email khớp VITE_ADMIN_EMAIL
   * VÀ đã nhập đúng VITE_ADMIN_SECRET_KEY. Mặc định false (kiểm tra đúng Email Admin).
   */
  requireSecretUnlock?: boolean;
  fallback?: React.ReactNode;
}

/**
 * Component bảo vệ giao diện `<AdminGuard>`:
 * - Tự động ẩn hoàn toàn (`null`) các nút "+ Nạp dữ liệu" hoặc phân khu "Mô-đun Nạp Nội Dung (Admin Only)"
 *   nếu người dùng hiện tại không phải là Admin khớp với `VITE_ADMIN_EMAIL`.
 */
export const AdminGuard: React.FC<AdminGuardProps> = ({
  children,
  requireSecretUnlock = false,
  fallback = null
}) => {
  const { userProfile } = useAnalytics();
  const { isAdmin, isAdminAuthenticated } = useAdminAccess(userProfile?.email);

  if (!isAdmin) {
    return <>{fallback}</>;
  }

  if (requireSecretUnlock && !isAdminAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
