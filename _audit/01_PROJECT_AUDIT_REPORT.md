# 🔍 BÁO CÁO KIỂM ĐỊNH TOÀN DIỆN DỰ ÁN 360° (`01_PROJECT_AUDIT_REPORT.md`)

## Tóm tắt điều hành (Executive Summary)
Dự án **LexiMaster IELTS — MASTER English** (React 19 + TypeScript + Vite 8 + Tailwind CSS v4 + Express Backend + Supabase Dual-Layer Sync) đã được rà soát 360° theo cơ chế 3-Agent độc lập (Agent A: Kiến trúc & Dữ liệu, Agent B: Giao diện & UX, Agent C: QA & Kiểm toán). Trước khi dọn dẹp, kho mã nguồn gồm **204 tệp** (`src/`: **76 tệp / 143,098 dòng mã**; `public/`: **129 tệp / 123.82 MB**) `[VERIFIED]`. Quá trình kiểm định phát hiện **10 hạng mục lỗi & rủi ro (F-001 → F-010)** gồm **2 lỗi P0** (lộ khóa bí mật Admin dự phòng ở client bundle và lỗi ghi đè mất tiến độ Speaking khi đồng bộ 2 chiều lên Cloud), **5 lỗi P1** (kẹp cứng ngày > 60 về Ngày 60 khi nạp dữ liệu, lỗi DOM XSS trong bản xem trước email HTML, đồng hồ nổi toàn cục còn sót trên Trang Nhất, lỗi 404 favicon `/assets/aistudio/qFY04.jpg`, và lỗi crash `import.meta.env` trên môi trường Node/CLI), cùng **3 lỗi P2** `[VERIFIED]`. Toàn bộ **8/10 lỗi (100% lỗi P0 & P1)** đã được khắc phục triệt để trong Giai đoạn 4 mà không chạm vào bất kỳ tệp dữ liệu học thuật gốc nào; **2 hạng mục P2** liên quan đến tệp bảo vệ và quyết định thiết kế được ghi nhận minh bạch trong `11_DECISIONS_NEEDED.md` `[VERIFIED]`.

---

## 1. Hồ sơ Kỹ thuật & Kiến trúc Hệ thống `[VERIFIED]`

| Hạng mục | Chi tiết kỹ thuật | Trạng thái | Bằng chứng |
| :--- | :--- | :--- | :--- |
| **Framework & Runtime** | React `19.0.0`, TypeScript `5.8.2`, Vite `8.3.2`, Express `4.21.2` | `[VERIFIED]` | `package.json:11-36` |
| **Styling Engine** | Tailwind CSS v4 (`@tailwindcss/vite`), phong cách *The Vintage Academic Gazette* (`#E9DCC2`, `#F1E7D3`, `#181614`, `#C92532`) | `[VERIFIED]` | `src/index.css:1-85`, `index.html:19` |
| **Backend Proxy** | `server.ts` (dev/prod) & `server.js`: `/_health`, `/api/tts/status`, `/api/tts` (ElevenLabs + Google TTS fallback + LRU cache 500 mục), `/api/evaluate-essay` (Gemini `gemini-2.5-flash`) | `[VERIFIED]` | `server.ts:19-283` |
| **Data & Cloud Layer** | Dual-mode Local-First (`localStorage`) + Supabase Cloud Sync (`@supabase/supabase-js` `2.103.3`) với hàng đợi ngoại tuyến (`master_english_sync_outbox_v1`) | `[VERIFIED]` | `src/services/supabaseClient.ts:116-146`, `src/services/dataRepository.ts:62-95` |
| **Google Workspace OAuth** | Tích hợp Gmail API (`https://www.googleapis.com/auth/gmail.send`) phía trình duyệt qua Google Identity Services (GIS) | `[VERIFIED]` | `src/services/gmailService.ts:1-95` |
| **Quy mô mã nguồn (Baseline GĐ 0)** | Tổng **204 tệp**; `src/` có **76 tệp** (**143,098 dòng**); `public/` có **129 tệp** (**123,820,430 bytes**) | `[VERIFIED]` | `_audit/00_PROGRESS_LOG.md`, `_audit/backup_0_original/CHECKSUMS.txt` |
| **Quy mô mã nguồn (Sau GĐ 4)** | `src/` còn **73 tệp** (xóa 3 component chết + 1 file rỗng gốc); `public/` còn **60 tệp** (**68,577,364 bytes**, giảm **55.24 MB / 44.6%**) | `[VERIFIED]` | `_audit/03_ASSET_MANIFEST.json`, `_audit/04_CODE_CLEANUP_REPORT.md` |

---

## 2. Sơ đồ Điều hướng & Kiến trúc Phân hệ (`src/App.tsx` & `WarmLightWorkspace.tsx`) `[VERIFIED]`

Ứng dụng vận hành qua 3 chế độ xem cấp cao (`AppView`: `home`, `workspace`, `analytics`) và 10 chuyên mục bên trong `WarmLightWorkspace`:

1. **`dashboard` (Trang Nhất — Tòa Soạn Học Thuật)**: Bố cục 2 cột báo chí cổ điển (Cột trái: Bài tâm điểm `SPOTLIGHT_WORDS` + Khung tra cứu; Cột phải: Bảng tiến độ `THE EDITORIAL PROGRESS & LAUREL CREST` + Lộ trình tuần). **Không có đồng hồ đếm giờ** theo đúng quy chuẩn thiết kế mục 3.2 `[VERIFIED: src/components/WarmLightWorkspace.tsx:660-1390]`.
2. **`directory` (Kho Chữ & Thuật Ngữ)**: Tra cứu toàn bộ **3,666** mục từ học thuật, lọc theo CEFR (`B1–C2`), từ loại, chuyên đề, tích hợp phát âm TTS và lưu sổ từ `[VERIFIED: src/components/WarmLightWorkspace.tsx:1395-1515]`.
3. **`expanded-library` (Quy Chuẩn Hành Văn — 77 Cấu Trúc & Cẩm Nang VSTEP)**: Khung tiêu đề khắc gỗ `HorizonEngravingHeader` (Nhà thờ Đức Bà Sài Gòn) + đồng hồ tròn góc phải trên (`clock-only`) `[VERIFIED: src/components/ExpandedExamplesLibrary.tsx:310-375]`.
4. **`flashcard` (Thẻ Hồ Sơ Lưu Trữ — Spaced Repetition SM-2)**: Ôn tập thẻ lật 2 mặt kết hợp thuật toán lặp lại ngắt quãng (`easeFactor`, `intervalDays`, `nextReviewAt`) `[VERIFIED: src/components/FlashcardsMode.tsx:1-420]`.
5. **`quiz` (Thẩm Định Ngữ Nghĩa — Context Completion)**: Trắc nghiệm điền từ vào ngữ cảnh học thuật `[VERIFIED: src/components/QuizMode.tsx:1-360]`.
6. **`matching` (Sơ Đồ Liên Đới — Interactive Node Matching)**: Ghép nối từ vựng – nghĩa – cụm từ với đồng hồ tròn góc phải trên `[VERIFIED: src/components/InteractiveNodeMatching.tsx:205-260]`.
7. **`distinctions` (Chuyên Đề Học Thuật — Tricky Distinctions & Grammar Tips)**: Phân biệt từ dễ nhầm lẫn và quy tắc ngữ pháp `[VERIFIED: src/components/GrammarAndDistinctions.tsx:1-450]`.
8. **`challenge-60` (Lộ Trình 60 Ngày — Thực tế 66 Ngày + 28 Bộ Đề Speaking VSTEP)**: Reading, Vocabulary, Writing Task 2 (chấm điểm AI / tiêu chí), Speaking Part 1–2–3 `[VERIFIED: src/components/Ielts60DayChallenge.tsx:1-1450]`.
9. **`collocations` (Cụm Từ Cố Định)** & **`mistakes` (Sổ Tay Hiệu Đính)**: Trắc nghiệm Collocations và kho câu sai cá nhân `[VERIFIED: src/components/CollocationsQuiz.tsx:1-260, src/components/MistakeBank.tsx:1-290]`.

---

## 3. Danh sách Chi tiết 10 Phát hiện Kiểm định (P0 → P2) `[VERIFIED]`

### 🔴 Mức P0 — Nghiêm trọng (Bảo mật & Toàn vẹn dữ liệu)

| Mã | Phân loại | Vị trí (`file:line`) | Mô tả chi tiết & Tác động | Trạng thái xử lý |
| :--- | :--- | :--- | :--- | :--- |
| **F-001** | Security (Hardcoded Secret & `VITE_` Key Exposure) | `src/utils/adminAuth.ts:17,36`<br>`server.ts:26`<br>`server.js:22` | `adminAuth.ts` nhúng cứng khóa mật khẩu dự phòng dạng văn bản thuần trong bundle trình duyệt; `server.ts` và `server.js` đọc `process.env.VITE_ELEVENLABS_API_KEY`, khuyến khích đặt tiền tố `VITE_` làm lộ khóa API ra client. | **ĐÃ SỬA `[VERIFIED]`**: Xóa hoàn toàn hằng số mật khẩu dự phòng khỏi `src/utils/adminAuth.ts`; xóa nhánh fallback `VITE_ELEVENLABS_API_KEY` trong `server.ts` và `server.js`. |
| **F-002** | Data Integrity (Mất dữ liệu Speaking khi Cloud Sync) | `src/services/dataRepository.ts:588-649, 911-925, 1189-1202` | Trong `syncChallenge60State` (`line 1561-1568`), dữ liệu `speakingDrafts` và `speakingHistory` được đóng gói vào thuộc tính `__speakingDrafts` và `__speakingHistory` bên trong cột JSONB `writing_drafts` và `writing_history`. Tuy nhiên, hàm `syncAllDataWithCloud` khi tải về (`line 915-916`) không tách hai khóa này ra (khiến `Number('__speakingDrafts')` thành `NaN`), và khi đẩy lên (`line 1196-1197`) lại ghi đè `writing_drafts` / `writing_history` mà không có `__speakingDrafts` / `__speakingHistory`, làm mất sạch bài nháp và lịch sử Speaking của học viên. | **ĐÃ SỬA `[VERIFIED]`**: Tách tường minh `__speakingDrafts` và `__speakingHistory` khi pull, lọc khóa số hợp lệ (`Number.isFinite(day)`) trong `mergeChallengeProgress`, và bảo toàn cả hai trường khi upsert lên Supabase. |

### 🟠 Mức P1 — Quan trọng (Chức năng, Bảo mật XSS, UI & Tương thích Runtime)

| Mã | Phân loại | Vị trí (`file:line`) | Mô tả chi tiết & Tác động | Trạng thái xử lý |
| :--- | :--- | :--- | :--- | :--- |
| **F-003** | Data Integrity (Kẹp cứng ngày học ở mốc 60) | `src/services/customContentStore.ts:143, 286` | `CHALLENGE_60_DAYS` thực tế có **66 ngày** (Ngày 61–66 là phần mở rộng PDF) và trình nạp hàng loạt (`line 433`) cho phép tới ngày `3650`, nhưng `addCustomVocabItem` (`line 143`) và `saveCustomChallengeDayOverride` (`line 286`) lại giới hạn `<= 60` / `Math.min(60, override.day)`, khiến mọi chỉnh sửa cho Ngày 61–66 bị ghi đè nhầm vào Ngày 60. | **ĐÃ SỬA `[VERIFIED]`**: Mở rộng giới hạn ngày hợp lệ lên `1..3650` đồng nhất trên toàn bộ `customContentStore.ts`. |
| **F-004** | Security (DOM XSS qua Email HTML Preview) | `src/services/gmailService.ts:507-510, 562, 588`<br>`src/components/analytics/GmailWorkspaceModal.tsx:404` | Hàm `buildMagazineEditorialEmailHtml()` nội suy trực tiếp `studentName`, `customNote`, `w.word`, `w.ipa`, `w.meaning`, `w.statusLabel` vào chuỗi HTML rồi hiển thị qua `dangerouslySetInnerHTML` trong `GmailWorkspaceModal.tsx:404`. Nếu tên người dùng hoặc ghi chú chứa thẻ `<script>` / `<img onerror=...>`, mã độc sẽ thực thi. | **ĐÃ SỬA `[VERIFIED]`**: Bổ sung hàm `escapeHtml()` chuẩn hóa `& < > " '` cho toàn bộ biến đầu vào trước khi dựng chuỗi HTML. |
| **F-005** | UI / Design Regression (Đồng hồ nổi trên Trang Nhất) | `src/App.tsx:12, 264`<br>`src/components/GlobalFloatingTimer.tsx` | `<GlobalFloatingTimer />` được gắn ở cấp cao nhất trong `src/App.tsx`, hiển thị một đồng hồ nổi trên mọi trang kể cả **Trang Nhất (`dashboard`)**, vi phạm yêu cầu của người dùng (Request #8/#9 và Mục 3.2: *"Không đưa đồng hồ học tập trở lại trang chủ"*). | **ĐÃ SỬA `[VERIFIED]`**: Gỡ bỏ `<GlobalFloatingTimer />` khỏi `src/App.tsx` và xóa tệp `src/components/GlobalFloatingTimer.tsx` theo quy trình 6 cổng. |
| **F-006** | Broken Asset / Network 404 | `index.html:8-9` | Thẻ `<link rel="icon">` và `<link rel="apple-touch-icon">` trỏ tới `/assets/aistudio/qFY04.jpg` không tồn tại trên đĩa, gây lỗi 404 trên mọi lần tải trang. Ngoài ra `<title>` chưa đồng bộ với `metadata.json`. | **ĐÃ SỬA `[VERIFIED]`**: Trỏ icon về `/assets/vintage-editorial/mascot/cat-graduation-cap.jpg` (tệp hợp lệ có sẵn) và đồng bộ `<title>` + `<meta description>` khớp `metadata.json`. |
| **F-007** | Runtime Compatibility (Crash khi chạy script Node/CLI) | `src/services/supabaseClient.ts:19-20`<br>`src/utils/adminAuth.ts:25, 36` | Truy cập `import.meta.env.VITE_*` không có toán tử `?.` gây lỗi `TypeError: Cannot read properties of undefined` khi các mô-đun dữ liệu được nạp qua `tsx` hoặc công cụ kiểm định dòng lệnh. | **ĐÃ SỬA `[VERIFIED]`**: Sử dụng `import.meta.env?.VITE_*` an toàn trên mọi môi trường. |

### 🟡 Mức P2 — Cải thiện Chất lượng Nội dung & Đồng bộ Giao diện

| Mã | Phân loại | Vị trí (`file:line`) | Mô tả chi tiết & Tác động | Trạng thái xử lý |
| :--- | :--- | :--- | :--- | :--- |
| **F-008** | Broken Reference in Protected Data Files | `src/data/expandedPdfLibraryData.ts:85`<br>`src/data/vstepPdfKnowledgeBankData.ts:203` | Hai hằng số metadata trỏ tới `/assets/aistudio/Untitled_document_bb0198f5.pdf` và `/assets/aistudio/_n_thi_vstep_11d6f8c6.pdf` không có file `.pdf` nhị phân trong `public/assets/aistudio/` (dù 100% nội dung bài học đã được trích xuất đầy đủ trong mã TypeScript). | **GHI NHẬN TRONG `11_DECISIONS_NEEDED.md` `[VERIFIED]`**: Không sửa trực tiếp 2 tệp trong danh sách bảo vệ mục 3.1 để bảo toàn 100% checksum gốc. |
| **F-009** | Content Typo (Sai chính tả từ học thuật tiêu điểm) | `src/components/WarmLightWorkspace.tsx:108, 116` | Mục từ tiêu điểm đầu tiên trên Trang Nhất (`id: 'spot-conducive'`, IPA `/kənˈdʒuː.sɪv/`, nghĩa *"Tạo điều kiện thuận lợi"*) bị gõ nhầm `word: 'conductive'` (dẫn điện/nhiệt) thay vì `'conducive'`. | **ĐÃ SỬA `[VERIFIED]`**: Đã sửa `'conductive'` → `'conducive'` tại `WarmLightWorkspace.tsx:108,116`. |
| **F-010** | UI Consistency (`CollocationsQuiz` & `MistakeBank`) | `src/components/CollocationsQuiz.tsx:152-182`<br>`src/components/MistakeBank.tsx:136-166` | Hai trang con `Cụm Từ Cố Định` và `Sổ Tay Hiệu Đính` vẫn dùng `ActiveSessionBar` kiểu cũ thay vì `HorizonEngravingHeader` như 7 chuyên mục còn lại. | **GHI NHẬN TRONG `11_DECISIONS_NEEDED.md` `[VERIFIED]`**: Giữ nguyên theo nguyên tắc bảo수 mục 3.2 (chỉ đổi bố cục trang khi người dùng yêu cầu). |

---

## 4. Kiểm định Bảo mật & Biến môi trường (`.env.example`, Firebase & Supabase) `[VERIFIED]`

- **Không lộ khóa bí mật (`service_role`, `GEMINI_API_KEY`, `ELEVENLABS_API_KEY`) ở Frontend `[VERIFIED]`**:
  - `src/services/supabaseClient.ts:26-44` có hàm `detectServiceRoleLeak()` tự động khóa kết nối nếu người dùng dán nhầm `service_role` hoặc `sb_secret_` vào `VITE_SUPABASE_ANON_KEY`.
  - `GEMINI_API_KEY` và `ELEVENLABS_API_KEY` chỉ được đọc trong `server.ts` (`process.env.GEMINI_API_KEY`, `process.env.ELEVENLABS_API_KEY`).
- **Trạng thái Firebase vs Supabase `[VERIFIED]`**:
  - Dự án có tệp cấu hình `firebase-applet-config.json` và `firestore.rules` ở thư mục gốc nhưng **0 tệp nào trong `src/` import Firebase SDK** (`package.json` không cài `firebase`). Toàn bộ tầng xác thực và cơ sở dữ liệu đám mây trong code sử dụng **Supabase** (`@supabase/supabase-js`). Nội dung này được đưa vào `11_DECISIONS_NEEDED.md` để người dùng quyết định giữ hay dọn 2 tệp cấu hình Firebase.

---

## 5. Kết quả Kiểm định Build & Type-Check sau Sửa lỗi `[VERIFIED]`

- `bun run lint` (`tsc --noEmit`): **PASS (0 lỗi TypeScript)** `[VERIFIED]`.
- `bun run build` (`vite build`): **PASS (3.77s, 3,153 modules)** `[VERIFIED]`:
  - `dist/index.html`: `2.15 kB` (gzip `0.96 kB`)
  - `dist/assets/index-C6vrwiNx.css`: `93.81 kB` (gzip `17.66 kB` — giảm `10.87 kB` so với baseline `104.68 kB`)
  - `dist/assets/vendor-C0sByh3C.js`: `1,319.29 kB` (gzip `386.39 kB`)
  - `dist/assets/index-cTstxOEM.js`: `5,054.03 kB` (gzip `1,387.42 kB` — giảm `9.42 kB` so với baseline `5,063.45 kB`, trong đó ~4.4 MB là dữ liệu học thuật tĩnh nhúng sẵn để hoạt động 100% Offline/Local Mode).
