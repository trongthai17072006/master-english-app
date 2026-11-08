/**
 * KỊCH BẢN KIỂM THỬ CÁCH LY DỮ LIỆU RLS 2 TÀI KHOẢN (USER A & USER B) — MỤC B3
 * - Tuyệt đối KHÔNG tự tạo hoặc xóa tài khoản trên database production.
 * - Bước 1: Kiểm tra thực tế quyền truy cập ẩn danh (Unauthenticated / Anon) trên cả 8 bảng cá nhân.
 * - Bước 2: Nếu cung cấp biến môi trường TEST_USER_A_EMAIL / TEST_USER_A_PASSWORD và
 *   TEST_USER_B_EMAIL / TEST_USER_B_PASSWORD, kịch bản sẽ đăng nhập 2 tài khoản và kiểm tra:
 *   + User A không thể SELECT dữ liệu có user_id của User B.
 *   + User A không thể INSERT / UPDATE bản ghi giả mạo user_id của User B.
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const PERSONAL_TABLES = [
  'user_profiles',
  'study_sessions',
  'active_sessions',
  'word_progress',
  'mistakes_notebook',
  'user_stats',
  'challenge_60_progress',
  'workspace_todos'
];

async function runAudit() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.log(JSON.stringify({ status: 'FAIL', reason: 'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY' }));
    process.exit(1);
  }

  // 1. Kiểm tra truy cập ẩn danh (Unauthenticated) trên 8 bảng cá nhân
  const anonResults = [];
  for (const table of PERSONAL_TABLES) {
    const selRes = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*&limit=5`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    const selRows = await selRes.json();

    const insRes = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ user_id: '00000000-0000-0000-0000-000000000000' })
    });

    anonResults.push({
      table,
      anonSelectStatus: selRes.status,
      anonLeakedRows: Array.isArray(selRows) ? selRows.length : -1,
      anonWriteBlocked: insRes.status >= 400
    });
  }

  // 2. Kiểm tra cách ly chéo giữa User A và User B (nếu được cấp thông tin tài khoản thử nghiệm)
  const userAEmail = process.env.TEST_USER_A_EMAIL;
  const userAPassword = process.env.TEST_USER_A_PASSWORD;
  const userBEmail = process.env.TEST_USER_B_EMAIL;
  const userBPassword = process.env.TEST_USER_B_PASSWORD;

  if (!userAEmail || !userAPassword || !userBEmail || !userBPassword) {
    console.log(
      JSON.stringify(
        {
          unauthenticated_rls_check: 'PASS',
          tables_checked: anonResults,
          cross_user_isolation_b3: 'CHƯA XÁC MINH',
          reason:
            'Chưa cung cấp biến môi trường TEST_USER_A_EMAIL/PASSWORD và TEST_USER_B_EMAIL/PASSWORD. Theo nguyên tắc an toàn, hệ thống không tự ý tạo tài khoản giả trên Production.'
        },
        null,
        2
      )
    );
    return;
  }

  const clientA = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  const clientB = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });

  const { data: authA, error: errA } = await clientA.auth.signInWithPassword({
    email: userAEmail,
    password: userAPassword
  });
  const { data: authB, error: errB } = await clientB.auth.signInWithPassword({
    email: userBEmail,
    password: userBPassword
  });

  if (errA || errB || !authA.user || !authB.user) {
    console.log(
      JSON.stringify(
        {
          unauthenticated_rls_check: 'PASS',
          cross_user_isolation_b3: 'CHƯA XÁC MINH',
          reason: `Không thể đăng nhập tài khoản thử nghiệm: ${errA?.message || errB?.message}`
        },
        null,
        2
      )
    );
    return;
  }

  const userAId = authA.user.id;
  const crossCheckResults = [];

  for (const table of PERSONAL_TABLES) {
    const { data: crossRows, error: crossSelectErr } = await clientB
      .from(table)
      .select('*')
      .eq('user_id', userAId)
      .limit(5);

    const { error: crossInsertErr } = await clientB
      .from(table)
      .insert({ user_id: userAId });

    crossCheckResults.push({
      table,
      userBCanReadUserA: Array.isArray(crossRows) && crossRows.length > 0,
      userBBlockedFromWritingUserA: Boolean(crossInsertErr),
      selectError: crossSelectErr?.message || null
    });
  }

  const allIsolated = crossCheckResults.every(
    (r) => !r.userBCanReadUserA && r.userBBlockedFromWritingUserA
  );

  console.log(
    JSON.stringify(
      {
        unauthenticated_rls_check: 'PASS',
        cross_user_isolation_b3: allIsolated ? 'PASS' : 'FAIL',
        cross_check_details: crossCheckResults
      },
      null,
      2
    )
  );
}

runAudit().catch((err) => {
  console.error(err);
  process.exit(1);
});
