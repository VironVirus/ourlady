import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_ST_CAMILLUS_SUPABASE_URL ??
  process.env.ST_CAMILLUS_SUPABASE_URL ??
  "";
const supabaseServiceRoleKey =
  process.env.ST_CAMILLUS_SUPABASE_SERVICE_ROLE_KEY ?? "";

export const siteContentTable = "site_content";
export const siteContentRowId = "main";
export const newsPostsTable = "news_posts";
export const documentsTable = "uploaded_documents";
export const churchMediaBucket =
  process.env.ST_CAMILLUS_SUPABASE_STORAGE_BUCKET ?? "st-camillus-media";

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseServiceRoleKey);
}

export function getSupabaseAdmin() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
