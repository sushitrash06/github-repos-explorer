export interface GitHubUser {
  login: string;
  avatar_url: string;
  id: number;
  html_url: string;
  user_view_type: "public" | "private";
  type: "User" | "Organization";
}

export interface Repo {
  id: number;
  name: string;
  html_url: string;
  description: string;
  full_name?: string;
  owner?: { login: string; avatar_url: string };
  stargazers_count?: number;
  forks_count?: number;
  language?: string;
  updated_at?: string;
  topics?: string[];
  title?: string;
  user?: { login: string; avatar_url: string; html_url: string };
  created_at?: string;
  number?: number;
  repository_url?: string;
  body?: string;
  comments?: number;
  type?: { name: string };
}

export type GitHubUserDetail = {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  type: string;
  name: string | null;
  bio: string | null;
  company: string | null;
  location: string | null;
  blog: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
};
