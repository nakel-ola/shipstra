import { createAppAuth } from "@octokit/auth-app";
import { GITHUB_APP_ID, GITHUB_APP_PRIVATE_KEY } from "./env";

export const createGitHubAppAuth = () => {
  if (!GITHUB_APP_ID || !GITHUB_APP_PRIVATE_KEY) {
    throw new Error("GitHub App credentials not configured");
  }

  // Handle different private key formats
  let privateKey = GITHUB_APP_PRIVATE_KEY;

  // If the key is base64 encoded, decode it
  if (!privateKey.includes("-----BEGIN")) {
    try {
      privateKey = Buffer.from(privateKey, "base64").toString("utf8");
      console.log("Successfully decoded base64 key");
    } catch (e) {
      console.log("Failed to decode base64, using as-is");
      // If decoding fails, try to use as-is
    }
  }

  // Replace escaped newlines with actual newlines
  privateKey = privateKey.replace(/\\n/g, "\n");

  // Validate the key format
  if (!privateKey.includes("-----BEGIN") || !privateKey.includes("-----END")) {
    throw new Error("Invalid private key format");
  }

  try {
    return createAppAuth({
      appId: GITHUB_APP_ID,
      privateKey,
    });
  } catch (error) {
    console.error("Failed to create GitHub App auth:", error);
    throw new Error("Failed to initialize GitHub App authentication");
  }
};
