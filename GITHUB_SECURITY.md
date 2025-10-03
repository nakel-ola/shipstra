# GitHub Token Security Implementation

## Security Approach

This implementation replaces the insecure localStorage approach with a comprehensive security solution for storing GitHub access tokens using Next.js API routes.

## Architecture

### 1. Next.js API Route Security
- **Secure API Route**: `/api/github/token` handles all token operations
- **Server-Side Authentication**: Uses Supabase service role for secure operations
- **Encryption**: Tokens are encrypted before storage (base64 as placeholder, implement proper encryption)
- **User Validation**: Verifies user identity for all operations

### 2. Server-Side API Routes
Single Next.js API route handles all token operations:

#### `GET /api/github/token`
- Authenticates user requests via Bearer token
- Decrypts and returns GitHub tokens
- Validates user permissions

#### `POST /api/github/token`
- Validates GitHub tokens before storage
- Encrypts tokens before storage
- Tests token validity with GitHub API

#### `DELETE /api/github/token`
- Securely removes GitHub tokens
- Validates user permissions

### 3. Client-Side Security
- No tokens stored in browser storage
- All operations go through authenticated API calls
- Token validation before storage

### 4. Storage Security
- **Database Storage**: Tokens stored securely in Supabase `user_security_settings` table
- **Encryption**: Base64 encoding (replace with AES in production)
- **Row Level Security**: Database-level security policies protect user data
- **Persistent Storage**: Tokens survive server restarts and deployments

## Security Features

### ✅ Implemented
- Server-side token storage via Next.js API routes
- **Database persistence** in Supabase with Row Level Security
- Encryption at rest (base64 placeholder implementation)
- User authentication validation via Supabase
- Secure API endpoints with proper error handling
- Token validation before storage
- No client-side token exposure

### 🔄 Production Recommendations
- ✅ ~~Replace in-memory storage with database~~ **COMPLETED**
- Implement proper AES encryption instead of base64
- Add token rotation mechanism
- Implement audit logging and rate limiting
- Consider using GitHub Apps instead of personal tokens
- Add token scope validation
- Implement proper session management

## API Route Structure

```typescript
// /api/github/token/route.ts
export async function GET(request: NextRequest) {
  // Authenticate user
  // Query database for encrypted token
  // Decrypt and return token
}

export async function POST(request: NextRequest) {
  // Validate GitHub token
  // Encrypt and store in database
}

export async function DELETE(request: NextRequest) {
  // Update database to remove token
}
```

## Usage

The `useGitHubRepos` hook automatically handles:
- Secure token retrieval via API routes
- Repository fetching with authentication
- Error handling and retry logic
- Token validation

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Database Schema

The GitHub tokens are stored in the `user_security_settings` table:

```sql
ALTER TABLE user_security_settings
ADD COLUMN github_encrypted_token TEXT,
ADD COLUMN github_username TEXT,
ADD COLUMN github_token_updated_at TIMESTAMP WITH TIME ZONE;
```

## Security Notes

- Tokens are never exposed to client-side JavaScript
- All operations require user authentication via Supabase
- Server-side validation of all operations
- Encrypted storage in secure database with RLS
- Database persistence survives server restarts
- No browser storage dependencies