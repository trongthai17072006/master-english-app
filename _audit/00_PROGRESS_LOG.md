# 📋 NHẬT KÝ TIẾN ĐỘ KIỂM ĐỊNH & CHUẨN HÓA DỮ LIỆU (`00_PROGRESS_LOG.md`)

## Tóm tắt điều hành (Executive Summary)
Nhật ký này ghi lại toàn bộ tiến trình thực thi 6 giai đoạn (GĐ 0 → GĐ 6) cho dự án **LexiMaster IELTS (MASTER English)** theo quy chuẩn 3-Agent độc lập. Toàn bộ 4 điểm sao lưu (`backup_0_original`, `backup_1_pre_fixes`, `backup_2_pre_cleanup`, `backup_3_pre_data_norm`), 12 giao phẩm kiểm định trong `_audit/`, gói dữ liệu chuẩn hóa **5,087 bản ghi** trong `_audit/08_SUPABASE_IMPORT/`, và kiểm định biên dịch (`compile_applet` + `lint_applet`) đều đã hoàn tất 100% với **0 lỗi** và **bảo toàn nguyên vẹn 100% mã băm SHA-256 của toàn bộ 17 tệp dữ liệu gốc** `[VERIFIED]`.

---

## 1. Kiểm tra Công cụ Môi trường & Hệ thống (GĐ 0) `[VERIFIED]`
- **Thời gian bắt đầu**: `2026-11-05T15:39:12Z`
- **Công cụ có sẵn `[VERIFIED]`**:
  - `git`: `/usr/bin/git` (Lưu ý: dự án không khởi tạo `.git` -> áp dụng chiến lược Snapshot Tarball + SHA-256 Checksums tại `_audit/backup_*`)
  - `node`: `v22.22.0`
  - `npm`: `10.9.4`
  - `bun`: `1.4.4` (Package manager chính vì có `bun.lock`)
  - `npx` / `tsx`: Có sẵn
  - `python3`: `3.11+` (Dùng cho Agent C kiểm toán độc lập `verify_export_counts.py`)
  - `psql`, `supabase`, `sqlite3`: Không cài đặt trong container (`[NOT VERIFIED]` cho thực thi SQL trực tiếp trên DB engine; đã cung cấp bộ script SQL chuẩn PostgreSQL 15+ kèm truy vấn kiểm định).

---

## 2. Điểm Sao lưu (Checkpoints) & Baseline `[VERIFIED]`
- **Checkpoint 0 (`_audit/backup_0_original/`)**:
  - `snapshot_0_original.tar.gz` (`118 MB`) + `CHECKSUMS.txt` (SHA-256 của toàn bộ **204 tệp** gốc) `[VERIFIED]`.
- **Baseline trước khi chạm vào code `[VERIFIED]`**:
  - Tổng số tệp: **204** (`src/`: **76 tệp / 143,098 dòng**; `public/`: **129 tệp / 123.82 MB**).
  - `bun run lint` (`tsc --noEmit`): **PASS (0 lỗi)**.
  - `bun run build` (`vite build`): **PASS (4.43s, 3,154 modules)**.
- **Checkpoint 1 (`_audit/backup_1_pre_fixes/`)**:
  - `snapshot_1_pre_fixes.tar.gz` + `CHECKSUMS.txt` (10 tệp mã nguồn trước khi vá lỗi P0/P1) `[VERIFIED]`.
- **Checkpoint 2 (`_audit/backup_2_pre_cleanup/`)**:
  - `snapshot_2_pre_cleanup.tar.gz` + `CHECKSUMS.txt` + `DUPLICATE_ASSETS_REMOVED.json` `[VERIFIED]`.
- **Checkpoint 3 (`_audit/backup_3_pre_data_norm/`)**:
  - Lưu trữ `CHECKSUMS.txt` đối chiếu bảo toàn 17 tệp dữ liệu gốc trong `src/data/` `[VERIFIED]`.

---

## 3. Tiến độ Thực thi 6 Giai đoạn (GĐ 0 → GĐ 6) `[VERIFIED]`

| Giai đoạn | Nội dung thực hiện | Trạng thái | Kết quả & Giao phẩm chính |
| :--- | :--- | :--- | :--- |
| **GĐ 0** | Khảo sát môi trường, tạo `backup_0_original`, đo Baseline | **HOÀN TẤT `[VERIFIED]`** | `_audit/00_PROGRESS_LOG.md`, `_audit/backup_0_original/snapshot_0_original.tar.gz` |
| **GĐ 1** | Khám phá & Lập bản đồ dự án (Routes, Components, Services, Data) | **HOÀN TẤT `[VERIFIED]`** | `_audit/01_PROJECT_AUDIT_REPORT.md` (10 phát hiện `F-001..F-010`) |
| **GĐ 2** | Kiểm định nội dung học thuật (5,087 bản ghi) & SHA-256 Asset Dedup | **HOÀN TẤT `[VERIFIED]`** | `_audit/02_CONTENT_INVENTORY.md`, `_audit/03_ASSET_MANIFEST.json` |
| **GĐ 3** | Thiết kế Lược đồ Supabase (21 bảng, RLS, Storage, Indexes) | **HOÀN TẤT `[VERIFIED]`** | `_audit/05_DATA_DICTIONARY.md`, `_audit/06_SUPABASE_SCHEMA.sql` |
| **GĐ 4** | Vá 8 lỗi P0/P1/P2 & Dọn dẹp 6 cổng (4 file code chết + 69 ảnh trùng SHA-256) | **HOÀN TẤT `[VERIFIED]`** | `_audit/04_CODE_CLEANUP_REPORT.md` (Giảm **55.24 MB** trong `public/`) |
| **GĐ 5** | Xuất dữ liệu tất định UUID v5 (Chạy 2 lần khớp 100%) & Kiểm toán độc lập bằng Python | **HOÀN TẤT `[VERIFIED]`** | `_audit/08_SUPABASE_IMPORT/*`, `_audit/07_SUPABASE_MIGRATION_PLAN.md`, `_audit/09_DATA_VALIDATION_REPORT.md`, `_audit/09_VALIDATION_QUERIES.sql` |
| **GĐ 6** | Nghiệm thu cuối cùng (`compile_applet` + `lint_applet`) & bàn giao 12 báo cáo | **HOÀN TẤT `[VERIFIED]`** | `_audit/10_FINAL_QA_REPORT.md`, `_audit/11_DECISIONS_NEEDED.md` |
