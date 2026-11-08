# 🚦 DANH MỤC KIỂM TRA VẬN HÀNH CHÍNH THỨC & PHÂN LOẠI TRẠNG THÁI CUỐI CÙNG (`20_FINAL_GO_LIVE_CHECKLIST.md`)

## Tóm tắt điều hành (Executive Summary)
Tài liệu này là **Cổng Kiểm định Cuối cùng (Final Gate Go-Live Runbook — Mục 11, 13 & 14)** trước khi đưa **LexiMaster IELTS (MASTER English)** lên vận hành chính thức với **Supabase PostgreSQL, Auth & Storage** `[VERIFIED]`. Toàn bộ hạng mục được phân loại trung thực tuyệt đối theo đúng 5 nhãn quy chuẩn: **`PASS`**, **`FAIL`**, **`BLOCKED`**, **`PENDING APPROVAL`**, và **`NOT APPLICABLE`**.

---

## 1. Bảng Phân loại Trạng thái Tổng thể (Final Gate Classification Matrix — Mục 13 & 14) `[VERIFIED]`

| # | Trụ cột Kiểm định | Hạng mục Chi tiết | Phân loại Trạng thái | Bằng chứng & Ghi chú Minh bạch |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **UI Strict Local Containment** | Cố định đồng hồ học tập (`Compact Timer Badge`) bên trong `.hero-banner-container` (`position: relative; overflow: hidden`) + `.compact-timer-badge` (`position: absolute; top: 16px; right: 24px; z-index: 5`) trên cả 4 trang bắt buộc (*Kho Chữ & Thuật Ngữ*, *Quy Chuẩn Hành Văn*, *Thẻ Hồ Sơ Lưu Trữ*, *Phối Ngữ & Mạch Văn*) và các trang chuyên mục; **0 `position: fixed`**; **0 đồng hồ trên Trang Nhất** | **`PASS`** | `src/constants/engravings.tsx:94,142`, `src/components/ActiveSessionBar.tsx:243–315`, `verify_final_gate.mjs` (`uiContainment.status = 'PASS'`). |
| **2** | **Build, TypeScript & Lint** | `compile_applet` (`vite build`), `lint_applet` (`tsc --noEmit`), kiểm tra định tuyến SPA và Express Backend Proxy (`server.ts`) | **`PASS`** | `compile_applet` = `PASS`, `lint_applet` = `PASS` (`0` lỗi TypeScript). |
| **3** | **Data Protection (17 Source Files)** | Bảo toàn 100% mã băm SHA-256 của toàn bộ 17 tệp dữ liệu gốc trong `src/data/*` so với `_audit/backup_0_original/CHECKSUMS.txt` | **`PASS`** | `python3 _audit/08_SUPABASE_IMPORT/scripts/verify_export_counts.py` → `protected_files_intact: true`. |
| **4** | **Migration Package Integrity (`5,087` Rows)** | Đối chiếu 9 cặp file CSV/JSON trong `_audit/08_SUPABASE_IMPORT/`, khóa chính UUIDv5 tất định, `0` khóa ngoại mồ côi, `0` lỗi Unicode NFC, giải trình khớp 100% con số `3,666` từ vựng | **`PASS`** | `verify_export_counts.py` → `overall_status: "PASS"`, `checksum_file_verified: true`. |
| **5** | **2nd-Import Idempotency (Chạy Lại Lần 2)** | Kịch bản nạp dữ liệu lần 2 qua bảng tạm & `ON CONFLICT (id) DO UPDATE` không sinh bản ghi trùng, không gãy FK | **`PASS`** | `_audit/08_SUPABASE_IMPORT/10_IDEMPOTENT_UPSERT_IMPORT.sql`, `_audit/15_MIGRATION_INTEGRITY_REPORT.md`. |
| **6** | **Cloud Sync Logic & Conflict Resolution** | Kiểm thử tự động toàn bộ 9 nhóm dữ liệu (`__speakingDrafts`, `__speakingHistory`, `vocab_progress`, `saved_words`, `study_sessions`, `mistake_bank`, `user_stats`, `workspace_todos`, `custom_content_store`) qua Kịch bản 1–5 & Test Cases A–E | **`PASS`** | `bun run _audit/08_SUPABASE_IMPORT/scripts/verify_final_gate.mjs` → `allPassed: true` (`5/5` nhóm kịch bản `PASS`). |
| **7** | **21-Table Schema, RLS & Auth Trigger (Static Audit)** | Đầy đủ 21 bảng chính thức + bảng tương thích runtime, `ENABLE ROW LEVEL SECURITY` 100%, tách quyền `anon` vs `authenticated` vs `is_admin()`, Trigger `on_auth_user_created` (`1:1` profile), `SECURITY DEFINER SET search_path = ''` | **`PASS`** | `_audit/06_SUPABASE_SCHEMA.sql`, `_audit/13_SUPABASE_SECURITY_AUDIT.md`, `_audit/18_AUTHENTICATION_AUDIT.md`. |
| **8** | **Backup & 3-Tier Disaster Recovery Plan** | Đầy đủ 4 snapshot cục bộ (`_audit/backup_0..3`), lệnh `pg_dump` pre-migration, và 3 kịch bản Rollback độc lập (Batch Rollback, Schema Rollback, Post-Migration User Data Recovery) | **`PASS`** | `_audit/16_BACKUP_RECOVERY_PLAN.md`. |
| **9** | **Database Performance & Index Design** | Đánh chỉ mục B-tree trên mọi FK và `user_id`, GIN `tsvector` + `pg_trgm` trên `vocabulary`, truy vấn gộp JSON chống N+1 | **`PASS`** | `_audit/17_DATABASE_PERFORMANCE_REPORT.md`, `_audit/09_VALIDATION_QUERIES.sql`. |
| **10** | **Live Remote Supabase Execution (SQL / RLS / Storage / Multi-Device Network)** | Chạy trực tiếp `_audit/06_SUPABASE_SCHEMA.sql`, nạp CSV vào PostgreSQL từ xa, tải ảnh lên Supabase Storage và đo `EXPLAIN ANALYZE` trên máy chủ thật | **`BLOCKED`** | Môi trường container Local Development hiện chưa được cấp biến môi trường `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_DB_URL`. |
| **11** | **5 Quyết định Mở của Chủ Dự án** | (1) `existingVocab.json`, (2) 29 ảnh unique chưa tham chiếu (`40.71 MB`), (3) 2 đường dẫn PDF gốc, (4) nghĩa từ `protein`, (5) header trang `MistakeBank.tsx` | **`PENDING APPROVAL`** | Đã trình bày đầy đủ bằng chứng, phương án A/B và phân tích rủi ro trong `_audit/19_STORAGE_VALIDATION_REPORT.md` & `_audit/11_DECISIONS_NEEDED.md`. |
| **12** | **Firebase Cloud Firestore / Auth Migration** | Chuyển đổi dữ liệu từ Firebase sang Supabase | **`NOT APPLICABLE`** | Ứng dụng không sử dụng Firebase SDK trong `src/` (`0` import, không cài gói `firebase` trong `package.json`). |

---

## 2. Phân tách Cấu hình 3 Môi trường: Local vs Staging vs Production (Mục 11.1) `[VERIFIED]`

| Hạng mục Cấu hình | 1. Local Development (`.env.local`) | 2. Supabase Staging (`.env.staging`) | 3. Supabase Production (`.env.production` / Cloud Run Secrets) |
| :--- | :--- | :--- | :--- |
| **Chế độ Vận hành** | Hỗ trợ cả `local_mode` (không cần khóa Supabase) hoặc kết nối tới Supabase CLI cục bộ (`http://127.0.0.1:54321`). | Kết nối tới **Supabase Staging Project** riêng biệt để chạy thử nghiệm Migration & RLS. | Kết nối tới **Supabase Production Project** có bật **Daily Backups / PITR**. |
| **`VITE_SUPABASE_URL`** | `""` (Local Mode) hoặc `https://<staging-ref>.supabase.co` | `https://<staging-ref>.supabase.co` | `https://<prod-ref>.supabase.co` |
| **`VITE_SUPABASE_ANON_KEY`** | `""` hoặc khóa `anon` công khai của Staging | Khóa `anon` (publishable) của Staging | Khóa `anon` (publishable) của Production *(Tuyệt đối KHÔNG dùng `service_role`!)* |
| **`GEMINI_API_KEY`** *(Server-only)* | Đặt trong `.env` cục bộ cho `server.ts` | Đặt trong biến môi trường Staging Server | Đặt trong **Secret Manager / Cloud Run Env** (chỉ `server.ts` đọc) |
| **`ELEVENLABS_API_KEY`** *(Server-only)* | Tùy chọn (nếu trống tự động fallback sang Google TTS) | Tùy chọn | Đặt trong **Secret Manager / Cloud Run Env** |
| **`VITE_ADMIN_EMAIL`** | `trongthai17072006@gmail.com` | `trongthai17072006@gmail.com` | `trongthai17072006@gmail.com` + gán `app_metadata.role = 'admin'` trên Supabase Auth |

---

## 3. Quy trình 9 Bước Triển khai Chính thức (9-Step Go-Live Sequence — Mục 11.2)

Thực hiện tuần tự từng bước dưới đây trên **Staging** trước, sau khi đạt `100% PASS` mới thực hiện trên **Production**:

### Bước 1: Tạo Bản Sao Lưu Trước Triển khai (`Backup`)
- Nếu dự án Supabase đã có bảng cũ, chạy lệnh `pg_dump` tại Mục 2 của `_audit/16_BACKUP_RECOVERY_PLAN.md` để lưu file `.dump` và `.sql` kèm mã băm SHA-256.

### Bước 2: Khởi tạo Schema 21 Bảng, Index & Trigger (`Create Schema`)
- Mở **Supabase SQL Editor** (hoặc dùng `psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f _audit/06_SUPABASE_SCHEMA.sql`) và thực thi toàn bộ `_audit/06_SUPABASE_SCHEMA.sql`.

### Bước 3: Kích hoạt & Kiểm tra RLS + Storage Policies (`Enable RLS & Policies`)
- Đã được tích hợp tự động trong Phần IV & Phần V của `_audit/06_SUPABASE_SCHEMA.sql`.
- Xác nhận ngay bằng truy vấn:
  ```sql
  SELECT count(*) FILTER (WHERE NOT rowsecurity) AS tables_without_rls
  FROM pg_tables WHERE schemaname = 'public'; -- Phải bằng 0
  ```

### Bước 4: Nạp Gói 5,087 Bản ghi Nội dung Học thuật (`Import Data`)
- Chạy script nạp bất biến (an toàn ngay cả khi chạy lại lần 2):
  ```bash
  psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f _audit/08_SUPABASE_IMPORT/10_IDEMPOTENT_UPSERT_IMPORT.sql
  ```
  *(Hoặc nạp lần lượt `01_import_batches.csv` → `09_pdf_library.csv` qua Supabase Dashboard Table Editor).*

### Bước 5: Chạy Bộ Truy vấn Hậu kiểm (`Run Validation Queries`)
- Chạy toàn bộ `_audit/09_VALIDATION_QUERIES.sql` trong Supabase SQL Editor:
  - Xác nhận 9/9 bảng có `status = 'PASS'` (tổng `5,087` dòng).
  - Xác nhận cả 4 kiểm tra khóa ngoại đều có `orphan_count = 0`.
  - Xác nhận `empty_vocab_word_or_meaning = 0`, `invalid_pos_count = 0`, `invalid_cefr_count = 0`.

### Bước 6: Kiểm thử Bảo mật RLS Giữa `Anon`, `User A`, `User B` & `Admin` (`Test RLS`)
- Chạy khối giao dịch kiểm thử `BEGIN ... ROLLBACK` tại Mục 3 của `_audit/13_SUPABASE_SECURITY_AUDIT.md`.
- Cấp quyền Admin JWT cho tài khoản quản trị viên:
  ```sql
  UPDATE auth.users
  SET raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
  WHERE email = 'trongthai17072006@gmail.com';
  ```

### Bước 7: Kiểm thử Xác thực & Khởi tạo Hồ sơ (`Test Auth`)
- Điền `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY` vào môi trường, mở ngăn kéo **Hồ Sơ Học Viên**, nhấn **"Kiểm tra kết nối & 8 bảng RLS"**, sau đó đăng ký/đăng nhập thử 1 tài khoản và xác nhận 1 dòng mới xuất hiện trong `public.profiles` & `public.user_profiles`.

### Bước 8: Kiểm thử Đồng bộ Đám mây Hai chiều (`Test Cloud Sync`)
- Thực hiện lưu 1 từ vựng, làm 1 câu Quiz, viết thử 1 đoạn nháp Writing & Speaking ở Lộ trình 60 Ngày rồi nhấn **"Đồng bộ 2 chiều ngay"**.
- Mở tab ẩn danh (Thiết bị B), đăng nhập cùng tài khoản và xác nhận toàn bộ tiến độ (bao gồm cả Speaking Drafts & History) được tải về đầy đủ 100%.

### Bước 9: Đóng gói & Phát hành Production (`Go-Live`)
- Chạy `npm run build` và khởi động máy chủ Production với `npm run start` (`node server.ts`).
- Theo dõi mục **Database → Query Performance (`pg_stat_statements`)** và **Auth → Logs** trên Supabase Dashboard trong 24 giờ đầu sau Go-Live.
