# 🔐 Authentication Options

DustBunny AI now supports **two authentication methods**, giving you flexibility in how you use the platform:

## 1. Email/Password Authentication (New! ✨)

Use the app with just an email and password - **no Gmail connection required**.

### What Works Without Gmail:
- ✅ **Privacy Breach Scanning** - Check your email against known data breaches
- ✅ **Manual Subscription Tracking** - Add and manage subscriptions manually
- ✅ **Dashboard Access** - View your stats and manage your account
- ✅ **Reports** - Generate basic weekly reports

### How to Sign Up:
1. Go to `/login`
2. Click "Don't have an account? Sign up"
3. Enter your email and password (min 8 characters)
4. Start using DustBunny!

### What Requires Gmail:
- 📧 **Email Sync** - Fetching emails from your Gmail inbox
- 🔍 **Auto Subscription Detection** - Automatically finding subscriptions from emails
- 🧹 **Email Cleanup** - Bulk cleaning promotional emails
- 🔒 **PII Scanning** - Scanning email content for sensitive information

## 2. Gmail OAuth Authentication (Original)

Connect your Gmail account for full inbox management capabilities.

### How to Connect Gmail:
1. Go to `/login`
2. Click "Continue with Gmail"
3. Authorize DustBunny AI
4. Gmail features are now available!

### Gmail Features Include:
- Full email sync and analysis
- Automatic subscription detection
- Smart email cleanup
- PII scanning in emails
- AI-powered email classification (requires OpenAI)

## Hybrid Approach (Recommended)

You can use **both methods** for the best experience:

1. **Start with Email/Password** to explore the platform
2. **Add Gmail later** when you're ready for full features
3. Switch between manual and automatic subscription tracking

## Session Management

- Sessions are cookie-based
- Sessions last 30 days
- Log out using `/api/auth/logout` (POST request)

## Security

- Passwords are hashed with bcryptjs (10 salt rounds)
- OAuth tokens stored securely in database
- Automatic token refresh for Gmail
- HTTP-only session cookies

## Migration Path

Existing Gmail users can continue using the app without changes. New users can:
- Start without Gmail connection
- Add Gmail connection later from dashboard
- Use privacy and subscription features immediately

## API Endpoints

### Email/Password Auth
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/logout` - Sign out

### Gmail Auth
- `GET /api/auth` - Initiate OAuth flow
- `GET /api/auth/callback` - OAuth callback

## Environment Variables

See `.env.example` for configuration. Key variables:

```env
# Required for any authentication
DATABASE_URL="postgresql://..."

# Optional - only needed for Gmail features
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Optional - for AI features
OPENAI_API_KEY="..."

# Optional - for breach scanning
HIBP_API_KEY="..."
```

## Troubleshooting

### "Email already registered"
- Email is already in use
- Try logging in instead of signing up
- Use password reset (if implemented)

### "Invalid email or password"
- Check credentials
- Passwords are case-sensitive
- Must be at least 8 characters

### "No Google tokens found"
- Gmail features require OAuth
- Click "Connect Gmail" in dashboard
- Re-authorize if tokens expired

## Next Steps

Want to contribute? Check out:
- Adding password reset functionality
- Implementing 2FA
- Adding more OAuth providers
- Social login options
