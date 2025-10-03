# GitHub App Setup Guide

This guide explains how to set up GitHub App integration for the create project flow.

## Prerequisites

1. Create a GitHub App in your GitHub account/organization
2. Install the app on your repositories
3. Configure environment variables

## Step 1: Create GitHub App

1. Go to GitHub Settings → Developer settings → GitHub Apps
2. Click "New GitHub App"
3. Fill in the details:
   - **App name**: `your-app-name` (e.g., "shipstra")
   - **Homepage URL**: Your app's homepage
   - **Callback URL**: `https://your-domain.com/api/github/callback`
   - **Webhook URL**: Optional for basic functionality

4. Set permissions:
   - **Repository permissions**:
     - Contents: Read
     - Metadata: Read
     - Pull requests: Read (if needed)

5. Click "Create GitHub App"

## Step 2: Get App Credentials

After creating the app:

1. Note down the **App ID**
2. Generate a **Private Key** (download the .pem file)
3. Convert the private key to base64 or store as-is

## Step 3: Environment Variables

Add these to your `.env.local` file:

```env
# GitHub App Configuration
GITHUB_APP_ID=123456
GITHUB_APP_NAME=your-app-name

# Option 1: Raw private key (with escaped newlines)
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA...\n-----END RSA PRIVATE KEY-----"

# Option 2: Base64 encoded private key
GITHUB_APP_PRIVATE_KEY=LS0tLS1CRUdJTi...

# Option 3: File path to private key
GITHUB_APP_PRIVATE_KEY_PATH=/path/to/private-key.pem
```

## Step 4: Install App

1. Go to your GitHub App settings
2. Click "Install App"
3. Select the account/organization
4. Choose repositories to grant access to
5. Click "Install"

## Step 5: Test Integration

1. Start your development server
2. Go to `/create-project`
3. Click "Install GitHub App"
4. Grant access to repositories
5. You should be redirected back with access to selected repos

## Troubleshooting

### Private Key Issues

If you get "DECODER routines::unsupported" errors:

1. **Check key format**: Ensure it starts with `-----BEGIN` and ends with `-----END`
2. **Escape newlines**: Use `\n` instead of actual newlines in .env
3. **Base64 encode**: Convert the entire .pem file to base64
4. **File path**: Store the .pem file and reference its path

### Authentication Errors

1. **Verify App ID**: Make sure `GITHUB_APP_ID` matches your GitHub App
2. **Check installation**: Ensure the app is installed on the repositories
3. **Permissions**: Verify the app has required repository permissions

### Installation Callback Issues

1. **Callback URL**: Must match exactly in GitHub App settings
2. **HTTPS required**: GitHub requires HTTPS for production callbacks
3. **Development**: Use ngrok or similar for local development

## Development Setup

For local development:

1. Use ngrok to create HTTPS tunnel: `ngrok http 3000`
2. Update GitHub App callback URL to ngrok URL
3. Set environment variables
4. Test the flow

## Production Setup

1. Set production callback URL in GitHub App settings
2. Configure environment variables in your hosting platform
3. Ensure HTTPS is enabled
4. Test the complete flow

## Security Notes

- Never commit private keys to version control
- Use environment variables for all sensitive data
- Rotate keys periodically
- Monitor app installation events
- Limit repository access to minimum required

## Common Errors

- `GitHub App credentials not configured` → Check environment variables
- `Invalid private key format` → Check key format and escaping
- `Installation not found` → App not installed on repositories
- `Failed to authenticate` → Check App ID and private key match