# 📦 GÓI NẠP DỮ LIỆU SUPABASE (`_audit/08_SUPABASE_IMPORT/`)

## Tóm tắt điều hành (Executive Summary)
Thư mục này chứa toàn bộ dữ liệu học thuật tĩnh của **LexiMaster IELTS (MASTER English)** đã được chuẩn hóa (Unicode NFC, chuẩn hóa từ loại `pos`, chuẩn hóa cấp độ CEFR `B1–C2`, sinh khóa chính định danh tất định **UUID v5** theo chuẩn RFC 4122 từ khóa tự nhiên và giữ nguyên `legacy_id` để tương thích ngược 100%). Gói dữ liệu đã được kiểm định độc lập bằng cả hai script `scripts/export_supabase_data.mjs` (chạy 2 lần cho ra `checksums.sha256` khớp tuyệt đối 100%) và `scripts/verify_export_counts.py` (Agent C độc lập bằng Python: **0 lỗi UUID, 0 lỗi khóa ngoại mồ côi, 0 vi phạm NFC**).

---

## 1. Danh sách 9 bảng dữ liệu (Thứ tự nạp chuẩn theo Khóa Ngoại)

| Thứ tự | Bảng đích trên Supabase | File CSV / JSON | Số bản ghi `[VERIFIED]` | Khóa ngoại (FK) phụ thuộc |
| :--- | :--- | :--- | ---: | :--- |
| **1** | `public.import_batches` | `01_import_batches.csv` / `.json` | **1** | Không (Bảng gốc theo dõi lô nạp) |
| **2** | `public.vocabulary_categories` | `02_vocabulary_categories.csv` / `.json` | **42** | `import_batch_id -> import_batches(id)` |
| **3** | `public.vocabulary` | `03_vocabulary.csv` / `.json` | **3,666** | `category_id -> vocabulary_categories(id)`, `import_batch_id` |
| **4** | `public.grammar_structures` | `04_grammar_structures.csv` / `.json` | **89** | `import_batch_id -> import_batches(id)` |
| **5** | `public.curriculum_days` | `05_curriculum_days.csv` / `.json` | **66** | `import_batch_id -> import_batches(id)` |
| **6** | `public.curriculum_day_vocab` | `06_curriculum_day_vocab.csv` / `.json` | **990** | `day_id -> curriculum_days(id)`, `vocab_id -> vocabulary(id)` |
| **7** | `public.ielts_speaking_topics` | `07_ielts_speaking_topics.csv` / `.json` | **45** | `import_batch_id -> import_batches(id)` |
| **8** | `public.quiz_questions` | `08_quiz_questions.csv` / `.json` | **153** | `import_batch_id -> import_batches(id)` |
| **9** | `public.pdf_library` | `09_pdf_library.csv` / `.json` | **35** | `import_batch_id -> import_batches(id)` |
| **Tổng** | **9 bảng nội dung** | **18 file (`.csv` + `.json`)** | **5,087** | **0 khóa ngoại mồ côi `[VERIFIED]`** |

---

## 2. Các tệp ánh xạ ID, kiểm định & Storage đi kèm

- `manifest.json`: Thông tin tổng hợp lô xuất, namespace UUID v5 (`6ba7b810-9dad-11d1-80b4-00c04fd430c8`), số dòng và mã băm SHA-256 của từng bảng.
- `checksums.sha256`: Danh sách mã băm SHA-256 của toàn bộ tệp `.csv` và `.json` trong gói.
- `id_map_vocabulary.csv`, `id_map_grammar_structures.csv`, `id_map_curriculum_days.csv`, `id_map_speaking_topics.csv`, `id_map_quiz_questions.csv`: Bảng đối chiếu `legacy_id <-> new_uuid` kèm `natural_key` và `source_hash`.
- `storage_manifest.csv`: Danh sách **59** tệp tài nguyên tĩnh trong `public/assets/` ánh xạ sang Supabase Storage bucket `public-editorial-assets` (kèm kích thước, chiều ảnh, MIME type, SHA-256 và `Cache-Control`).
- `needs_review/vocabulary_needs_review.csv`:
  - 1 bản ghi (`legacy_id = "protein"`) có `meaning_vi = "Protein"` trùng với từ gốc tiếng Anh (từ mượn khoa học).
  - 4 bản ghi từ `VSTEP_PDF_VOCAB_BANK` (`take part in`, `broaden one's horizons`, `cutting-edge`, `Strike a balance`) trùng với `vocabDatabase.json` và đã được gộp tự động.
- `needs_review/pdf_references_needs_review.csv`: 2 đường dẫn file PDF gốc (`/assets/aistudio/Untitled_document_bb0198f5.pdf` và `/assets/aistudio/_n_thi_vstep_11d6f8c6.pdf`) mà nội dung đã được trích xuất 100% sang dữ liệu có cấu trúc nhưng file nhị phân `.pdf` gốc không nằm trong `public/assets/aistudio/`.

---

## 3. Hướng dẫn 3 bước nạp lên Supabase

### Bước 1: Khởi tạo Schema & RLS
Mở **Supabase Dashboard → SQL Editor**, dán toàn bộ nội dung file `/_audit/06_SUPABASE_SCHEMA.sql` và nhấn **Run**.

### Bước 2: Nạp dữ liệu theo đúng thứ tự `01` → `09`
Bạn có thể nạp qua **Supabase Table Editor → Import data from CSV** theo đúng thứ tự đánh số `01_import_batches.csv` đến `09_pdf_library.csv`, hoặc dùng `psql`:

```bash
psql "$SUPABASE_DB_URL" -c "\copy public.import_batches(id,batch_code,description,source_version,total_tables,imported_at,created_at) FROM '_audit/08_SUPABASE_IMPORT/01_import_batches.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');"
psql "$SUPABASE_DB_URL" -c "\copy public.vocabulary_categories(id,legacy_id,slug,name,display_order,vocab_count,import_batch_id,created_at,updated_at) FROM '_audit/08_SUPABASE_IMPORT/02_vocabulary_categories.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');"
psql "$SUPABASE_DB_URL" -c "\copy public.vocabulary(id,legacy_id,word,word_normalized,ipa,pos,pos_raw,cefr_level,meaning_vi,example_en,example_vi,synonyms,antonyms,collocations,word_family,detailed_note,tags,category_id,needs_review,source_file,source_hash,import_batch_id,created_at,updated_at) FROM '_audit/08_SUPABASE_IMPORT/03_vocabulary.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');"
psql "$SUPABASE_DB_URL" -c "\copy public.grammar_structures FROM '_audit/08_SUPABASE_IMPORT/04_grammar_structures.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');"
psql "$SUPABASE_DB_URL" -c "\copy public.curriculum_days FROM '_audit/08_SUPABASE_IMPORT/05_curriculum_days.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');"
psql "$SUPABASE_DB_URL" -c "\copy public.curriculum_day_vocab FROM '_audit/08_SUPABASE_IMPORT/06_curriculum_day_vocab.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');"
psql "$SUPABASE_DB_URL" -c "\copy public.ielts_speaking_topics FROM '_audit/08_SUPABASE_IMPORT/07_ielts_speaking_topics.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');"
psql "$SUPABASE_DB_URL" -c "\copy public.quiz_questions FROM '_audit/08_SUPABASE_IMPORT/08_quiz_questions.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');"
psql "$SUPABASE_DB_URL" -c "\copy public.pdf_library FROM '_audit/08_SUPABASE_IMPORT/09_pdf_library.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');"
```

### Bước 3: Chạy bộ truy vấn hậu kiểm
Mở **Supabase SQL Editor** và chạy file `/_audit/09_VALIDATION_QUERIES.sql` để xác nhận 100% bảng hiển thị `PASS`.

### Cách Rollback theo `import_batch_id` (nếu cần)
```sql
DELETE FROM public.import_batches
WHERE id = '5b37893a-535b-515b-9f1b-8c7b779b527b';
-- Hoặc xóa theo batch_code:
DELETE FROM public.import_batches
WHERE batch_code = 'LEXIMASTER_BASELINE_2026_11_05';
```
*(Để xóa kèm các bản ghi con trong một giao dịch an toàn, xem chi tiết trong `/_audit/07_SUPABASE_MIGRATION_PLAN.md`.)*
