# 📚 KIỂM KÊ NỘI DUNG HỌC THUẬT & DỮ LIỆU (`02_CONTENT_INVENTORY.md`)

## Tóm tắt điều hành (Executive Summary)
Báo cáo này thống kê chính xác 100% kho nội dung học thuật của **LexiMaster IELTS (MASTER English)** được trích xuất trực tiếp bằng script kiểm định tự động và đối chiếu chéo bởi Agent C (`verify_export_counts.py`) `[VERIFIED]`. Toàn bộ hệ thống sở hữu **5,087 bản ghi chuẩn hóa** trên 9 bảng nội dung: **3,666 mục từ vựng học thuật** (`3,650` từ trong `vocabDatabase.json` + `16` từ độc nhất từ `VSTEP_PDF_VOCAB_BANK`), **89 cấu trúc ngữ pháp & công thức hành văn** (`77` cấu trúc chuyên sâu kèm `232` ví dụ mở rộng + `12` cấu trúc VSTEP), **66 ngày lộ trình học toàn diện** (`990` mục từ vựng theo ngày, `66` bài đọc hiểu học thuật, `66` đề luận Writing Task 2 kèm bài mẫu, `66` bộ câu hỏi Speaking), **45 chủ đề & bộ đề Speaking IELTS/VSTEP** (`28` bộ đề đầy đủ 3 phần + `17` bài mẫu Part 1/2/3), **153 câu hỏi trắc nghiệm & phân biệt từ**, và **35 hồ sơ học liệu PDF VSTEP** `[VERIFIED]`. Không có bất kỳ tệp dữ liệu gốc nào bị sửa đổi (17/17 tệp trong `src/data/` khớp 100% mã băm SHA-256 gốc) `[VERIFIED]`.

---

## 1. Bảng Tổng hợp Các Nguồn Dữ liệu Học thuật (`src/data/`) `[VERIFIED]`

| STT | Tệp nguồn (`src/data/...`) | Hằng số / Định dạng | Số bản ghi gốc `[VERIFIED]` | Số bản ghi sau chuẩn hóa (`08_SUPABASE_IMPORT`) | Mã băm SHA-256 Gốc `[VERIFIED]` |
| :--- | :--- | :--- | ---: | ---: | :--- |
| **1** | `src/data/vocabDatabase.json` | JSON Array (`VocabItem[]`) | **3,650** | **3,650** (trong `03_vocabulary.csv`) | `d6b6a67291a4baa1...518c7fe70` |
| **2** | `src/data/existingVocab.json` | JSON Array (`VocabItem[]`) | **104** | Tập con 100% của `vocabDatabase.json` (104/104 khớp ID & từ) | `63eb5ab753c69078...7699ef27` |
| **3** | `src/data/vocabularyData.ts` | `VOCAB_DATABASE` | **3,666** | **3,666** (`3,650` + `20` VSTEP − `4` trùng) | `de2abd09dfc9a238...b76e14` |
| **4** | `src/data/vocabularyData.ts` | `COLLOCATION_QUESTIONS` | **20** | **20** (trong `08_quiz_questions.csv`) | `de2abd09dfc9a238...b76e14` |
| **5** | `src/data/vocabularyData.ts` | `CONTEXT_QUESTIONS` | **15** | **15** (trong `08_quiz_questions.csv`) | `de2abd09dfc9a238...b76e14` |
| **6** | `src/data/vocabularyData.ts` | `TRICKY_DISTINCTIONS` | **12** | **12** (trong `08_quiz_questions.csv`) | `de2abd09dfc9a238...b76e14` |
| **7** | `src/data/vocabularyData.ts` | `GRAMMAR_TIPS` | **17** | **17** (trong `08_quiz_questions.csv`) | `de2abd09dfc9a238...b76e14` |
| **8** | `src/data/expandedPdfLibraryData.ts` | `EXPANDED_PDF_KNOWLEDGE_LIBRARY` | **77** cấu trúc | **77** (trong `04_grammar_structures.csv`) + **77** bài tập (trong `08_quiz_questions.csv`) | `e35a70c97dbc0cbf...006039772` |
| **9** | `src/data/vstepPdfKnowledgeBankData.ts` | `VSTEP_PDF_STRUCTURE_BANK` | **12** cấu trúc | **12** (trong `04_grammar_structures.csv`) | `d13deeede284a0a7...6bf9974f9` |
| **10** | `src/data/vstepPdfKnowledgeBankData.ts` | `VSTEP_PDF_GRAMMAR_BANK` | **12** chủ điểm | **12** (trong `08_quiz_questions.csv`) | `d13deeede284a0a7...6bf9974f9` |
| **11** | `src/data/vstepPdfKnowledgeBankData.ts` | `VSTEP_PDF_VOCAB_BANK` | **20** mục từ | **16** mục từ mới + **4** mục gộp (trong `03_vocabulary.csv`) | `d13deeede284a0a7...6bf9974f9` |
| **12** | `src/data/vstepPdfKnowledgeBankData.ts` | `VSTEP_PDF_SPEAKING_PART1/2/3_BANK` | **17** (`4 + 8 + 5`) | **17** (trong `07_ielts_speaking_topics.csv`) | `d13deeede284a0a7...6bf9974f9` |
| **13** | `src/data/vstepPdfKnowledgeBankData.ts` | `VSTEP_PDF_AS_KNOWLEDGE_RECORDS` + Writing (5) + Listening (3) + Notes (3) | **35** (`24 + 5 + 3 + 3`) | **35** (trong `09_pdf_library.csv`) | `d13deeede284a0a7...6bf9974f9` |
| **14** | `src/data/challenge60Data.ts` (`days01To15.ts`, `days16To60.ts`, Days 61–66) | `CHALLENGE_60_DAYS` | **66** ngày (**990** từ) | **66** ngày (`05_curriculum_days.csv`) + **990** từ (`06_curriculum_day_vocab.csv`) | `5b0a4ba8f7d63ccd...561bb3de` |
| **15** | `src/data/curriculum/vstep28SpeakingBank*.ts` | `ALL_VSTEP_28_SEEDS` | **28** bộ đề đầy đủ | **28** (trong `07_ielts_speaking_topics.csv`) | `91875ece3d94f111...7131710de` |

---

## 2. Phân tích Chi tiết Kho Từ Vựng (`vocabDatabase.json` — 3,650 từ & `VOCAB_DATABASE` — 3,666 từ) `[VERIFIED]`

### 2.1. Phân bổ theo Từ loại (`pos`) trong `vocabDatabase.json` (3,650 bản ghi) `[VERIFIED]`
- `noun` (Danh từ): **1,479** bản ghi (40.52%)
- `verb` (Động từ): **1,458** bản ghi (39.95%)
- `adj` (Tính từ): **609** bản ghi (16.68%)
- `adv` (Trạng từ): **88** bản ghi (2.41%)
- `phrase` (Cụm từ): **13** bản ghi (0.36%)
- `grammar` (Cấu trúc): **2** bản ghi (0.05%)
- `idiom` (Thành ngữ): **1** bản ghi (0.03%)

### 2.2. Phân bổ theo Cấp độ CEFR (`level`) trong `vocabDatabase.json` (3,650 bản ghi) `[VERIFIED]`
- **B2** (Upper-Intermediate / Band 6.0–6.5): **1,653** bản ghi (45.29%)
- **C1** (Advanced / Band 7.0–8.0): **1,006** bản ghi (27.56%)
- **B1** (Intermediate / Band 5.0–5.5): **846** bản ghi (23.18%)
- **C2** (Mastery / Band 8.5–9.0): **145** bản ghi (3.97%)

### 2.3. Kiểm định Chất lượng Nội dung Từ vựng `[VERIFIED]`
- **Thiếu ID / Trùng ID**: **0** bản ghi `[VERIFIED]`.
- **Trùng từ chuẩn hóa (`word.trim().toLowerCase()`) trong `vocabDatabase.json`**: **0** bản ghi `[VERIFIED]`.
- **Thiếu phiên âm IPA hoặc sai định dạng `/.../`**: **0** bản ghi `[VERIFIED]`.
- **Thiếu nghĩa tiếng Việt (`meaning`) hoặc thiếu câu ví dụ (`exampleEn`, `exampleVi`)**: **0** bản ghi `[VERIFIED]`.
- **Lỗi bảng mã Unicode / ký tự lạ (`\uFFFD`) / chưa chuẩn NFC**: **0** bản ghi `[VERIFIED]`.
- **Cảnh báo ngữ nghĩa cần rà soát thủ công (`needs_review`)**:
  1. **1 bản ghi** (`id = "protein"`, `word = "protein"`, `meaning = "Protein"`): Nghĩa tiếng Việt viết giống hệt từ gốc tiếng Anh (do là thuật ngữ sinh hóa quốc tế). Đã đánh dấu `needs_review = true` trong `03_vocabulary.csv` và tách vào `_audit/08_SUPABASE_IMPORT/needs_review/vocabulary_needs_review.csv` `[VERIFIED]`.
  2. **4 bản ghi trùng giữa `VSTEP_PDF_VOCAB_BANK` (20 từ) và `vocabDatabase.json` (3,650 từ)**: `take part in`, `broaden one's horizons`, `cutting-edge`, `Strike a balance`. Hàm hợp nhất trong `src/data/vocabularyData.ts:50-85` đã tự động loại bỏ 4 bản trùng này để tạo ra **3,666** mục từ duy nhất `[VERIFIED]`.

---

## 3. Phân tích Kho Quy Chuẩn Hành Văn & Cẩm Nang VSTEP (`expandedPdfLibraryData.ts` & `vstepPdfKnowledgeBankData.ts`) `[VERIFIED]`

1. **`EXPANDED_PDF_KNOWLEDGE_LIBRARY` (`src/data/expandedPdfLibraryData.ts`)**:
   - Tổng số cấu trúc: **77** cấu trúc ngữ pháp & mẫu câu học thuật (`pdfItemNumber` từ `#1` đến `#77`) `[VERIFIED]`.
   - Phân bổ theo 6 chuyên mục (`category`):
     - `grammar-formulas` (Công thức Ngữ pháp & Mẫu câu)
     - `academic-structures` (Cấu trúc Câu Học thuật)
     - `ielts-vstep` (Mẫu câu IELTS Writing & VSTEP)
     - `everyday-communication` (Giao tiếp & Phản xạ Speaking)
     - `advanced-variations` (Biến thể Nâng cao: Đảo ngữ & Câu chẻ)
     - `mistakes-transformations` (So sánh, Đối chiếu & Chuyển đổi câu)
   - Tổng số ví dụ đa lĩnh vực (`expandedExamples`): **232** câu ví dụ song ngữ Anh–Việt `[VERIFIED]`.
   - Tổng số bài biến đổi câu (`sentenceTransformations`): **77** cặp câu gốc – câu nâng cấp `[VERIFIED]`.
   - Tổng số phân tích lỗi sai (`commonMistakes`): **77** cặp câu sai – câu đúng `[VERIFIED]`.
   - Tổng số câu hỏi trắc nghiệm thực hành (`practiceExercises`): **77** câu (100% có `correctAnswer` nằm trong `options`) `[VERIFIED]`.

2. **`VSTEP_PDF_KNOWLEDGE_BANK` (`src/data/vstepPdfKnowledgeBankData.ts`)**:
   - `VSTEP_PDF_STRUCTURE_BANK`: **12** cấu trúc ăn điểm VSTEP B1–C1 `[VERIFIED]`.
   - `VSTEP_PDF_GRAMMAR_BANK`: **12** chủ điểm ngữ pháp cốt lõi `[VERIFIED]`.
   - `VSTEP_PDF_VOCAB_BANK`: **20** từ/cụm từ học thuật `[VERIFIED]`.
   - `VSTEP_PDF_SPEAKING_PART1_BANK`: **4** bộ chủ đề Giao tiếp xã hội `[VERIFIED]`.
   - `VSTEP_PDF_SPEAKING_PART2_BANK`: **8** tình huống Thảo luận giải pháp (`Solution Discussion`) `[VERIFIED]`.
   - `VSTEP_PDF_SPEAKING_PART3_BANK`: **5** sơ đồ tư duy Phát triển chủ đề (`Topic Development`) `[VERIFIED]`.
   - `VSTEP_PDF_WRITING_BANK`: **5** mẫu thư/luận Task 1 & Task 2 `[VERIFIED]`.
   - `VSTEP_PDF_LISTENING_BANK`: **3** chiến thuật nghe hiểu Part 1–3 `[VERIFIED]`.
   - `VSTEP_PDF_STUDY_NOTES`: **3** lộ trình ôn luyện theo mục tiêu B1, B2, C1 `[VERIFIED]`.

---

## 4. Phân tích Lộ Trình 60 Ngày (`CHALLENGE_60_DAYS` — Thực tế 66 Ngày) & 28 Bộ Đề Speaking `[VERIFIED]`

- **Tổng số ngày học**: **66 ngày** chia làm 3 phân đoạn:
  - Ngày 1 → 15 (`src/data/curriculum/days01To15.ts`): **15 ngày** nền tảng học thuật `[VERIFIED]`.
  - Ngày 16 → 60 (`src/data/curriculum/days16To60.ts`): **45 ngày** tăng tốc & chuyên sâu (kết hợp `topicContentBuilder.ts` và `vstep28SpeakingBank.ts` cho Ngày 33–60) `[VERIFIED]`.
  - Ngày 61 → 66 (`src/data/challenge60Data.ts` — `RAW_PDF_EXTENSION_DAYS`): **6 ngày** mở rộng đặc biệt từ tài liệu PDF gốc `[VERIFIED]`.
- **Mật độ nội dung trên mỗi ngày học**:
  - Đúng **15 từ vựng/ngày** × 66 ngày = **990 mục từ vựng theo ngày** (`06_curriculum_day_vocab.csv`), trong đó **757/990 mục từ** liên kết khóa ngoại trực tiếp (`vocab_id`) tới bảng `03_vocabulary.csv` và **233 mục từ** là các cụm từ/biến thể chuyên biệt theo bài đọc của ngày đó `[VERIFIED]`.
  - **66 bài đọc hiểu học thuật** (`reading`: tiêu đề, đoạn văn, câu hỏi đọc hiểu) `[VERIFIED]`.
  - **66 đề thi Writing Task 2** (`writing`: đề bài, dàn ý 4 đoạn, bài mẫu Band 7.5–8.0+, danh sách từ vựng mục tiêu) `[VERIFIED]`.
  - **66 bộ đề Speaking Part 1, Part 2 Cue Card & Part 3** `[VERIFIED]`.
- **Kiểm định Trắc nghiệm (`COLLOCATION_QUESTIONS`, `CONTEXT_QUESTIONS`, `TRICKY_DISTINCTIONS`, `GRAMMAR_TIPS`)**:
  - 100% câu hỏi (`64/64` câu trong `vocabularyData.ts` và `77/77` câu trong `expandedPdfLibraryData.ts`) có đáp án đúng khớp chính xác với danh sách lựa chọn `options`, không có câu hỏi mồ côi hoặc thiếu lời giải thích tiếng Việt `[VERIFIED]`.
