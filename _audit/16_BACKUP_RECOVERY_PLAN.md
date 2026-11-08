# 🛡️ KẾ HOẠCH SAO LƯU & PHỤC HỒI THẢM HỌA 3 TẦNG (`16_BACKUP_RECOVERY_PLAN.md`)

## Tóm tắt điều hành (Executive Summary)
Tài liệu này thiết lập **Kế hoạch Sao lưu, Hoàn tác (Rollback) và Phục hồi Thảm họa 3 Tầng (Mục 5)** cho LexiMaster IELTS trước, trong và sau khi đưa hệ thống lên vận hành chính thức trên Supabase `[VERIFIED]`. Kế hoạch tách biệt rõ ràng 3 kịch bản: **(1) Rollback Schema**, **(2) Rollback Dữ liệu Học thuật Nạp theo Lô (`import_batch_id`)**, và **(3) Phục hồi Dữ liệu Người dùng Sau Go-Live (Post-Migration User Data Recovery)** để đảm bảo không bao giờ làm mất tiến độ học tập của học viên.

---

## 1. Kiểm kê Các Bản Sao Lưu Cục bộ Hiện có (`_audit/backup_*/`) `[VERIFIED]`

Toàn bộ dữ liệu gốc và trạng thái mã nguồn qua từng giai đoạn kiểm định đều đã được đóng gói và kiểm chứng SHA-256:

| Thư mục Sao lưu | Tệp Lưu trữ & Kiểm chứng | Thời điểm Tạo | Nội dung Bảo vệ | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| **`_audit/backup_0_original/`** | `snapshot_0_original.tar.gz` (`84.2 MB`)<br>`CHECKSUMS.txt` (`204 tệp`) | Trước GĐ 1 (Baseline nguyên bản 100%) | Toàn bộ `src/` (gồm 17/17 tệp `src/data/*`), `public/` (129 tệp ảnh gốc), `server.ts`, `package.json`. | **PASS `[VERIFIED]`** |
| **`_audit/backup_1_pre_fixes/`** | `snapshot_1_pre_fixes.tar.gz` | Trước GĐ 4 (Trước khi sửa lỗi `F-001..F-009`) | Toàn bộ `src/`, `server.ts`, `server.js`, `index.html`. | **PASS `[VERIFIED]`** |
| **`_audit/backup_2_pre_cleanup/`** | `snapshot_2_pre_cleanup.tar.gz` | Trước khi dọn 4 file code chết & 69 ảnh trùng | Danh sách đầy đủ các tệp đã dọn dẹp để có thể khôi phục bất kỳ tệp nào trong 1 lệnh `tar -xzf`. | **PASS `[VERIFIED]`** |
| **`_audit/backup_3_pre_data_norm/`** | `snapshot_3_pre_data_norm.tar.gz` | Trước GĐ 5 (Chuẩn hóa dữ liệu Supabase) | Toàn bộ `src/data/` và `supabase/schema.sql`. | **PASS `[VERIFIED]`** |

---

## 2. Quy trình Sao lưu Database Trước Khi Chạy Migration Trên Supabase (Pre-Migration Snapshot)

Trước khi chạy `_audit/06_SUPABASE_SCHEMA.sql` hoặc nạp gói `_audit/08_SUPABASE_IMPORT/` trên môi trường Staging/Production, bắt buộc thực hiện:

```bash
# 1. Xuất toàn bộ Schema + Data hiện có trên Supabase ra file dump có gắn timestamp
export SUPABASE_DB_URL="postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres"
export BACKUP_TS=$(date -u +"%Y%m%d_%H%M%S")

pg_dump "$SUPABASE_DB_URL" \
  --schema=public \
  --format=custom \
  --file="_audit/supabase_pre_migration_${BACKUP_TS}.dump"

# 2. Tạo bản SQL thuần để dễ tra cứu diff
pg_dump "$SUPABASE_DB_URL" \
  --schema=public \
  --clean --if-exists \
  --file="_audit/supabase_pre_migration_${BACKUP_TS}.sql"

# 3. Ghi nhận mã băm SHA-256 của bản sao lưu
sha256sum "_audit/supabase_pre_migration_${BACKUP_TS}."* > "_audit/supabase_pre_migration_${BACKUP_TS}.sha256"
```

---

## 3. Phân tách Rõ 3 Kịch bản Rollback & Phục hồi (Mục 5)

### Kịch bản A — Rollback Lô Dữ liệu Học thuật (`import_batch_id`) *(Không chạm vào bảng User)*
- **Khi nào sử dụng**: Khi muốn gỡ bỏ hoặc thay thế gói `5,087` bản ghi học thuật vừa nạp (`batch_id = '9b9c7c85-c47f-5dac-824e-b5bf703c4037'`) mà **giữ nguyên 100% tài khoản và tiến độ học tập của học viên**.
- **Lệnh thực thi SQL (Zero-Downtime)**:
```sql
BEGIN;
  DELETE FROM public.curriculum_day_vocab  WHERE import_batch_id = '9b9c7c85-c47f-5dac-824e-b5bf703c4037';
  DELETE FROM public.curriculum_days       WHERE import_batch_id = '9b9c7c85-c47f-5dac-824e-b5bf703c4037';
  DELETE FROM public.vocabulary            WHERE import_batch_id = '9b9c7c85-c47f-5dac-824e-b5bf703c4037';
  DELETE FROM public.vocabulary_categories WHERE import_batch_id = '9b9c7c85-c47f-5dac-824e-b5bf703c4037';
  DELETE FROM public.grammar_structures    WHERE import_batch_id = '9b9c7c85-c47f-5dac-824e-b5bf703c4037';
  DELETE FROM public.ielts_speaking_topics WHERE import_batch_id = '9b9c7c85-c47f-5dac-824e-b5bf703c4037';
  DELETE FROM public.quiz_questions        WHERE import_batch_id = '9b9c7c85-c47f-5dac-824e-b5bf703c4037';
  DELETE FROM public.pdf_library           WHERE import_batch_id = '9b9c7c85-c47f-5dac-824e-b5bf703c4037';
  DELETE FROM public.import_batches        WHERE id = '9b9c7c85-c47f-5dac-824e-b5bf703c4037';
COMMIT;
```

### Kịch bản B — Rollback Schema (Chỉ gỡ bỏ 9 bảng Content Mới, Bảo toàn Bảng Tiến độ Học viên)
- **Khi nào sử dụng**: Khi cần đưa cấu trúc Schema về trước GĐ 5 nhưng tuyệt đối không được xóa các bảng `profiles`, `user_profiles`, `vocab_progress`, `word_progress`, `study_sessions`, `challenge_60_progress`, `user_stats`, `mistake_bank`, `workspace_todos`.
- **Lệnh thực thi SQL**:
```sql
BEGIN;
  DROP TABLE IF EXISTS public.curriculum_day_vocab CASCADE;
  DROP TABLE IF EXISTS public.curriculum_days CASCADE;
  DROP TABLE IF EXISTS public.vocabulary CASCADE;
  DROP TABLE IF EXISTS public.vocabulary_categories CASCADE;
  DROP TABLE IF EXISTS public.grammar_structures CASCADE;
  DROP TABLE IF EXISTS public.ielts_speaking_topics CASCADE;
  DROP TABLE IF EXISTS public.quiz_questions CASCADE;
  DROP TABLE IF EXISTS public.pdf_library CASCADE;
  DROP TABLE IF EXISTS public.import_batches CASCADE;
COMMIT;
```

### Kịch bản C — Phục hồi Dữ liệu Người dùng Sau Khi Đã Có Học viên Học tập (Post-Migration User Data Recovery)
1. **Tầng 1 — Phục hồi phía Học viên từ Snapshot Trình duyệt (`localStorage` + JSON Backup)**:
   - Mọi học viên đều có dữ liệu đầy đủ trên `localStorage` và tính năng **Xuất/Nhập Hồ Sơ JSON + Hoàn tác (`rollbackPreRestoreSnapshot`)** trong ngăn kéo Hồ sơ (`src/components/UserProfileDrawer.tsx:243-258`).
   - Ngay khi kết nối lại và nhấn **"Đồng bộ 2 chiều ngay"**, hàm `syncAllDataWithCloud` sẽ tự động đẩy (Push) toàn bộ dữ liệu học tập từ trình duyệt của học viên lên lại Supabase.
2. **Tầng 2 — Phục hồi Bảng Cụ thể từ Bản Dump (`pg_restore --table`)**:
   - Nếu chỉ cần khôi phục 1 bảng người dùng cụ thể (ví dụ `challenge_60_progress`) mà không ghi đè các bảng khác:
   ```bash
   pg_restore --dbname="$SUPABASE_DB_URL" \
     --schema=public \
     --table=challenge_60_progress \
     --data-only \
     "_audit/supabase_pre_migration_${BACKUP_TS}.dump"
   ```
3. **Tầng 3 — Supabase Point-in-Time Recovery (PITR) / Daily Automated Backups**:
   - Trên Supabase Pro/Production, kích hoạt **Daily Backups** (hoặc **PITR** theo từng giây) trong **Database → Backups** để khôi phục về bất kỳ mốc thời gian nào trước sự cố.

---

## 4. Quy trình Kiểm tra Sau Khôi phục (Post-Recovery Verification Checklist)

Sau bất kỳ thao tác Rollback hoặc Restore nào, chạy ngay 3 truy vấn kiểm chứng sau:
```sql
-- 1. Kiểm tra RLS vẫn bật 100% trên mọi bảng public
SELECT count(*) FILTER (WHERE NOT rowsecurity) AS tables_without_rls
FROM pg_tables WHERE schemaname = 'public'; -- Kỳ vọng: 0

-- 2. Kiểm tra số lượng bản ghi người dùng được bảo toàn
SELECT
  (SELECT count(*) FROM public.profiles) AS profiles_count,
  (SELECT count(*) FROM public.study_sessions) AS sessions_count,
  (SELECT count(*) FROM public.challenge_60_progress) AS challenge60_count;

-- 3. Chạy lại bộ kiểm định _audit/09_VALIDATION_QUERIES.sql
```
