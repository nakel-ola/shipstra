import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import { createGitHubAppAuth } from "@/integrations/github/create-github-app-auth";
import { getUserInServer } from "../../helper/get-user-in-server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const { ok, ...rest } = await getUserInServer(request);
    console.log("installationId", { rest, ok });

    if (!ok) {
      return NextResponse.json({ error: rest.error }, { status: rest.status });
    }

    const installationId =
      rest.result?.securitySettings?.github_app_installation_id;

    const owner = searchParams.get("owner");
    const repo = searchParams.get("repo");

    if (!installationId || !owner || !repo) {
      return NextResponse.json(
        { error: "Installation ID, owner, and repo are required" },
        { status: 400 }
      );
    }

    // Create GitHub App authentication
    const auth = createGitHubAppAuth();

    // Get installation access token
    const { token } = await auth({
      type: "installation",
      installationId: parseInt(installationId),
    });

    // Create Octokit instance with installation token
    const octokit = new Octokit({
      auth: token,
    });

    // Fetch branches for the repository
    const { data } = await octokit.rest.repos.listBranches({
      owner,
      repo,
      per_page: 100,
    });

    // Transform branches to include just the name and commit info
    const branches = data.map((branch: any) => ({
      name: branch.name,
      commit: {
        sha: branch.commit.sha,
        url: branch.commit.url,
      },
      protected: branch.protected,
    }));

    return NextResponse.json({ branches });
  } catch (error: any) {
    console.error("Error fetching GitHub branches:", error);

    // Handle specific GitHub API errors
    if (error.status === 401) {
      return NextResponse.json(
        { error: "Invalid GitHub App installation" },
        { status: 401 }
      );
    }

    if (error.status === 403) {
      return NextResponse.json(
        { error: "Access denied to repository" },
        { status: 403 }
      );
    }

    if (error.status === 404) {
      return NextResponse.json(
        { error: "Repository not found or not accessible" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch branches" },
      { status: 500 }
    );
  }
}
