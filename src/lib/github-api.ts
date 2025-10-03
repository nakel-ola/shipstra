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

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string | null;
  email: string | null;
}

class GitHubAPIError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'GitHubAPIError';
  }
}

export class GitHubAPI {
  private baseUrl = 'https://api.github.com';
  private token: string | null = null;

  constructor(token?: string) {
    this.token = token || null;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async makeRequest<T>(endpoint: string): Promise<T> {
    if (!this.token) {
      throw new GitHubAPIError('GitHub access token is required');
    }

    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Shipstra-App',
      },
    });

    if (!response.ok) {
      const errorMessage = response.status === 401
        ? 'Invalid GitHub access token'
        : response.status === 403
        ? 'GitHub API rate limit exceeded'
        : response.status === 404
        ? 'GitHub resource not found'
        : `GitHub API error: ${response.statusText}`;

      throw new GitHubAPIError(errorMessage, response.status);
    }

    return response.json();
  }

  async getCurrentUser(): Promise<GitHubUser> {
    return this.makeRequest<GitHubUser>('/user');
  }

  async getUserRepositories(options: {
    visibility?: 'all' | 'public' | 'private';
    sort?: 'created' | 'updated' | 'pushed' | 'full_name';
    direction?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
  } = {}): Promise<GitHubRepository[]> {
    const params = new URLSearchParams();

    if (options.visibility) params.append('visibility', options.visibility);
    if (options.sort) params.append('sort', options.sort);
    if (options.direction) params.append('direction', options.direction);
    if (options.per_page) params.append('per_page', options.per_page.toString());
    if (options.page) params.append('page', options.page.toString());

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return this.makeRequest<GitHubRepository[]>(`/user/repos${queryString}`);
  }

  async getAllUserRepositories(): Promise<GitHubRepository[]> {
    const allRepos: GitHubRepository[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const repos = await this.getUserRepositories({
        visibility: 'all',
        sort: 'updated',
        direction: 'desc',
        per_page: perPage,
        page: page
      });

      if (repos.length === 0) break;

      allRepos.push(...repos);

      if (repos.length < perPage) break;
      page++;
    }

    return allRepos;
  }

  async searchUserRepositories(query: string): Promise<GitHubRepository[]> {
    if (!query.trim()) {
      return this.getUserRepositories({
        sort: 'updated',
        direction: 'desc',
        per_page: 50
      });
    }

    const user = await this.getCurrentUser();
    const searchQuery = `${query} user:${user.login}`;

    const response = await this.makeRequest<{
      items: GitHubRepository[];
    }>(`/search/repositories?q=${encodeURIComponent(searchQuery)}&sort=updated`);

    return response.items;
  }
}

export const createGitHubAPI = (token?: string) => new GitHubAPI(token);