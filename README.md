# 🐰 DustBunny AI

AI-powered email cleanup and privacy management tool built with Next.js, TypeScript, tRPC, Prisma, and Zustand.

## Features

- 📧 **Smart Email Cleanup** - AI classifies and cleans your inbox automatically
- 🔒 **Privacy Scanner** - Check if your emails have been in data breaches (HaveIBeenPwned integration)
- 📋 **Subscription Manager** - Find and manage all your email subscriptions
- 💰 **Money Saver** - Identify and cancel unwanted subscriptions
- 📊 **Weekly Reports** - AI-generated summaries of your cleanup progress
- 🤖 **Automated Workflows** - Set up daily cleanup and weekly reports

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **API Layer**: tRPC
- **Database**: PostgreSQL with Prisma ORM
- **State Management**: Zustand
- **UI Components**: ShadCN UI + Tailwind CSS
- **AI/ML**: OpenAI GPT-3.5 for email classification
- **Email API**: Gmail API (OAuth 2.0)
- **Privacy**: HaveIBeenPwned API

## Project Structure

```
dustbunny-ai/
├── prisma/
│   └── schema.prisma              # Database schema
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── dashboard/             # Dashboard pages
│   │   ├── api/                   # API routes
│   │   └── auth/                  # Authentication
│   ├── components/                # React components
│   │   ├── ui/                    # ShadCN UI components
│   │   ├── BunnyAvatar.tsx
│   │   ├── BunnyLoader.tsx
│   │   └── ...
│   ├── lib/                       # Utility functions
│   │   ├── gmail.ts               # Gmail API integration
│   │   ├── classify.ts            # OpenAI email classification
│   │   ├── privacy.ts             # Privacy scanning
│   │   ├── savings.ts             # Savings analysis
│   │   └── ...
│   ├── server/                    # tRPC server
│   │   ├── routers/               # tRPC routers
│   │   ├── context.ts
│   │   └── trpc.ts
│   ├── store/                     # Zustand stores
│   │   ├── userStore.ts
│   │   ├── inboxStore.ts
│   │   └── settingsStore.ts
│   ├── cron/                      # Automated jobs
│   │   ├── daily-clean.ts
│   │   ├── weekly-report.ts
│   │   └── scan-subscriptions.ts
│   └── styles/                    # Global styles
└── public/                        # Static assets

```

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- pnpm (recommended) or npm
- PostgreSQL database
- Google Cloud Console account (for Gmail API)
- OpenAI API key

### Environment Setup

1. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

2. Fill in your environment variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dustbunny"

# Gmail API
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/callback"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"

# HaveIBeenPwned (optional)
HIBP_API_KEY="your-hibp-api-key"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"
```

### Installation

1. Install dependencies:

```bash
pnpm install
```

2. Set up the database:

```bash
npx prisma db push
npx prisma generate
```

3. Run the development server:

```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Gmail API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs: `http://localhost:3000/api/auth/callback`
6. Copy Client ID and Client Secret to your `.env` file

## Database Schema

The application uses the following main models:

- **User** - User accounts with Google OAuth tokens
- **Email** - Ingested emails from Gmail
- **Subscription** - Detected email subscriptions
- **PrivacyScan** - Privacy breach scan results
- **Report** - Weekly cleanup reports

## API Routes

### tRPC Routers

- `inbox` - Email management (get, classify, cleanup)
- `privacy` - Privacy scanning
- `subscriptions` - Subscription management
- `savings` - Savings recommendations
- `reports` - Weekly reports

### REST Endpoints

- `/api/auth` - OAuth callbacks
- `/api/gmail` - Gmail ingestion
- `/api/cleanup` - Email cleanup
- `/api/unsubscribe` - Unsubscribe flow
- `/api/cancel` - Cancel subscriptions
- `/api/privacy` - Privacy scan
- `/api/savings` - Savings recommendations
- `/api/report` - Generate reports

## Cron Jobs

Set up these scripts to run periodically:

- **daily-clean.ts** - Runs daily to clean old promotional emails
- **weekly-report.ts** - Generates weekly summary reports
- **scan-subscriptions.ts** - Scans for new subscriptions

### Example with Vercel Cron:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-clean",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/weekly-report",
      "schedule": "0 9 * * 1"
    }
  ]
}
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project to Vercel
3. Add environment variables
4. Deploy!

### Docker

```bash
docker build -t dustbunny-ai .
docker run -p 3000:3000 dustbunny-ai
```

## Development

### Running Tests

```bash
pnpm test
```

### Linting

```bash
pnpm lint
```

### Type Checking

```bash
pnpm type-check
```

## Features Roadmap

- [ ] Browser extension for one-click cleanup
- [ ] Mobile app (React Native)
- [ ] Advanced AI categorization with custom training
- [ ] Automated subscription cancellation workflows
- [ ] Multi-email account support
- [ ] Team/family plans
- [ ] Analytics dashboard
- [ ] Email templates for common responses

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

For issues and questions:
- GitHub Issues: [github.com/yourusername/dustbunny-ai/issues](https://github.com/yourusername/dustbunny-ai/issues)
- Email: support@dustbunny.ai

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [OpenAI](https://openai.com/)
- Privacy checks by [HaveIBeenPwned](https://haveibeenpwned.com/)
- Icons and design inspired by clean, minimal UI patterns

---

Made with 🐰 by DustBunny Team
# dustbunnyai
