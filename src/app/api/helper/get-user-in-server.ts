import { createAdminClient } from "@/integrations/supabase/server";
import { NextRequest } from "next/server";

export const getUserInServer = async (request: NextRequest) => {
  const supabaseAdmin = createAdminClient();

  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return {
      ok: false,
      error: "Unauthorized",
      status: 401,
    };
  }

  const {
    data: { user },
    error: authError,
  } = await supabaseAdmin.auth.getUser(authHeader.replace("Bearer ", ""));

  if (authError || !user) {
    return {
      ok: false,
      error: "Unauthorized",
      status: 401,
    };
  }

  const { data: securitySettings, error } = await supabaseAdmin
    .from("user_security_settings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      error: "Database error",
      status: 500,
    };
  }

  return {
    ok: true,
    status: 200,
    result: {
      ...user,
      securitySettings,
    },
  };
};
