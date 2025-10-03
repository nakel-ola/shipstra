import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  createGitHubAPI,
  GitHubRepository,
  GitHubUser,
} from "@/lib/github-api";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";

export function useGitHubRepos() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch GitHub settings from secure Next.js API route
  const {
    data: gitHubSettings,
    isLoading: isLoadingSettings,
    refetch: refetchGithubSettings,
  } = useQuery({
    queryKey: ["github-settings", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      try {
        // Get current session for authentication
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          return { github_access_token: null };
        }

        // Call our secure API route
        const response = await fetch("/api/github/token", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          console.error("Failed to fetch GitHub token:", response.statusText);
          return { github_access_token: null };
        }

        const data = await response.json();
        return { github_access_token: data.access_token || null };
      } catch (error) {
        console.error("Error fetching GitHub settings:", error);
        return { github_access_token: null };
      }
    },
    enabled: !!user?.id,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const gitHubAPI = gitHubSettings?.github_access_token
    ? createGitHubAPI(gitHubSettings.github_access_token)
    : null;

  // Fetch GitHub user info
  const { data: gitHubUser, refetch: refetchGithubUser } = useQuery({
    queryKey: ["github-user", gitHubSettings?.github_access_token],
    queryFn: () => gitHubAPI!.getCurrentUser(),
    enabled: !!gitHubAPI,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch repositories with search capability
  const {
    data: repositories = [],
    isLoading: isLoadingRepos,
    error: reposError,
    refetch: refetchRepos,
  } = useQuery({
    queryKey: [
      "github-repos",
      gitHubSettings?.github_access_token,
      searchQuery,
    ],
    queryFn: async () => {
      if (!gitHubAPI) return [];

      if (searchQuery.trim()) {
        return gitHubAPI.searchUserRepositories(searchQuery);
      } else {
        return gitHubAPI.getUserRepositories({
          sort: "updated",
          direction: "desc",
          per_page: 100,
        });
      }
    },
    enabled: !!gitHubAPI,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on authentication errors
      if (error?.status === 401) return false;
      return failureCount < 2;
    },
  });

  const searchRepositories = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const saveGitHubToken = useCallback(
    async (token: string) => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      try {
        // Get current session for authentication
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          throw new Error("No active session");
        }

        // Save token using secure API route
        const response = await fetch("/api/github/token", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ access_token: token }),
        });

        console.log(response);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to save GitHub token");
        }

        return true;
      } catch (error: any) {
        throw error;
      }
    },
    [user?.id]
  );

  const removeGitHubToken = useCallback(async () => {
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    try {
      // Get current session for authentication
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("No active session");
      }

      // Remove token using secure API route
      const response = await fetch("/api/github/token", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to remove GitHub token");
      }

      return true;
    } catch (error: any) {
      throw error;
    }
  }, [user?.id]);

  const refreshAll = useCallback(async () => {
    await refetchGithubSettings();
    await refetchGithubUser();
    await refetchRepos();
  }, [refetchGithubSettings, refetchRepos, refetchGithubUser]);

  return {
    // Data
    repositories,
    gitHubUser,
    searchQuery,

    // Loading states
    isLoading: isLoadingSettings || isLoadingRepos,
    isLoadingSettings,
    isLoadingRepos,

    // Error states
    error: reposError,

    // Connection status
    isConnected: !!gitHubSettings?.github_access_token,
    hasValidToken: !!gitHubAPI && !!gitHubUser,

    // Actions
    searchRepositories,
    clearSearch,
    refetchRepos,
    saveGitHubToken,
    removeGitHubToken,
    refreshAll,
  };
}

export type { GitHubRepository, GitHubUser };
