import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY,
    GITHUB_APP_NAME: process.env.GITHUB_APP_NAME,
    GITHUB_WEBHOOK_SECRET: process.env.GITHUB_WEBHOOK_SECRET,
    GITHUB_APP_ID: process.env.GITHUB_APP_ID,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRETS: process.env.GITHUB_CLIENT_SECRETS,
    GITHUB_APP_PRIVATE_KEY: process.env.GITHUB_APP_PRIVATE_KEY,
    GITHUB_STATE_SECRET: process.env.GITHUB_STATE_SECRET,
    GITHUB_INSTALLATION_SECRET: process.env.GITHUB_INSTALLATION_SECRET,
  },
};

export default nextConfig;
