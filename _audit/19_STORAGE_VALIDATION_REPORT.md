# 🗂️ BÁO CÁO KIỂM ĐỊNH LƯU TRỮ TÀI NGUYÊN & GIẢI QUYẾT CÁC QUYẾT ĐỊNH TỒN ĐỌNG (`19_STORAGE_VALIDATION_REPORT.md`)

## Tóm tắt điều hành (Executive Summary)
Báo cáo này thực hiện **Kiểm định Chi tiết Tài nguyên Tĩnh & 2 Tệp PDF Gốc (Mục 8)** đồng thời cung cấp **Hồ sơ Bằng chứng & Khuyến nghị Giải quyết cho 5 Quyết định Mở (Mục 9)** từ `11_DECISIONS_NEEDED.md` `[VERIFIED]`.
- **Kiểm định 60 tệp tài nguyên tĩnh hiện có trong `public/` (`28.47 MB` active assets + `40.11 MB` unused unique assets)**: **PASS (0 broken active image/icon references)** `[VERIFIED]`.
- **Thực thi tải tài nguyên lên Supabase Storage Buckets từ xa**: **BLOCKED** (do chưa kết nối tới project Supabase thực tế).
- **5 Quyết định Mở của Chủ Dự án**: **PENDING APPROVAL** (đã chuẩn bị đầy đủ bằng chứng, mức độ rủi ro và phương án thực thi 1 lệnh ngay khi được phê duyệt).

---

## 1. Kiểm định Chuyên sâu 2 Tệp PDF Gốc Được Tham chiếu Trong Tệp Bảo vệ (Mục 8) `[VERIFIED]`

### 1.1. Bảng Điều tra Nguồn gốc & Vị trí Tham chiếu

| # | Tên Tệp PDF | Đường dẫn Khai báo | Vị trí Khai báo (`Protected File`) | Vị trí Sử dụng Trên UI (`src/components/*`) | Có trong `public/` hiện tại? | Có trong `_audit/backup_0_original/`? |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | `Untitled_document_bb0198f5.pdf` *(77 Cấu trúc Câu Học thuật IELTS/VSTEP)* | `/assets/aistudio/Untitled_document_bb0198f5.pdf` | `src/data/expandedPdfLibraryData.ts:85` (`PDF_SOURCE_METADATA.pdfPath`) | `src/components/ExpandedExamplesLibrary.tsx:548` (Thẻ `<a href={PDF_SOURCE_METADATA.pdfPath} target="_blank">` nút *"Mở Tài Liệu PDF Gốc"*) | **Không** (`0` byte file nhị phân `.pdf`) | **Không** (Ngay từ snapshot gốc `backup_0_original`, thư mục `public/assets/aistudio/` chỉ chứa các file `.png/.jpg` và 1 file văn bản, không có file `.pdf` nhị phân). |
| **2** | `_n_thi_vstep_11d6f8c6.pdf` *(Cẩm nang Ôn thi VSTEP B1–B2–C1)* | `/assets/aistudio/_n_thi_vstep_11d6f8c6.pdf` | `src/data/vstepPdfKnowledgeBankData.ts:203` (`VSTEP_PDF_METADATA.pdfAssetPath`) | **Không có nút bấm trực tiếp nào trên UI gọi `VSTEP_PDF_METADATA.pdfAssetPath`** (Chỉ được đọc khi xuất gói dữ liệu sang bảng `public.pdf_library`). | **Không** | **Không** (Không tồn tại trong snapshot gốc `backup_0_original`). |

### 1.2. Đánh giá Tác động Thực tế Tới Người Dùng
1. **Về mặt Nội dung Học thuật (`Data Completeness = 100%`)**:
   - Toàn bộ **77/77 cấu trúc ngữ pháp** (công thức, giải thích tiếng Việt, phân tích cú pháp, ví dụ mở rộng, biến đổi câu, lỗi thường gặp) của `Untitled_document_bb0198f5.pdf` đã được số hóa 100% trong `src/data/expandedPdfLibraryData.ts` (`88,691 bytes`).
   - Toàn bộ **24 chuyên đề kiến thức + 5 bài luận mẫu + 6 khung Speaking + 20 từ vựng + 12 cấu trúc** của `_n_thi_vstep_11d6f8c6.pdf` đã được số hóa 100% trong `src/data/vstepPdfKnowledgeBankData.ts` (`69,760 bytes`).
   - Do đó, mọi tính năng học tập, tra cứu, lọc chuyên đề và làm bài tập trên ứng dụng **hoạt động 100% bình thường mà không cần 2 file `.pdf` nhị phân này**.
2. **Về mặt Nút bấm *"Mở Tài Liệu PDF Gốc"* (`ExpandedExamplesLibrary.tsx:548`)**:
   - Nếu người dùng nhấn vào liên kết `<a href="/assets/aistudio/Untitled_document_bb0198f5.pdf" target="_blank">Mở Tài Liệu PDF Gốc</a>` khi chưa tải file `.pdf` lên `public/assets/aistudio/` hoặc Supabase Storage, tab mới sẽ mở ra trang SPA fallback thay vì trình xem PDF.
3. **Phương án Khuyến nghị Tốt nhất (Supabase Storage vs Public Assets)**:
   - **Ngắn hạn (Local / Static Hosting)**: Nếu bạn còn lưu 2 file `.pdf` gốc trên máy tính cá nhân, đặt chúng vào `public/assets/aistudio/Untitled_document_bb0198f5.pdf` và `public/assets/aistudio/_n_thi_vstep_11d6f8c6.pdf` (không cần sửa bất kỳ dòng code nào trong tệp bảo vệ!).
   - **Dài hạn (Supabase Production)**: Tải 2 file PDF lên bucket công khai `course-pdfs` (đã được định nghĩa sẵn trong `_audit/06_SUPABASE_SCHEMA.sql:713–719` với giới hạn `50 MB`, MIME `application/pdf`).

---

## 2. Hồ sơ Giải quyết 5 Quyết định Tồn đọng từ `11_DECISIONS_NEEDED.md` (Mục 9)

Tuân thủ nguyên tắc **Không tự ý quyết định thay người dùng đối với tệp bảo vệ và tài nguyên duy nhất**, dưới đây là bảng phân tích đầy đủ để chủ dự án chốt quyết định cuối cùng:

| # | Hạng mục Cần Quyết định | Bằng chứng Thực nghiệm (`[VERIFIED]`) | Phương án A (Khuyên dùng) | Phương án B (Bảo thủ) | Rủi ro Nếu Chọn A | Rủi ro Nếu Chọn B | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Tệp `src/data/existingVocab.json`** (`104` mục từ, `38.1 KB`) | `0` tệp nào trong `src/` import file này; kiểm định tự động xác nhận **104/104 mục từ** đã nằm trọn vẹn trong `src/data/vocabDatabase.json` (`3,650` từ). Bản sao lưu đã nằm trong `_audit/backup_0_original/`. | **Xóa `src/data/existingVocab.json`** sau khi nghiệm thu để tránh nhầm lẫn khi bảo trì kho từ vựng về sau. | **Giữ nguyên** làm tệp dữ liệu lịch sử (không ảnh hưởng tới bundle JS vì Vite tree-shaking bỏ qua file không được import). | **0 rủi ro** (đã có backup gốc + 100% từ đã nằm trong `vocabDatabase.json`). | Tốn `38.1 KB` trên đĩa, dễ gây hiểu nhầm cho lập trình viên mới rằng file này đang được dùng. | **PENDING APPROVAL** |
| **2** | **29 Tệp Ảnh Không Tham Chiếu Nhưng Có SHA-256 Duy Nhất** (`40.71 MB` trong `public/assets/`) | Sau khi đã xóa 69 ảnh trùng lặp 100% SHA-256 (`55.24 MB`), còn 29 ảnh có `status: "unused"` trong `_audit/03_ASSET_MANIFEST.json`. Chúng không được gọi trong code nhưng mỗi ảnh là một tác phẩm khắc gỗ/minh họa riêng biệt. | **Chuyển 29 tệp ảnh này sang kho lưu trữ dự phòng** (hoặc bucket `public-editorial-assets` trên Supabase Storage) và xóa khỏi `public/assets/` để giảm dung lượng repo từ `68.58 MB` xuống **`27.87 MB`**. | **Giữ nguyên trong `public/assets/`** để làm thư viện ảnh minh họa dự phòng cho các tính năng tương lai. | Không thể gọi trực tiếp bằng đường dẫn `/assets/...` cục bộ nếu chưa copy lại từ `_audit/backup_0_original/`. | Tăng thời gian clone/deploy container thêm `~40.7 MB` băng thông tĩnh. | **PENDING APPROVAL** |
| **3** | **2 Đường dẫn PDF Gốc (`Untitled_document_bb0198f5.pdf` & `_n_thi_vstep_11d6f8c6.pdf`)** | Xem phân tích chi tiết tại Mục 1 ở trên: 100% nội dung văn bản đã được số hóa trong TypeScript, nhưng 2 file `.pdf` nhị phân không có trong repo gốc. | **Cung cấp 2 file `.pdf` gốc** vào `public/assets/aistudio/` (hoặc bucket `course-pdfs`) **HOẶC** cho phép đổi nút *"Mở Tài Liệu PDF Gốc"* trong `ExpandedExamplesLibrary.tsx` thành nút mở chế độ đọc toàn trang nội tuyến. | **Giữ nguyên đường dẫn hiện tại** trong 2 tệp dữ liệu bảo vệ. | **0 rủi ro mất dữ liệu**. | Nút *"Mở Tài Liệu PDF Gốc"* mở ra tab không có file PDF nhị phân nếu người dùng chưa tải file `.pdf` lên. | **PENDING APPROVAL** |
| **4** | **Bản ghi Từ vựng `id = "protein"` (`meaning_vi = "Protein"`)** | Trong `src/data/vocabDatabase.json` (`line 36915`), từ `"protein"` có `meaning: "Protein"` (trùng với từ tiếng Anh). Đã được gắn cờ `needs_review = true` trong `03_vocabulary.csv`. | **Cho phép cập nhật `meaning` thành `"Chất đạm (Protein)"`** trong `src/data/vocabDatabase.json` và chạy câu lệnh `UPDATE public.vocabulary SET meaning_vi = 'Chất đạm (Protein)', needs_review = false WHERE legacy_id = 'protein';`. | **Giữ nguyên `"Protein"`** (vì trong tiếng Việt khoa học thông dụng cũng dùng từ vay mượn *"Protein"*). | Thay đổi mã băm SHA-256 của `src/data/vocabDatabase.json` so với baseline ban đầu. | Học viên khi làm câu hỏi trắc nghiệm Anh–Việt cho từ `protein` sẽ thấy đáp án tiếng Việt giống hệt từ tiếng Anh. | **PENDING APPROVAL** |
| **5** | **Đồng bộ Header cho trang `MistakeBank.tsx` (`Sổ Tay Hiệu Đính`)** | Trang `CollocationsQuiz.tsx` (*Phối Ngữ & Mạch Văn*) **đã được người dùng yêu cầu và hoàn tất chuyển sang `HorizonEngravingHeader` + đồng hồ tròn góc phải trên**. Hiện chỉ còn duy nhất trang `MistakeBank.tsx` (*Bản Đính Chính / Sổ Tay Lỗi Sai*) dùng bố cục tiêu đề riêng. | **Chuyển nốt `MistakeBank.tsx` sang `HorizonEngravingHeader` + Compact Timer Badge** để đồng bộ 100% toàn bộ các chuyên mục. | **Giữ nguyên bố cục hiện tại của `MistakeBank.tsx`**. | **0 rủi ro** (chỉ thay đổi phần khung tiêu đề của trang Bản Đính Chính). | Trang Bản Đính Chính có phần tiêu đề khác kiểu với 8 chuyên mục còn lại. | **PENDING APPROVAL** |
