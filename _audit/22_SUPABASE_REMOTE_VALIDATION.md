# 📡 BÁO CÁO KIỂM ĐỊNH KẾT NỐI SUPABASE REMOTE (`22_SUPABASE_REMOTE_VALIDATION.md`)

**Dự án**: LexiMaster IELTS (MASTER English)  
**Thời gian kiểm tra**: 2026-11-06 00:51 (Local Server Time)  
**Supabase Project ID**: `wqncrljdxpxvfinepjmb`  
**Supabase Project URL**: `https://wqncrljdxpxvfinepjmb.supabase.co`  
**Khóa API**: `sb_publishable_wZ81vdswN3gGFLTdkbGq3Q_KwJ5-9Z7` (Publishable / Public Anon Key)  
**Trạng thái tổng thể**: **`REMOTE CONNECTED – PENDING SCHEMA MIGRATION`**  
**Nguyên tắc tuân thủ**: BẢO TOÀN DỮ LIỆU – KHÔNG TỰ ĐỘNG CHẠY MIGRATION KHI CHƯA XÁC NHẬN – KHÔNG GHI ĐÈ DỮ LIỆU – PHÂN LOẠI TRUNG THỰC (PASS / FAIL / BLOCKED / NOT TESTED).

---

## 1. Kết Quả Xác Minh Project & Kết Nối Remote (Project Verification)

Hệ thống đã thực hiện kết nối trực tiếp từ server tới máy chủ Supabase Remote của bạn:

| # | Endpoint Kiểm Tra | Phương Thức | HTTP Status | Kết Quả Thực Tế | Đánh Giá |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `https://wqncrljdxpxvfinepjmb.supabase.co/auth/v1/health` | GET | **`200 OK`** | Dịch vụ xác thực GoTrue v2.197.0 đang hoạt động | **PASS** |
| 2 | `https://wqncrljdxpxvfinepjmb.supabase.co/auth/v1/settings` | GET | **`200 OK`** | Cấu hình Auth khả dụng (Email Provider enabled) | **PASS** |
| 3 | `https://wqncrljdxpxvfinepjmb.supabase.co/storage/v1/bucket` | GET | **`200 OK`** | Dịch vụ Supabase Storage kết nối thành công, trả về danh sách: `[]` (Chưa có bucket) | **PASS** (Reachable) |
| 4 | `https://wqncrljdxpxvfinepjmb.supabase.co/rest/v1/` | GET | **`401 Unauthorized`** | Root OpenAPI yêu cầu secret key (Cơ chế bảo mật chuẩn của PostgREST) | **PASS** (Expected) |
| 5 | `https://wqncrljdxpxvfinepjmb.supabase.co/rest/v1/import_batches` | GET | **`404 Not Found`** | `PGRST205: Could not find the table 'public.import_batches' in schema cache` | **BLOCKED** |
| 6 | `https://wqncrljdxpxvfinepjmb.supabase.co/rest/v1/vocabulary` | GET | **`404 Not Found`** | `PGRST205: Could not find the table 'public.vocabulary' in schema cache` | **BLOCKED** |

---

## 2. Bảng Phân Loại Kết Quả Theo 8 Tiêu Chí Nghiệm Thu

| STT | Phân Vùng Kiểm Tra | Hiện Trạng Trên Remote | Đánh Giá | Ghi Chú Chi Tiết |
| :--- | :--- | :--- | :--- | :--- |
| 1 | **Xác minh Project ID & URL** | Khớp `wqncrljdxpxvfinepjmb` | **PASS** | Máy chủ Remote trực tuyến và phản hồi chính xác. |
| 2 | **Cấu hình Client `.env`** | Đã ghi vào `.env` (được `.gitignore` bảo vệ) | **PASS** | `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY` đã được thiết lập. |
| 3 | **21 Bảng Cơ Sở Dữ Liệu** | `public` schema hiện chưa có 21 bảng (0/21) | **BLOCKED** | Project mới khởi tạo, cần chạy migration SQL. |
| 4 | **RLS và Security Policies** | Chưa có bảng trên Remote | **BLOCKED** | Đã sẵn sàng 100% trong `_audit/06_SUPABASE_SCHEMA.sql`. |
| 5 | **Hệ Thống Authentication** | GoTrue v2.197.0 hoạt động (`200 OK`) | **PASS / WAITING** | Sẵn sàng; cần bảng `profiles` và trigger `on_auth_user_created` khi chạy schema. |
| 6 | **Storage 3 Buckets** | 0 bucket tồn tại (`[]`) | **NOT YET CREATED** | Cần khởi tạo 3 bucket: `public-editorial-assets`, `course-pdfs`, `user-uploads`. |
| 7 | **Cloud Sync Engine** | Code client PASS; Remote chưa có bảng | **WAITING SCHEMA** | Ứng dụng tự động fallback sang `localStorage` an toàn mà không bị crash. |
| 8 | **Dữ Liệu Học Thuật Gốc** | 17/17 tệp gốc nguyên vẹn (100% SHA-256) | **PASS (STATIC)** | Gói nạp 5,087 bản ghi sẵn sàng tại `10_IDEMPOTENT_UPSERT_IMPORT.sql`. |

---

## 3. Kế Hoạch Di Dời An Toàn (Safe Migration Plan)

Theo đúng điều khoản **Mục 8 & 9**: **TUYỆT ĐỐI KHÔNG TỰ ĐỘNG CHẠY MIGRATION HOẶC GHI ĐÈ DỮ LIỆU KHI CHƯA CÓ XÁC NHẬN RÕ RÀNG TỪ NGƯỜI DÙNG.**

Dưới đây là 2 bước thực thi chuẩn xác trong **Supabase SQL Editor** của bạn:

### BƯỚC 1: Khởi Tạo 21 Bảng, RLS, Trigger & Storage Buckets (Schema Migration)
1. Mở trình duyệt và truy cập:  
   👉 **`https://supabase.com/dashboard/project/wqncrljdxpxvfinepjmb/sql`**
2. Mở tệp **`_audit/06_SUPABASE_SCHEMA.sql`** trong dự án này, copy toàn bộ nội dung (hoặc tải về).
3. Dán vào **SQL Editor** trên Supabase Dashboard và bấm nút **RUN**.
4. **Tác động kỹ thuật**:
   - Khởi tạo 21 bảng chuẩn hóa có kiểu dữ liệu, khóa chính UUIDv5, foreign keys.
   - Bật `ENABLE ROW LEVEL SECURITY` trên tất cả các bảng.
   - Thiết lập 3 hàm bảo mật `SECURITY DEFINER` với `SET search_path = ''`.
   - Tạo 3 Storage Buckets (`public-editorial-assets`, `course-pdfs`, `user-uploads`) kèm chính sách bảo mật storage.

### BƯỚC 2: Nạp Gói Dữ Liệu Học Thuật Gốc (Idempotent Data Import)
1. Trong **SQL Editor** trên Supabase Dashboard, tạo một truy vấn mới.
2. Mở tệp **`_audit/08_SUPABASE_IMPORT/10_IDEMPOTENT_UPSERT_IMPORT.sql`**, copy và dán vào.
3. Bấm nút **RUN**.
4. **Tác động kỹ thuật**:
   - Nạp đúng 5,087 bản ghi (gồm 3,666 từ vựng độc bản, 89 cấu trúc, 66 ngày học, 990 từ vựng theo ngày, 45 chủ đề Speaking, 153 câu trắc nghiệm, 35 tài liệu PDF).
   - Dùng cơ chế `ON CONFLICT (id) DO UPDATE` nên an toàn 100%, chạy lại bao nhiêu lần cũng không gây trùng lặp.

---

## 4. Kiểm Tra Sau Khi Nạp (Validation Suite)

Sau khi bạn đã bấm Run xong 2 bước trên trong Dashboard:
1. Mở tệp **`_audit/09_VALIDATION_QUERIES.sql`**.
2. Chạy trong SQL Editor để kiểm tra 6 nhóm tiêu chí:
   - Tất cả 9 bảng dữ liệu đều trả về trạng thái **`PASS`** (0 dòng chênh lệch).
   - 0 khóa ngoại mồ côi (`orphan_count = 0`).
   - 0 vi phạm enum/CEFR level.
   - 21/21 bảng đều `rls_enabled = true`.
3. Báo cáo lại cho tôi, tôi sẽ chạy lại kiểm thử tự động `verify_final_gate.mjs` để chuyển trạng thái nghiệm thu lên **`FULL PRODUCTION READY (PASS 100%)`**!
