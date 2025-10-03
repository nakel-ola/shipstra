import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import {
  GITHUB_APP_ID,
  GITHUB_APP_PRIVATE_KEY,
} from "@/integrations/github/env";
import { createGitHubAppAuth } from "@/integrations/github/create-github-app-auth";
import { getUserInServer } from "../../helper/get-user-in-server";

if (!GITHUB_APP_ID || !GITHUB_APP_PRIVATE_KEY) {
  console.warn("GitHub App credentials not configured");
}

export async function GET(request: NextRequest) {
  try {
    const { ok, ...rest } = await getUserInServer(request);

    if (!ok) {
      return NextResponse.json({ error: rest.error }, { status: rest.status });
    }

    const installationId =
      rest.result?.securitySettings?.github_app_installation_id;

    if (!installationId) {
      return NextResponse.json(
        { error: "Installation ID is required" },
        { status: 400 }
      );
    }

    // Create GitHub App authentication
    let auth;
    try {
      auth = createGitHubAppAuth();
    } catch (authError) {
      console.error("GitHub App auth creation failed:", authError);
      return NextResponse.json(
        { error: "GitHub App configuration error" },
        { status: 500 }
      );
    }

    // Get installation access token
    let token;
    try {
      const authResult = await auth({
        type: "installation",
        installationId: parseInt(installationId),
      });
      token = authResult.token;
      console.log("Successfully obtained installation token");
    } catch (tokenError) {
      console.error("Failed to get installation token:", tokenError);
      return NextResponse.json(
        { error: "Failed to authenticate with GitHub App installation" },
        { status: 500 }
      );
    }

    // Create Octokit instance with installation token
    const octokit = new Octokit({
      auth: token,
    });

    // Fetch repositories that the installation has access to
    const { data } = await octokit.rest.apps.listReposAccessibleToInstallation({
      per_page: 100,
    });

    // Transform repositories to match our interface
    const repositories = data.repositories.map((repo) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      private: repo.private,
      html_url: repo.html_url,
      clone_url: repo.clone_url,
      ssh_url: repo.ssh_url,
      git_url: repo.git_url,
      owner: {
        login: repo.owner.login,
        avatar_url: repo.owner.avatar_url,
      },
      default_branch: repo.default_branch,
      language: repo.language,
      stargazers_count: repo.stargazers_count,
      updated_at: repo.updated_at,
    }));

    return NextResponse.json({ repositories });
  } catch (error: any) {
    console.error("Error fetching GitHub repositories:", error);

    // Handle specific GitHub API errors
    if (error.status === 401) {
      return NextResponse.json(
        { error: "Invalid GitHub App installation" },
        { status: 401 }
      );
    }

    if (error.status === 403) {
      return NextResponse.json(
        { error: "GitHub API rate limit exceeded" },
        { status: 403 }
      );
    }

    if (error.status === 404) {
      return NextResponse.json(
        { error: "GitHub installation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch repositories" },
      { status: 500 }
    );
  }
}
