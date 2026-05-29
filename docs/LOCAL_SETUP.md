# Local Setup Guide

## Prerequisites

- Node.js 20+
- PostgreSQL 16+ (or Docker)
- OpenAI API key
- Stripe test keys (for billing)

## Quick Start

```bash
# Clone and install
npm install

# Configure environment
cp .env.example .env
# Edit .env with your values

# Start PostgreSQL (Docker)
docker compose up postgres -d

# Push schema and seed
npm run db:push
npm run db:seed

# Start dev server
npm run dev
```

Open http://localhost:3000

## Seed Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@artmorph.ai | Admin123!@# | Admin |
| demo@artmorph.ai | Demo1234!@# | User |

## Storage

Local development uses `./storage` by default (`STORAGE_DRIVER=local`).

Files are served at `/api/files/{key}`.

## Stripe Local Testing

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`.

## Troubleshooting

**Prisma connection errors:** Verify `DATABASE_URL` and PostgreSQL is running.

**OpenAI errors:** Confirm `OPENAI_API_KEY` has image and vision access.

**Build env errors:** Set `SKIP_ENV_VALIDATION=true` during local builds without full config.
