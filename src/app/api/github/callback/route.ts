import { NextRequest, NextResponse } from "next/server";

import { createAdminClient } from "@/integrations/supabase/server";
import {
  GITHUB_APP_ID,
  GITHUB_APP_PRIVATE_KEY,
  GITHUB_INSTALLATION_SECRET,
  GITHUB_STATE_SECRET,
} from "@/integrations/github/env";
import Cryptr from "@/lib/cryptr";

if (!GITHUB_APP_ID || !GITHUB_APP_PRIVATE_KEY) {
  console.warn(
    "GitHub App credentials not configured. Please set GITHUB_APP_ID and GITHUB_APP_PRIVATE_KEY environment variables."
  );
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const installationId = searchParams.get("installation_id");
    const setupAction = searchParams.get("setup_action");
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    const cryptr = new Cryptr(GITHUB_STATE_SECRET);

    if (!installationId) {
      return NextResponse.redirect(
        new URL("/create-project?error=missing_installation", request.url)
      );
    }

    // For successful GitHub App installation
    if (setupAction === "install") {
      try {
        // Get current user from session state (you may need to decode state parameter)
        const supabaseAdmin = createAdminClient();

        if (!state) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = cryptr.decrypt(state);

        const { data: existingRecord } = await supabaseAdmin
          .from("user_security_settings")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();

        const encryptedInstallationId = new Cryptr(
          GITHUB_INSTALLATION_SECRET
        ).encrypt(installationId);

        let upsertError;

        if (existingRecord) {
          // Update existing record
          const { error } = await supabaseAdmin
            .from("user_security_settings")
            .update({
              github_app_installation_id: encryptedInstallationId,
              github_app_installation_id_updated_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);
          upsertError = error;
        } else {
          // Insert new record
          const { error } = await supabaseAdmin
            .from("user_security_settings")
            .insert({
              user_id: userId,
              github_app_installation_id: encryptedInstallationId,
              github_app_installation_id_updated_at: new Date().toISOString(),
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
                  "GitHub installation storage is not set up. Please run the database migration first.",
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

        // In a real implementation, you would:
        // 1. Decode the state parameter to get user information
        // 2. Store the installation_id associated with the user
        // 3. Verify the installation with GitHub API

        // For now, we'll redirect to create-project with success
        const redirectUrl = new URL("/create-project", request.url);
        redirectUrl.searchParams.set("github_installation", installationId);
        redirectUrl.searchParams.set("status", "connected");

        return NextResponse.redirect(redirectUrl);
      } catch (error) {
        console.error("Error processing GitHub App installation:", error);
        return NextResponse.redirect(
          new URL("/create-project?error=installation_failed", request.url)
        );
      }
    }

    // Default redirect for other cases
    return NextResponse.redirect(new URL("/create-project", request.url));
  } catch (error) {
    console.error("GitHub callback error:", error);
    return NextResponse.redirect(
      new URL("/create-project?error=callback_failed", request.url)
    );
  }
}
