# 🚀 BÁO CÁO NGHIỆM THU CỔNG CUỐI SUPABASE & ĐÁNH GIÁ SẴN SÀNG PRODUCTION (`21_FINAL_SUPABASE_GO_LIVE_REPORT.md`)

## 1. Tóm Tắt Điều Hành (Executive Summary)

Báo cáo này là văn bản nghiệm thu chính thức **FINAL GATE & PRODUCTION READINESS AUDIT** cho hệ thống **LexiMaster IELTS (MASTER English)**, được thực hiện bởi đội ngũ kiến trúc sư Supabase, kỹ sư bảo mật cơ sở dữ liệu, QA Automation và DevOps theo nguyên tắc trung thực tuyệt đối:
- **Nguyên tắc cốt lõi**: BẢO TOÀN DỮ LIỆU – BẢO MẬT TUYỆT ĐỐI – KHÔNG PHÁ VỠ WEBSITE – KIỂM ĐỊNH TRUNG THỰC – PHÂN ĐỊNH RÕ RÀNG GIỮA STATIC VÀ REMOTE.
- **Dữ liệu gốc (Baseline Data)**: 17/17 tệp dữ liệu gốc trong `src/data/*` khớp 100% mã băm SHA-256 so với `_audit/backup_0_original/CHECKSUMS.txt`.
- **Gói nạp Supabase**: Đầy đủ 5,087 bản ghi (gồm 3,666 từ vựng duy nhất, 89 cấu trúc ngữ pháp, 66 ngày học, 990 mục từ theo ngày, 45 chủ đề Speaking, 153 câu hỏi trắc nghiệm, 35 tài liệu thư viện) với 0 lỗi khóa ngoại và 0 lỗi Unicode NFC.
- **Kiểm định mã nguồn & kiểm thử tự động**:
  - `lint_applet` (`tsc --noEmit`): **PASS** (0 lỗi cú pháp / kiểu dữ liệu).
  - `compile_applet` (`vite build`): **PASS** (biên dịch thành công 100%).
  - `verify_final_gate.mjs` (Bộ kiểm thử tự động 9 nhóm dữ liệu đồng bộ): **PASS (100%)**.
  - `verify_export_counts.py` (Bộ kiểm toán độc lập bằng Python): **PASS (100%)**.
- **KẾT LUẬN CỔNG CUỐI**:
  **`BLOCKED – NOT READY FOR PRODUCTION (PENDING REMOTE CREDENTIALS & PRODUCTION SIGN-OFF)`**
  *Lý do kỹ thuật bắt buộc*: Môi trường hiện tại là container phát triển nội bộ chưa được cấp thông tin định danh máy chủ Supabase từ xa (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_DB_URL`). Theo Điều kiện Kết thúc (Mục XII), ứng dụng KHÔNG ĐƯỢC PHÉP tuyên bố "Ready for Production" khi chưa thực hiện thành công Remote Security Test, Remote Authentication Test và Remote Storage Test trên máy chủ PostgreSQL đám mây thật.

---

## 2. Những Hạng Mục PASS Được Bảo Toàn (Preserved PASS Items)

Tất cả các thành quả đã đạt được từ Giai đoạn 0 đến Giai đoạn 6 cùng các cải tiến UI/UX được bảo toàn nguyên vẹn, không bị phá vỡ:
1. **Bảo toàn dữ liệu gốc 17/17 tệp (`PASS`)**:
   - `src/data/vocabDatabase.json` (SHA-256: `d6b6a672...`)
   - `src/data/existingVocab.json` (SHA-256: `63eb5ab7...`)
   - `src/data/vocabularyData.ts` (SHA-256: `de2abd09...`)
   - `src/data/expandedPdfLibraryData.ts` (SHA-256: `e35a70c9...`)
   - `src/data/vstepPdfKnowledgeBankData.ts` (SHA-256: `d13deeede...`)
   - `src/data/challenge60Data.ts` (SHA-256: `5b0a4ba8...`)
   - 11 tệp chương trình và bài học trong `src/data/curriculum/*` (100% SHA-256 intact).
2. **Gói dữ liệu nạp 5,087 bản ghi tất định UUIDv5 (`PASS`)**:
   - Khóa chính UUIDv5 sinh theo RFC 4122 SHA-1 với Namespace cố định và `import_batch_id = '9b9c7c85-c47f-5dac-824e-b5bf703c4037'`.
   - Cung cấp sẵn script nạp bất biến `_audit/08_SUPABASE_IMPORT/10_IDEMPOTENT_UPSERT_IMPORT.sql` chạy lại lần 2 không sinh bản ghi trùng và không gãy FK.
3. **Logic Đồng bộ Đám mây Hai chiều 9 Nhóm Dữ liệu (`PASS`)**:
   - Kịch bản 1..5 và Test Cases A..E trong `verify_final_gate.mjs` đạt `100% PASS`.
   - Bảo toàn phân tách `__speakingDrafts` và `__speakingHistory` theo từng ngày 1..66.
   - Hàng đợi ngoại tuyến `master_english_pending_sync_v1` khử trùng lặp và tự động đẩy khi có mạng.
4. **Bảo mật Schema & RLS Tĩnh (`STATIC AUDIT PASS`)**:
   - 21 bảng chính thức + bảng tương thích runtime đều đã có `ENABLE ROW LEVEL SECURITY`.
   - 3 hàm `SECURITY DEFINER` đều đã khóa cứng `SET search_path = ''`.
   - Trigger `on_auth_user_created` đảm bảo quan hệ `1:1` giữa `auth.users` và `profiles`.
5. **Giao diện Đồng hồ Bấm giờ Toàn trang (DraggablePageTimer / BoundedBannerTimer) (`PASS`)**:
   - Phóng to 2X (`160px × 160px`), viền đôi cổ điển `border-[3.5px] border-[#1A1917]` và bóng khối `shadow-[4px_6px_0px_#1A1917]`.
   - Mặc định ẩn hoàn toàn các nút điều khiển để giữ giao diện tòa soạn thanh lịch.
   - Click nhẹ tại chỗ (< 5px): Bật/tắt thanh nút điều khiển (`showControls`); tự động ẩn khi click ra ngoài hoặc sau 4 giây.
   - Giữ chuột kéo (>= 5px): Di chuyển tự do trên toàn bộ chiều dài trang hiện tại mà không bị nhốt trong Hero Banner.
   - Đồng bộ 100% thời gian với `REAL-TIME FOCUS CLOCK` qua `useFocusTimer()` trong `AnalyticsContext`.
   - Tách biệt rõ ràng 2 chức năng: `⏸ Dừng / ▶ Tiếp` (`togglePause`) và `⊘ Kết thúc` (`endAndSaveSession`).

---

## 3. Những BLOCKED Đã Được Giải Quyết (Resolved Items)

1. **Khắc phục lỗi ràng buộc `onConflict` của bảng `user_writing_logs`**:
   - *Vấn đề trước*: `dataRepository.ts` dùng `onConflict: 'id'`, trong khi khóa chính trong database là `(user_id, id)`.
   - *Đã giải quyết*: Sửa thành `{ onConflict: 'user_id,id' }` trong `src/services/dataRepository.ts`.
2. **Khắc phục thiếu sót đồng bộ 2 chiều cho `custom_content_store` và `saved_words`**:
   - *Vấn đề trước*: `syncAllDataWithCloud` chưa kéo thả đồng bộ tự động 2 bảng này.
   - *Đã giải quyết*: Bổ sung bước `3.9` trong `dataRepository.ts` và export các hàm merge tương ứng.
3. **Đồng bộ Header Khắc gỗ & Đồng hồ cho 2 trang con `CollocationsQuiz` và `MistakeBank` (Quyết định #5)**:
   - *Vấn đề trước*: 2 trang này trước đây dùng thanh ngang đỏ cũ.
   - *Đã giải quyết*: Đã chuyển cả `CollocationsQuiz.tsx` (`timerPageId="phoi_ngu"`) và `MistakeBank.tsx` (`timerPageId="ban_dinh_chinh"`) sang `HorizonEngravingHeader` đồng bộ với 7 chuyên mục còn lại.
4. **Đồng bộ hóa kiểm tra tự động trong `verify_final_gate.mjs`**:
   - Cập nhật bộ kiểm tra `pageChecks` nhận diện `timerPageId=` và cấu trúc Hero Banner mới, giúp bộ kiểm tra tự động chạy thành công `allPassed: true`.

---

## 4. Những BLOCKED Chưa Thể Giải Quyết & Nguyên Nhân (Unresolved BLOCKED)

Theo đúng yêu cầu tại Mục I.6 và Mục XII:
1. **Kiểm thử Kết nối & RLS trên Supabase Remote (`BLOCKED`)**:
   - *Nguyên nhân*: Chưa có biến môi trường `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY` (hoặc `SUPABASE_DB_URL`).
   - *Ảnh hưởng*: Chưa thể chạy trực tiếp các lệnh SQL `EXPLAIN ANALYZE` và kiểm thử mạng giữa 2 trình duyệt thật trên máy chủ Supabase.
   - *Biện pháp đã chuẩn bị sẵn sàng*: Kịch bản giao dịch an toàn `BEGIN ... ROLLBACK` tại Mục 3 trong `_audit/13_SUPABASE_SECURITY_AUDIT.md` và file `_audit/09_VALIDATION_QUERIES.sql` sẵn sàng chạy trong Supabase SQL Editor trong 30 giây ngay khi có kết nối.
2. **Kiểm thử Gửi Email Xác thực & OAuth Redirect (`BLOCKED`)**:
   - *Nguyên nhân*: Cần cấu hình SMTP và Google Client ID trên trang quản trị Supabase Auth Dashboard.
   - *Biện pháp*: Code client-side (`signUpWithEmailPassword`, `sendPasswordResetEmail`, `signInWithOAuth`) đã hoàn tất và kiểm tra tĩnh PASS.
3. **Kiểm thử Tải Tệp Lên 3 Buckets Supabase Storage Từ Xa (`BLOCKED`)**:
   - *Nguyên nhân*: Chưa có dự án Supabase Remote để khởi tạo bucket.
   - *Biện pháp*: SQL định nghĩa 3 buckets và chính sách RLS cho `storage.objects` đã nằm trọn vẹn trong `_audit/06_SUPABASE_SCHEMA.sql:679–733`.

---

## 5. Những Quyết Định Đang Chờ Phê Duyệt (PENDING APPROVAL)

Theo đúng quy tắc **Không tự ý xóa dữ liệu hoặc thay đổi nội dung học thuật**, 4 quyết định còn lại được giữ nguyên trạng thái an toàn:

| # | Hạng mục | Khuyến nghị của Kiến trúc sư | Ảnh hưởng nếu giữ nguyên | Ảnh hưởng nếu thực thi | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | `src/data/existingVocab.json` (104 từ, 38 KB) | Giữ nguyên tệp trong `src/data/` (không xóa). File không được import trong code nên không ảnh hưởng bundle JS. | Tốn 38.1 KB trên đĩa, không ảnh hưởng vận hành. | Xóa sẽ làm đổi danh mục file trong `src/data/`. | **PENDING APPROVAL** |
| **2** | 29 Tệp Ảnh Unused nhưng Unique SHA-256 (40.71 MB) | Giữ nguyên trong `public/assets/` làm kho tư liệu minh họa dự phòng cho các chuyên mục mới. | Tăng dung lượng repo thêm ~40 MB. | Xóa sẽ tiết kiệm 40 MB nhưng mất các bản khắc gỗ độc bản nếu cần dùng lại. | **PENDING APPROVAL** |
| **3** | 2 Đường dẫn PDF gốc (`Untitled_document_bb0198f5.pdf` và `_n_thi_vstep_11d6f8c6.pdf`) | 100% nội dung đã số hóa trong TypeScript (77 cấu trúc + 24 chuyên đề VSTEP). Giữ nguyên đường dẫn tham chiếu; người dùng có thể đặt 2 file PDF gốc vào `public/assets/aistudio/` bất cứ lúc nào. | Nút "Mở PDF gốc" sẽ mở tab fallback nếu chưa copy file PDF nhị phân vào thư mục. | Ứng dụng học tập bình thường không bị gián đoạn. | **PENDING APPROVAL** |
| **4** | Bản ghi từ vựng `protein` (`meaning_vi = "Protein"`) | Giữ nguyên nghĩa `"Protein"` trong baseline hoặc cho phép cập nhật thành `"Chất đạm (Protein)"` khi chủ dự án đồng ý. | Học viên thấy nghĩa tiếng Việt là từ mượn "Protein". | Cập nhật sẽ làm thay đổi mã băm SHA-256 của `vocabDatabase.json`. | **PENDING APPROVAL** |

---

## 6. Kết Quả Kiểm Thử Toàn Diện 21 Bảng Cơ Sở Dữ Liệu

| # | Tên Bảng | Vai trò | Khóa chính | RLS Status | anon Access | auth Access | Static Audit | Remote Test |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `import_batches` | Content Metadata | `id (UUID)` | ENABLED | SELECT | Admin Only | **PASS** | **BLOCKED** |
| 2 | `vocabulary_categories` | Content Danh mục | `id (UUID)` | ENABLED | SELECT | Admin Only | **PASS** | **BLOCKED** |
| 3 | `vocabulary` | 3,666 Từ vựng | `id (UUID)` | ENABLED | SELECT | Admin Only | **PASS** | **BLOCKED** |
| 4 | `grammar_structures` | 89 Cấu trúc ngữ pháp | `id (UUID)` | ENABLED | SELECT | Admin Only | **PASS** | **BLOCKED** |
| 5 | `curriculum_days` | 66 Ngày học | `id (UUID)` | ENABLED | SELECT | Admin Only | **PASS** | **BLOCKED** |
| 6 | `curriculum_day_vocab` | 990 Từ theo ngày | `id (UUID)` | ENABLED | SELECT | Admin Only | **PASS** | **BLOCKED** |
| 7 | `ielts_speaking_topics` | 45 Bộ đề Speaking | `id (UUID)` | ENABLED | SELECT | Admin Only | **PASS** | **BLOCKED** |
| 8 | `quiz_questions` | 153 Câu hỏi trắc nghiệm | `id (UUID)` | ENABLED | SELECT | Admin Only | **PASS** | **BLOCKED** |
| 9 | `pdf_library` | 35 Chuyên đề PDF | `id (UUID)` | ENABLED | SELECT | Admin Only | **PASS** | **BLOCKED** |
| 10 | `profiles` / `user_profiles` | Hồ sơ học viên 1:1 | `id (UUID)` | ENABLED | BLOCKED (0) | Chown (`auth.uid() = id`) | **PASS** | **BLOCKED** |
| 11 | `vocab_progress` / `word_progress` | Tiến trình SRS | `(user_id, word_id)` | ENABLED | BLOCKED (0) | Chown (`auth.uid() = user_id`) | **PASS** | **BLOCKED** |
| 12 | `saved_words` | Từ vựng đã lưu | `(user_id, word_id)` | ENABLED | BLOCKED (0) | Chown (`auth.uid() = user_id`) | **PASS** | **BLOCKED** |
| 13 | `study_sessions` | Lịch sử ca học | `(user_id, id)` | ENABLED | BLOCKED (0) | Chown (`auth.uid() = user_id`) | **PASS** | **BLOCKED** |
| 14 | `mistake_bank` | Sổ tay lỗi sai | `(user_id, item_id)` | ENABLED | BLOCKED (0) | Chown (`auth.uid() = user_id`) | **PASS** | **BLOCKED** |
| 15 | `user_stats` | Thống kê & Streak | `user_id (UUID)` | ENABLED | BLOCKED (0) | Chown (`auth.uid() = user_id`) | **PASS** | **BLOCKED** |
| 16 | `challenge_60_progress` | Tiến độ thử thách | `user_id (UUID)` | ENABLED | BLOCKED (0) | Chown (`auth.uid() = user_id`) | **PASS** | **BLOCKED** |
| 17 | `user_challenge_progress` | Tiến độ bổ trợ | `user_id (UUID)` | ENABLED | BLOCKED (0) | Chown (`auth.uid() = user_id`) | **PASS** | **BLOCKED** |
| 18 | `user_writing_logs` | Nhật ký bài viết | `(user_id, id)` | ENABLED | BLOCKED (0) | Chown (`auth.uid() = user_id`) | **PASS** | **BLOCKED** |
| 19 | `workspace_todos` | Nhiệm vụ lịch học | `(user_id, todo_id)` | ENABLED | BLOCKED (0) | Chown (`auth.uid() = user_id`) | **PASS** | **BLOCKED** |
| 20 | `custom_content_store` | Nội dung cá nhân | `user_id (UUID)` | ENABLED | BLOCKED (0) | Chown (`auth.uid() = user_id`) | **PASS** | **BLOCKED** |
| 21 | `user_custom_vocab` | Từ vựng tự thêm | `(user_id, id)` | ENABLED | BLOCKED (0) | Chown (`auth.uid() = user_id`) | **PASS** | **BLOCKED** |

---

## 7. Kết Quả Kiểm Định RLS & Storage

1. **Phân quyền vai trò (Role Separation)**:
   - `ROLE anon`: Chỉ được phép đọc (`SELECT`) trên 9 bảng nội dung tĩnh. Bị từ chối 100% trên 12 bảng người dùng (**PASS**).
   - `ROLE authenticated`: Chỉ được phép thao tác trên các hàng có `user_id = auth.uid()` (**PASS**).
   - User A không thể đọc, sửa, hoặc xóa dữ liệu của User B (**PASS**).
   - Quyền Admin: Kiểm tra qua `public.is_admin()` sử dụng `app_metadata.role = 'admin'`, ngăn chặn hoàn toàn việc người dùng tự nâng quyền (**PASS**).
2. **Storage Policies (3 Buckets)**:
   - `public-editorial-assets`: Public đọc, chỉ Admin ghi (**PASS**).
   - `course-pdfs`: Public đọc, chỉ Admin ghi (**PASS**).
   - `user-uploads`: Private, chỉ chủ sở hữu thư mục `(storage.foldername(name))[1] = auth.uid()::text` được đọc/ghi (**PASS**).
3. **Trạng thái thực thi Remote**: **BLOCKED** (chờ cấp Project URL và Service Role Key trên máy chủ Staging).

---

## 8. Kết Quả Toàn Vẹn Di Dời Dữ Liệu (Migration Integrity)

- **Tổng số bản ghi**: **5,087 / 5,087 bản ghi** (100% khớp đối chiếu giữa nguồn TypeScript/JSON và đích CSV/JSON).
- **Khóa chính**: 100% UUID v5 tất định không đổi qua các lần xuất.
- **Khóa ngoại mồ côi**: **0**.
- **Vi phạm Unicode NFC**: **0**.
- **Tính bất biến (Idempotency)**: Script `10_IDEMPOTENT_UPSERT_IMPORT.sql` đã kiểm chứng logic qua bảng tạm `stg_*` và `ON CONFLICT (id) DO UPDATE`, đảm bảo chạy lại nhiều lần không sinh bản ghi trùng lặp (**PASS**).

---

## 9. Kết Quả Kiểm Định Xác Thực (Authentication)

- **Vòng đời tài khoản**: Đăng ký, đăng nhập (Email/Mật khẩu & Google OAuth), đăng xuất, khôi phục mật khẩu đều có xử lý lỗi và thông báo tiếng Việt (**PASS**).
- **Tính năng không xóa dữ liệu local khi đăng xuất**: Được bảo đảm trong `src/services/supabaseClient.ts` (**PASS**).
- **Khởi tạo hồ sơ 1:1**: Trigger `on_auth_user_created` trên `auth.users` tự động chèn dòng vào `profiles`, `user_profiles` và `user_stats` với `ON CONFLICT DO NOTHING` (**PASS**).
- **Dọn dẹp Cascade**: 100% các bảng người dùng liên kết với `auth.users(id) ON DELETE CASCADE` (**PASS**).
- **Trạng thái thực thi Remote**: **BLOCKED** (cần Supabase Project đang hoạt động để gửi email thật).

---

## 10. Kết Quả Kiểm Thử Đồng Bộ Đám Mây (Cloud Sync)

- **9/9 nhóm dữ liệu**: `__speakingDrafts`, `__speakingHistory`, `vocab_progress`, `saved_words`, `study_sessions`, `mistake_bank`, `user_stats`, `workspace_todos`, `custom_content_store` được bảo toàn trọn vẹn qua 5 kịch bản kiểm thử tự động trong `verify_final_gate.mjs` (**PASS**).
- **Khả năng ngoại tuyến (Offline Resiliency)**: Khi mất mạng hoặc chưa cấu hình Supabase, hệ thống hoạt động 100% bình thường trên `localStorage` và lưu hàng đợi đồng bộ (**PASS**).
- **Giải quyết xung đột (Conflict Resolution)**: Dựa trên timestamp mới nhất và hợp nhất tập hợp (Set Union), không ghi đè mất mát bài tập giữa các thiết bị (**PASS**).

---

## 11. Kết Quả Kế Hoạch Sao Lưu & Phục Hồi (Backup & Recovery)

- **4 Snapshot sao lưu**: `backup_0_original` (Baseline nguyên bản), `backup_1_pre_fixes`, `backup_2_pre_cleanup`, `backup_3_pre_data_norm` tồn tại đầy đủ kèm mã băm SHA-256 (**PASS**).
- **3 Kịch bản phục hồi**:
  - Kịch bản A: Rollback theo `import_batch_id` (chỉ gỡ dữ liệu học thuật, giữ nguyên người dùng).
  - Kịch bản B: Rollback Schema (gỡ 9 bảng content, bảo toàn bảng tiến độ).
  - Kịch bản C: Phục hồi người dùng sau Go-Live từ JSON Export, `localStorage` và `pg_restore --table`.

---

## 12. Kết Quả Hiệu Năng & Chỉ Mục (Performance)

- **Độ phủ chỉ mục**: 100% khóa ngoại và các cột truy vấn chính đều có B-tree index (**PASS**).
- **Tìm kiếm từ vựng**: Hỗ trợ đồng thời B-tree (`word_normalized`), GIN `pg_trgm` (tìm mờ/sai chính tả) và GIN `tsvector` (tìm kiếm toàn văn tiếng Anh/Việt) (**PASS**).
- **Chống N+1**: Tầng đồng bộ gom batch upsert 1 lần cho mỗi bảng; truy vấn giáo trình ngày học dùng gộp JSON qua `json_agg` (**PASS**).
- **Phân trang Client**: Giữ DOM nhẹ nhàng bằng lô hiển thị `INITIAL_BATCH_SIZE = 40` mục từ (**PASS**).

---

## 13. Danh Sách Các Tệp Được Tạo, Sửa Trong Phiên Làm Việc

1. `src/components/BoundedBannerTimer.tsx`:
   - Phóng to kích thước 2X (`160px × 160px`).
   - Mặc định ẩn hoàn toàn cụm nút điều khiển và nút `↺`.
   - Click/tap vào mặt đồng hồ bật/tắt hiển thị nút điều khiển (`showControls`); tự động ẩn khi click ra ngoài hoặc sau 4 giây idle.
   - Giữ chuột kéo di chuyển tự do khắp trang hiện tại mà không bị giới hạn trong khung Hero Banner.
   - Đồng bộ 100% thời gian với `useFocusTimer()`.
   - Tách biệt rõ ràng nút `⏸ Dừng / ▶ Tiếp` (`togglePause`) và `⊘ Kết thúc` (`endAndSaveSession`).
2. `src/components/DraggablePageTimer.tsx`:
   - Tạo tệp module tái xuất (`re-export`) đảm bảo tương thích mọi đường dẫn import.
3. `_audit/08_SUPABASE_IMPORT/scripts/verify_final_gate.mjs`:
   - Cập nhật kiểm tra cấu trúc để tương thích với `timerPageId=` và kiến trúc Banner Timer mới.
4. `_audit/21_FINAL_SUPABASE_GO_LIVE_REPORT.md`:
   - Tạo báo cáo nghiệm thu cổng cuối toàn diện này.

---

## 14. Những Thay Đổi Có Ảnh Hưởng Dữ Liệu (Data Impact Assessment)

- **Ảnh hưởng tới 17 tệp dữ liệu gốc**: **HOÀN TOÀN KHÔNG** (0 byte bị thay đổi, 17/17 tệp khớp 100% SHA-256).
- **Ảnh hưởng tới dữ liệu học viên `localStorage`**: **HOÀN TOÀN KHÔNG** (toàn bộ lịch sử học, từ vựng, chuỗi ngày, bài viết đều được giữ nguyên vẹn).
- **Ảnh hưởng tới database Supabase**: Chưa áp dụng lên database thật do đang chờ cấp thông tin kết nối máy chủ Staging/Production.

---

## 15. Hướng Dẫn Triển Khai Production (Production Runbook)

Khi chủ dự án đã sẵn sàng và có thông tin đăng nhập Supabase Dashboard:

### Bước 1: Chuẩn bị Biến Môi Trường
Tạo dự án mới trên Supabase và điền các khóa vào `.env.production` (hoặc Cloud Run Environment Variables):
```env
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-publishable-key>
SUPABASE_DB_URL=postgresql://postgres.<project-id>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres
GEMINI_API_KEY=<your-gemini-key>
VITE_ADMIN_EMAIL=trongthai17072006@gmail.com
```

### Bước 2: Khởi Tạo Schema & RLS
Mở Supabase SQL Editor và chạy nội dung tệp:
`_audit/06_SUPABASE_SCHEMA.sql`

### Bước 3: Nạp 5,087 Bản Ghi Nội Dung Học Thuật
Trong terminal hoặc SQL Editor, thực thi script bất biến:
`_audit/08_SUPABASE_IMPORT/10_IDEMPOTENT_UPSERT_IMPORT.sql`

### Bước 4: Chạy Bộ Truy Vấn Hậu Kiểm
Chạy toàn bộ truy vấn trong:
`_audit/09_VALIDATION_QUERIES.sql`
Xác nhận tất cả 9 bảng đều trả về `PASS` và 0 bản ghi mồ côi.

### Bước 5: Cấp Quyền Admin Cho Tài Khoản Quản Trị
Trong SQL Editor:
```sql
UPDATE auth.users
SET raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE email = 'trongthai17072006@gmail.com';
```

### Bước 6: Khởi Động Production Server
```bash
npm run build
npm run start
```

---

## 16. Các Điều Kiện Còn Thiếu Trước Khi Go-Live (Missing Conditions)

Để chuyển trạng thái từ **BLOCKED** sang **READY FOR PRODUCTION**, chủ dự án cần cung cấp và thực hiện:
1. **Supabase Project Credentials**: Cung cấp `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY` của dự án Staging/Production.
2. **Thực thi Remote Migration**: Chạy script schema và import data trên database thật.
3. **Phê duyệt 4 quyết định mở**:
   - Xác nhận giữ `existingVocab.json` (khuyến nghị).
   - Xác nhận giữ 29 ảnh unique trong `public/assets/` (khuyến nghị).
   - Tải 2 file PDF gốc vào thư mục hoặc chấp nhận xem số hóa nội tuyến.
   - Xác nhận cập nhật nghĩa từ `protein` thành "Chất đạm (Protein)".
4. **Kiểm thử nghiệm thu cuối cùng (UAT) trên Staging**: Đăng ký 1 tài khoản mới và xác nhận đồng bộ 2 chiều thành công trên 2 thiết bị thực tế.

---

**Xác nhận nghiệm thu kỹ thuật**:
- QA & Automation Suite: **`PASS (100%)`**
- Mã nguồn & Kiểu dữ liệu TypeScript: **`PASS (0 errors)`**
- Toàn vẹn Dữ liệu Nạp (5,087 bản ghi): **`PASS`**
- Trạng thái Vận hành Tổng thể: **`BLOCKED – NOT READY FOR PRODUCTION (PENDING REMOTE CREDENTIALS & PRODUCTION SIGN-OFF)`**
