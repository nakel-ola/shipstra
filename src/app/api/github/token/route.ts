import { NextRequest, NextResponse } from "next/server";
import { createGitHubAPI } from "@/lib/github-api";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/integrations/supabase/types";
import { SUPABASE_URL } from "@/integrations/supabase/env";
import { createAdminClient } from "@/integrations/supabase/server";

// Simple encryption/decryption using base64 (replace with proper encryption in production)
const encryptToken = (token: string): string => {
  return Buffer.from(token).toString("base64");
};

const decryptToken = (encryptedToken: string): string => {
  return Buffer.from(encryptedToken, "base64").toString("utf-8");
};

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = createAdminClient();
    // Get the authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user with admin client
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(authHeader.replace("Bearer ", ""));

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get GitHub token from database
    const { data: securitySettings, error } = await supabaseAdmin
      .from("user_security_settings")
      .select("github_encrypted_token, github_username")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (!securitySettings?.github_encrypted_token) {
      return NextResponse.json({ access_token: null });
    }

    // Decrypt and return token
    const decryptedToken = decryptToken(
      securitySettings.github_encrypted_token
    );

    return NextResponse.json({
      access_token: decryptedToken,
      github_username: securitySettings.github_username,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = createAdminClient();
    // Get the authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user with admin client
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(authHeader.replace("Bearer ", ""));

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { access_token } = await request.json();

    if (!access_token) {
      return NextResponse.json(
        { error: "Access token is required" },
        { status: 400 }
      );
    }

    // Validate the GitHub token
    const gitHubAPI = createGitHubAPI(access_token);
    let githubUser;

    try {
      githubUser = await gitHubAPI.getCurrentUser();
    } catch {
      return NextResponse.json(
        { error: "Invalid GitHub access token" },
        { status: 400 }
      );
    }

    // Encrypt and store the token securely in database
    const encryptedToken = encryptToken(access_token);

    // Store in Supabase database - check if record exists first
    const { data: existingRecord } = await supabaseAdmin
      .from("user_security_settings")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    let upsertError;

    if (existingRecord) {
      // Update existing record
      const { error } = await supabaseAdmin
        .from("user_security_settings")
        .update({
          github_encrypted_token: encryptedToken,
          github_username: githubUser.login,
          github_token_updated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);
      upsertError = error;
    } else {
      // Insert new record
      const { error } = await supabaseAdmin
        .from("user_security_settings")
        .insert({
          user_id: user.id,
          github_encrypted_token: encryptedToken,
          github_username: githubUser.login,
          github_token_updated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      upsertError = error;
    }

    if (upsertError) {
      console.error("Database error:", upsertError);

      // Check if the error is due to missing columns
      if (
        upsertError.message?.includes("github_encrypted_token") ||
        upsertError.message?.includes("column") ||
        upsertError.code === "PGRST204"
      ) {
        return NextResponse.json(
          {
            error:
              "GitHub token storage is not set up. Please run the database migration first.",
            hint: "Run the SQL migration to add GitHub token columns to user_security_settings table.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: "Failed to save GitHub token" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabaseAdmin = createAdminClient();
    // Get the authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user with admin client
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(authHeader.replace("Bearer ", ""));

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Remove GitHub token from database
    const { error: updateError } = await supabaseAdmin
      .from("user_security_settings")
      .update({
        github_encrypted_token: null,
        github_username: null,
        github_token_updated_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Database error:", updateError);
      return NextResponse.json(
        { error: "Failed to remove GitHub token" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
