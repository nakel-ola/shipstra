-- Add GitHub token fields to user_security_settings table
ALTER TABLE user_security_settings
ADD COLUMN IF NOT EXISTS github_encrypted_token TEXT,
ADD COLUMN IF NOT EXISTS github_username TEXT,
ADD COLUMN IF NOT EXISTS github_token_updated_at TIMESTAMP WITH TIME ZONE;

-- Create index for performance on GitHub username lookups
CREATE INDEX IF NOT EXISTS idx_user_security_settings_github_username
ON user_security_settings(github_username)
WHERE github_username IS NOT NULL;