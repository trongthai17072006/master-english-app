-- ============================================================================
-- LEXIMASTER IELTS — IDEMPOTENT UPSERT IMPORT SCRIPT (2ND-RUN SAFE)
-- File: _audit/08_SUPABASE_IMPORT/10_IDEMPOTENT_UPSERT_IMPORT.sql
-- Purpose: Cho phép chạy nạp dữ liệu lần 2 (hoặc nhiều lần) mà KHÔNG tạo bản ghi
--          trùng lặp, KHÔNG gãy khóa ngoại và KHÔNG làm mất dữ liệu hiện có.
-- Usage:   psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f _audit/08_SUPABASE_IMPORT/10_IDEMPOTENT_UPSERT_IMPORT.sql
-- ============================================================================

BEGIN;

-- 1. Tạo các bảng tạm (TEMP STAGING TABLES) tự động hủy khi kết thúc giao dịch (ON COMMIT DROP)
CREATE TEMP TABLE stg_import_batches        (LIKE public.import_batches        INCLUDING DEFAULTS) ON COMMIT DROP;
CREATE TEMP TABLE stg_vocabulary_categories (LIKE public.vocabulary_categories INCLUDING DEFAULTS) ON COMMIT DROP;
CREATE TEMP TABLE stg_vocabulary            (
  id UUID, legacy_id TEXT, word TEXT, word_normalized TEXT, ipa TEXT, pos TEXT, pos_raw TEXT,
  cefr_level TEXT, meaning_vi TEXT, example_en TEXT, example_vi TEXT, synonyms JSONB, antonyms JSONB,
  collocations JSONB, word_family JSONB, detailed_note TEXT, tags JSONB, category_id UUID,
  needs_review BOOLEAN, source_file TEXT, source_hash TEXT, import_batch_id UUID,
  created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ
) ON COMMIT DROP;
CREATE TEMP TABLE stg_grammar_structures    (LIKE public.grammar_structures    INCLUDING DEFAULTS) ON COMMIT DROP;
CREATE TEMP TABLE stg_curriculum_days       (LIKE public.curriculum_days       INCLUDING DEFAULTS) ON COMMIT DROP;
CREATE TEMP TABLE stg_curriculum_day_vocab  (LIKE public.curriculum_day_vocab  INCLUDING DEFAULTS) ON COMMIT DROP;
CREATE TEMP TABLE stg_ielts_speaking_topics (LIKE public.ielts_speaking_topics INCLUDING DEFAULTS) ON COMMIT DROP;
CREATE TEMP TABLE stg_quiz_questions        (LIKE public.quiz_questions        INCLUDING DEFAULTS) ON COMMIT DROP;
CREATE TEMP TABLE stg_pdf_library           (LIKE public.pdf_library           INCLUDING DEFAULTS) ON COMMIT DROP;

-- 2. Nạp CSV vào các bảng tạm
\copy stg_import_batches(id,batch_code,description,source_version,total_tables,imported_at,created_at) FROM '_audit/08_SUPABASE_IMPORT/01_import_batches.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');
\copy stg_vocabulary_categories(id,legacy_id,slug,name,display_order,vocab_count,import_batch_id,created_at,updated_at) FROM '_audit/08_SUPABASE_IMPORT/02_vocabulary_categories.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');
\copy stg_vocabulary(id,legacy_id,word,word_normalized,ipa,pos,pos_raw,cefr_level,meaning_vi,example_en,example_vi,synonyms,antonyms,collocations,word_family,detailed_note,tags,category_id,needs_review,source_file,source_hash,import_batch_id,created_at,updated_at) FROM '_audit/08_SUPABASE_IMPORT/03_vocabulary.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');
\copy stg_grammar_structures(id,legacy_id,item_number,structure_name,formula,meaning_vi,when_to_use,category_slug,category_label,difficulty_band,example_en,example_vi,how_it_works_vi,syntactic_breakdown,expanded_examples,sentence_transformations,common_mistakes,source_pdf_name,source_pdf_page,source_file,source_hash,import_batch_id,created_at,updated_at) FROM '_audit/08_SUPABASE_IMPORT/04_grammar_structures.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');
\copy stg_curriculum_days(id,legacy_id,day_number,week_number,topic_en,topic_vi,theme_tag,band_target,reading_title,reading_source,reading_paragraphs,reading_questions,writing_prompt,writing_question_type,writing_outline,writing_model_essay,speaking_topic,speaking_part1,speaking_cue_card,speaking_part3,source_file,source_hash,import_batch_id,created_at,updated_at) FROM '_audit/08_SUPABASE_IMPORT/05_curriculum_days.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');
\copy stg_curriculum_day_vocab(id,legacy_id,day_id,day_number,display_order,vocab_id,word,ipa,pos,meaning_vi,collocations,example_en,example_vi,detailed_note,source_file,source_hash,import_batch_id,created_at) FROM '_audit/08_SUPABASE_IMPORT/06_curriculum_day_vocab.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');
\copy stg_ielts_speaking_topics(id,legacy_id,topic_number,part_type,topic_en,topic_vi,theme_tag,band_target,part1_questions,part2_cue_card,part3_questions,vocabulary_Executing,source_file,source_hash,import_batch_id,created_at,updated_at) FROM '_audit/08_SUPABASE_IMPORT/07_ielts_speaking_topics.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');
\copy stg_quiz_questions(id,legacy_id,quiz_type,question_prompt,options,correct_answer,explanation_vi,meaning_hint_vi,example_en,metadata,source_file,source_hash,import_batch_id,created_at) FROM '_audit/08_SUPABASE_IMPORT/08_quiz_questions.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');
\copy stg_pdf_library(id,legacy_id,record_type,title,subtitle,category,difficulty,summary_vi,content_json,pdf_file_name,pdf_page,source_file,source_hash,import_batch_id,created_at) FROM '_audit/08_SUPABASE_IMPORT/09_pdf_library.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');

-- 3. Upsert từng bảng theo đúng thứ tự Khóa Ngoại (Idempotent 100%)
INSERT INTO public.import_batches
SELECT * FROM stg_import_batches
ON CONFLICT (id) DO UPDATE SET
  description = EXCLUDED.description,
  source_version = EXCLUDED.source_version,
  total_tables = EXCLUDED.total_tables,
  imported_at = EXCLUDED.imported_at;

INSERT INTO public.vocabulary_categories
SELECT * FROM stg_vocabulary_categories
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  display_order = EXCLUDED.display_order,
  vocab_count = EXCLUDED.vocab_count,
  import_batch_id = EXCLUDED.import_batch_id,
  updated_at = timezone('utc'::text, now());

INSERT INTO public.vocabulary (
  id, legacy_id, word, word_normalized, ipa, pos, pos_raw, cefr_level,
  meaning_vi, example_en, example_vi, synonyms, antonyms, collocations,
  word_family, detailed_note, tags, category_id, needs_review, source_file,
  source_hash, import_batch_id, created_at, updated_at
)
SELECT
  id, legacy_id, word, word_normalized, ipa, pos, pos_raw, cefr_level,
  meaning_vi, example_en, example_vi, synonyms, antonyms, collocations,
  word_family, detailed_note, tags, category_id, needs_review, source_file,
  source_hash, import_batch_id, created_at, updated_at
FROM stg_vocabulary
ON CONFLICT (id) DO UPDATE SET
  word = EXCLUDED.word,
  word_normalized = EXCLUDED.word_normalized,
  ipa = EXCLUDED.ipa,
  pos = EXCLUDED.pos,
  pos_raw = EXCLUDED.pos_raw,
  cefr_level = EXCLUDED.cefr_level,
  meaning_vi = EXCLUDED.meaning_vi,
  example_en = EXCLUDED.example_en,
  example_vi = EXCLUDED.example_vi,
  synonyms = EXCLUDED.synonyms,
  antonyms = EXCLUDED.antonyms,
  collocations = EXCLUDED.collocations,
  word_family = EXCLUDED.word_family,
  detailed_note = EXCLUDED.detailed_note,
  tags = EXCLUDED.tags,
  category_id = EXCLUDED.category_id,
  needs_review = EXCLUDED.needs_review,
  source_hash = EXCLUDED.source_hash,
  import_batch_id = EXCLUDED.import_batch_id,
  updated_at = timezone('utc'::text, now());

INSERT INTO public.grammar_structures
SELECT * FROM stg_grammar_structures
ON CONFLICT (id) DO UPDATE SET
  structure_name = EXCLUDED.structure_name,
  formula = EXCLUDED.formula,
  meaning_vi = EXCLUDED.meaning_vi,
  when_to_use = EXCLUDED.when_to_use,
  category_slug = EXCLUDED.category_slug,
  category_label = EXCLUDED.category_label,
  difficulty_band = EXCLUDED.difficulty_band,
  example_en = EXCLUDED.example_en,
  example_vi = EXCLUDED.example_vi,
  how_it_works_vi = EXCLUDED.how_it_works_vi,
  syntactic_breakdown = EXCLUDED.syntactic_breakdown,
  expanded_examples = EXCLUDED.expanded_examples,
  sentence_transformations = EXCLUDED.sentence_transformations,
  common_mistakes = EXCLUDED.common_mistakes,
  source_hash = EXCLUDED.source_hash,
  import_batch_id = EXCLUDED.import_batch_id,
  updated_at = timezone('utc'::text, now());

INSERT INTO public.curriculum_days
SELECT * FROM stg_curriculum_days
ON CONFLICT (id) DO UPDATE SET
  topic_en = EXCLUDED.topic_en,
  topic_vi = EXCLUDED.topic_vi,
  theme_tag = EXCLUDED.theme_tag,
  band_target = EXCLUDED.band_target,
  reading_title = EXCLUDED.reading_title,
  reading_source = EXCLUDED.reading_source,
  reading_paragraphs = EXCLUDED.reading_paragraphs,
  reading_questions = EXCLUDED.reading_questions,
  writing_prompt = EXCLUDED.writing_prompt,
  writing_question_type = EXCLUDED.writing_question_type,
  writing_outline = EXCLUDED.writing_outline,
  writing_model_essay = EXCLUDED.writing_model_essay,
  speaking_topic = EXCLUDED.speaking_topic,
  speaking_part1 = EXCLUDED.speaking_part1,
  speaking_cue_card = EXCLUDED.speaking_cue_card,
  speaking_part3 = EXCLUDED.speaking_part3,
  source_hash = EXCLUDED.source_hash,
  import_batch_id = EXCLUDED.import_batch_id,
  updated_at = timezone('utc'::text, now());

INSERT INTO public.curriculum_day_vocab
SELECT * FROM stg_curriculum_day_vocab
ON CONFLICT (id) DO UPDATE SET
  vocab_id = EXCLUDED.vocab_id,
  word = EXCLUDED.word,
  ipa = EXCLUDED.ipa,
  pos = EXCLUDED.pos,
  meaning_vi = EXCLUDED.meaning_vi,
  collocations = EXCLUDED.collocations,
  example_en = EXCLUDED.example_en,
  example_vi = EXCLUDED.example_vi,
  detailed_note = EXCLUDED.detailed_note,
  source_hash = EXCLUDED.source_hash,
  import_batch_id = EXCLUDED.import_batch_id;

INSERT INTO public.ielts_speaking_topics
SELECT * FROM stg_ielts_speaking_topics
ON CONFLICT (id) DO UPDATE SET
  topic_en = EXCLUDED.topic_en,
  topic_vi = EXCLUDED.topic_vi,
  theme_tag = EXCLUDED.theme_tag,
  band_target = EXCLUDED.band_target,
  part1_questions = EXCLUDED.part1_questions,
  part2_cue_card = EXCLUDED.part2_cue_card,
  part3_questions = EXCLUDED.part3_questions,
  vocabulary_Executing = EXCLUDED.vocabulary_Executing,
  source_hash = EXCLUDED.source_hash,
  import_batch_id = EXCLUDED.import_batch_id,
  updated_at = timezone('utc'::text, now());

INSERT INTO public.quiz_questions
SELECT * FROM stg_quiz_questions
ON CONFLICT (id) DO UPDATE SET
  quiz_type = EXCLUDED.quiz_type,
  question_prompt = EXCLUDED.question_prompt,
  options = EXCLUDED.options,
  correct_answer = EXCLUDED.correct_answer,
  explanation_vi = EXCLUDED.explanation_vi,
  meaning_hint_vi = EXCLUDED.meaning_hint_vi,
  example_en = EXCLUDED.example_en,
  metadata = EXCLUDED.metadata,
  source_hash = EXCLUDED.source_hash,
  import_batch_id = EXCLUDED.import_batch_id;

INSERT INTO public.pdf_library
SELECT * FROM stg_pdf_library
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  summary_vi = EXCLUDED.summary_vi,
  content_json = EXCLUDED.content_json,
  pdf_file_name = EXCLUDED.pdf_file_name,
  pdf_page = EXCLUDED.pdf_page,
  source_hash = EXCLUDED.source_hash,
  import_batch_id = EXCLUDED.import_batch_id;

COMMIT;
