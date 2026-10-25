import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * 서버 환경 전용 Supabase 관리자 클라이언트
 * SERVICE_ROLE_KEY를 사용하여 RLS를 안전하게 우회하거나 서버단에서 데이터 영구 기록 시 사용됩니다.
 */
export function getSupabaseServerClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
