# ⚖️ CÁC HẠNG MỤC CẦN NGƯỜI DÙNG QUYẾT ĐỊNH (`11_DECISIONS_NEEDED.md`)

## Tóm tắt điều hành (Executive Summary)
Tuân thủ nghiêm ngặt nguyên tắc **Bảo toàn tuyệt đối & Không tự ý suy diễn (Mục 3.1, 3.2, 9 & 10.1)**, bất kỳ hạng mục nào liên quan đến: (1) xóa tệp dữ liệu `.json`/`.ts` trong `src/data/`, (2) xóa tệp tài nguyên ảnh có mã băm SHA-256 duy nhất (không trùng lặp), (3) chỉnh sửa nội dung trong các tệp dữ liệu thuộc danh sách bảo vệ, hoặc (4) thay đổi bố cục giao diện của các trang con chưa được yêu cầu trực tiếp đều **KHÔNG được tự động thực hiện**. Tài liệu này trình bày rõ ràng **6 quyết định** kèm phương án khuyến nghị để chủ dự án phê duyệt.

---

## Quyết định #1: Xử lý tệp `src/data/existingVocab.json` (104 mục từ, 38.1 KB)
- **Hiện trạng `[VERIFIED]`**:
  - `src/data/existingVocab.json` không được import bởi bất kỳ tệp nào trong `src/`.
  - Kiểm định tự động xác nhận **104/104 mục từ** trong `existingVocab.json` đã nằm trọn vẹn 100% trong `src/data/vocabDatabase.json` (3,650 mục từ).
- **Lý do giữ nguyên**: Mục 3.1 & Mục 9 quy định không tự động xóa tệp dữ liệu `.json` trong `src/data/`.
- **Phương án lựa chọn**:
  - **Phương án A (Khuyên dùng)**: Xóa `src/data/existingVocab.json` để tránh nhầm lẫn khi bảo trì về sau (bản sao lưu đã có trong `_audit/backup_0_original/snapshot_0_original.tar.gz`).
  - **Phương án B**: Giữ nguyên làm tệp mẫu lịch sử.

---

## Quyết định #2: Xử lý 29 Tệp Ảnh Không Tham Chiếu Nhưng Có Mã Băm Duy Nhất (`40.71 MB` trong `public/assets/`)
- **Hiện trạng `[VERIFIED]`**:
  - Sau khi đã xóa an toàn 69 tệp ảnh trùng lặp 100% SHA-256 (tiết kiệm `55.24 MB`), trong `public/assets/` còn **29 tệp ảnh** có `status: "unused"` trong `_audit/03_ASSET_MANIFEST.json` (0 tham chiếu trong code hiện tại, nhưng mỗi tệp là một bức ảnh riêng biệt không trùng SHA-256 với tệp nào khác, tổng dung lượng **40.71 MB**).
- **Lý do giữ nguyên**: Mục 9 quy định rõ *"Asset không tham chiếu nhưng không trùng → chỉ báo cáo, để người dùng quyết định"*.
- **Phương án lựa chọn**:
  - **Phương án A (Khuyên dùng nếu muốn tối ưu dung lượng repo xuống ~28 MB)**: Cho phép xóa 29 tệp ảnh không tham chiếu này (hoặc chuyển lên Supabase Storage lưu trữ dự phòng).
  - **Phương án B**: Giữ lại trong `public/assets/` để dùng làm kho ảnh minh họa dự phòng cho các tính năng tương lai.

---

## Quyết định #3: Hai Đường Dẫn File PDF Gốc Trong Tệp Dữ Liệu Bảo Vệ (`F-008`)
- **Hiện trạng `[VERIFIED]`**:
  - `src/data/expandedPdfLibraryData.ts:85` khai báo `pdfPath: '/assets/aistudio/Untitled_document_bb0198f5.pdf'`.
  - `src/data/vstepPdfKnowledgeBankData.ts:203` khai báo `pdfAssetPath: '/assets/aistudio/_n_thi_vstep_11d6f8c6.pdf'`.
  - Toàn bộ nội dung kiến thức của 2 tài liệu này (77 cấu trúc ngữ pháp + 24 chuyên đề VSTEP) đã được trích xuất 100% vào mã nguồn TypeScript, nhưng 2 tệp nhị phân `.pdf` gốc không nằm trong thư mục `public/assets/aistudio/`.
- **Lý do chưa sửa trực tiếp**: Cả 2 tệp `.ts` trên đều nằm trong **Danh sách Tệp Bảo vệ Nghiêm ngặt (Mục 3.1)**.
- **Phương án lựa chọn**:
  - **Phương án A (Khuyên dùng)**: Tải 2 tệp `.pdf` gốc vào `public/assets/aistudio/` (hoặc lên bucket `course-pdfs` của Supabase Storage) để nút *"Mở PDF gốc"* tải được tệp nhị phân.
  - **Phương án B**: Cho phép cập nhật 2 dòng đường dẫn trong `expandedPdfLibraryData.ts:85` và `vstepPdfKnowledgeBankData.ts:203` sang chế độ chỉ đọc bản số hóa nội tuyến.

---

## Quyết định #4: Bản Ghi Từ Vựng `id = "protein"` (`meaning_vi = "Protein"`)
- **Hiện trạng `[VERIFIED]`**:
  - Trong `src/data/vocabDatabase.json` (`id: "protein"`), nghĩa tiếng Việt được ghi là `"Protein"` (trùng với từ tiếng Anh). Bản ghi đã được gắn cờ `needs_review = true` trong `03_vocabulary.csv` và xuất ra `_audit/08_SUPABASE_IMPORT/needs_review/vocabulary_needs_review.csv`.
- **Phương án lựa chọn**:
  - **Phương án A (Khuyên dùng)**: Đổi `meaning_vi` thành `"Chất đạm (Protein)"` trong cả `src/data/vocabDatabase.json` và trên bảng `public.vocabulary` của Supabase.
  - **Phương án B**: Giữ nguyên `"Protein"`.

---

## Quyết định #5: Đồng Bộ Header Khắc Gỗ cho 2 Trang Con `CollocationsQuiz` & `MistakeBank` (`F-010`)
- **Hiện trạng `[VERIFIED]`**:
  - 7/9 trang chuyên mục học tập đã dùng chung khung `HorizonEngravingHeader` + đồng hồ tròn góc phải trên. Riêng 2 trang `Cụm Từ Cố Định` (`src/components/CollocationsQuiz.tsx`) và `Sổ Tay Hiệu Đính` (`src/components/MistakeBank.tsx`) vẫn dùng thanh `ActiveSessionBar` kiểu cũ.
- **Lý do giữ nguyên**: Mục 3.2 quy định giữ nguyên bố cục hiện tại của các trang chưa có yêu cầu thay đổi trực tiếp.
- **Phương án lựa chọn**:
  - **Phương án A (Khuyên dùng)**: Chuyển nốt `CollocationsQuiz.tsx` và `MistakeBank.tsx` sang `HorizonEngravingHeader` + đồng hồ tròn góc phải trên để đồng bộ 100% toàn hệ thống.
  - **Phương án B**: Giữ nguyên giao diện hiện tại của 2 trang này.

---

## Quyết định #6: Dọn Dẹp 2 Tệp Cấu Hình Firebase Cũ (`firebase-applet-config.json` & `firestore.rules`)
- **Hiện trạng `[VERIFIED]`**:
  - Thư mục gốc có `firebase-applet-config.json` và `firestore.rules`, nhưng ứng dụng **không cài đặt `firebase`** trong `package.json` và **0 tệp nào trong `src/` sử dụng Firebase** (toàn bộ Cloud Auth & Database dùng **Supabase**).
- **Phương án lựa chọn**:
  - **Phương án A**: Giữ nguyên nếu nền tảng AI Studio dùng 2 tệp này cho metadata môi trường.
  - **Phương án B**: Xóa 2 tệp cấu hình Firebase nếu bạn chỉ triển khai thuần túy với Supabase.
