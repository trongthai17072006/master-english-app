-- ============================================================================
-- MASTER ENGLISH IELTS — SUPABASE CLOUD SCHEMA & RLS POLICIES (PHASE 3)
-- ============================================================================
-- Hướng dẫn sử dụng:
-- 1. Mở Supabase Dashboard -> chọn Project của bạn -> vào mục "SQL Editor".
-- 2. Tạo "New query", dán toàn bộ nội dung file này vào và nhấn "Run" (Ctrl+Enter).
-- 3. Script này được thiết kế Idempotent (an toàn khi chạy nhiều lần, không làm mất dữ liệu).
-- 4. Tất cả các bảng đều bật Row Level Security (RLS) và giới hạn nghiêm ngặt:
--    auth.uid() = user_id (Người dùng chỉ đọc/ghi dữ liệu của chính mình).
-- ============================================================================

-- 1. Hàm tự động cập nhật cột updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

-- ============================================================================
-- BẢNG 1: public.user_profiles
-- Lưu trữ: master_english_user_profile_v2, master_english_theme_v2,
--          master_english_theme_preference_v2, master_english_report_recipient_v1,
--          leximaster_mastered_words_v1, leximaster_card_status_v1
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Học Viên IELTS',
  email TEXT NOT NULL DEFAULT '',
  gender TEXT NOT NULL DEFAULT 'Nữ',
  dob TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT 'Việt Nam',
  student_category TEXT NOT NULL DEFAULT 'Sinh viên Đại học',
  current_level TEXT NOT NULL DEFAULT 'Upper-Intermediate (Band 7.0)',
  exam_target TEXT NOT NULL DEFAULT 'IELTS Academic',
  target_band TEXT NOT NULL DEFAULT 'BAND 8.5+',
  words_per_session_goal INTEGER NOT NULL DEFAULT 15,
  daily_study_minutes_goal INTEGER NOT NULL DEFAULT 45,
  avatar_pose TEXT NOT NULL DEFAULT 'welcome-heart',
  custom_avatar_url TEXT NOT NULL DEFAULT '',
  theme_preference TEXT NOT NULL DEFAULT 'light',
  report_recipient JSONB NOT NULL DEFAULT '{}'::jsonb,
  mastered_words_v1 JSONB NOT NULL DEFAULT '[]'::jsonb,
  card_status_v1 JSONB NOT NULL DEFAULT '{}'::jsonb,
  profile_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  client_updated_at BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

DROP TRIGGER IF EXISTS set_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER set_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_profiles_select_own" ON public.user_profiles;
CREATE POLICY "user_profiles_select_own" ON public.user_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_profiles_insert_own" ON public.user_profiles;
CREATE POLICY "user_profiles_insert_own" ON public.user_profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_profiles_update_own" ON public.user_profiles;
CREATE POLICY "user_profiles_update_own" ON public.user_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_profiles_delete_own" ON public.user_profiles;
CREATE POLICY "user_profiles_delete_own" ON public.user_profiles
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- BẢNG 2: public.study_sessions
-- Lưu trữ: master_english_sessions_v2 (Lịch sử các phiên học đã hoàn thành)
-- Khóa chính kép (user_id, id) đảm bảo chống trùng lặp tuyệt đối khi đồng bộ
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.study_sessions (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  start_time BIGINT NOT NULL,
  end_time BIGINT NOT NULL,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  target_minutes INTEGER NOT NULL DEFAULT 45,
  date_string TEXT NOT NULL,
  topics JSONB NOT NULL DEFAULT '[]'::jsonb,
  words_mastered JSONB NOT NULL DEFAULT '[]'::jsonb,
  words_reviewed JSONB NOT NULL DEFAULT '[]'::jsonb,
  quiz_questions_answered INTEGER NOT NULL DEFAULT 0,
  quiz_questions_correct INTEGER NOT NULL DEFAULT 0,
  flashcards_flipped INTEGER NOT NULL DEFAULT 0,
  mistakes_resolved INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed',
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (user_id, id)
);

CREATE INDEX IF NOT EXISTS idx_study_sessions_user_date
  ON public.study_sessions (user_id, date_string DESC);

DROP TRIGGER IF EXISTS set_study_sessions_updated_at ON public.study_sessions;
CREATE TRIGGER set_study_sessions_updated_at
  BEFORE UPDATE ON public.study_sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "study_sessions_select_own" ON public.study_sessions;
CREATE POLICY "study_sessions_select_own" ON public.study_sessions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "study_sessions_insert_own" ON public.study_sessions;
CREATE POLICY "study_sessions_insert_own" ON public.study_sessions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "study_sessions_update_own" ON public.study_sessions;
CREATE POLICY "study_sessions_update_own" ON public.study_sessions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "study_sessions_delete_own" ON public.study_sessions;
CREATE POLICY "study_sessions_delete_own" ON public.study_sessions
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- BẢNG 3: public.active_sessions
-- Lưu trữ: master_english_active_session_v2 (Phiên học đang diễn ra / tạm dừng)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.active_sessions (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  payload JSONB,
  last_active_timestamp BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

DROP TRIGGER IF EXISTS set_active_sessions_updated_at ON public.active_sessions;
CREATE TRIGGER set_active_sessions_updated_at
  BEFORE UPDATE ON public.active_sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "active_sessions_select_own" ON public.active_sessions;
CREATE POLICY "active_sessions_select_own" ON public.active_sessions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "active_sessions_insert_own" ON public.active_sessions;
CREATE POLICY "active_sessions_insert_own" ON public.active_sessions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "active_sessions_update_own" ON public.active_sessions;
CREATE POLICY "active_sessions_update_own" ON public.active_sessions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "active_sessions_delete_own" ON public.active_sessions;
CREATE POLICY "active_sessions_delete_own" ON public.active_sessions
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- BẢNG 4: public.word_progress
-- Lưu trữ: master_english_word_progress_v2 (Tiến độ SRS từng từ vựng)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.word_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id TEXT NOT NULL,
  word TEXT NOT NULL,
  ipa TEXT NOT NULL DEFAULT '',
  meaning TEXT NOT NULL DEFAULT '',
  level TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'learning',
  times_reviewed INTEGER NOT NULL DEFAULT 0,
  first_mastered_at BIGINT,
  last_reviewed_at BIGINT NOT NULL DEFAULT 0,
  history JSONB NOT NULL DEFAULT '[]'::jsonb,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (user_id, word_id)
);

CREATE INDEX IF NOT EXISTS idx_word_progress_user_last_reviewed
  ON public.word_progress (user_id, last_reviewed_at DESC);

DROP TRIGGER IF EXISTS set_word_progress_updated_at ON public.word_progress;
CREATE TRIGGER set_word_progress_updated_at
  BEFORE UPDATE ON public.word_progress
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.word_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "word_progress_select_own" ON public.word_progress;
CREATE POLICY "word_progress_select_own" ON public.word_progress
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "word_progress_insert_own" ON public.word_progress;
CREATE POLICY "word_progress_insert_own" ON public.word_progress
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "word_progress_update_own" ON public.word_progress;
CREATE POLICY "word_progress_update_own" ON public.word_progress
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "word_progress_delete_own" ON public.word_progress;
CREATE POLICY "word_progress_delete_own" ON public.word_progress
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- BẢNG 5: public.mistakes_notebook
-- Lưu trữ: leximaster_mistakes_v1 (Sổ tay lỗi sai Quiz / Grammar / Vocab)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.mistakes_notebook (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  question TEXT NOT NULL DEFAULT '',
  user_answer TEXT NOT NULL DEFAULT '',
  correct_answer TEXT NOT NULL DEFAULT '',
  explanation TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  timestamp BIGINT NOT NULL DEFAULT 0,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (user_id, id)
);

DROP TRIGGER IF EXISTS set_mistakes_notebook_updated_at ON public.mistakes_notebook;
CREATE TRIGGER set_mistakes_notebook_updated_at
  BEFORE UPDATE ON public.mistakes_notebook
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.mistakes_notebook ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mistakes_notebook_select_own" ON public.mistakes_notebook;
CREATE POLICY "mistakes_notebook_select_own" ON public.mistakes_notebook
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "mistakes_notebook_insert_own" ON public.mistakes_notebook;
CREATE POLICY "mistakes_notebook_insert_own" ON public.mistakes_notebook
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "mistakes_notebook_update_own" ON public.mistakes_notebook;
CREATE POLICY "mistakes_notebook_update_own" ON public.mistakes_notebook
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "mistakes_notebook_delete_own" ON public.mistakes_notebook;
CREATE POLICY "mistakes_notebook_delete_own" ON public.mistakes_notebook
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- BẢNG 6: public.user_stats
-- Lưu trữ: leximaster_stats_v1 (Thống kê Quiz lũy kế)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  quizzes_taken INTEGER NOT NULL DEFAULT 0,
  total_questions_answered INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  client_updated_at BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

DROP TRIGGER IF EXISTS set_user_stats_updated_at ON public.user_stats;
CREATE TRIGGER set_user_stats_updated_at
  BEFORE UPDATE ON public.user_stats
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_stats_select_own" ON public.user_stats;
CREATE POLICY "user_stats_select_own" ON public.user_stats
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_stats_insert_own" ON public.user_stats;
CREATE POLICY "user_stats_insert_own" ON public.user_stats
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_stats_update_own" ON public.user_stats;
CREATE POLICY "user_stats_update_own" ON public.user_stats
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_stats_delete_own" ON public.user_stats;
CREATE POLICY "user_stats_delete_own" ON public.user_stats
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- BẢNG 7: public.challenge_60_progress
-- Lưu trữ: ielts_60_day_challenge_state_v1 (Lộ trình 60 Ngày + Bài viết Writing)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.challenge_60_progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  active_day INTEGER NOT NULL DEFAULT 1,
  streak INTEGER NOT NULL DEFAULT 0,
  last_active_date TEXT,
  day_statuses JSONB NOT NULL DEFAULT '{}'::jsonb,
  writing_drafts JSONB NOT NULL DEFAULT '{}'::jsonb,
  writing_history JSONB NOT NULL DEFAULT '{}'::jsonb,
  mastered_vocab_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  client_updated_at BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

DROP TRIGGER IF EXISTS set_challenge_60_progress_updated_at ON public.challenge_60_progress;
CREATE TRIGGER set_challenge_60_progress_updated_at
  BEFORE UPDATE ON public.challenge_60_progress
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.challenge_60_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "challenge_60_progress_select_own" ON public.challenge_60_progress;
CREATE POLICY "challenge_60_progress_select_own" ON public.challenge_60_progress
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "challenge_60_progress_insert_own" ON public.challenge_60_progress;
CREATE POLICY "challenge_60_progress_insert_own" ON public.challenge_60_progress
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "challenge_60_progress_update_own" ON public.challenge_60_progress;
CREATE POLICY "challenge_60_progress_update_own" ON public.challenge_60_progress
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "challenge_60_progress_delete_own" ON public.challenge_60_progress;
CREATE POLICY "challenge_60_progress_delete_own" ON public.challenge_60_progress
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- BẢNG 8: public.workspace_todos
-- Lưu trữ: master_english_workspace_todos_v1 (Danh sách nhiệm vụ lịch học)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.workspace_todos (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  todo_id BIGINT NOT NULL,
  text TEXT NOT NULL DEFAULT '',
  date TEXT NOT NULL DEFAULT '',
  done BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (user_id, todo_id)
);

DROP TRIGGER IF EXISTS set_workspace_todos_updated_at ON public.workspace_todos;
CREATE TRIGGER set_workspace_todos_updated_at
  BEFORE UPDATE ON public.workspace_todos
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.workspace_todos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "workspace_todos_select_own" ON public.workspace_todos;
CREATE POLICY "workspace_todos_select_own" ON public.workspace_todos
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "workspace_todos_insert_own" ON public.workspace_todos;
CREATE POLICY "workspace_todos_insert_own" ON public.workspace_todos
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "workspace_todos_update_own" ON public.workspace_todos;
CREATE POLICY "workspace_todos_update_own" ON public.workspace_todos
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "workspace_todos_delete_own" ON public.workspace_todos;
CREATE POLICY "workspace_todos_delete_own" ON public.workspace_todos
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- BẢNG 9: public.curriculum_custom_content (RBAC — ADMIN WRITE ONLY / PUBLIC READ)
-- Lưu trữ: Từ vựng mở rộng, Cấu trúc ngữ pháp #78+, và Lộ trình 60 Ngày mở rộng.
-- - Học viên & Khách (anon, authenticated): CHỈ CÓ QUYỀN ĐỌC (SELECT).
-- - Duy nhất Admin (email khớp với VITE_ADMIN_EMAIL): CÓ QUYỀN GHI (INSERT/UPDATE/DELETE).
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.curriculum_custom_content (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('vocab', 'structures', 'challenge_day')),
  target_day INTEGER,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by_email TEXT NOT NULL DEFAULT 'trongthai17072006@gmail.com',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

DROP TRIGGER IF EXISTS set_curriculum_custom_content_updated_at ON public.curriculum_custom_content;
CREATE TRIGGER set_curriculum_custom_content_updated_at
  BEFORE UPDATE ON public.curriculum_custom_content
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.curriculum_custom_content ENABLE ROW LEVEL SECURITY;

-- 1. Quyền ĐỌC (Read-Only): Mọi học viên đều có thể đọc kho từ vựng, cấu trúc và lộ trình
DROP POLICY IF EXISTS "curriculum_public_read_only" ON public.curriculum_custom_content;
CREATE POLICY "curriculum_public_read_only" ON public.curriculum_custom_content
  FOR SELECT TO anon, authenticated
  USING (true);

-- 2. Quyền THÊM MỚI (INSERT): Tuyệt đối chỉ duy nhất Admin
DROP POLICY IF EXISTS "curriculum_admin_insert_only" ON public.curriculum_custom_content;
CREATE POLICY "curriculum_admin_insert_only" ON public.curriculum_custom_content
  FOR INSERT TO authenticated
  WITH CHECK (lower(auth.jwt() ->> 'email') = 'trongthai17072006@gmail.com');

-- 3. Quyền CẬP NHẬT (UPDATE): Tuyệt đối chỉ duy nhất Admin
DROP POLICY IF EXISTS "curriculum_admin_update_only" ON public.curriculum_custom_content;
CREATE POLICY "curriculum_admin_update_only" ON public.curriculum_custom_content
  FOR UPDATE TO authenticated
  USING (lower(auth.jwt() ->> 'email') = 'trongthai17072006@gmail.com')
  WITH CHECK (lower(auth.jwt() ->> 'email') = 'trongthai17072006@gmail.com');

-- 4. Quyền XÓA (DELETE): Tuyệt đối chỉ duy nhất Admin
DROP POLICY IF EXISTS "curriculum_admin_delete_only" ON public.curriculum_custom_content;
CREATE POLICY "curriculum_admin_delete_only" ON public.curriculum_custom_content
  FOR DELETE TO authenticated
  USING (lower(auth.jwt() ->> 'email') = 'trongthai17072006@gmail.com');

-- ============================================================================
-- HOÀN TẤT KHỞI TẠO SCHEMA & RLS CHO MASTER ENGLISH IELTS
-- ============================================================================

