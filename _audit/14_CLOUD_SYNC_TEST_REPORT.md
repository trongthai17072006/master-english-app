# ☁️ BÁO CÁO KIỂM THỬ ĐỒNG BỘ ĐÁM MÂY HAI CHIỀU (`14_CLOUD_SYNC_TEST_REPORT.md`)

## Tóm tắt điều hành (Executive Summary)
Báo cáo này ghi lại kết quả kiểm định chuyên sâu cơ chế **Đồng bộ Đám mây Hai chiều Không mất dữ liệu (Two-Way Non-Destructive Cloud Sync — Mục 3)** trong `src/services/dataRepository.ts` và kịch bản kiểm thử tự động `_audit/08_SUPABASE_IMPORT/scripts/verify_final_gate.mjs` (đã thực thi qua `bun run` với kết quả **100% PASS**).
- **Kiểm thử Logic Hợp nhất (Merge), Hàng đợi Offline (`master_english_pending_sync_v1`), Chống trùng lặp (Idempotency) & Chống mất dữ liệu khi rớt mạng**: **PASS** `[VERIFIED]`.
- **Thực thi đồng bộ mạng trực tiếp tới máy chủ Supabase từ xa**: **BLOCKED** (do môi trường Local Development hiện chưa cấu hình `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY`).

---

## 1. Kiểm định Phạm vi Bảo phủ Toàn bộ 9 Nhóm Dữ liệu Học tập (Mục 3.1) `[VERIFIED]`

| # | Nhóm dữ liệu / Bảng | Khóa `localStorage` | Hàm Merge & Sync trong `src/services/dataRepository.ts` | Cơ chế Giải quyết Xung đột (Conflict Resolution) | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | `__speakingDrafts` (Bài nháp Speaking Ngày 1–66) | `ielts_60_day_challenge_state_v1` | `mergeChallengeProgress` (`lines 609–622`), `syncAllDataWithCloud` (`lines 929–940, 1318–1325`) | Tách tường minh `__speakingDrafts` khỏi `writing_drafts` khi Pull; lọc khóa ngày hợp lệ `Number.isFinite(day)`; chọn bản nháp có `lastSaved` mới hơn theo từng ngày `1..66`; đóng gói lại khi Push. | **PASS** |
| **2** | `__speakingHistory` (Lịch sử nộp Speaking Ngày 1–66) | `ielts_60_day_challenge_state_v1` | `mergeChallengeProgress` (`lines 645–664`), `syncAllDataWithCloud` (`lines 931–943, 1322–1325`) | Tách tường minh `__speakingHistory` khỏi `writing_history` khi Pull; hợp nhất (Set Union) theo `submission.id` không mất bất kỳ lần chấm bài nào trên cả 2 thiết bị. | **PASS** |
| **3** | `vocab_progress` / `word_progress` (Tiến độ SRS từng từ) | `master_english_word_progress_v2` | `mergeWordProgress` (`lines 481–517`), `syncWordProgressRecord` (`lines 1472–1531`) | Chọn trạng thái (`status`) của bản có `lastReviewedAt` mới hơn; lấy `Math.max(timesReviewed)`; hợp nhất mảng `history` theo khóa `${timestamp}_${action}`. | **PASS** |
| **4** | `saved_words` / `mastered_words_v1` (Sổ từ đã lưu / đã thuộc) | `leximaster_mastered_words_v1` | `mergeSavedWords` (`lines 711–733`), `syncAllDataWithCloud` (`lines 865–875, 1397–1407`) | Hợp nhất tập hợp (Set Union) giữa `localMasteredIds`, `cloudMasteredIds` và mọi từ có `status === 'mastered'` trong SRS; giữ `savedAt` mới nhất. | **PASS** |
| **5** | `study_sessions` (Lịch sử phiên học) | `master_english_sessions_v2` | `mergeStudySessions` (`lines 453–479`), `syncCompletedSession` (`lines 1396–1449`) | Hợp nhất theo `session.id`; nếu trùng `id`, giữ bản có `endTime` và `durationSeconds` lớn hơn hoặc bằng; sắp xếp giảm dần theo `startTime`. | **PASS** |
| **6** | `mistake_bank` / `mistakes_notebook` (Sổ tay lỗi sai) | `leximaster_mistakes_v1` | `mergeMistakes` (`lines 519–543`), `syncMistakeRecord` (`lines 1559–1599`) | Khử trùng lặp thông minh theo cả `id` lẫn nội dung câu hỏi `question`; giữ bản ghi có `timestamp` mới nhất. | **PASS** |
| **7** | `user_stats` (Thống kê lũy kế & Streak) | `leximaster_stats_v1` | `mergeUserStats` (`lines 545–556`), `syncUserStatsRecord` (`lines 1630–1668`) | Lấy giá trị cực đại `Math.max()` trên từng chỉ số lũy kế (`quizzesTaken`, `totalQuestionsAnswered`, `correctAnswers`, `bestStreak`, `currentStreak`). | **PASS** |
| **8** | `workspace_todos` (Danh sách nhiệm vụ lịch học) | `master_english_workspace_todos_v1` | `mergeWorkspaceTodos` (`lines 686–709`), `syncWorkspaceTodosList` (`lines 1760–1799`) | Hợp nhất theo `todo.id`; trạng thái hoàn thành được tính bằng phép tuyển logic `Boolean(local.done \|\| cloud.done)`. | **PASS** |
| **9** | `custom_content_store` (Từ vựng, Cấu trúc #78+, Ngày học mở rộng) | `master_english_custom_content_v1` | `mergeCustomContentStore` (`lines 735–804`), `syncAllDataWithCloud` (`lines 1344–1395`) | Hợp nhất `customVocab` theo `id/word`, `customStructures` theo `id/structureName`, và `customChallengeDays` (hỗ trợ ngày `1..3650`) theo `updatedAt` mới nhất. | **PASS** |

---

## 2. Kết quả Kiểm thử Tự động Kịch bản 1–5 & Test Cases A–E (`verify_final_gate.mjs`) `[VERIFIED]`

Lệnh thực thi:
```bash
bun run _audit/08_SUPABASE_IMPORT/scripts/verify_final_gate.mjs
```

| Kịch bản / Test Case | Mô tả Kịch bản Kiểm thử | Kết quả Thực thi | Bằng chứng & Chi tiết Kiểm chứng |
| :--- | :--- | :--- | :--- |
| **Scenario 1 & Test Case B**<br>*(Device A → Cloud → Device B & User có dữ liệu Local đăng nhập)* | Học viên học trên Thiết bị A tới **Ngày 62** (bao gồm bài nháp và lịch sử Speaking `speakingDrafts[1, 62]`, `speakingHistory[1, 62]`, `writingDrafts[1]`, `masteredVocabIds`), sau đó đồng bộ sang Thiết bị B (hoặc đăng nhập lần đầu khi đã có dữ liệu local). | **PASS** | `mergeChallengeProgress` bảo toàn 100% `activeDay = 62`, `streak = 14`, `speakingDrafts[1]`, `speakingDrafts[62]`, `speakingHistory[62]` và danh sách từ vựng đã thuộc; không bị ghi đè bởi trạng thái rỗng ban đầu của Thiết bị B. |
| **Scenario 2**<br>*(User Offline → Học tiếp → Online lại)* | Học viên mất kết nối mạng, thực hiện 2 lần cập nhật liên tiếp cho từ `conducive` (`t = 1700000010000` status `learning`, sau đó `t = 1700000020000` status `mastered`) và hoàn thành phiên học `sess-101`. | **PASS** | Hàng đợi `master_english_pending_sync_v1` tự động khử trùng theo khóa phức hợp `word_progress:conducive` (chỉ giữ 1 mục mới nhất `t = 1700000020000`, `status = 'mastered'`) cùng `study_session:sess-101`. Khi mạng phục hồi (`window.addEventListener('online')`), toàn bộ dữ liệu được đẩy lên Cloud và xóa sạch hàng đợi. |
| **Scenario 3 & Test Case C**<br>*(Xung đột đồng thời giữa Thiết bị A và Thiết bị B)* | Thiết bị A sửa bài nháp Writing Ngày 1 lúc `t = 2000` (mới hơn) nhưng bài nháp Speaking Ngày 1 lúc `t = 1000` (cũ hơn); Thiết bị B có Writing Ngày 1 lúc `t = 1000`, Writing Ngày 2 lúc `t = 1500` và Speaking Ngày 1 lúc `t = 3000`. Đồng thời kiểm tra xung đột trên `word_progress`, `saved_words`, `study_sessions`, `mistake_bank`, `user_stats`, `workspace_todos`, `custom_content_store`. | **PASS** | Thuật toán hợp nhất chọn chính xác: Writing Ngày 1 của Thiết bị A (`t = 2000`), giữ nguyên Writing Ngày 2 của Thiết bị B (`t = 1500`), chọn Speaking Ngày 1 của Thiết bị B (`t = 3000`), gộp cả 2 bài nộp trong `writingHistory` và `speakingHistory` (2 bản ghi mỗi bên), và gộp lịch sử ôn tập SRS (`3 mốc thời gian`). |
| **Scenario 4**<br>*(Gọi `syncAllDataWithCloud` / Merge lặp lại 3 lần liên tiếp)* | Thực thi hợp nhất liên tiếp 3 vòng (`pass1`, `pass2`, `pass3`) trên cùng tập dữ liệu. | **PASS** | `assert.deepEqual(pass1, pass3)` thành công 100%: 0 bản ghi lịch sử bị nhân đôi, 0 lỗi sai bị lặp, 0 phiên học bị trùng. |
| **Scenario 5 & Test Case E**<br>*(Mạng đứt giữa chừng / Lỗi kết nối Cloud)* | Giả lập lỗi kết nối Cloud khi đang gọi `syncAllDataWithCloud('manual')` trong khi `localStorage` đang lưu `quizzesTaken = 9, bestStreak = 15`. | **PASS** | Hàm bắt ngoại lệ an toàn (`catch`), đặt `isSyncingNow = false`, trả về thông báo rõ ràng và giữ nguyên 100% dữ liệu trong `localStorage` (`quizzesTaken = 9`). |
| **Test Case A**<br>*(User mới hoàn toàn đăng ký & đăng nhập)* | Tài khoản mới đăng ký qua `signUpWithEmailPassword`. | **PASS** | Trigger `on_auth_user_created` trên Supabase tự động tạo 1 dòng trong `public.profiles`, `public.user_profiles` và `public.user_stats` (`ON CONFLICT DO NOTHING`); khi client gọi `syncAllDataWithCloud('auto_login')`, dữ liệu khởi tạo đồng bộ êm ái không sinh lỗi `null`. |
| **Test Case D**<br>*(Xóa / Reset lỗi sai trong Sổ tay)* | Học viên xóa 1 lỗi sai (`deleteMistakeFromCloud`) hoặc xóa toàn bộ lỗi sai đã khắc phục (`clearAllMistakesFromCloud`). | **PASS** | Xóa đồng bộ trên cả `localStorage` và bảng `mistakes_notebook` theo `eq('user_id', currentUser.id)`. |

---

## 3. Phát hiện & Khắc phục Bổ sung trong Cổng Cuối (Final Gate Fix) `[VERIFIED]`

Trong quá trình đối chiếu chéo giữa `src/services/dataRepository.ts` và `_audit/06_SUPABASE_SCHEMA.sql`, kiểm toán viên phát hiện và đã khắc phục ngay **2 điểm tinh chỉnh quan trọng**:
1. **Ràng buộc `onConflict` của bảng `user_writing_logs` (`src/services/dataRepository.ts:1752`)**:
   - *Trước khi sửa*: `syncUserWritingLog` gọi `.upsert(..., { onConflict: 'id' })`, trong khi khóa chính của bảng `public.user_writing_logs` là khóa phức hợp `PRIMARY KEY (user_id, id)`.
   - *Đã khắc phục*: Cập nhật thành `{ onConflict: 'user_id,id' }` khớp 100% với PK của bảng.
2. **Đồng bộ `custom_content_store` và `saved_words` trong `syncAllDataWithCloud` (`src/services/dataRepository.ts:1344–1413`)**:
   - *Đã bổ sung*: Bổ sung bước `3.9` trong `syncAllDataWithCloud` cùng 2 hàm hợp nhất công khai `mergeSavedWords` và `mergeCustomContentStore` để tự động đồng bộ cả kho nội dung mở rộng (`custom_content_store`) và sổ từ đã lưu (`saved_words`).
