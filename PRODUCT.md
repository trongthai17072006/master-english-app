# PRODUCT.md — MASTER English (Grounded via Impeccable)

## 1. Product Identity & Mission
- **Product Name:** MASTER English
- **Tagline:** Better Me. Everyday. • Phương pháp tư duy logic & phản xạ từ vựng IELTS Band 7.0+
- **Category:** High-Craft Academic EdTech & IELTS Preparation Workspace
- **Primary Audience:** Học viên Việt Nam ôn luyện IELTS Academic (mục tiêu Band 6.5 – 8.0+) và VSTEP (B1 – C1), cần hệ thống học từ vựng học thuật C1–C2, rèn phản xạ nhanh, viết luận Task 2 và theo dõi lộ trình 60 ngày có kỷ luật.

## 2. Core Product Loops
1. **Dashboard Workspace (`/dashboard`):**
   - **Phiên Học Live (`ActiveSessionBar`):** Đồng hồ đếm thời gian học thực tế, tự động ghi nhận số từ mới, số từ ôn tập, câu hỏi hoàn thành và lưu lịch sử phiên học (`#001`, `#002`, ...) theo thời gian thực.
   - **Lộ Trình 60 Ngày Tóm Tắt & Spotlight Từ Vựng Trọng Tâm:** Hiển thị tiến độ 60 ngày và từ vựng học thuật tiêu điểm trong ngày kèm Collocations, Word Family, Register và ví dụ IELTS Writing/Speaking.
   - **Chế Độ Luyện Tập Phản Xạ:** Speed Quiz, Collocations & Giới Từ, Phân Biệt Từ (Distinctions), Nối Từ Tương Tác (Node Matching), Ngữ Cảnh IELTS, Flashcard 3D và Ngân Hàng Lỗi Sai.
2. **Kho Từ Điển Học Thuật Độc Lập (`/dictionary`):**
   - 3.650 từ vựng chuẩn Cambridge/Oxford (B1 – C2) và hệ thống chủ điểm Ngữ Pháp học thuật.
   - Phân tách rõ 4 phân mục: `Cần Học`, `Đã Thuộc`, `Toàn Bộ`, `Ngữ Pháp` kèm bộ lọc Chủ đề, Loại từ, Band CEFR và giải thích chuyên sâu cùng Live AI Tutor.
3. **IELTS 60-Day Challenge Độc Lập (`/ielts-60-day`):**
   - Lộ trình 60 ngày toàn diện 5 kỹ năng (**Từ vựng, Listening, Reading, Writing Task 2, Speaking**) với thanh tiến độ từng kỹ năng, bản đồ 60 ngày, mục tiêu học tập hằng ngày, thống kê streak và lịch sử hoàn thành nhiệm vụ.
4. **Analytics Hub (`/analytics`) & Lịch Học Tuần (`/schedule`):**
   - Báo cáo chuyên sâu thời lượng học thực tế, tốc độ làm chủ từ vựng và phân bổ lịch học trong tuần.

## 3. Architectural Invariants
- **Shared Layout + Independent Pages:** Toàn bộ ứng dụng chỉ sử dụng **1 Global Header** và **1 Left Sidebar** dùng chung. Khi điều hướng sang `/dictionary` hoặc `/ielts-60-day`, trang con được render độc lập chiếm 100% chiều rộng `Main Content`, tuyệt đối không lồng bên trong Dashboard.
- **Real Data Persistence:** Mọi thao tác đánh dấu thuộc từ, kết thúc phiên học, làm bài Writing hay hoàn thành nhiệm vụ 60 ngày đều đồng bộ trực tiếp vào bộ nhớ lưu trữ và giữ nguyên khi tải lại trang (`F5`).
