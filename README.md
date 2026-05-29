# ArtMorph AI

Production-ready SaaS platform that transforms sketches, wireframes, logos, and visual concepts into professional creative outputs using OpenAI.

## Stack

- **Frontend:** Next.js 16, TypeScript, Tailwind CSS, Shadcn-style components
- **Backend:** Server Actions, API Routes
- **Database:** PostgreSQL + Prisma
- **Auth:** NextAuth v5
- **Payments:** Stripe
- **Storage:** Cloudflare R2 (production) / Local (development)
- **Email:** Resend
- **Analytics:** PostHog

## Features

- AI image analysis, style recommendations, and prompt optimization
- Full transformation pipeline with quality evaluation
- Credit system with subscription tiers
- Project management and version history
- Admin dashboard
- Rate limiting, RBAC, webhook verification

## Documentation

| Guide | Path |
|-------|------|
| Local setup | [docs/LOCAL_SETUP.md](docs/LOCAL_SETUP.md) |
| Deployment | [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) |
| Architecture | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| Database ER | [docs/DATABASE.md](docs/DATABASE.md) |
| API | [docs/API.md](docs/API.md) |
| Stripe | [docs/STRIPE_SETUP.md](docs/STRIPE_SETUP.md) |
| OpenAI | [docs/OPENAI_SETUP.md](docs/OPENAI_SETUP.md) |
| Domain | [docs/DOMAIN.md](docs/DOMAIN.md) |
| Monitoring | [docs/MONITORING.md](docs/MONITORING.md) |
| Scaling | [docs/SCALING.md](docs/SCALING.md) |

## Project Structure

```
src/
├── app/              # Routes (marketing, dashboard, admin, api)
├── actions/          # Server Actions
├── components/       # UI components
├── lib/              # Core business logic
│   ├── ai/           # OpenAI agents & pipeline
│   ├── auth/         # NextAuth config
│   └── storage/      # R2 + local storage
prisma/               # Schema, migrations, seed
docs/                 # Documentation
```

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run db:push      # Push schema to database
npm run db:seed      # Seed admin + demo users
npm run test         # Run tests
```

