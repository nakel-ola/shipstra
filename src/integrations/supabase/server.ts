import { SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL } from "./env";
import { Database } from "./types";
import { createClient } from "@supabase/supabase-js";

export const createAdminClient = () => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing required Supabase environment variables");
  }

  return createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
