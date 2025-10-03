import { NextRequest, NextResponse } from "next/server";
import { createGitHubAPI } from "@/lib/github-api";
import { createServerClient } from "@/integrations/supabase/server";

// Simple encryption/decryption using base64 (replace with proper encryption in production)
const encryptToken = (token: string): string => {
  return Buffer.from(token).toString("base64");
};

const decryptToken = (encryptedToken: string): string => {
  return Buffer.from(encryptedToken, "base64").toString("utf-8");
};

// Fallback: Use profiles table with a JSON metadata approach
export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = await createServerClient();
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(authHeader.replace("Bearer ", ""));

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use profiles table to store GitHub token in bio field temporarily
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('bio')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    // Parse GitHub data from bio field (temporary storage)
    let githubData = null;
    try {
      if (profile?.bio && profile.bio.startsWith('GITHUB:')) {
        const jsonData = profile.bio.replace('GITHUB:', '');
        githubData = JSON.parse(jsonData);
      }
    } catch {
      // Invalid data, ignore
    }

    if (!githubData?.token) {
      return NextResponse.json({ access_token: null });
    }

    // Decrypt and return token
    const decryptedToken = decryptToken(githubData.token);

    return NextResponse.json({
      access_token: decryptedToken,
      github_username: githubData.username,
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
    const supabaseAdmin = await createServerClient();
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    // Encrypt and store in bio field temporarily
    const encryptedToken = encryptToken(access_token);
    const githubData = {
      token: encryptedToken,
      username: githubUser.login,
      updated: new Date().toISOString(),
    };

    const { error: upsertError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        user_id: user.id,
        bio: `GITHUB:${JSON.stringify(githubData)}`,
        updated_at: new Date().toISOString(),
      });

    if (upsertError) {
      console.error('Database error:', upsertError);
      return NextResponse.json(
        { error: 'Failed to save GitHub token' },
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
    const supabaseAdmin = await createServerClient();
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(authHeader.replace("Bearer ", ""));

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Remove GitHub data from bio field
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        bio: null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Database error:', updateError);
      return NextResponse.json(
        { error: 'Failed to remove GitHub token' },
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