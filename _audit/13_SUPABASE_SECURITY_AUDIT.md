# 🔐 KIỂM ĐỊNH BẢO MẬT CUỐI CÙNG SUPABASE (`13_SUPABASE_SECURITY_AUDIT.md`)

## Tóm tắt điều hành (Executive Summary)
Báo cáo này thực hiện **Kiểm định Bảo mật Cổng Cuối (Security Final Gate — Mục 2 & Mục 10)** cho toàn bộ **21 bảng chính thức** (9 bảng nội dung học thuật + 12 bảng tiến độ người dùng) cùng các bảng tương thích runtime, các hàm `SECURITY DEFINER`, Trigger `auth.users`, 3 Storage Buckets và biến môi trường trên LexiMaster IELTS `[VERIFIED]`.
- **Kiểm định tĩnh Schema & Code (`_audit/06_SUPABASE_SCHEMA.sql`, `src/services/supabaseClient.ts`, `src/utils/adminAuth.ts`, `server.ts`)**: **PASS** `[VERIFIED]`.
- **Thực thi kiểm thử RLS trực tiếp trên máy chủ PostgreSQL đám mây**: **BLOCKED** (do môi trường Local Development hiện tại chưa gắn biến `VITE_SUPABASE_URL` / `SUPABASE_DB_URL` tới project Supabase thực tế; đã đính kèm bộ kịch bản SQL Transaction `BEGIN ... ROLLBACK` tự kiểm chứng ngay khi kết nối).

---

## 1. Ma trận Kiểm định Toàn diện 21 Bảng Chính thức (Mục 10 — Table-by-Table Audit) `[VERIFIED]`

| # | Table Name | Rows (Import) | Primary Key | Foreign Keys & Cascade | Unique Constraints | Indexes | RLS | Policies (`SELECT / INSERT / UPDATE / DELETE`) | Backup Ready | Import Ready | Validation Ready | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | `import_batches` | `1` | `id (UUID)` | — | `batch_code UNIQUE` | PK + `batch_code` | `ENABLED` | `SELECT`: `anon, authenticated (true)`<br>`INSERT/UPDATE/DELETE`: `authenticated (public.is_admin())` | Yes | Yes (`01_import_batches.csv`) | Yes (`09_VALIDATION_QUERIES.sql`) | **PASS** |
| **2** | `vocabulary_categories` | `42` | `id (UUID)` | `import_batch_id -> import_batches(id) ON DELETE SET NULL` | `legacy_id UNIQUE`, `slug UNIQUE` | `idx_vocab_categories_import_batch`, `idx_vocab_categories_display_order` | `ENABLED` | `SELECT`: `anon, authenticated (true)`<br>`INSERT/UPDATE/DELETE`: `authenticated (public.is_admin())` | Yes | Yes (`02_vocabulary_categories.csv`) | Yes | **PASS** |
| **3** | `vocabulary` | `3,666` | `id (UUID)` | `category_id -> vocabulary_categories(id) ON DELETE SET NULL`<br>`import_batch_id -> import_batches(id) ON DELETE SET NULL` | `legacy_id UNIQUE` | `idx_vocabulary_word_normalized`, `idx_vocabulary_word_trgm` (GIN), `idx_vocabulary_fts` (GIN `tsvector`), `idx_vocabulary_tags_gin`, `idx_vocabulary_category_id`, `idx_vocabulary_cefr_pos`, `idx_vocabulary_import_batch`, `idx_vocabulary_needs_review` | `ENABLED` | `SELECT`: `anon, authenticated (true)`<br>`INSERT/UPDATE/DELETE`: `authenticated (public.is_admin())` | Yes | Yes (`03_vocabulary.csv`) | Yes | **PASS** |
| **4** | `grammar_structures` | `89` | `id (UUID)` | `import_batch_id -> import_batches(id) ON DELETE SET NULL` | `legacy_id UNIQUE` | `idx_grammar_structures_category`, `idx_grammar_structures_import_batch` | `ENABLED` | `SELECT`: `anon, authenticated (true)`<br>`INSERT/UPDATE/DELETE`: `authenticated (public.is_admin())` | Yes | Yes (`04_grammar_structures.csv`) | Yes | **PASS** |
| **5** | `curriculum_days` | `66` | `id (UUID)` | `import_batch_id -> import_batches(id) ON DELETE SET NULL` | `legacy_id UNIQUE`, `day_number UNIQUE` | `idx_curriculum_days_week`, `idx_curriculum_days_import_batch` | `ENABLED` | `SELECT`: `anon, authenticated (true)`<br>`INSERT/UPDATE/DELETE`: `authenticated (public.is_admin())` | Yes | Yes (`05_curriculum_days.csv`) | Yes | **PASS** |
| **6** | `curriculum_day_vocab` | `990` | `id (UUID)` | `day_id -> curriculum_days(id) ON DELETE CASCADE`<br>`vocab_id -> vocabulary(id) ON DELETE SET NULL`<br>`import_batch_id -> import_batches(id) ON DELETE SET NULL` | `UNIQUE (day_id, display_order)` | `idx_curriculum_day_vocab_day_id`, `idx_curriculum_day_vocab_vocab_id`, `idx_curriculum_day_vocab_import_batch` | `ENABLED` | `SELECT`: `anon, authenticated (true)`<br>`INSERT/UPDATE/DELETE`: `authenticated (public.is_admin())` | Yes | Yes (`06_curriculum_day_vocab.csv`) | Yes | **PASS** |
| **7** | `ielts_speaking_topics` | `45` | `id (UUID)` | `import_batch_id -> import_batches(id) ON DELETE SET NULL` | `legacy_id UNIQUE` | `idx_speaking_topics_part_type`, `idx_speaking_topics_import_batch` | `ENABLED` | `SELECT`: `anon, authenticated (true)`<br>`INSERT/UPDATE/DELETE`: `authenticated (public.is_admin())` | Yes | Yes (`07_ielts_speaking_topics.csv`) | Yes | **PASS** |
| **8** | `quiz_questions` | `153` | `id (UUID)` | `import_batch_id -> import_batches(id) ON DELETE SET NULL` | `legacy_id UNIQUE` | `idx_quiz_questions_type`, `idx_quiz_questions_import_batch` | `ENABLED` | `SELECT`: `anon, authenticated (true)`<br>`INSERT/UPDATE/DELETE`: `authenticated (public.is_admin())` | Yes | Yes (`08_quiz_questions.csv`) | Yes | **PASS** |
| **9** | `pdf_library` | `35` | `id (UUID)` | `import_batch_id -> import_batches(id) ON DELETE SET NULL` | `legacy_id UNIQUE` | `idx_pdf_library_type_cat`, `idx_pdf_library_import_batch` | `ENABLED` | `SELECT`: `anon, authenticated (true)`<br>`INSERT/UPDATE/DELETE`: `authenticated (public.is_admin())` | Yes | Yes (`09_pdf_library.csv`) | Yes | **PASS** |
| **10** | `profiles` *(+ `user_profiles`)* | Runtime | `id (UUID)` | `id -> auth.users(id) ON DELETE CASCADE` | PK (`1:1` với `auth.users`) | PK B-tree (`id`) | `ENABLED` | `SELECT/INSERT/UPDATE/DELETE`: `authenticated ((SELECT auth.uid()) = id)` | Yes | N/A (User table) | Yes | **PASS** |
| **11** | `vocab_progress` *(+ `word_progress`)* | Runtime | `(user_id, word_id)` | `user_id -> auth.users(id) ON DELETE CASCADE` | Composite PK `(user_id, word_id)` | `idx_vocab_progress_user_next_review`, `idx_vocab_progress_user_status` | `ENABLED` | `SELECT/INSERT/UPDATE/DELETE`: `authenticated ((SELECT auth.uid()) = user_id)` | Yes | N/A (User table) | Yes | **PASS** |
| **12** | `saved_words` | Runtime | `(user_id, word_id)` | `user_id -> auth.users(id) ON DELETE CASCADE` | Composite PK `(user_id, word_id)` | `idx_saved_words_user_saved_at` | `ENABLED` | `SELECT/INSERT/UPDATE/DELETE`: `authenticated ((SELECT auth.uid()) = user_id)` | Yes | N/A (User table) | Yes | **PASS** |
| **13** | `study_sessions` *(+ `active_sessions`)* | Runtime | `(user_id, id)` | `user_id -> auth.users(id) ON DELETE CASCADE` | Composite PK `(user_id, id)` | `idx_study_sessions_user_started`, `idx_study_sessions_user_date`, `idx_study_sessions_user_date_string` | `ENABLED` | `SELECT/INSERT/UPDATE/DELETE`: `authenticated ((SELECT auth.uid()) = user_id)` | Yes | N/A (User table) | Yes | **PASS** |
| **14** | `mistake_bank` *(+ `mistakes_notebook`)* | Runtime | `(user_id, item_id)` | `user_id -> auth.users(id) ON DELETE CASCADE` | Composite PK `(user_id, item_id)` | `idx_mistake_bank_user_timestamp` | `ENABLED` | `SELECT/INSERT/UPDATE/DELETE`: `authenticated ((SELECT auth.uid()) = user_id)` | Yes | N/A (User table) | Yes | **PASS** |
| **15** | `user_stats` | Runtime | `user_id (UUID)` | `user_id -> auth.users(id) ON DELETE CASCADE` | PK (`1:1` với `auth.users`) | PK B-tree (`user_id`) | `ENABLED` | `SELECT/INSERT/UPDATE/DELETE`: `authenticated ((SELECT auth.uid()) = user_id)` | Yes | N/A (User table) | Yes | **PASS** |
| **16** | `challenge_60_progress` | Runtime | `user_id (UUID)` | `user_id -> auth.users(id) ON DELETE CASCADE` | PK (`1:1` với `auth.users`) | PK B-tree (`user_id`) | `ENABLED` | `SELECT/INSERT/UPDATE/DELETE`: `authenticated ((SELECT auth.uid()) = user_id)` | Yes | N/A (User table) | Yes | **PASS** |
| **17** | `user_challenge_progress` | Runtime | `user_id (UUID)` | `user_id -> auth.users(id) ON DELETE CASCADE` | PK (`1:1` với `auth.users`) | PK B-tree (`user_id`) | `ENABLED` | `SELECT/INSERT/UPDATE/DELETE`: `authenticated ((SELECT auth.uid()) = user_id)` | Yes | N/A (User table) | Yes | **PASS** |
| **18** | `user_writing_logs` | Runtime | `(user_id, id)` | `user_id -> auth.users(id) ON DELETE CASCADE` | Composite PK `(user_id, id)` | `idx_user_writing_logs_user_day` | `ENABLED` | `SELECT/INSERT/UPDATE/DELETE`: `authenticated ((SELECT auth.uid()) = user_id)` | Yes | N/A (User table) | Yes | **PASS** |
| **19** | `workspace_todos` | Runtime | `(user_id, todo_id)` | `user_id -> auth.users(id) ON DELETE CASCADE` | Composite PK `(user_id, todo_id)` | `idx_workspace_todos_user` | `ENABLED` | `SELECT/INSERT/UPDATE/DELETE`: `authenticated ((SELECT auth.uid()) = user_id)` | Yes | N/A (User table) | Yes | **PASS** |
| **20** | `custom_content_store` | Runtime | `user_id (UUID)` | `user_id -> auth.users(id) ON DELETE CASCADE` | PK (`1:1` với `auth.users`) | PK B-tree (`user_id`) | `ENABLED` | `SELECT/INSERT/UPDATE/DELETE`: `authenticated ((SELECT auth.uid()) = user_id)` | Yes | N/A (User table) | Yes | **PASS** |
| **21** | `user_custom_vocab` *(+ `user_custom_structures`)* | Runtime | `(user_id, id)` | `user_id -> auth.users(id) ON DELETE CASCADE` | Composite PK `(user_id, id)` | `idx_user_custom_vocab_user_word`, `idx_user_custom_structures_user` | `ENABLED` | `SELECT/INSERT/UPDATE/DELETE`: `authenticated ((SELECT auth.uid()) = user_id)` | Yes | N/A (User table) | Yes | **PASS** |

---

## 2. Kiểm định Chi tiết 8 Tiêu chí Bảo mật Cốt lõi (Mục 2) `[VERIFIED]`

### 2.1. Quyền truy cập `anon` vs `authenticated` & Cách ly Chéo Giữa `User A` và `User B`
1. **Khách chưa đăng nhập (`ROLE anon`)**:
   - **Được phép**: `SELECT` trên 9 bảng nội dung học thuật (`import_batches`, `vocabulary_categories`, `vocabulary`, `grammar_structures`, `curriculum_days`, `curriculum_day_vocab`, `ielts_speaking_topics`, `quiz_questions`, `pdf_library`) và 2 bucket công khai (`public-editorial-assets`, `course-pdfs`).
   - **Bị chặn 100% (`0 policies granted to anon`)**: Không có bất kỳ policy `SELECT / INSERT / UPDATE / DELETE` nào cho `ROLE anon` trên tất cả 12+ bảng dữ liệu người dùng (`profiles`, `user_profiles`, `vocab_progress`, `word_progress`, `saved_words`, `study_sessions`, `active_sessions`, `mistake_bank`, `mistakes_notebook`, `user_stats`, `challenge_60_progress`, `user_challenge_progress`, `user_writing_logs`, `workspace_todos`, `custom_content_store`, `user_custom_vocab`, `user_custom_structures`).
2. **Cách ly giữa `User A` và `User B` (`ROLE authenticated`)**:
   - Mọi bảng người dùng đều áp dụng mệnh đề `USING ((SELECT auth.uid()) = user_id)` và `WITH CHECK ((SELECT auth.uid()) = user_id)` (hoặc `= id` với bảng `profiles`).
   - **Hệ quả**:
     - `User A` (`sub = '11111111-1111-4111-8111-111111111111'`) **không thể đọc (`SELECT`)** bất kỳ dòng nào của `User B` (`sub = '22222222-2222-4222-8222-222222222222'`).
     - `User A` **không thể chèn (`INSERT`)** hoặc **sửa (`UPDATE`)** dòng mang `user_id` của `User B` vì mệnh đề `WITH CHECK ((SELECT auth.uid()) = user_id)` sẽ lập tức từ chối với lỗi `42501: new row violates row-level security policy`.
     - `User A` (học viên thông thường, `app_metadata.role != 'admin'`) **không thể ghi/sửa/xóa** bất kỳ dòng nào trong 9 bảng nội dung tĩnh (`vocabulary`, `grammar_structures`, `curriculum_days`...).

### 2.2. Kiểm định `SECURITY DEFINER`, `search_path` và Triggers
Trong `_audit/06_SUPABASE_SCHEMA.sql`, có đúng **3 hàm** sử dụng `SECURITY DEFINER`, và cả 3 đều đã khóa cứng `SET search_path = ''` (tuân thủ chuẩn chống tấn công leo thang đặc quyền `search_path hijacking` của PostgreSQL):
1. `public.handle_updated_at()` (`lines 28–38`): `SECURITY DEFINER SET search_path = ''` — chỉ gán `NEW.updated_at = timezone('utc'::text, now())`.
2. `public.is_admin()` (`lines 40–51`): `SECURITY DEFINER SET search_path = ''` — kiểm tra `((SELECT auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'`. Lưu ý: `app_metadata` chỉ có thể được sửa bởi `service_role` hoặc Admin SQL, người dùng đầu cuối **không thể** tự sửa `app_metadata` qua `supabase.auth.updateUser()` (vốn chỉ sửa được `user_metadata`).
3. `public.handle_new_auth_user()` (`lines 562–592`): `SECURITY DEFINER SET search_path = ''` — tự động khởi tạo hồ sơ `1:1` trong `public.profiles`, `public.user_profiles` và `public.user_stats` với `ON CONFLICT DO NOTHING` khi có bản ghi mới trong `auth.users`.

### 2.3. Kiểm định Storage Buckets & Storage Policies (`storage.objects`)
| Bucket ID | Chế độ Public | Giới hạn kích thước | MIME Types cho phép | Quyền Đọc (`SELECT`) | Quyền Ghi (`INSERT/UPDATE/DELETE`) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `public-editorial-assets` | `true` | `10 MB` (`10,485,760 B`) | `image/jpeg, png, webp, avif, svg+xml` | `anon, authenticated` | Chỉ Admin (`public.is_admin()`) |
| `course-pdfs` | `true` | `50 MB` (`52,428,800 B`) | `application/pdf` | `anon, authenticated` | Chỉ Admin (`public.is_admin()`) |
| `user-uploads` | `false` (Private) | `10 MB` (`10,485,760 B`) | `image/jpeg, png, webp, audio/mpeg, wav, webm` | Chỉ chủ sở hữu thư mục `(storage.foldername(name))[1] = auth.uid()::text` | Chỉ chủ sở hữu thư mục `(storage.foldername(name))[1] = auth.uid()::text` |

### 2.4. Kiểm định Khóa Bí mật & Biến Môi trường (Frontend vs Backend Secrets)
- **`service_role` Leak Protection `[VERIFIED: PASS]`**:
  - `src/services/supabaseClient.ts:26-44` có hàm `detectServiceRoleLeak()` giải mã payload JWT của `VITE_SUPABASE_ANON_KEY`. Nếu phát hiện `"role": "service_role"` hoặc tiền tố `sb_secret_`, client tự động ngắt khởi tạo và khóa ở `local_mode`.
- **Admin Password Fallback `[VERIFIED: PASS]`**:
  - Đã loại bỏ hoàn toàn mật khẩu dự phòng nhúng cứng trong `src/utils/adminAuth.ts` (Finding `F-001`).
- **Server-Only API Keys (`GEMINI_API_KEY`, `ELEVENLABS_API_KEY`) `[VERIFIED: PASS]`**:
  - Chỉ được đọc trong `server.ts` và `server.js` ở phía Node.js/Express; không có biến `VITE_ELEVENLABS_API_KEY` hay `VITE_GEMINI_API_KEY` nào được đưa ra trình duyệt.

---

## 3. Kịch bản Kiểm thử RLS Giữa `Anon`, `User A`, `User B` và `Admin` (Chạy trong Supabase SQL Editor)

Khi kết nối tới Supabase Staging/Production, chạy đoạn script kiểm thử trong giao dịch an toàn (`BEGIN ... ROLLBACK`) dưới đây để xác nhận thực nghiệm:

```sql
BEGIN;
  -- 1. Kiểm thử vai trò ANON: Đọc được vocabulary, KHÔNG đọc được dữ liệu cá nhân
  SET LOCAL ROLE anon;
  SELECT count(*) AS anon_vocab_readable FROM public.vocabulary; -- Kỳ vọng: 3666
  SELECT count(*) AS anon_profiles_readable FROM public.profiles; -- Kỳ vọng: 0
  SELECT count(*) AS anon_progress_readable FROM public.vocab_progress; -- Kỳ vọng: 0

  -- 2. Kiểm thử cách ly giữa User A và User B
  SET LOCAL ROLE authenticated;
  SET LOCAL "request.jwt.claims" = '{"sub": "11111111-1111-4111-8111-111111111111", "role": "authenticated", "app_metadata": {"role": "student"}}';

  -- User A thử đọc dữ liệu của User B -> Kỳ vọng: 0 dòng trả về
  SELECT count(*) AS user_a_reads_user_b
  FROM public.vocab_progress
  WHERE user_id = '22222222-2222-4222-8222-222222222222';

  -- User A thử xóa từ vựng hệ thống -> Kỳ vọng: 0 rows deleted
  DELETE FROM public.vocabulary WHERE legacy_id = 'abandon';
ROLLBACK;
```
