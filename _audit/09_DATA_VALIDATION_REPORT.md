# ✅ BÁO CÁO ĐỐI CHIẾU & XÁC THỰC DỮ LIỆU ĐỘC LẬP (`09_DATA_VALIDATION_REPORT.md`)

## Tóm tắt điều hành (Executive Summary)
Báo cáo này ghi lại kết quả đối chiếu chéo độc lập giữa **Agent A** (script xuất dữ liệu tất định `_audit/08_SUPABASE_IMPORT/scripts/export_supabase_data.mjs` chạy bằng Bun) và **Agent C** (script kiểm toán độc lập `_audit/08_SUPABASE_IMPORT/scripts/verify_export_counts.py` viết bằng Python 3) `[VERIFIED]`. Kết quả đạt **100% PASS** trên toàn bộ 5 tiêu chí bắt buộc: (1) **Tính tất định (Determinism)**: chạy xuất 2 lần liên tiếp cho ra `checksums.sha256` giống hệt nhau 100% (`diff -u` = 0 dòng khác biệt); (2) **Bảo toàn dữ liệu gốc**: 17/17 tệp trong `src/data/` giữ nguyên mã băm SHA-256 so với `_audit/backup_0_original/CHECKSUMS.txt`; (3) **Đếm bản ghi 1:1**: khớp tuyệt đối **5,087 bản ghi** giữa CSV, JSON và `manifest.json`; (4) **Toàn vẹn khóa chính & khóa ngoại**: 100% UUID đúng chuẩn RFC 4122 v5, 0 trùng lặp, 0 khóa ngoại mồ côi; và (5) **Chuẩn hóa văn bản**: 0 vi phạm Unicode NFC `[VERIFIED]`.

---

## 1. Bảng Đối chiếu Số lượng Bản ghi Giữa Nguồn Gốc và Gói Xuất (`08_SUPABASE_IMPORT`) `[VERIFIED]`

| STT | Bảng đích | Nguồn dữ liệu gốc (`src/data/...`) | Số bản ghi gốc `[VERIFIED]` | Số dòng CSV xuất `[VERIFIED]` | Số phần tử JSON xuất `[VERIFIED]` | Số UUIDv5 duy nhất `[VERIFIED]` | Trạng thái |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | :--- |
| **1** | `import_batches` | Sinh tự động cho lô xuất Baseline | **1** | **1** | **1** | **1** | **PASS `[VERIFIED]`** |
| **2** | `vocabulary_categories` | Trích xuất từ `tags[0]` của `VOCAB_DATABASE` | **42** | **42** | **42** | **42** | **PASS `[VERIFIED]`** |
| **3** | `vocabulary` | `vocabDatabase.json` (**3,650**) + `VSTEP_PDF_VOCAB_BANK` (**20**) − **4** trùng | **3,666** | **3,666** | **3,666** | **3,666** | **PASS `[VERIFIED]`** |
| **4** | `grammar_structures` | `EXPANDED_PDF_KNOWLEDGE_LIBRARY` (**77**) + `VSTEP_PDF_STRUCTURE_BANK` (**12**) | **89** | **89** | **89** | **89** | **PASS `[VERIFIED]`** |
| **5** | `curriculum_days` | `CHALLENGE_60_DAYS` (Ngày 1–15: **15**, Ngày 16–60: **45**, Ngày 61–66: **6**) | **66** | **66** | **66** | **66** | **PASS `[VERIFIED]`** |
| **6** | `curriculum_day_vocab` | `CHALLENGE_60_DAYS[].vocab` (15 từ × 66 ngày) | **990** | **990** | **990** | **990** | **PASS `[VERIFIED]`** |
| **7** | `ielts_speaking_topics` | `ALL_VSTEP_28_SEEDS` (**28**) + `VSTEP_PDF_SPEAKING_PART1/2/3` (**4 + 8 + 5**) | **45** | **45** | **45** | **45** | **PASS `[VERIFIED]`** |
| **8** | `quiz_questions` | `COLLOCATION` (**20**) + `CONTEXT` (**15**) + `DISTINCTIONS` (**12**) + `GRAMMAR_TIPS` (**17**) + `EXPANDED_PDF_QUIZ` (**77**) + `VSTEP_GRAMMAR` (**12**) | **153** | **153** | **153** | **153** | **PASS `[VERIFIED]`** |
| **9** | `pdf_library` | `VSTEP_PDF_AS_KNOWLEDGE_RECORDS` (**24**) + `WRITING` (**5**) + `LISTENING` (**3**) + `STUDY_NOTES` (**3**) | **35** | **35** | **35** | **35** | **PASS `[VERIFIED]`** |
| **Tổng** | **9 bảng** | **Toàn bộ kho nội dung học thuật** | **5,087** | **5,087** | **5,087** | **5,087** | **100% PASS `[VERIFIED]`** |

---

## 2. Kiểm định Toàn vẹn Khóa Ngoại (Referential Integrity) `[VERIFIED]`

Được kiểm chứng độc lập bởi `python3 _audit/08_SUPABASE_IMPORT/scripts/verify_export_counts.py`:
- `vocabulary.category_id -> vocabulary_categories.id`: **0 bản ghi mồ côi** (`3,666/3,666` khớp hợp lệ) `[VERIFIED]`.
- `curriculum_day_vocab.day_id -> curriculum_days.id`: **0 bản ghi mồ côi** (`990/990` khớp hợp lệ) `[VERIFIED]`.
- `curriculum_day_vocab.vocab_id -> vocabulary.id`: **0 bản ghi mồ côi** (`757` dòng khớp trực tiếp UUID từ vựng trong kho chính; `233` dòng là cụm từ chuyên biệt của bài đọc nên `vocab_id = NULL` hợp lệ) `[VERIFIED]`.
- `import_batch_id -> import_batches.id` trên toàn bộ 8 bảng con: **0 bản ghi mồ côi** (`5,086/5,086` khớp `5b37893a-535b-515b-9f1b-8c7b779b527b`) `[VERIFIED]`.

---

## 3. Kiểm định Bảo toàn 17 Tệp Dữ liệu Gốc (`src/data/`) `[VERIFIED]`

Đối chiếu trực tiếp với `_audit/backup_0_original/CHECKSUMS.txt`:
- `src/data/vocabDatabase.json`: `d6b6a67291a4baa16588ffe0a83d37168af0fd2c9bbcc116adc585a518c7fe70` — **KHỚP 100% `[VERIFIED]`**
- `src/data/existingVocab.json`: `63eb5ab753c6907893d86c2a17fbdda78515a92e07abcb9dd74a09097699ef27` — **KHỚP 100% `[VERIFIED]`**
- `src/data/vocabularyData.ts`: `de2abd09dfc9a23819e49e5116e0e74dbef89e6d1f6c6e63ebf01ab784b76e14` — **KHỚP 100% `[VERIFIED]`**
- `src/data/expandedPdfLibraryData.ts`: `e35a70c97dbc0cbfe8cf8dadfdc6129233528c3b67d4d514877b5a8006039772` — **KHỚP 100% `[VERIFIED]`**
- `src/data/vstepPdfKnowledgeBankData.ts`: `d13deeede284a0a7a2414248459a173a80daad540bc179b69391efd6bf9974f9` — **KHỚP 100% `[VERIFIED]`**
- `src/data/challenge60Data.ts`: `5b0a4ba8f7d63ccd6b3ab62f347d13d4d3c55eb144528ae8336103d5b61bb3de` — **KHỚP 100% `[VERIFIED]`**
- Toàn bộ 11 tệp còn lại trong `src/data/curriculum/*` và `src/data/rubyTypingAudioB64.ts`: **KHỚP 100% `[VERIFIED]`**.

---

## 4. Trạng thái Thực thi SQL Trực tiếp trên PostgreSQL `[NOT VERIFIED]`

- **Trạng thái**: `[NOT VERIFIED — Môi trường container hiện tại không cài đặt psql / supabase CLI / docker và chưa kết nối tới instance PostgreSQL từ xa]`.
- **Cách người dùng tự xác nhận trong 1 bước**: Mở Supabase SQL Editor, chạy `/_audit/06_SUPABASE_SCHEMA.sql`, nạp CSV và chạy `/_audit/09_VALIDATION_QUERIES.sql`.
