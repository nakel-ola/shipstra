"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Cryptr from "@/lib/cryptr";
import { GITHUB_STATE_SECRET } from "@/integrations/github/env";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "./use-user";

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  html_url: string;
  clone_url: string;
  ssh_url: string;
  git_url: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  default_branch: string;
  language: string | null;
  stargazers_count: number;
  updated_at: string;
}

export interface GitHubBranch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
}

// GitHub App name - set this in your .env.local file
// GITHUB_APP_NAME=your-app-name
const GITHUB_APP_NAME = process.env.GITHUB_APP_NAME;

export function useGitHubApp() {
  const [searchQuery, setSearchQuery] = useState("");

  const { isLoading, user } = useUser();

  const installationId = user?.securitySettings?.github_app_installation_id;
  // Check for installation ID from URL params on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const githubInstallation = urlParams.get("github_installation");
      const status = urlParams.get("status");

      if (githubInstallation && status === "connected") {
        // Clean up URL params
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete("github_installation");
        newUrl.searchParams.delete("status");
        window.history.replaceState({}, "", newUrl.toString());
      }
    }
  }, []);

  // Fetch repositories using GitHub App
  const {
    data: repositories = [],
    isLoading: isLoadingRepos,
    error: reposError,
    refetch: refetchRepos,
  } = useQuery({
    queryKey: ["github-app-repos", installationId, searchQuery],
    queryFn: async () => {
      if (!installationId) return [];

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Unauthorized");
      }

      try {
        const response = await fetch(`/api/github/repos`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();

          // Handle specific error cases
          if (
            response.status === 500 &&
            errorData.error?.includes("configuration")
          ) {
            throw new Error(
              "GitHub App not configured properly. Please check environment variables."
            );
          }

          throw new Error(errorData.error || "Failed to fetch repositories");
        }

        const data = await response.json();
        let repos = data.repositories as GitHubRepository[];

        // Filter repositories based on search query
        if (searchQuery.trim()) {
          repos = repos.filter(
            (repo) =>
              repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              repo.description
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase())
          );
        }

        return repos;
      } catch (error) {
        console.error("Error in GitHub repos query:", error);
        throw error;
      }
    },
    enabled: !!installationId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on authentication errors
      if (error?.message?.includes("Invalid GitHub App installation")) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Fetch branches for a specific repository
  const fetchBranches = useCallback(
    async (owner: string, repo: string): Promise<GitHubBranch[]> => {
      console.log("BRANCH:", { owner, repo, installationId });
      if (!installationId) {
        throw new Error("No GitHub App installation found");
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Unauthorized");
      }

      const response = await fetch(
        `/api/github/branches?owner=${owner}&repo=${repo}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch branches");
      }

      const data = await response.json();
      return data.branches;
    },
    [installationId]
  );

  const searchRepositories = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const installGitHubApp = useCallback(async () => {
    // Generate a state parameter for security (in production, you should store this securely)

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const cryptr = new Cryptr(GITHUB_STATE_SECRET);

    const state = cryptr.encrypt(user?.id || "");

    // Redirect to GitHub App installation
    const installUrl = `https://github.com/apps/${GITHUB_APP_NAME}/installations/new?state=${state}`;
    window.open(installUrl, "_blank");
  }, []);

  const disconnectGitHubApp = useCallback(() => {
    // In a real implementation, you might want to revoke the installation
  }, []);

  return {
    // Data
    repositories,
    searchQuery,
    installationId,

    // Loading states
    isLoading: isLoadingRepos || isLoading,
    isUserLoading: isLoading,
    isLoadingRepos,

    // Error states
    error: reposError,

    // Connection status
    isConnected: !!installationId,

    // Actions
    searchRepositories,
    clearSearch,
    refetchRepos,
    fetchBranches,
    installGitHubApp,
    disconnectGitHubApp,
  };
}
