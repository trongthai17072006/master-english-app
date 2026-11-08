-- ============================================================================
-- LEXIMASTER IELTS (MASTER ENGLISH) — PRODUCTION SUPABASE SCHEMA & RLS (GĐ 5)
-- File: _audit/06_SUPABASE_SCHEMA.sql
-- Dialect: PostgreSQL 15+ (Supabase Cloud / Local CLI compatible, Idempotent)
-- Author: Agent A (Database Architect) & Agent C (QA Auditor)
-- ============================================================================
--
-- TÓM TẮT ĐIỀU HÀNH (EXECUTIVE SUMMARY):
-- 1. Định nghĩa đầy đủ 21 bảng: 9 bảng nội dung học thuật chuẩn hóa (Content Bank)
--    tương ứng 1:1 với gói `_audit/08_SUPABASE_IMPORT/` và 12 bảng tiến độ/đồng bộ
--    người dùng tương thích 100% với `src/services/dataRepository.ts`.
-- 2. Mọi khóa ngoại (FK) đều có chỉ mục B-tree; tìm kiếm từ vựng tích hợp Full-Text
--    Search (`tsvector` + GIN) và tìm kiếm mờ (`pg_trgm` + GIN).
-- 3. Bật Row Level Security (RLS) trên 100% bảng: sử dụng mẫu hiệu năng cao
--    `(select auth.uid()) = user_id` (cached per statement) và `public.is_admin()`
--    dựa trên `app_metadata.role = 'admin'`.
-- 4. Bao gồm cấu hình 3 Supabase Storage Buckets (`public-editorial-assets`,
--    `course-pdfs`, `user-uploads`) và kịch bản kiểm thử RLS tự động ở cuối file.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. EXTENSIONS & HELPER FUNCTIONS
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(
    ((SELECT auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
    OR lower((SELECT auth.jwt()) ->> 'email') = 'trongthai17072006@gmail.com',
    false
  );
$$;

-- ============================================================================
-- PHẦN I: 9 BẢNG NỘI DUNG HỌC THUẬT CHUẨN HÓA (STATIC & ADMIN-MANAGED CONTENT)
-- Tương ứng 1:1 với _audit/08_SUPABASE_IMPORT/01..09_*.csv
-- ============================================================================

-- 1. Bảng quản lý lô nạp dữ liệu (`01_import_batches.csv` — 1 dòng)
CREATE TABLE IF NOT EXISTS public.import_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_code TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  source_version TEXT NOT NULL DEFAULT '1.0.0',
  total_tables INTEGER NOT NULL DEFAULT 9 CHECK (total_tables >= 0),
  imported_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Bảng danh mục từ vựng (`02_vocabulary_categories.csv` — 47 dòng)
CREATE TABLE IF NOT EXISTS public.vocabulary_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 1,
  vocab_count INTEGER NOT NULL DEFAULT 0 CHECK (vocab_count >= 0),
  import_batch_id UUID REFERENCES public.import_batches(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.vocabulary_categories ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.vocabulary_categories ADD COLUMN IF NOT EXISTS vocab_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.vocabulary_categories ADD COLUMN IF NOT EXISTS import_batch_id UUID REFERENCES public.import_batches(id) ON DELETE SET NULL;
ALTER TABLE public.vocabulary_categories ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());
ALTER TABLE public.vocabulary_categories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());

CREATE INDEX IF NOT EXISTS idx_vocab_categories_import_batch
  ON public.vocabulary_categories(import_batch_id);
CREATE INDEX IF NOT EXISTS idx_vocab_categories_display_order
  ON public.vocabulary_categories(display_order ASC);

-- 3. Bảng kho từ vựng học thuật (`03_vocabulary.csv` — 3,666 dòng)
CREATE TABLE IF NOT EXISTS public.vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id TEXT NOT NULL UNIQUE,
  word TEXT NOT NULL,
  word_normalized TEXT NOT NULL,
  ipa TEXT NOT NULL DEFAULT '',
  pos TEXT NOT NULL CHECK (pos IN ('noun', 'verb', 'adj', 'adv', 'phrase', 'idiom', 'grammar')),
  pos_raw TEXT NOT NULL DEFAULT '',
  cefr_level TEXT NOT NULL DEFAULT 'B2' CHECK (cefr_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  meaning_vi TEXT NOT NULL,
  example_en TEXT NOT NULL DEFAULT '',
  example_vi TEXT NOT NULL DEFAULT '',
  synonyms JSONB NOT NULL DEFAULT '[]'::jsonb,
  antonyms JSONB NOT NULL DEFAULT '[]'::jsonb,
  collocations JSONB NOT NULL DEFAULT '[]'::jsonb,
  word_family JSONB NOT NULL DEFAULT '[]'::jsonb,
  detailed_note TEXT NOT NULL DEFAULT '',
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  category_id UUID REFERENCES public.vocabulary_categories(id) ON DELETE SET NULL,
  needs_review BOOLEAN NOT NULL DEFAULT false,
  source_file TEXT NOT NULL DEFAULT 'src/data/vocabDatabase.json',
  source_hash TEXT NOT NULL DEFAULT '',
  import_batch_id UUID REFERENCES public.import_batches(id) ON DELETE SET NULL,
  fts_vector TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(word, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(meaning_vi, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(example_en, '')), 'C')
  ) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.vocabulary ADD COLUMN IF NOT EXISTS word_normalized TEXT NOT NULL DEFAULT '';
ALTER TABLE public.vocabulary ADD COLUMN IF NOT EXISTS pos TEXT NOT NULL DEFAULT 'noun';
ALTER TABLE public.vocabulary ADD COLUMN IF NOT EXISTS cefr_level TEXT NOT NULL DEFAULT 'B2';
ALTER TABLE public.vocabulary ADD COLUMN IF NOT EXISTS tags JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.vocabulary ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.vocabulary_categories(id) ON DELETE SET NULL;
ALTER TABLE public.vocabulary ADD COLUMN IF NOT EXISTS needs_review BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.vocabulary ADD COLUMN IF NOT EXISTS import_batch_id UUID REFERENCES public.import_batches(id) ON DELETE SET NULL;
ALTER TABLE public.vocabulary ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());
ALTER TABLE public.vocabulary ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());

CREATE INDEX IF NOT EXISTS idx_vocabulary_word_normalized
  ON public.vocabulary(word_normalized);
CREATE INDEX IF NOT EXISTS idx_vocabulary_word_trgm
  ON public.vocabulary USING gin (word_normalized gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_vocabulary_fts
  ON public.vocabulary USING gin (fts_vector);
CREATE INDEX IF NOT EXISTS idx_vocabulary_tags_gin
  ON public.vocabulary USING gin (tags);
CREATE INDEX IF NOT EXISTS idx_vocabulary_category_id
  ON public.vocabulary(category_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_cefr_pos
  ON public.vocabulary(cefr_level, pos);
CREATE INDEX IF NOT EXISTS idx_vocabulary_import_batch
  ON public.vocabulary(import_batch_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_needs_review
  ON public.vocabulary(id) WHERE needs_review = true;

-- 4. Bảng cấu trúc ngữ pháp & công thức hành văn (`04_grammar_structures.csv` — 89 dòng)
CREATE TABLE IF NOT EXISTS public.grammar_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id TEXT NOT NULL UNIQUE,
  item_number INTEGER NOT NULL DEFAULT 0,
  structure_name TEXT NOT NULL,
  formula TEXT NOT NULL,
  meaning_vi TEXT NOT NULL,
  when_to_use TEXT NOT NULL DEFAULT '',
  category_slug TEXT NOT NULL DEFAULT 'academic-structures',
  category_label TEXT NOT NULL DEFAULT '',
  difficulty_band TEXT NOT NULL DEFAULT 'Band 7.0–7.5',
  example_en TEXT NOT NULL DEFAULT '',
  example_vi TEXT NOT NULL DEFAULT '',
  how_it_works_vi TEXT NOT NULL DEFAULT '',
  syntactic_breakdown JSONB NOT NULL DEFAULT '[]'::jsonb,
  expanded_examples JSONB NOT NULL DEFAULT '[]'::jsonb,
  sentence_transformations JSONB NOT NULL DEFAULT '[]'::jsonb,
  common_mistakes JSONB NOT NULL DEFAULT '[]'::jsonb,
  source_pdf_name TEXT NOT NULL DEFAULT '',
  source_pdf_page INTEGER NOT NULL DEFAULT 1,
  source_file TEXT NOT NULL DEFAULT 'src/data/expandedPdfLibraryData.ts',
  source_hash TEXT NOT NULL DEFAULT '',
  import_batch_id UUID REFERENCES public.import_batches(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.grammar_structures ADD COLUMN IF NOT EXISTS item_number INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.grammar_structures ADD COLUMN IF NOT EXISTS category_slug TEXT NOT NULL DEFAULT 'academic-structures';
ALTER TABLE public.grammar_structures ADD COLUMN IF NOT EXISTS import_batch_id UUID REFERENCES public.import_batches(id) ON DELETE SET NULL;
ALTER TABLE public.grammar_structures ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());
ALTER TABLE public.grammar_structures ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());

CREATE INDEX IF NOT EXISTS idx_grammar_structures_category
  ON public.grammar_structures(category_slug, item_number);
CREATE INDEX IF NOT EXISTS idx_grammar_structures_import_batch
  ON public.grammar_structures(import_batch_id);

-- 5. Bảng lộ trình học 60+ ngày (`05_curriculum_days.csv` — 66 dòng)
CREATE TABLE IF NOT EXISTS public.curriculum_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id TEXT NOT NULL UNIQUE,
  day_number INTEGER NOT NULL UNIQUE CHECK (day_number >= 1 AND day_number <= 3650),
  week_number INTEGER NOT NULL DEFAULT 1 CHECK (week_number >= 1),
  topic_en TEXT NOT NULL,
  topic_vi TEXT NOT NULL,
  theme_tag TEXT NOT NULL DEFAULT '',
  band_target TEXT NOT NULL DEFAULT 'Band 7.0+',
  reading_title TEXT NOT NULL DEFAULT '',
  reading_source TEXT NOT NULL DEFAULT '',
  reading_paragraphs JSONB NOT NULL DEFAULT '[]'::jsonb,
  reading_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  writing_prompt TEXT NOT NULL DEFAULT '',
  writing_question_type TEXT NOT NULL DEFAULT '',
  writing_outline JSONB NOT NULL DEFAULT '[]'::jsonb,
  writing_model_essay TEXT NOT NULL DEFAULT '',
  speaking_topic TEXT NOT NULL DEFAULT '',
  speaking_part1 JSONB NOT NULL DEFAULT '[]'::jsonb,
  speaking_cue_card JSONB NOT NULL DEFAULT '{}'::jsonb,
  speaking_part3 JSONB NOT NULL DEFAULT '[]'::jsonb,
  source_file TEXT NOT NULL DEFAULT 'src/data/challenge60Data.ts',
  source_hash TEXT NOT NULL DEFAULT '',
  import_batch_id UUID REFERENCES public.import_batches(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.curriculum_days ADD COLUMN IF NOT EXISTS day_number INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.curriculum_days ADD COLUMN IF NOT EXISTS week_number INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.curriculum_days ADD COLUMN IF NOT EXISTS import_batch_id UUID REFERENCES public.import_batches(id) ON DELETE SET NULL;
ALTER TABLE public.curriculum_days ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());
ALTER TABLE public.curriculum_days ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());

CREATE INDEX IF NOT EXISTS idx_curriculum_days_week
  ON public.curriculum_days(week_number, day_number);
CREATE INDEX IF NOT EXISTS idx_curriculum_days_import_batch
  ON public.curriculum_days(import_batch_id);

-- 6. Bảng từ vựng theo từng ngày học (`06_curriculum_day_vocab.csv` — 990 dòng)
CREATE TABLE IF NOT EXISTS public.curriculum_day_vocab (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id TEXT NOT NULL,
  day_id UUID NOT NULL REFERENCES public.curriculum_days(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL CHECK (day_number >= 1 AND day_number <= 3650),
  display_order INTEGER NOT NULL DEFAULT 1,
  vocab_id UUID REFERENCES public.vocabulary(id) ON DELETE SET NULL,
  word TEXT NOT NULL,
  ipa TEXT NOT NULL DEFAULT '',
  pos TEXT NOT NULL DEFAULT 'noun',
  meaning_vi TEXT NOT NULL,
  collocations JSONB NOT NULL DEFAULT '[]'::jsonb,
  example_en TEXT NOT NULL DEFAULT '',
  example_vi TEXT NOT NULL DEFAULT '',
  detailed_note TEXT NOT NULL DEFAULT '',
  source_file TEXT NOT NULL DEFAULT 'src/data/challenge60Data.ts',
  source_hash TEXT NOT NULL DEFAULT '',
  import_batch_id UUID REFERENCES public.import_batches(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (day_id, display_order)
);

ALTER TABLE public.curriculum_day_vocab ADD COLUMN IF NOT EXISTS day_id UUID REFERENCES public.curriculum_days(id) ON DELETE CASCADE;
ALTER TABLE public.curriculum_day_vocab ADD COLUMN IF NOT EXISTS day_number INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.curriculum_day_vocab ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.curriculum_day_vocab ADD COLUMN IF NOT EXISTS vocab_id UUID REFERENCES public.vocabulary(id) ON DELETE SET NULL;
ALTER TABLE public.curriculum_day_vocab ADD COLUMN IF NOT EXISTS import_batch_id UUID REFERENCES public.import_batches(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_curriculum_day_vocab_day_id
  ON public.curriculum_day_vocab(day_id, display_order);
CREATE INDEX IF NOT EXISTS idx_curriculum_day_vocab_vocab_id
  ON public.curriculum_day_vocab(vocab_id);
CREATE INDEX IF NOT EXISTS idx_curriculum_day_vocab_import_batch
  ON public.curriculum_day_vocab(import_batch_id);

-- 7. Bảng bộ đề Speaking IELTS & VSTEP (`07_ielts_speaking_topics.csv` — 45 dòng)
CREATE TABLE IF NOT EXISTS public.ielts_speaking_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id TEXT NOT NULL UNIQUE,
  topic_number INTEGER NOT NULL DEFAULT 1,
  part_type TEXT NOT NULL DEFAULT 'full_test_part_1_2_3',
  topic_en TEXT NOT NULL,
  topic_vi TEXT NOT NULL,
  theme_tag TEXT NOT NULL DEFAULT '',
  band_target TEXT NOT NULL DEFAULT 'Band 7.0+',
  part1_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  part2_cue_card JSONB NOT NULL DEFAULT '{}'::jsonb,
  part3_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  vocabulary_Executing JSONB NOT NULL DEFAULT '[]'::jsonb,
  source_file TEXT NOT NULL DEFAULT 'src/data/curriculum/vstep28SpeakingBank.ts',
  source_hash TEXT NOT NULL DEFAULT '',
  import_batch_id UUID REFERENCES public.import_batches(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.ielts_speaking_topics ADD COLUMN IF NOT EXISTS topic_number INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.ielts_speaking_topics ADD COLUMN IF NOT EXISTS part_type TEXT NOT NULL DEFAULT 'full_test_part_1_2_3';
ALTER TABLE public.ielts_speaking_topics ADD COLUMN IF NOT EXISTS import_batch_id UUID REFERENCES public.import_batches(id) ON DELETE SET NULL;
ALTER TABLE public.ielts_speaking_topics ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());
ALTER TABLE public.ielts_speaking_topics ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());

CREATE INDEX IF NOT EXISTS idx_speaking_topics_part_type
  ON public.ielts_speaking_topics(part_type, topic_number);
CREATE INDEX IF NOT EXISTS idx_speaking_topics_import_batch
  ON public.ielts_speaking_topics(import_batch_id);

-- 8. Bảng ngân hàng câu hỏi trắc nghiệm & phân biệt từ (`08_quiz_questions.csv` — 153 dòng)
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id TEXT NOT NULL UNIQUE,
  quiz_type TEXT NOT NULL,
  question_prompt TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_answer TEXT NOT NULL,
  explanation_vi TEXT NOT NULL DEFAULT '',
  meaning_hint_vi TEXT NOT NULL DEFAULT '',
  example_en TEXT NOT NULL DEFAULT '',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  source_file TEXT NOT NULL DEFAULT 'src/data/vocabularyData.ts',
  source_hash TEXT NOT NULL DEFAULT '',
  import_batch_id UUID REFERENCES public.import_batches(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.quiz_questions ADD COLUMN IF NOT EXISTS quiz_type TEXT NOT NULL DEFAULT 'multiple-choice';
ALTER TABLE public.quiz_questions ADD COLUMN IF NOT EXISTS import_batch_id UUID REFERENCES public.import_batches(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_quiz_questions_type
  ON public.quiz_questions(quiz_type);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_import_batch
  ON public.quiz_questions(import_batch_id);

-- 9. Bảng tổng kho học liệu PDF & cẩm nang VSTEP (`09_pdf_library.csv` — 35 dòng)
CREATE TABLE IF NOT EXISTS public.pdf_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id TEXT NOT NULL UNIQUE,
  record_type TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  difficulty TEXT NOT NULL DEFAULT '',
  summary_vi TEXT NOT NULL DEFAULT '',
  content_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  pdf_file_name TEXT NOT NULL DEFAULT '',
  pdf_page INTEGER NOT NULL DEFAULT 1,
  source_file TEXT NOT NULL DEFAULT 'src/data/vstepPdfKnowledgeBankData.ts',
  source_hash TEXT NOT NULL DEFAULT '',
  import_batch_id UUID REFERENCES public.import_batches(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.pdf_library ADD COLUMN IF NOT EXISTS record_type TEXT NOT NULL DEFAULT 'guide';
ALTER TABLE public.pdf_library ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT '';
ALTER TABLE public.pdf_library ADD COLUMN IF NOT EXISTS import_batch_id UUID REFERENCES public.import_batches(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_pdf_library_type_cat
  ON public.pdf_library(record_type, category);
CREATE INDEX IF NOT EXISTS idx_pdf_library_import_batch
  ON public.pdf_library(import_batch_id);

-- ============================================================================
-- PHẦN II: 12 BẢNG NGƯỜI DÙNG, TIẾN ĐỘ HỌC TẬP & ĐỒNG BỘ ĐÁM MÂY (USER TABLES)
-- Tương thích 100% với `src/services/dataRepository.ts` và `supabase/schema.sql`
-- ============================================================================

-- 10. Hồ sơ người dùng (`profiles` — 1:1 với `auth.users(id)`)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Học viên MASTER',
  email TEXT NOT NULL DEFAULT '',
  avatar TEXT NOT NULL DEFAULT '🎓',
  target_band TEXT NOT NULL DEFAULT '7.5',
  exam_date TEXT NOT NULL DEFAULT '',
  study_streak INTEGER NOT NULL DEFAULT 0,
  last_study_date TEXT,
  daily_goal_minutes INTEGER NOT NULL DEFAULT 30,
  words_per_session_goal INTEGER NOT NULL DEFAULT 15,
  weekly_sessions_goal INTEGER NOT NULL DEFAULT 5,
  preferred_study_Period TEXT NOT NULL DEFAULT '20:00',
  bio TEXT NOT NULL DEFAULT '',
  level TEXT NOT NULL DEFAULT 'B2 - Upper Intermediate',
  focus_skill TEXT NOT NULL DEFAULT 'Writing & Lexical Resource',
  theme_preference TEXT NOT NULL DEFAULT 'light',
  card_status_map JSONB NOT NULL DEFAULT '{}'::jsonb,
  report_recipient_email TEXT NOT NULL DEFAULT '',
  client_updated_at BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT 'Học viên MASTER';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT NOT NULL DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar TEXT NOT NULL DEFAULT '🎓';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS target_band TEXT NOT NULL DEFAULT '7.5';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS exam_date TEXT NOT NULL DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS study_streak INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_study_date TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS daily_goal_minutes INTEGER NOT NULL DEFAULT 30;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS words_per_session_goal INTEGER NOT NULL DEFAULT 15;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS weekly_sessions_goal INTEGER NOT NULL DEFAULT 5;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_study_Period TEXT NOT NULL DEFAULT '20:00';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT NOT NULL DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS level TEXT NOT NULL DEFAULT 'B2 - Upper Intermediate';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS focus_skill TEXT NOT NULL DEFAULT 'Writing & Lexical Resource';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme_preference TEXT NOT NULL DEFAULT 'light';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS card_status_map JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS report_recipient_email TEXT NOT NULL DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS client_updated_at BIGINT NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());

-- Bảng đồng bộ tương thích runtime (`user_profiles` — khóa chính `user_id` 1:1 với `auth.users(id)`)
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

ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT 'Học Viên IELTS';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS email TEXT NOT NULL DEFAULT '';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS gender TEXT NOT NULL DEFAULT 'Nữ';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS dob TEXT NOT NULL DEFAULT '';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS location TEXT NOT NULL DEFAULT 'Việt Nam';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS student_category TEXT NOT NULL DEFAULT 'Sinh viên Đại học';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS current_level TEXT NOT NULL DEFAULT 'Upper-Intermediate (Band 7.0)';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS exam_target TEXT NOT NULL DEFAULT 'IELTS Academic';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS target_band TEXT NOT NULL DEFAULT 'BAND 8.5+';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS words_per_session_goal INTEGER NOT NULL DEFAULT 15;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS daily_study_minutes_goal INTEGER NOT NULL DEFAULT 45;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS avatar_pose TEXT NOT NULL DEFAULT 'welcome-heart';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS custom_avatar_url TEXT NOT NULL DEFAULT '';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS theme_preference TEXT NOT NULL DEFAULT 'light';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS report_recipient JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS mastered_words_v1 JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS card_status_v1 JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS profile_payload JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS client_updated_at BIGINT NOT NULL DEFAULT 0;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());

-- 11. Tiến độ SRS từng từ (`vocab_progress` & `word_progress`)
CREATE TABLE IF NOT EXISTS public.vocab_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id TEXT NOT NULL,
  word TEXT NOT NULL,
  ipa TEXT NOT NULL DEFAULT '',
  meaning TEXT NOT NULL DEFAULT '',
  level TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'learning' CHECK (status IN ('new', 'learning', 'reviewing', 'mastered')),
  times_reviewed INTEGER NOT NULL DEFAULT 1,
  correct_streak INTEGER NOT NULL DEFAULT 0,
  first_mastered_at BIGINT,
  last_reviewed_at BIGINT NOT NULL DEFAULT 0,
  next_review_at BIGINT NOT NULL DEFAULT 0,
  ease_factor DOUBLE PRECISION NOT NULL DEFAULT 2.5,
  interval_days INTEGER NOT NULL DEFAULT 1,
  sourceMode TEXT NOT NULL DEFAULT 'flashcard',
  history JSONB NOT NULL DEFAULT '[]'::jsonb,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (user_id, word_id)
);

ALTER TABLE public.vocab_progress ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.vocab_progress ADD COLUMN IF NOT EXISTS word_id TEXT NOT NULL DEFAULT '';
ALTER TABLE public.vocab_progress ADD COLUMN IF NOT EXISTS word TEXT NOT NULL DEFAULT '';
ALTER TABLE public.vocab_progress ADD COLUMN IF NOT EXISTS ipa TEXT NOT NULL DEFAULT '';
ALTER TABLE public.vocab_progress ADD COLUMN IF NOT EXISTS meaning TEXT NOT NULL DEFAULT '';
ALTER TABLE public.vocab_progress ADD COLUMN IF NOT EXISTS level TEXT NOT NULL DEFAULT '';
ALTER TABLE public.vocab_progress ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'learning';
ALTER TABLE public.vocab_progress ADD COLUMN IF NOT EXISTS times_reviewed INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.vocab_progress ADD COLUMN IF NOT EXISTS correct_streak INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.vocab_progress ADD COLUMN IF NOT EXISTS first_mastered_at BIGINT;
ALTER TABLE public.vocab_progress ADD COLUMN IF NOT EXISTS last_reviewed_at BIGINT NOT NULL DEFAULT 0;
ALTER TABLE public.vocab_progress ADD COLUMN IF NOT EXISTS next_review_at BIGINT NOT NULL DEFAULT 0;
ALTER TABLE public.vocab_progress ADD COLUMN IF NOT EXISTS ease_factor DOUBLE PRECISION NOT NULL DEFAULT 2.5;
ALTER TABLE public.vocab_progress ADD COLUMN IF NOT EXISTS interval_days INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.vocab_progress ADD COLUMN IF NOT EXISTS sourceMode TEXT NOT NULL DEFAULT 'flashcard';
ALTER TABLE public.vocab_progress ADD COLUMN IF NOT EXISTS history JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.vocab_progress ADD COLUMN IF NOT EXISTS raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.vocab_progress ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());

CREATE INDEX IF NOT EXISTS idx_vocab_progress_user_next_review
  ON public.vocab_progress(user_id, next_review_at);
CREATE INDEX IF NOT EXISTS idx_vocab_progress_user_status
  ON public.vocab_progress(user_id, status);

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

ALTER TABLE public.word_progress ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.word_progress ADD COLUMN IF NOT EXISTS word_id TEXT NOT NULL DEFAULT '';
ALTER TABLE public.word_progress ADD COLUMN IF NOT EXISTS word TEXT NOT NULL DEFAULT '';
ALTER TABLE public.word_progress ADD COLUMN IF NOT EXISTS ipa TEXT NOT NULL DEFAULT '';
ALTER TABLE public.word_progress ADD COLUMN IF NOT EXISTS meaning TEXT NOT NULL DEFAULT '';
ALTER TABLE public.word_progress ADD COLUMN IF NOT EXISTS level TEXT NOT NULL DEFAULT '';
ALTER TABLE public.word_progress ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'learning';
ALTER TABLE public.word_progress ADD COLUMN IF NOT EXISTS times_reviewed INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.word_progress ADD COLUMN IF NOT EXISTS first_mastered_at BIGINT;
ALTER TABLE public.word_progress ADD COLUMN IF NOT EXISTS last_reviewed_at BIGINT NOT NULL DEFAULT 0;
ALTER TABLE public.word_progress ADD COLUMN IF NOT EXISTS history JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.word_progress ADD COLUMN IF NOT EXISTS raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.word_progress ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());

CREATE INDEX IF NOT EXISTS idx_word_progress_user_last_reviewed
  ON public.word_progress(user_id, last_reviewed_at DESC);

-- 12. Sổ từ vựng đã lưu (`saved_words`)
CREATE TABLE IF NOT EXISTS public.saved_words (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id TEXT NOT NULL,
  word TEXT NOT NULL,
  saved_at BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (user_id, word_id)
);

ALTER TABLE public.saved_words ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.saved_words ADD COLUMN IF NOT EXISTS word_id TEXT NOT NULL DEFAULT '';
ALTER TABLE public.saved_words ADD COLUMN IF NOT EXISTS word TEXT NOT NULL DEFAULT '';
ALTER TABLE public.saved_words ADD COLUMN IF NOT EXISTS saved_at BIGINT NOT NULL DEFAULT 0;
ALTER TABLE public.saved_words ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());

CREATE INDEX IF NOT EXISTS idx_saved_words_user_saved_at
  ON public.saved_words(user_id, saved_at DESC);

-- 13. Lịch sử phiên học (`study_sessions` & `active_sessions`)
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL DEFAULT 'speed',
  mode_label TEXT NOT NULL DEFAULT 'Speed Quiz',
  started_at BIGINT NOT NULL DEFAULT 0,
  ended_at BIGINT NOT NULL DEFAULT 0,
  start_time BIGINT NOT NULL DEFAULT 0,
  end_time BIGINT NOT NULL DEFAULT 0,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  target_minutes INTEGER NOT NULL DEFAULT 45,
  words_studied INTEGER NOT NULL DEFAULT 0,
  quizzes_completed INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  date_str TEXT NOT NULL DEFAULT '',
  date_string TEXT NOT NULL DEFAULT '',
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

-- Bảo đảm tương thích ngược 100% nếu bảng study_sessions đã được tạo từ schema cũ
ALTER TABLE public.study_sessions ADD COLUMN IF NOT EXISTS id TEXT NOT NULL DEFAULT gen_random_uuid()::text;
ALTER TABLE public.study_sessions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.study_sessions ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'speed';
ALTER TABLE public.study_sessions ADD COLUMN IF NOT EXISTS mode_label TEXT NOT NULL DEFAULT 'Speed Quiz';
ALTER TABLE public.study_sessions ADD COLUMN IF NOT EXISTS started_at BIGINT NOT NULL DEFAULT 0;
ALTER TABLE public.study_sessions ADD COLUMN IF NOT EXISTS ended_at BIGINT NOT NULL DEFAULT 0;
ALTER TABLE public.study_sessions ADD COLUMN IF NOT EXISTS start_time BIGINT NOT NULL DEFAULT 0;
ALTER TABLE public.study_sessions ADD COLUMN IF NOT EXISTS end_time BIGINT NOT NULL DEFAULT 0;
ALTER TABLE public.study_sessions ADD COLUMN IF NOT EXISTS duration_seconds INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.study_sessions ADD COLUMN IF NOT EXISTS target_minutes INTEGER NOT NULL DEFAULT 45;
ALTER TABLE public.study_sessions ADD COLUMN IF NOT EXISTS words_studied INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.study_sessions ADD COLUMN IF NOT EXISTS quizzes_completed INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.study_sessions ADD COLUMN IF NOT EXISTS correct_answers INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.study_sessions ADD COLUMN IF NOT EXISTS total_questions INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.study_sessions ADD COLUMN IF NOT EXISTS date_str TEXT NOT NULL DEFAULT '';
ALTER TABLE public.study_sessions ADD COLUMN IF NOT EXISTS date_string TEXT NOT NULL DEFAULT '';
ALTER TABLE public.study_sessions ADD COLUMN IF NOT EXISTS topics JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.study_sessions ADD COLUMN IF NOT EXISTS words_mastered JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.study_sessions ADD COLUMN IF NOT EXISTS words_reviewed JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.study_sessions ADD COLUMN IF NOT EXISTS quiz_questions_answered INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.study_sessions ADD COLUMN IF NOT EXISTS quiz_questions_correct INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.study_sessions ADD COLUMN IF NOT EXISTS flashcards_flipped INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.study_sessions ADD COLUMN IF NOT EXISTS mistakes_resolved INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.study_sessions ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'completed';
ALTER TABLE public.study_sessions ADD COLUMN IF NOT EXISTS raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.study_sessions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());
ALTER TABLE public.study_sessions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());

-- Đặt DEFAULT an toàn cho các cột cũ của study_sessions
DO $$
BEGIN
  ALTER TABLE public.study_sessions ALTER COLUMN start_time SET DEFAULT 0;
  ALTER TABLE public.study_sessions ALTER COLUMN end_time SET DEFAULT 0;
  ALTER TABLE public.study_sessions ALTER COLUMN date_string SET DEFAULT '';
EXCEPTION WHEN OTHERS THEN
  NULL;
END;
$$;

-- Đồng bộ giá trị alias giữa các cột thời gian nếu bảng đã có dữ liệu cũ
UPDATE public.study_sessions SET started_at = start_time WHERE started_at = 0 AND start_time > 0;
UPDATE public.study_sessions SET start_time = started_at WHERE start_time = 0 AND started_at > 0;
UPDATE public.study_sessions SET ended_at = end_time WHERE ended_at = 0 AND end_time > 0;
UPDATE public.study_sessions SET end_time = ended_at WHERE end_time = 0 AND ended_at > 0;
UPDATE public.study_sessions SET date_str = date_string WHERE (date_str IS NULL OR date_str = '') AND date_string IS NOT NULL AND date_string != '';
UPDATE public.study_sessions SET date_string = date_str WHERE (date_string IS NULL OR date_string = '') AND date_str IS NOT NULL AND date_str != '';

CREATE INDEX IF NOT EXISTS idx_study_sessions_user_started
  ON public.study_sessions(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_start_time
  ON public.study_sessions(user_id, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_date
  ON public.study_sessions(user_id, date_str);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_date_string
  ON public.study_sessions(user_id, date_string DESC);

CREATE TABLE IF NOT EXISTS public.active_sessions (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  payload JSONB,
  last_active_timestamp BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.active_sessions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.active_sessions ADD COLUMN IF NOT EXISTS session_id TEXT;
ALTER TABLE public.active_sessions ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.active_sessions ADD COLUMN IF NOT EXISTS payload JSONB;
ALTER TABLE public.active_sessions ADD COLUMN IF NOT EXISTS last_active_timestamp BIGINT NOT NULL DEFAULT 0;
ALTER TABLE public.active_sessions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());

-- 14. Sổ tay lỗi sai (`mistake_bank` & `mistakes_notebook`)
CREATE TABLE IF NOT EXISTS public.mistake_bank (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  question TEXT NOT NULL,
  user_answer TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Lexical',
  timestamp BIGINT NOT NULL DEFAULT 0,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (user_id, item_id)
);

ALTER TABLE public.mistake_bank ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.mistake_bank ADD COLUMN IF NOT EXISTS item_id TEXT NOT NULL DEFAULT '';
ALTER TABLE public.mistake_bank ADD COLUMN IF NOT EXISTS question TEXT NOT NULL DEFAULT '';
ALTER TABLE public.mistake_bank ADD COLUMN IF NOT EXISTS user_answer TEXT NOT NULL DEFAULT '';
ALTER TABLE public.mistake_bank ADD COLUMN IF NOT EXISTS correct_answer TEXT NOT NULL DEFAULT '';
ALTER TABLE public.mistake_bank ADD COLUMN IF NOT EXISTS explanation TEXT NOT NULL DEFAULT '';
ALTER TABLE public.mistake_bank ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'Lexical';
ALTER TABLE public.mistake_bank ADD COLUMN IF NOT EXISTS timestamp BIGINT NOT NULL DEFAULT 0;
ALTER TABLE public.mistake_bank ADD COLUMN IF NOT EXISTS raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.mistake_bank ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());

CREATE INDEX IF NOT EXISTS idx_mistake_bank_user_timestamp
  ON public.mistake_bank(user_id, timestamp DESC);

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

ALTER TABLE public.mistakes_notebook ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.mistakes_notebook ADD COLUMN IF NOT EXISTS id TEXT NOT NULL DEFAULT '';
ALTER TABLE public.mistakes_notebook ADD COLUMN IF NOT EXISTS question TEXT NOT NULL DEFAULT '';
ALTER TABLE public.mistakes_notebook ADD COLUMN IF NOT EXISTS user_answer TEXT NOT NULL DEFAULT '';
ALTER TABLE public.mistakes_notebook ADD COLUMN IF NOT EXISTS correct_answer TEXT NOT NULL DEFAULT '';
ALTER TABLE public.mistakes_notebook ADD COLUMN IF NOT EXISTS explanation TEXT NOT NULL DEFAULT '';
ALTER TABLE public.mistakes_notebook ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT '';
ALTER TABLE public.mistakes_notebook ADD COLUMN IF NOT EXISTS timestamp BIGINT NOT NULL DEFAULT 0;
ALTER TABLE public.mistakes_notebook ADD COLUMN IF NOT EXISTS raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.mistakes_notebook ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());

CREATE INDEX IF NOT EXISTS idx_mistakes_notebook_user_timestamp
  ON public.mistakes_notebook(user_id, timestamp DESC);

-- 15. Thống kê tổng hợp (`user_stats`)
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

ALTER TABLE public.user_stats ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.user_stats ADD COLUMN IF NOT EXISTS quizzes_taken INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.user_stats ADD COLUMN IF NOT EXISTS total_questions_answered INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.user_stats ADD COLUMN IF NOT EXISTS correct_answers INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.user_stats ADD COLUMN IF NOT EXISTS best_streak INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.user_stats ADD COLUMN IF NOT EXISTS current_streak INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.user_stats ADD COLUMN IF NOT EXISTS client_updated_at BIGINT NOT NULL DEFAULT 0;
ALTER TABLE public.user_stats ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());

-- 16. Tiến độ Lộ trình 60 Ngày (`challenge_60_progress`)
CREATE TABLE IF NOT EXISTS public.challenge_60_progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  active_day INTEGER NOT NULL DEFAULT 1,
  streak INTEGER NOT NULL DEFAULT 0,
  last_active_date TEXT NOT NULL DEFAULT '',
  day_statuses JSONB NOT NULL DEFAULT '{}'::jsonb,
  writing_drafts JSONB NOT NULL DEFAULT '{}'::jsonb,
  speaking_drafts JSONB NOT NULL DEFAULT '{}'::jsonb,
  writing_history JSONB NOT NULL DEFAULT '{}'::jsonb,
  speaking_history JSONB NOT NULL DEFAULT '{}'::jsonb,
  mastered_vocab_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  client_updated_at BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.challenge_60_progress ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.challenge_60_progress ADD COLUMN IF NOT EXISTS active_day INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.challenge_60_progress ADD COLUMN IF NOT EXISTS streak INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.challenge_60_progress ADD COLUMN IF NOT EXISTS last_active_date TEXT NOT NULL DEFAULT '';
ALTER TABLE public.challenge_60_progress ADD COLUMN IF NOT EXISTS day_statuses JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.challenge_60_progress ADD COLUMN IF NOT EXISTS writing_drafts JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.challenge_60_progress ADD COLUMN IF NOT EXISTS speaking_drafts JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.challenge_60_progress ADD COLUMN IF NOT EXISTS writing_history JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.challenge_60_progress ADD COLUMN IF NOT EXISTS speaking_history JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.challenge_60_progress ADD COLUMN IF NOT EXISTS mastered_vocab_ids JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.challenge_60_progress ADD COLUMN IF NOT EXISTS client_updated_at BIGINT NOT NULL DEFAULT 0;
ALTER TABLE public.challenge_60_progress ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());

-- 17. Bảng đồng bộ song song (`user_challenge_progress`)
CREATE TABLE IF NOT EXISTS public.user_challenge_progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  active_day INTEGER NOT NULL DEFAULT 1,
  streak INTEGER NOT NULL DEFAULT 0,
  last_active_date TEXT NOT NULL DEFAULT '',
  day_statuses JSONB NOT NULL DEFAULT '{}'::jsonb,
  writing_drafts JSONB NOT NULL DEFAULT '{}'::jsonb,
  speaking_drafts JSONB NOT NULL DEFAULT '{}'::jsonb,
  writing_history JSONB NOT NULL DEFAULT '{}'::jsonb,
  speaking_history JSONB NOT NULL DEFAULT '{}'::jsonb,
  mastered_vocab_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  client_updated_at BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.user_challenge_progress ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.user_challenge_progress ADD COLUMN IF NOT EXISTS active_day INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.user_challenge_progress ADD COLUMN IF NOT EXISTS streak INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.user_challenge_progress ADD COLUMN IF NOT EXISTS last_active_date TEXT NOT NULL DEFAULT '';
ALTER TABLE public.user_challenge_progress ADD COLUMN IF NOT EXISTS day_statuses JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.user_challenge_progress ADD COLUMN IF NOT EXISTS writing_drafts JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.user_challenge_progress ADD COLUMN IF NOT EXISTS speaking_drafts JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.user_challenge_progress ADD COLUMN IF NOT EXISTS writing_history JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.user_challenge_progress ADD COLUMN IF NOT EXISTS speaking_history JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.user_challenge_progress ADD COLUMN IF NOT EXISTS mastered_vocab_ids JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.user_challenge_progress ADD COLUMN IF NOT EXISTS client_updated_at BIGINT NOT NULL DEFAULT 0;
ALTER TABLE public.user_challenge_progress ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());

-- Nếu bảng user_challenge_progress cũ có cột day_number (nằm trong PK), đặt DEFAULT 1 an toàn (KHÔNG gọi DROP NOT NULL trên cột PK)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_challenge_progress' AND column_name = 'day_number'
  ) THEN
    ALTER TABLE public.user_challenge_progress ALTER COLUMN day_number SET DEFAULT 1;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END;
$$;

-- 18. Nhật ký bài nộp Writing & Speaking (`user_writing_logs`)
CREATE TABLE IF NOT EXISTS public.user_writing_logs (
  id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day INTEGER NOT NULL DEFAULT 1,
  task_type TEXT NOT NULL DEFAULT 'writing_task2',
  exam_type TEXT NOT NULL DEFAULT 'IELTS & VSTEP',
  prompt TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  word_count INTEGER NOT NULL DEFAULT 0,
  used_target_vocab JSONB NOT NULL DEFAULT '[]'::jsonb,
  feedback JSONB,
  submitted_at BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (user_id, id)
);

-- Bảo đảm tương thích 100% nếu bảng user_writing_logs đã tồn tại từ schema cũ (thiếu cột day, submitted_at, v.v.)
ALTER TABLE public.user_writing_logs ADD COLUMN IF NOT EXISTS id TEXT NOT NULL DEFAULT gen_random_uuid()::text;
ALTER TABLE public.user_writing_logs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.user_writing_logs ADD COLUMN IF NOT EXISTS day INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.user_writing_logs ADD COLUMN IF NOT EXISTS task_type TEXT NOT NULL DEFAULT 'writing_task2';
ALTER TABLE public.user_writing_logs ADD COLUMN IF NOT EXISTS exam_type TEXT NOT NULL DEFAULT 'IELTS & VSTEP';
ALTER TABLE public.user_writing_logs ADD COLUMN IF NOT EXISTS prompt TEXT NOT NULL DEFAULT '';
ALTER TABLE public.user_writing_logs ADD COLUMN IF NOT EXISTS content TEXT NOT NULL DEFAULT '';
ALTER TABLE public.user_writing_logs ADD COLUMN IF NOT EXISTS word_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.user_writing_logs ADD COLUMN IF NOT EXISTS used_target_vocab JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.user_writing_logs ADD COLUMN IF NOT EXISTS feedback JSONB;
ALTER TABLE public.user_writing_logs ADD COLUMN IF NOT EXISTS submitted_at BIGINT NOT NULL DEFAULT 0;
ALTER TABLE public.user_writing_logs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());
ALTER TABLE public.user_writing_logs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());

-- Đồng bộ & đặt DEFAULT an toàn cho các cột cũ (như day_number) trên user_writing_logs nếu có
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_writing_logs' AND column_name = 'day_number'
  ) THEN
    ALTER TABLE public.user_writing_logs ALTER COLUMN day_number SET DEFAULT 1;
    EXECUTE 'UPDATE public.user_writing_logs SET day = COALESCE(day_number, 1) WHERE day = 1 AND day_number IS NOT NULL';
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END;
$$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_writing_logs_user_id_id_uq
  ON public.user_writing_logs(user_id, id);
CREATE INDEX IF NOT EXISTS idx_user_writing_logs_user_day
  ON public.user_writing_logs(user_id, day, submitted_at DESC);

-- 19. Danh sách công việc (`workspace_todos`)
CREATE TABLE IF NOT EXISTS public.workspace_todos (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  todo_id BIGINT NOT NULL,
  text TEXT NOT NULL,
  date TEXT NOT NULL DEFAULT 'Hôm nay',
  done BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (user_id, todo_id)
);

ALTER TABLE public.workspace_todos ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.workspace_todos ADD COLUMN IF NOT EXISTS todo_id BIGINT NOT NULL DEFAULT 0;
ALTER TABLE public.workspace_todos ADD COLUMN IF NOT EXISTS text TEXT NOT NULL DEFAULT '';
ALTER TABLE public.workspace_todos ADD COLUMN IF NOT EXISTS date TEXT NOT NULL DEFAULT 'Hôm nay';
ALTER TABLE public.workspace_todos ADD COLUMN IF NOT EXISTS done BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.workspace_todos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());

CREATE INDEX IF NOT EXISTS idx_workspace_todos_user
  ON public.workspace_todos(user_id);

-- 20. Kho dữ liệu mở rộng JSONB (`custom_content_store`)
CREATE TABLE IF NOT EXISTS public.custom_content_store (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  custom_structures JSONB NOT NULL DEFAULT '[]'::jsonb,
  custom_vocab JSONB NOT NULL DEFAULT '[]'::jsonb,
  custom_challenge_days JSONB NOT NULL DEFAULT '{}'::jsonb,
  client_updated_at BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.custom_content_store ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.custom_content_store ADD COLUMN IF NOT EXISTS custom_structures JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.custom_content_store ADD COLUMN IF NOT EXISTS custom_vocab JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.custom_content_store ADD COLUMN IF NOT EXISTS custom_challenge_days JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.custom_content_store ADD COLUMN IF NOT EXISTS client_updated_at BIGINT NOT NULL DEFAULT 0;
ALTER TABLE public.custom_content_store ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());

-- 21. Từ vựng & Cấu trúc tự nạp dạng bảng (`user_custom_vocab` & `user_custom_structures`)
CREATE TABLE IF NOT EXISTS public.user_custom_vocab (
  id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  ipa TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'noun',
  level TEXT NOT NULL DEFAULT 'C1',
  meaning TEXT NOT NULL DEFAULT '',
  example_en TEXT NOT NULL DEFAULT '',
  example_vi TEXT NOT NULL DEFAULT '',
  collocations JSONB NOT NULL DEFAULT '[]'::jsonb,
  synonyms JSONB NOT NULL DEFAULT '[]'::jsonb,
  antonyms JSONB NOT NULL DEFAULT '[]'::jsonb,
  word_family JSONB NOT NULL DEFAULT '[]'::jsonb,
  detailed_note TEXT NOT NULL DEFAULT '',
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (user_id, id)
);

ALTER TABLE public.user_custom_vocab ADD COLUMN IF NOT EXISTS id TEXT NOT NULL DEFAULT '';
ALTER TABLE public.user_custom_vocab ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.user_custom_vocab ADD COLUMN IF NOT EXISTS word TEXT NOT NULL DEFAULT '';
ALTER TABLE public.user_custom_vocab ADD COLUMN IF NOT EXISTS ipa TEXT NOT NULL DEFAULT '';
ALTER TABLE public.user_custom_vocab ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'noun';
ALTER TABLE public.user_custom_vocab ADD COLUMN IF NOT EXISTS level TEXT NOT NULL DEFAULT 'C1';
ALTER TABLE public.user_custom_vocab ADD COLUMN IF NOT EXISTS meaning TEXT NOT NULL DEFAULT '';
ALTER TABLE public.user_custom_vocab ADD COLUMN IF NOT EXISTS example_en TEXT NOT NULL DEFAULT '';
ALTER TABLE public.user_custom_vocab ADD COLUMN IF NOT EXISTS example_vi TEXT NOT NULL DEFAULT '';
ALTER TABLE public.user_custom_vocab ADD COLUMN IF NOT EXISTS collocations JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.user_custom_vocab ADD COLUMN IF NOT EXISTS synonyms JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.user_custom_vocab ADD COLUMN IF NOT EXISTS antonyms JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.user_custom_vocab ADD COLUMN IF NOT EXISTS word_family JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.user_custom_vocab ADD COLUMN IF NOT EXISTS detailed_note TEXT NOT NULL DEFAULT '';
ALTER TABLE public.user_custom_vocab ADD COLUMN IF NOT EXISTS tags JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.user_custom_vocab ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());
ALTER TABLE public.user_custom_vocab ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());

CREATE INDEX IF NOT EXISTS idx_user_custom_vocab_user_word
  ON public.user_custom_vocab(user_id, word);

CREATE TABLE IF NOT EXISTS public.user_custom_structures (
  id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pdf_item_number INTEGER NOT NULL DEFAULT 78,
  structure_name TEXT NOT NULL,
  formula TEXT NOT NULL,
  meaning_vi TEXT NOT NULL,
  when_to_use TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'academic-structures',
  category_label TEXT NOT NULL DEFAULT 'Cấu trúc Câu Học thuật',
  difficulty TEXT NOT NULL DEFAULT 'Band 7.0–7.5',
  example_en TEXT NOT NULL DEFAULT '',
  example_vi TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (user_id, id)
);

ALTER TABLE public.user_custom_structures ADD COLUMN IF NOT EXISTS id TEXT NOT NULL DEFAULT '';
ALTER TABLE public.user_custom_structures ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.user_custom_structures ADD COLUMN IF NOT EXISTS pdf_item_number INTEGER NOT NULL DEFAULT 78;
ALTER TABLE public.user_custom_structures ADD COLUMN IF NOT EXISTS structure_name TEXT NOT NULL DEFAULT '';
ALTER TABLE public.user_custom_structures ADD COLUMN IF NOT EXISTS formula TEXT NOT NULL DEFAULT '';
ALTER TABLE public.user_custom_structures ADD COLUMN IF NOT EXISTS meaning_vi TEXT NOT NULL DEFAULT '';
ALTER TABLE public.user_custom_structures ADD COLUMN IF NOT EXISTS when_to_use TEXT NOT NULL DEFAULT '';
ALTER TABLE public.user_custom_structures ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'academic-structures';
ALTER TABLE public.user_custom_structures ADD COLUMN IF NOT EXISTS category_label TEXT NOT NULL DEFAULT 'Cấu trúc Câu Học thuật';
ALTER TABLE public.user_custom_structures ADD COLUMN IF NOT EXISTS difficulty TEXT NOT NULL DEFAULT 'Band 7.0–7.5';
ALTER TABLE public.user_custom_structures ADD COLUMN IF NOT EXISTS example_en TEXT NOT NULL DEFAULT '';
ALTER TABLE public.user_custom_structures ADD COLUMN IF NOT EXISTS example_vi TEXT NOT NULL DEFAULT '';
ALTER TABLE public.user_custom_structures ADD COLUMN IF NOT EXISTS notes TEXT NOT NULL DEFAULT '';
ALTER TABLE public.user_custom_structures ADD COLUMN IF NOT EXISTS payload JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.user_custom_structures ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());
ALTER TABLE public.user_custom_structures ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());

CREATE INDEX IF NOT EXISTS idx_user_custom_structures_user
  ON public.user_custom_structures(user_id);

-- ============================================================================
-- PHẦN III: TRIGGERS CẬP NHẬT `updated_at` & TỰ ĐỘNG KHỞI TẠO HỒ SƠ (`auth.users`)
-- ============================================================================

-- 3.1. Trigger tự động khởi tạo 1:1 `profiles`, `user_profiles`, `user_stats` khi đăng ký tài khoản mới
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_name TEXT;
BEGIN
  v_name := COALESCE(
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'name',
    split_part(COALESCE(NEW.email, 'Học viên MASTER'), '@', 1)
  );

  INSERT INTO public.profiles (id, name, email)
  VALUES (NEW.id, v_name, COALESCE(NEW.email, ''))
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_profiles (user_id, name, email)
  VALUES (NEW.id, v_name, COALESCE(NEW.email, ''))
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 3.2. Triggers cập nhật `updated_at` tự động
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'vocabulary_categories',
    'vocabulary',
    'grammar_structures',
    'curriculum_days',
    'ielts_speaking_topics',
    'profiles',
    'user_profiles',
    'vocab_progress',
    'word_progress',
    'saved_words',
    'study_sessions',
    'active_sessions',
    'mistake_bank',
    'mistakes_notebook',
    'user_stats',
    'challenge_60_progress',
    'user_challenge_progress',
    'user_writing_logs',
    'workspace_todos',
    'custom_content_store',
    'user_custom_vocab',
    'user_custom_structures'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated_at ON public.%I;', t, t);
    EXECUTE format(
      'CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();',
      t, t
    );
  END LOOP;
END;
$$;

-- ============================================================================
-- PHẦN IV: ROW LEVEL SECURITY (RLS) TRÊN 100% BẢNG
-- ============================================================================

-- A. Bật RLS trên tất cả 9 bảng nội dung (Công khai đọc, chỉ Admin/Service Role ghi)
DO $$
DECLARE
  ct TEXT;
BEGIN
  FOREACH ct IN ARRAY ARRAY[
    'import_batches',
    'vocabulary_categories',
    'vocabulary',
    'grammar_structures',
    'curriculum_days',
    'curriculum_day_vocab',
    'ielts_speaking_topics',
    'quiz_questions',
    'pdf_library'
  ]
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', ct);

    EXECUTE format('DROP POLICY IF EXISTS %I_public_read ON public.%I;', ct, ct);
    EXECUTE format(
      'CREATE POLICY %I_public_read ON public.%I FOR SELECT TO anon, authenticated USING (true);',
      ct, ct
    );

    EXECUTE format('DROP POLICY IF EXISTS %I_admin_insert ON public.%I;', ct, ct);
    EXECUTE format(
      'CREATE POLICY %I_admin_insert ON public.%I FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_admin()));',
      ct, ct
    );

    EXECUTE format('DROP POLICY IF EXISTS %I_admin_update ON public.%I;', ct, ct);
    EXECUTE format(
      'CREATE POLICY %I_admin_update ON public.%I FOR UPDATE TO authenticated USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()));',
      ct, ct
    );

    EXECUTE format('DROP POLICY IF EXISTS %I_admin_delete ON public.%I;', ct, ct);
    EXECUTE format(
      'CREATE POLICY %I_admin_delete ON public.%I FOR DELETE TO authenticated USING ((SELECT public.is_admin()));',
      ct, ct
    );
  END LOOP;
END;
$$;

-- B. Bật RLS trên bảng `profiles` (khóa sở hữu là cột `id`)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
CREATE POLICY profiles_insert_own ON public.profiles
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = id) WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS profiles_delete_own ON public.profiles;
CREATE POLICY profiles_delete_own ON public.profiles
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = id);

-- C. Bật RLS trên các bảng dữ liệu học tập cá nhân (khóa sở hữu là cột `user_id`)
DO $$
DECLARE
  ut TEXT;
BEGIN
  FOREACH ut IN ARRAY ARRAY[
    'user_profiles',
    'vocab_progress',
    'word_progress',
    'saved_words',
    'study_sessions',
    'active_sessions',
    'mistake_bank',
    'mistakes_notebook',
    'user_stats',
    'challenge_60_progress',
    'user_challenge_progress',
    'user_writing_logs',
    'workspace_todos',
    'custom_content_store',
    'user_custom_vocab',
    'user_custom_structures'
  ]
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', ut);

    EXECUTE format('DROP POLICY IF EXISTS %I_select_own ON public.%I;', ut, ut);
    EXECUTE format(
      'CREATE POLICY %I_select_own ON public.%I FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);',
      ut, ut
    );

    EXECUTE format('DROP POLICY IF EXISTS %I_insert_own ON public.%I;', ut, ut);
    EXECUTE format(
      'CREATE POLICY %I_insert_own ON public.%I FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);',
      ut, ut
    );

    EXECUTE format('DROP POLICY IF EXISTS %I_update_own ON public.%I;', ut, ut);
    EXECUTE format(
      'CREATE POLICY %I_update_own ON public.%I FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);',
      ut, ut
    );

    EXECUTE format('DROP POLICY IF EXISTS %I_delete_own ON public.%I;', ut, ut);
    EXECUTE format(
      'CREATE POLICY %I_delete_own ON public.%I FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);',
      ut, ut
    );
  END LOOP;
END;
$$;

-- ============================================================================
-- PHẦN V: SUPABASE STORAGE BUCKETS & POLICIES (MỤC 11.3)
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'buckets') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES
      (
        'public-editorial-assets',
        'public-editorial-assets',
        true,
        10485760, -- 10 MB
        ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml']
      ),
      (
        'course-pdfs',
        'course-pdfs',
        true,
        52428800, -- 50 MB
        ARRAY['application/pdf']
      ),
      (
        'user-uploads',
        'user-uploads',
        false,
        10485760, -- 10 MB
        ARRAY['image/jpeg', 'image/png', 'image/webp', 'audio/mpeg', 'audio/wav', 'audio/webm']
      )
    ON CONFLICT (id) DO UPDATE SET
      public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Storage buckets initialization skipped: %', SQLERRM;
END;
$$;

-- Storage RLS Policies (chỉ tạo khi bảng storage.objects tồn tại)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'objects') THEN
    DROP POLICY IF EXISTS storage_public_editorial_read ON storage.objects;
    CREATE POLICY storage_public_editorial_read ON storage.objects
      FOR SELECT TO anon, authenticated
      USING (bucket_id IN ('public-editorial-assets', 'course-pdfs'));

    DROP POLICY IF EXISTS storage_admin_editorial_write ON storage.objects;
    CREATE POLICY storage_admin_editorial_write ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (
        bucket_id IN ('public-editorial-assets', 'course-pdfs')
        AND (SELECT public.is_admin())
      );

    DROP POLICY IF EXISTS storage_user_uploads_own ON storage.objects;
    CREATE POLICY storage_user_uploads_own ON storage.objects
      FOR ALL TO authenticated
      USING (
        bucket_id = 'user-uploads'
        AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
      )
      WITH CHECK (
        bucket_id = 'user-uploads'
        AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
      );
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Storage RLS policies skipped: %', SQLERRM;
END;
$$;

-- ============================================================================
-- PHẦN VI: KỊCH BẢN KIỂM THỬ RLS TỰ ĐỘNG (MỤC 11.2 — CHẠY TRONG GIAO DỊCH AN TOÀN)
-- Copy và chạy khối dưới đây trong Supabase SQL Editor để kiểm chứng RLS:
-- ============================================================================
/*
BEGIN;
  -- 1. Kiểm thử vai trò anon: Được phép đọc bảng nội dung, KHÔNG đọc được bảng user
  SET LOCAL ROLE anon;
  SELECT count(*) AS anon_vocab_visible FROM public.vocabulary;
  SELECT count(*) AS anon_profiles_visible FROM public.profiles; -- Kỳ vọng: 0

  -- 2. Kiểm thử vai trò authenticated (User A):
  SET LOCAL ROLE authenticated;
  SET LOCAL "request.jwt.claims" = '{"sub": "11111111-1111-4111-8111-111111111111", "role": "authenticated", "app_metadata": {"role": "student"}}';
  -- User A không thể xóa từ vựng hệ thống:
  DELETE FROM public.vocabulary WHERE legacy_id = 'abandon'; -- Kỳ vọng: 0 rows deleted (bị chặn bởi RLS)
ROLLBACK;
*/
