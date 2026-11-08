-- ============================================================================
-- LEXIMASTER IELTS (MASTER ENGLISH) — POST-IMPORT SQL VALIDATION SUITE (GĐ 5)
-- File: _audit/09_VALIDATION_QUERIES.sql
-- Purpose: Kiểm định toàn diện số lượng bản ghi, khóa ngoại, enum, RLS và
--          kế hoạch thực thi (EXPLAIN ANALYZE) sau khi nạp gói 08_SUPABASE_IMPORT
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. KIỂM ĐỊNH SỐ DÒNG (ROW COUNTS) SO VỚI MANIFEST GỐC
-- Kỳ vọng: tất cả các dòng đều có status = 'PASS'
-- ----------------------------------------------------------------------------
WITH expected_counts (table_name, expected_rows) AS (
  VALUES
    ('import_batches',        1),
    ('vocabulary_categories', 42),
    ('vocabulary',            3666),
    ('grammar_structures',    89),
    ('curriculum_days',       66),
    ('curriculum_day_vocab',  990),
    ('ielts_speaking_topics', 45),
    ('quiz_questions',        153),
    ('pdf_library',           35)
),
actual_counts AS (
  SELECT 'import_batches'        AS table_name, count(*) AS actual_rows FROM public.import_batches
  UNION ALL
  SELECT 'vocabulary_categories' AS table_name, count(*) AS actual_rows FROM public.vocabulary_categories
  UNION ALL
  SELECT 'vocabulary'            AS table_name, count(*) AS actual_rows FROM public.vocabulary
  UNION ALL
  SELECT 'grammar_structures'    AS table_name, count(*) AS actual_rows FROM public.grammar_structures
  UNION ALL
  SELECT 'curriculum_days'       AS table_name, count(*) AS actual_rows FROM public.curriculum_days
  UNION ALL
  SELECT 'curriculum_day_vocab'  AS table_name, count(*) AS actual_rows FROM public.curriculum_day_vocab
  UNION ALL
  SELECT 'ielts_speaking_topics' AS table_name, count(*) AS actual_rows FROM public.ielts_speaking_topics
  UNION ALL
  SELECT 'quiz_questions'        AS table_name, count(*) AS actual_rows FROM public.quiz_questions
  UNION ALL
  SELECT 'pdf_library'           AS table_name, count(*) AS actual_rows FROM public.pdf_library
)
SELECT
  e.table_name,
  e.expected_rows,
  a.actual_rows,
  (a.actual_rows - e.expected_rows) AS diff,
  CASE WHEN a.actual_rows = e.expected_rows THEN 'PASS' ELSE 'FAIL' END AS status
FROM expected_counts e
JOIN actual_counts a USING (table_name)
ORDER BY e.table_name;

-- ----------------------------------------------------------------------------
-- 2. KIỂM ĐỊNH TOÀN VẸN KHÓA NGOẠI (ORPHAN FK CHECKS — KỲ VỌNG = 0)
-- ----------------------------------------------------------------------------
SELECT
  'vocabulary.category_id -> vocabulary_categories.id' AS fk_check,
  count(*) AS orphan_count
FROM public.vocabulary v
LEFT JOIN public.vocabulary_categories c ON c.id = v.category_id
WHERE v.category_id IS NOT NULL AND c.id IS NULL

UNION ALL

SELECT
  'curriculum_day_vocab.day_id -> curriculum_days.id' AS fk_check,
  count(*) AS orphan_count
FROM public.curriculum_day_vocab dv
LEFT JOIN public.curriculum_days d ON d.id = dv.day_id
WHERE d.id IS NULL

UNION ALL

SELECT
  'curriculum_day_vocab.vocab_id -> vocabulary.id' AS fk_check,
  count(*) AS orphan_count
FROM public.curriculum_day_vocab dv
LEFT JOIN public.vocabulary v ON v.id = dv.vocab_id
WHERE dv.vocab_id IS NOT NULL AND v.id IS NULL

UNION ALL

SELECT
  'vocabulary.import_batch_id -> import_batches.id' AS fk_check,
  count(*) AS orphan_count
FROM public.vocabulary v
LEFT JOIN public.import_batches b ON b.id = v.import_batch_id
WHERE v.import_batch_id IS NOT NULL AND b.id IS NULL;

-- ----------------------------------------------------------------------------
-- 3. KIỂM ĐỊNH RÀNG BUỘC TRƯỜNG BẮT BUỘC & ENUM (KỲ VỌNG = 0 VI PHẠM)
-- ----------------------------------------------------------------------------
SELECT
  count(*) FILTER (WHERE trim(word) = '' OR trim(meaning_vi) = '') AS empty_vocab_word_or_meaning,
  count(*) FILTER (WHERE pos NOT IN ('noun', 'verb', 'adj', 'adv', 'phrase', 'idiom', 'grammar')) AS invalid_pos_count,
  count(*) FILTER (WHERE cefr_level NOT IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')) AS invalid_cefr_count,
  count(*) FILTER (WHERE needs_review = true) AS flagged_needs_review_count
FROM public.vocabulary;

-- ----------------------------------------------------------------------------
-- 4. KIỂM ĐỊNH BẢO MẬT RLS TRÊN TOÀN BỘ 21 BẢNG PUBLIC (KỲ VỌNG: 0 BẢNG TẮT RLS)
-- ----------------------------------------------------------------------------
SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_enabled,
  CASE WHEN rowsecurity THEN 'PASS' ELSE 'FAIL_RLS_DISABLED' END AS audit_status
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ----------------------------------------------------------------------------
-- 5. KIỂM ĐỊNH CHỈ MỤC (INDEX COVERAGE) TRÊN BẢNG CONTENT & USER
-- ----------------------------------------------------------------------------
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ----------------------------------------------------------------------------
-- 6. TRUY VẤN MẪU CHỐNG N+1 & KIỂM ĐỊNH EXPLAIN ANALYZE
-- ----------------------------------------------------------------------------
-- 6.1. Lấy toàn bộ Ngày học #1 kèm danh sách 15 từ vựng đã sắp xếp trong 1 truy vấn duy nhất (Zero N+1):
EXPLAIN ANALYZE
SELECT
  d.day_number,
  d.topic_en,
  d.topic_vi,
  COALESCE(
    json_agg(
      json_build_object(
        'order', dv.display_order,
        'word', dv.word,
        'ipa', dv.ipa,
        'pos', dv.pos,
        'meaning_vi', dv.meaning_vi,
        'vocab_id', dv.vocab_id
      ) ORDER BY dv.display_order
    ) FILTER (WHERE dv.id IS NOT NULL),
    '[]'::json
  ) AS day_vocabulary
FROM public.curriculum_days d
LEFT JOIN public.curriculum_day_vocab dv ON dv.day_id = d.id
WHERE d.day_number = 1
GROUP BY d.id;

-- 6.2. Tìm kiếm từ vựng học thuật qua GIN Full-Text Search (tsvector):
EXPLAIN ANALYZE
SELECT id, legacy_id, word, ipa, pos, cefr_level, meaning_vi
FROM public.vocabulary
WHERE fts_vector @@ plainto_tsquery('english', 'sustainable development')
ORDER BY cefr_level DESC
LIMIT 20;
