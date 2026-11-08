# 🧹 BÁO CÁO DỌN DẸP MÃ NGUỒN & TÀI NGUYÊN AN TOÀN (`04_CODE_CLEANUP_REPORT.md`)

## Tóm tắt điều hành (Executive Summary)
Quá trình dọn dẹp trong Giai đoạn 4 tuân thủ nghiêm ngặt **Quy trình 6 Cổng Kiểm chứng (Mục 9)**: kiểm tra đồ thị import tĩnh (Cổng 1), import động & router (Cổng 2), tìm kiếm chuỗi tham chiếu toàn cục (Cổng 3), cấu hình build (Cổng 4), cách ly thử nghiệm vào `_audit/quarantine/` (Cổng 5), và kiểm tra `bun run lint && bun run build` thành công trước khi xóa vĩnh viễn (Cổng 6) `[VERIFIED]`. Kết quả đã loại bỏ an toàn **4 tệp mã nguồn dư thừa** (`759 dòng mã`) và **69 tệp ảnh trùng lặp 100% mã băm SHA-256** (`55,243,066 bytes` ≈ **52.68 MiB / 55.24 MB**), giúp giảm dung lượng thư mục `public/` từ **123.82 MB** xuống còn **68.58 MB** (**giảm 44.6%**) và giảm kích thước gói CSS/JS sau build mà không làm mất bất kỳ tính năng hay hình ảnh hiển thị nào `[VERIFIED]`. Toàn bộ **29 tệp ảnh không tham chiếu nhưng có mã băm duy nhất** và **1 tệp dữ liệu JSON không tham chiếu (`src/data/existingVocab.json`)** được giữ nguyên 100% theo đúng quy tắc bảo toàn Mục 9 và chuyển sang `11_DECISIONS_NEEDED.md` để người dùng quyết định `[VERIFIED]`.

---

## 1. Bảng Tổng kết Trước & Sau Dọn dẹp `[VERIFIED]`

| Chỉ số đo lường | Trước dọn dẹp (Baseline GĐ 0) | Sau dọn dẹp (GĐ 4) | Chênh lệch / Tiết kiệm | Trạng thái |
| :--- | ---: | ---: | ---: | :--- |
| **Tổng số tệp trong `src/`** | 76 tệp | 73 tệp | −3 tệp component dư thừa (kèm −1 tệp `untitled.tsx` ở gốc) | `[VERIFIED]` |
| **Tổng số tệp trong `public/`** | 129 tệp | 60 tệp | **−69 tệp trùng SHA-256** | `[VERIFIED]` |
| **Dung lượng thư mục `public/`** | 123,820,430 B (123.82 MB) | 68,577,364 B (68.58 MB) | **−55,243,066 B (−55.24 MB / −44.6%)** | `[VERIFIED]` |
| **Kích thước CSS Build (`dist/assets/*.css`)** | 104.68 kB (gzip 19.11 kB) | 93.81 kB (gzip 17.66 kB) | **−10.87 kB (−10.4%)** | `[VERIFIED]` |
| **Kích thước JS App Bundle (`dist/assets/index-*.js`)** | 5,063.45 kB | 5,054.03 kB | **−9.42 kB** | `[VERIFIED]` |
| **Kết quả `bun run lint` (`tsc --noEmit`)** | PASS (0 lỗi) | PASS (0 lỗi) | 0 lỗi phát sinh | `[VERIFIED]` |
| **Kết quả `bun run build` (`vite build`)** | PASS (4.43s) | PASS (3.77s) | Nhanh hơn 0.66s | `[VERIFIED]` |

---

## 2. Danh sách 4 Tệp Mã nguồn Đã Xóa qua 6 Cổng Kiểm chứng `[VERIFIED]`

*(Bản sao lưu đầy đủ trước khi xóa được lưu tại `_audit/backup_2_pre_cleanup/snapshot_2_pre_cleanup.tar.gz` và `_audit/backup_0_original/snapshot_0_original.tar.gz`)*

| STT | Đường dẫn tệp | Kích thước / Số dòng | Mã băm SHA-256 `[VERIFIED]` | Bằng chứng vượt qua 6 Cổng (Gates 1–6) |
| :--- | :--- | ---: | :--- | :--- |
| **1** | `untitled.tsx` | 0 B (0 dòng) | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` | Tệp rỗng sinh ra ngoài ý muốn ở thư mục gốc; `grep -rn "untitled"` = 0 tham chiếu; cách ly & build PASS. |
| **2** | `src/components/HeroBanner.tsx` | 6,356 B (131 dòng) | `75eabfed930da8ac2c5619b15b3c8b812a9d46ff0bb451b6bf4e81607425cedc` | Component banner thế hệ cũ đã được thay thế hoàn toàn bởi `HorizonEngravingHeader.tsx` và `WarmLightWorkspace.tsx`; 0 import tĩnh/động; cách ly & build PASS. |
| **3** | `src/components/IllustrationVisuals.tsx` | 14,768 B (267 dòng) | `cb6c9488aaa017ac2fa0892740536d8d1a62235288bc2623d731097a5f243261` | Bộ minh họa vector cũ đã được thay bằng `src/constants/engravings.tsx`; 0 tham chiếu ngoài tệp; cách ly & build PASS. |
| **4** | `src/components/GlobalFloatingTimer.tsx` | 15,826 B (361 dòng) | `c8f12b1d37c89a96f32e7f3362654b246e96046f6e8dc640609a2ddde5187ec6` | Đồng hồ nổi toàn cục gây lỗi lặp đồng hồ trên Trang Nhất (Request #8/#9 & Mục 3.2, phát hiện `F-005`). Sau khi gỡ khỏi `src/App.tsx`, tệp có 0 tham chiếu; cách ly & build PASS. |

---

## 3. Danh sách 69 Tệp Tài nguyên Ảnh Trùng lặp 100% SHA-256 Đã Dọn dẹp `[VERIFIED]`

Toàn bộ 69 tệp dưới đây nằm trong `public/assets/`, có **`used_in = []` (0 tham chiếu trong toàn bộ codebase)** và có nội dung nhị phân **trùng khớp 100% mã băm SHA-256** với tệp chuẩn (`canonical`) đang được giữ lại trong `public/assets/`. Danh sách chi tiết từng tệp kèm SHA-256 được lưu đầy đủ trong `_audit/03_ASSET_MANIFEST.json` (mục `cleaned_duplicates`) và `_audit/backup_2_pre_cleanup/DUPLICATE_ASSETS_REMOVED.json`:

- **Nhóm 1 — Bản sao trùng trong `public/assets/engravings/` (27 tệp, ~21.4 MB)**:
  - `public/assets/engravings/,_dãy_núi_himalia_434c71a3_2K.jpg` (`1,503,189 B`, SHA-256 `3547be11...`) → trùng 100% với `public/assets/engravings/,_dãy_núi_himalia_434c71a3_2K-1.jpg`
  - `public/assets/engravings/himalaya-monastery-pilgrimage.jpg` (`1,503,189 B`, SHA-256 `3547be11...`) → trùng 100% với `public/assets/engravings/,_dãy_núi_himalia_434c71a3_2K-1.jpg`
  - `public/assets/engravings/Architectural_sketch_of_Khue_Van…_c0c0559b_2K.jpg` (`1,371,032 B`, SHA-256 `7651153e...`) → trùng 100% với `public/assets/engravings/Architectural_sketch_of_Khue_Van…_c0c0559b_2K-1.jpg`
  - `public/assets/engravings/big-ben.jpg` (`1,224,703 B`) → trùng 100% với `public/assets/vintage-editorial/architecture/big-ben.jpg`
  - `public/assets/engravings/christ-redeemer.jpg` (`775,497 B`) → trùng 100% với `public/assets/engravings/Architectural_sketch_of_Christ_R…_86bb2b0e_2K.jpg`
  - `public/assets/engravings/empire-state.jpg` (`934,823 B`) → trùng 100% với `public/assets/engravings/Empire_State_Building_architectu…_18985320_2K.jpg`
  - `public/assets/engravings/fansipan-mountain-pagoda.jpg` (`1,315,434 B`) → trùng 100% với `public/assets/engravings/bốt điện thoại công cộng.jpg`
  - `public/assets/engravings/japanese-covered-bridge.jpg` (`1,174,662 B`) → trùng 100% với `public/assets/engravings/Japanese_Covered_Bridge_architec…_06e44f23_2K.jpg`
  - `public/assets/engravings/khue-van-cac.jpg` (`1,101,816 B`) → trùng 100% với `public/assets/vintage-editorial/architecture/khue-van-cac.jpg`
  - Cùng 18 tệp `media_1793720*.jpg`, `saigon-notre-dame.jpg`, `statue-of-liberty.jpg`, `sydney-opera-house.jpg`, `taj-mahal.jpg`, `tower-bridge-london.jpg` trùng 100% SHA-256 với các tệp đang active.
- **Nhóm 2 — Bản sao trùng trong `public/assets/aistudio/` & `public/assets/vintage-editorial/` (42 tệp, ~33.8 MB)**:
  - Các bản upload lặp lại trong `public/assets/aistudio/` và `public/assets/vintage-editorial/` có cùng mã băm SHA-256 với tệp chuẩn đang được `src/constants/engravings.tsx` tham chiếu.

---

## 4. Danh sách Tệp Không Tham Chiếu Nhưng ĐƯỢC GIỮ NGUYÊN (Theo Quy tắc Bảo toàn Mục 9) `[VERIFIED]`

1. **`src/data/existingVocab.json` (`38,167 bytes`, 104 bản ghi)**:
   - Không được import ở bất kỳ đâu trong `src/`, và 104/104 bản ghi đều đã nằm trong `src/data/vocabDatabase.json`.
   - **Lý do giữ nguyên**: Mục 3.1 và Mục 9 quy định rõ *"File data (`.json`, `.sql`, `.csv` trong `src/`): Không xóa tự động → ghi vào `11_DECISIONS_NEEDED.md`"*.
2. **29 tệp ảnh độc nhất (`unused`, không trùng SHA-256) trong `public/assets/` (`40.71 MB`)**:
   - Không có tham chiếu trong code hiện tại nhưng có mã băm SHA-256 duy nhất (ví dụ một số bản khắc kiến trúc dự phòng trong `public/assets/aistudio/` và `public/assets/engravings/`).
   - **Lý do giữ nguyên**: Mục 9 quy định *"Asset không tham chiếu nhưng không trùng → chỉ báo cáo, để người dùng quyết định"*. Danh sách đầy đủ nằm trong `_audit/03_ASSET_MANIFEST.json` (`status: "unused"`) và `_audit/11_DECISIONS_NEEDED.md`.
3. **`server.js` (`9,398 bytes`)**:
   - Là bản biên dịch JavaScript song song của `server.ts`. Được giữ lại và đồng bộ bản vá bảo mật `F-001` để đảm bảo tương thích nếu môi trường triển khai gọi `node server.js`.
