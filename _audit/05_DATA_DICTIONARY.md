# 📖 TỪ ĐIỂN DỮ LIỆU & ĐẶC TẢ LƯỢC ĐỒ (`05_DATA_DICTIONARY.md`)

## Tóm tắt điều hành (Executive Summary)
Tài liệu này định nghĩa chi tiết lược đồ cơ sở dữ liệu quan hệ PostgreSQL/Supabase cho **LexiMaster IELTS (MASTER English)** gồm **21 bảng** chia làm 2 phân khu: **Phân khu I (9 bảng nội dung học thuật chuẩn hóa)** tương ứng 1:1 với các tệp CSV/JSON trong `_audit/08_SUPABASE_IMPORT/`, và **Phân khu II (12 bảng hồ sơ, tiến độ SRS & đồng bộ đám mây của người dùng)** tương thích 100% với `src/services/dataRepository.ts` `[VERIFIED]`. Mọi bảng nội dung đều áp dụng quy ước đặt tên `snake_case`, khóa chính định danh tất định **UUID v5** (`id`), khóa truy vết ngược (`legacy_id`, `source_file`, `source_hash`, `import_batch_id`), và chuẩn hóa tiếng Việt **Unicode NFC** `[VERIFIED]`.

---

## 1. Quy ước Thiết kế Cơ sở Dữ liệu Chung `[VERIFIED]`

- **Khóa chính (Primary Key)**:
  - Trên 9 bảng nội dung (`01`..`09`): Kiểu `UUID` sinh tất định bằng thuật toán **UUID v5 (SHA-1 Namespace `6ba7b810-9dad-11d1-80b4-00c04fd430c8`)** từ khóa tự nhiên `<table>:<natural_key>`, kèm cột `legacy_id TEXT UNIQUE` giữ nguyên ID gốc từ mã nguồn TypeScript/JSON.
  - Trên 12 bảng người dùng: Khóa chính đơn `(user_id)` hoặc khóa chính phức hợp `(user_id, <item_id>)` tham chiếu trực tiếp `auth.users(id) ON DELETE CASCADE`.
- **Chuẩn thời gian**: Mọi cột thời gian hệ thống (`created_at`, `updated_at`, `imported_at`) dùng kiểu `TIMESTAMPTZ` (UTC); các cột dấu thời gian máy khách phục vụ giải quyết xung đột Offline-First (`client_updated_at`, `last_reviewed_at`, `next_review_at`) dùng `BIGINT` (epoch milliseconds).
- **Bảo mật cấp dòng (RLS)**: 100% bảng (21/21) bật `ROW LEVEL SECURITY`.

---

## 2. Phân khu I — 9 Bảng Nội dung Học thuật Chuẩn hóa (`_audit/08_SUPABASE_IMPORT/`) `[VERIFIED]`

### 2.1. `public.import_batches` (`01_import_batches.csv` — 1 bản ghi)
Quản lý lịch sử các lô nạp dữ liệu tĩnh để hỗ trợ truy vết và rollback tức thì theo lô.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | UUID v5 của lô nạp (`5b37893a-535b-515b-9f1b-8c7b779b527b`) |
| `batch_code` | `TEXT` | `NOT NULL UNIQUE` | Mã lô nạp (`LEXIMASTER_BASELINE_2026_11_05`) |
| `description` | `TEXT` | `NOT NULL` | Mô tả chi tiết nội dung lô nạp |
| `source_version` | `TEXT` | `NOT NULL DEFAULT '1.0.0'` | Phiên bản dữ liệu nguồn |
| `total_tables` | `INTEGER` | `NOT NULL CHECK (>= 0)` | Số bảng được nạp trong lô (`9`) |
| `imported_at` | `TIMESTAMPTZ` | `NOT NULL` | Thời điểm tạo lô nạp |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL` | Thời điểm tạo bản ghi |

---

### 2.2. `public.vocabulary_categories` (`02_vocabulary_categories.csv` — 42 bản ghi)
Danh mục chủ đề học thuật của từ vựng.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | UUID v5 sinh từ `vocabulary_category:<slug>` |
| `legacy_id` | `TEXT` | `NOT NULL UNIQUE` | Mã định danh cũ (`cat_<slug>`) |
| `slug` | `TEXT` | `NOT NULL UNIQUE` | Đường dẫn tĩnh chuẩn hóa (`academic`, `environment`, `technology`...) |
| `name` | `TEXT` | `NOT NULL` | Tên hiển thị chuyên đề |
| `display_order` | `INTEGER` | `NOT NULL DEFAULT 1` | Thứ tự hiển thị |
| `vocab_count` | `INTEGER` | `NOT NULL CHECK (>= 0)` | Số lượng từ vựng thuộc chuyên đề |
| `import_batch_id` | `UUID` | `FK -> import_batches(id)` | Khóa ngoại trỏ về lô nạp |
| `created_at` / `updated_at` | `TIMESTAMPTZ` | `NOT NULL` | Dấu thời gian tạo / cập nhật |

---

### 2.3. `public.vocabulary` (`03_vocabulary.csv` — 3,666 bản ghi)
Kho từ vựng học thuật IELTS & VSTEP trung tâm.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | UUID v5 sinh từ `vocabulary:<legacy_id>:<word_normalized>` |
| `legacy_id` | `TEXT` | `NOT NULL UNIQUE` | ID gốc trong `vocabDatabase.json` hoặc `VSTEP_PDF_VOCAB_BANK` |
| `word` | `TEXT` | `NOT NULL` | Từ hoặc cụm từ tiếng Anh (đã trim & chuẩn NFC) |
| `word_normalized` | `TEXT` | `NOT NULL` | Từ viết thường phục vụ tìm kiếm chính xác & `pg_trgm` |
| `ipa` | `TEXT` | `NOT NULL` | Phiên âm quốc tế IPA (`/kənˈdʒuː.sɪv/`) |
| `pos` | `TEXT` | `CHECK IN ('noun','verb','adj','adv','phrase','idiom','grammar')` | Từ loại chuẩn hóa |
| `pos_raw` | `TEXT` | `NOT NULL` | Giá trị từ loại gốc trước khi chuẩn hóa |
| `cefr_level` | `TEXT` | `CHECK IN ('A1','A2','B1','B2','C1','C2')` | Cấp độ khung tham chiếu châu Âu (`B1`..`C2`) |
| `meaning_vi` | `TEXT` | `NOT NULL` | Nghĩa tiếng Việt học thuật |
| `example_en` | `TEXT` | `NOT NULL` | Câu ví dụ tiếng Anh |
| `example_vi` | `TEXT` | `NOT NULL` | Bản dịch câu ví dụ tiếng Việt |
| `synonyms` | `JSONB` | `NOT NULL DEFAULT '[]'` | Mảng từ đồng nghĩa (`string[]`) |
| `antonyms` | `JSONB` | `NOT NULL DEFAULT '[]'` | Mảng từ trái nghĩa (`string[]`) |
| `collocations` | `JSONB` | `NOT NULL DEFAULT '[]'` | Mảng cụm từ cố định đi kèm (`string[]`) |
| `word_family` | `JSONB` | `NOT NULL DEFAULT '[]'` | Mảng họ từ (`string[]`) |
| `detailed_note` | `TEXT` | `NOT NULL DEFAULT ''` | Ghi chú ngữ cảnh học thuật mở rộng |
| `tags` | `JSONB` | `NOT NULL DEFAULT '[]'` | Mảng nhãn chủ đề (`string[]`, có GIN index) |
| `category_id` | `UUID` | `FK -> vocabulary_categories(id)` | Khóa ngoại trỏ tới chuyên đề chính |
| `needs_review` | `BOOLEAN` | `NOT NULL DEFAULT false` | Cờ đánh dấu bản ghi cần biên tập viên rà soát (`1` bản ghi `protein`) |
| `source_file` | `TEXT` | `NOT NULL` | Tệp nguồn gốc (`src/data/vocabDatabase.json` / `vstepPdfKnowledgeBankData.ts`) |
| `source_hash` | `TEXT` | `NOT NULL` | Mã băm SHA-256 của đối tượng JSON gốc |
| `import_batch_id` | `UUID` | `FK -> import_batches(id)` | Khóa ngoại lô nạp |
| `fts_vector` | `TSVECTOR` | `GENERATED ALWAYS AS (...) STORED` | Cột vector tìm kiếm toàn văn tự động (có GIN index) |
| `created_at` / `updated_at` | `TIMESTAMPTZ` | `NOT NULL` | Dấu thời gian tạo / cập nhật |

---

### 2.4. `public.grammar_structures` (`04_grammar_structures.csv` — 89 bản ghi)
Gồm 77 cấu trúc từ `EXPANDED_PDF_KNOWLEDGE_LIBRARY` và 12 cấu trúc từ `VSTEP_PDF_STRUCTURE_BANK`.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | UUID v5 của cấu trúc ngữ pháp |
| `legacy_id` | `TEXT` | `NOT NULL UNIQUE` | ID gốc (`pdf-item-1`..`pdf-item-77`, `vstep-struct-01`..`12`) |
| `item_number` | `INTEGER` | `NOT NULL` | Số thứ tự cấu trúc (`1..77`, `101..112`) |
| `structure_name` | `TEXT` | `NOT NULL` | Tên cấu trúc ngữ pháp / mẫu câu |
| `formula` | `TEXT` | `NOT NULL` | Công thức cú pháp chuẩn |
| `meaning_vi` | `TEXT` | `NOT NULL` | Ý nghĩa tiếng Việt |
| `when_to_use` | `TEXT` | `NOT NULL` | Ngữ cảnh áp dụng trong IELTS Writing / Speaking |
| `category_slug` / `category_label` | `TEXT` | `NOT NULL` | Mã và tên phân mục quy chuẩn hành văn |
| `difficulty_band` | `TEXT` | `NOT NULL` | Mức điểm mục tiêu (`Band 7.0–7.5`, `Band 8.0+`...) |
| `example_en` / `example_vi` | `TEXT` | `NOT NULL` | Ví dụ gốc tiếng Anh và bản dịch tiếng Việt |
| `how_it_works_vi` | `TEXT` | `NOT NULL` | Phân tích cơ chế ngữ pháp chuyên sâu |
| `syntactic_breakdown` | `JSONB` | `NOT NULL DEFAULT '[]'` | Mảng thành phần cú pháp |
| `expanded_examples` | `JSONB` | `NOT NULL DEFAULT '[]'` | Danh sách ví dụ mở rộng đa lĩnh vực (232 ví dụ) |
| `sentence_transformations` | `JSONB` | `NOT NULL DEFAULT '[]'` | Danh sách bài tập biến đổi câu |
| `common_mistakes` | `JSONB` | `NOT NULL DEFAULT '[]'` | Danh sách lỗi sai phổ biến cần tránh |
| `source_pdf_name` / `source_pdf_page` | `TEXT` / `INT` | `NOT NULL` | Tên tài liệu PDF nguồn và số trang |
| `source_file` / `source_hash` / `import_batch_id` | `TEXT` / `UUID` | `NOT NULL` | Thông tin truy vết nguồn dữ liệu |

---

### 2.5. `public.curriculum_days` (`05_curriculum_days.csv` — 66 bản ghi) & `public.curriculum_day_vocab` (`06_curriculum_day_vocab.csv` — 990 bản ghi)
- **`public.curriculum_days`**: Lưu trữ 66 ngày học (`day_number` `1..66` UNIQUE, `week_number`, `topic_en`, `topic_vi`, `theme_tag`, `band_target`, bài đọc `reading_title`/`reading_paragraphs`/`reading_questions`, bài viết `writing_prompt`/`writing_outline`/`writing_model_essay`, và bài nói `speaking_topic`/`speaking_part1`/`speaking_cue_card`/`speaking_part3`).
- **`public.curriculum_day_vocab`**: Bảng chi tiết 15 mục từ vựng của mỗi ngày học (`990` dòng), có khóa ngoại `day_id REFERENCES public.curriculum_days(id) ON DELETE CASCADE` và `vocab_id REFERENCES public.vocabulary(id) ON DELETE SET NULL` (757/990 dòng khớp trực tiếp với từ khóa trong `public.vocabulary`).

---

### 2.6. `public.ielts_speaking_topics` (`07_ielts_speaking_topics.csv` — 45 bản ghi)
Gồm 28 bộ đề thi Speaking hoàn chỉnh (`ALL_VSTEP_28_SEEDS`) và 17 chủ đề Speaking Part 1 (`4`), Part 2 (`8`), Part 3 (`5`) từ `vstepPdfKnowledgeBankData.ts`.

### 2.7. `public.quiz_questions` (`08_quiz_questions.csv` — 153 bản ghi)
Hợp nhất toàn bộ ngân hàng câu hỏi đánh giá năng lực:
- `collocation_mcq`: **20** câu (`COLLOCATION_QUESTIONS`)
- `context_completion`: **15** câu (`CONTEXT_QUESTIONS`)
- `tricky_distinction`: **12** câu (`TRICKY_DISTINCTIONS`)
- `grammar_error_correction`: **17** câu (`GRAMMAR_TIPS`)
- `structure_multiple-choice` / `fill-in-blank` / `rewrite`: **77** câu (`EXPANDED_PDF_KNOWLEDGE_LIBRARY`)
- `vstep_grammar_rule`: **12** câu (`VSTEP_PDF_GRAMMAR_BANK`)

### 2.8. `public.pdf_library` (`09_pdf_library.csv` — 35 bản ghi)
Lưu trữ 24 hồ sơ tổng hợp `VSTEP_PDF_AS_KNOWLEDGE_RECORDS`, 5 mẫu bài viết `VSTEP_PDF_WRITING_BANK`, 3 chiến thuật nghe `VSTEP_PDF_LISTENING_BANK`, và 3 ghi chú lộ trình `VSTEP_PDF_STUDY_NOTES`.

---

## 3. Phân khu II — 12 Bảng Người dùng & Đồng bộ Đám mây (`src/services/dataRepository.ts`) `[VERIFIED]`

| Bảng | Khóa chính (PK) | Khóa ngoại (FK) | Ánh xạ `localStorage` ở Local Mode | Chính sách RLS |
| :--- | :--- | :--- | :--- | :--- |
| `public.profiles` | `(id)` | `id -> auth.users(id)` | `master_english_user_profile_v2` | `(select auth.uid()) = id` |
| `public.vocab_progress` | `(user_id, word_id)` | `user_id -> auth.users(id)` | `master_english_srs_vocab_v2` | `(select auth.uid()) = user_id` |
| `public.saved_words` | `(user_id, word_id)` | `user_id -> auth.users(id)` | `leximaster_saved_words` | `(select auth.uid()) = user_id` |
| `public.study_sessions` | `(user_id, id)` | `user_id -> auth.users(id)` | `master_english_study_sessions_v2` | `(select auth.uid()) = user_id` |
| `public.mistake_bank` | `(user_id, item_id)` | `user_id -> auth.users(id)` | `leximaster_mistakes_v1` | `(select auth.uid()) = user_id` |
| `public.user_stats` | `(user_id)` | `user_id -> auth.users(id)` | `leximaster_stats_v1` | `(select auth.uid()) = user_id` |
| `public.challenge_60_progress` | `(user_id)` | `user_id -> auth.users(id)` | `ielts_60_day_challenge_state_v1` | `(select auth.uid()) = user_id` |
| `public.user_challenge_progress` | `(user_id)` | `user_id -> auth.users(id)` | Bản sao đồng bộ song song | `(select auth.uid()) = user_id` |
| `public.user_writing_logs` | `(user_id, id)` | `user_id -> auth.users(id)` | Lịch sử nộp bài Writing/Speaking | `(select auth.uid()) = user_id` |
| `public.workspace_todos` | `(user_id, todo_id)` | `user_id -> auth.users(id)` | `master_english_workspace_todos_v1` | `(select auth.uid()) = user_id` |
| `public.custom_content_store` | `(user_id)` | `user_id -> auth.users(id)` | `master_english_custom_content_v1` | `(select auth.uid()) = user_id` |
| `public.user_custom_vocab` / `user_custom_structures` | `(user_id, id)` | `user_id -> auth.users(id)` | Từ vựng & cấu trúc tự nạp dạng dòng | `(select auth.uid()) = user_id` |
