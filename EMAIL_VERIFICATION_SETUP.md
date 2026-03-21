# Email Verification Setup Guide

## Overview
Email verification has been implemented with the following features:
- Users must verify their email before logging in
- Verification tokens are valid for 24 hours
- Admin can see verification token in registration response (for testing)

## Database Setup

### Create the email_verification_tokens Table

Execute this SQL in your Cloudflare D1 database:

```sql
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token ON email_verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);
```

**Steps:**
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** → **D1**
3. Find your database (ID in `wrangler.jsonc`)
4. Click **Open Console**
5. Paste and execute the SQL above

## API Endpoints

### 1. Register User
**POST** `/api/auth/register`

Request:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe",
  "targetExam": "JEE_MAINS"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "user_...",
      "email": "user@example.com",
      "name": "John Doe",
      "emailVerified": false,
      "targetExam": "JEE_MAINS",
      "isActive": true,
      "createdAt": "2026-03-21T10:00:00Z",
      ...
    },
    "verificationToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
  }
}
```

**Notes:**
- `emailVerified` is `false` initially
- `verificationToken` is included in response for development/testing
- User cannot login until email is verified

### 2. Verify Email
**POST** `/api/auth/verify-email`

Request:
```json
{
  "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Email verified successfully",
    "user": {
      "id": "user_...",
      "email": "user@example.com",
      "emailVerified": true,
      ...
    }
  }
}
```

### 3. Login User
**POST** `/api/auth/login`

If email is **not verified**:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Please verify your email before logging in"
  }
}
```

If email **is verified**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "user_...",
      "email": "user@example.com",
      "emailVerified": true,
      ...
    }
  }
}
```

## Testing Locally

### Using the Frontend

1. **Register a user**:
   - Go to http://localhost:5173/register (or frontend URL)
   - Fill out the form and submit
   - You'll see a "Check your email" message
   - The page displays the verification token (dev-only)

2. **Copy the verification token** from the message

3. **Verify email via API**:
   ```bash
   curl -X POST http://localhost:8787/api/auth/verify-email \
     -H "Content-Type: application/json" \
     -d '{"token":"PASTE_TOKEN_HERE"}'
   ```

4. **Login**:
   - Go to http://localhost:5173/login
   - Use the email and password you registered with
   - Should now see "Invalid email or password" error if wrong password
   - Should login successfully with correct password

### Using Postman/curl

1. **Register**:
   ```bash
   curl -X POST http://localhost:8787/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "SecurePass123",
       "name": "Test User",
       "targetExam": "JEE_MAINS"
     }'
   ```
   Copy the `verificationToken` from response

2. **Verify Email**:
   ```bash
   curl -X POST http://localhost:8787/api/auth/verify-email \
     -H "Content-Type: application/json" \
     -d '{"token":"TOKEN_FROM_ABOVE"}'
   ```

3. **Login** (should now work):
   ```bash
   curl -X POST http://localhost:8787/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "SecurePass123"
     }'
   ```

## Production Deployment

### Email Integration

For production, you'll need to:

1. **Set up an email service** (SendGrid, Mailgun, AWS SES, etc.)
2. **Create an environment variable** for the service API key in Cloudflare Secrets:
   ```bash
   wrangler secret put EMAIL_SERVICE_API_KEY
   ```

3. **Update the registration endpoint** to send verification emails:
   ```typescript
   // In worker.ts, after storing verification token:
   await sendVerificationEmail(email, verificationToken, env);
   ```

4. **Remove the `verificationToken` from the response** once emails are working:
   ```typescript
   // Don't send token in response for production
   const response: AuthResponse = {
     token,
     user,
   }
   ```

### Verification Email Template

Example email body:
```
Subject: Verify your RankRise email

Hi [USER_NAME],

Welcome to RankRise! Please verify your email to access your account.

Verification Link:
https://rankrise.example.com/verify?token=[VERIFICATION_TOKEN]

This link expires in 24 hours.

If you didn't create this account, please ignore this email.

Best regards,
RankRise Team
```

## Troubleshooting

### Token Expired Error
- Token is valid for 24 hours from registration
- User must register again to get a new token
- Consider implementing a "Resend verification email" endpoint

### Table Not Found Error
- Ensure `email_verification_tokens` table is created in D1
- Check database ID in `wrangler.jsonc` matches your actual D1 database
- Verify table exists in Cloudflare Dashboard

### User Can't Login After Verification
- Verify the `email_verified` field is set to `1` (true)
- Check database directly: `SELECT * FROM users WHERE email = 'test@example.com'`
- Ensure verification token was correct and not expired

## API Response Codes

| Status | Meaning |
|--------|---------|
| 200 | Successful login, email verified |
| 201 | Successful registration |
| 401 | Invalid credentials OR email not verified |
| 400 | Validation error (invalid token, missing fields) |
| 409 | Email already registered |
| 500 | Server error |

## Future Enhancements

- [ ] Resend verification email endpoint
- [ ] Resend countdown (prevent spam)
- [ ] Two-factor authentication
- [ ] Social login (Google, GitHub)
- [ ] Email change verification
- [ ] Password reset with email verification
