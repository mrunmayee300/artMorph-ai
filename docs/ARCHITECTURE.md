# ArtMorph AI — Production Architecture

## System Overview

```mermaid
flowchart TB
    subgraph Client
        Browser[Next.js App Router]
    end

    subgraph Vercel
        SSR[SSR / RSC Pages]
        API[API Routes & Server Actions]
        MW[Auth Middleware]
    end

    subgraph Services
        OpenAI[OpenAI API]
        Stripe[Stripe]
        Resend[Resend Email]
        PostHog[PostHog Analytics]
        R2[Cloudflare R2]
    end

    subgraph Data
        PG[(PostgreSQL)]
        Local[Local Storage Dev]
    end

    Browser --> MW --> SSR
    Browser --> API
    API --> PG
    API --> OpenAI
    API --> Stripe
    API --> R2
    API --> Local
    SSR --> PG
    API --> Resend
    API --> PostHog
```

## Core Pipeline

```mermaid
sequenceDiagram
    participant U as User
    participant API as Upload API
    participant AI as OpenAI Agents
    participant S as Storage
    participant DB as PostgreSQL

    U->>API: Upload image
    API->>S: Store original
    API->>DB: Create generation record
    U->>API: Request analysis
    API->>AI: Image Analysis Agent
    AI->>AI: Style Recommendation Agent
    AI->>DB: Store analysis
    U->>API: Generate transform
    API->>AI: Prompt Optimization
    API->>AI: Image Edit/Generate
    API->>S: Store result
    API->>AI: Quality Evaluation
    API->>DB: Store scores & version
```

## Layer Responsibilities

| Layer | Responsibility |
|-------|----------------|
| `src/app` | Routes, layouts, metadata, SEO |
| `src/actions` | Server Actions for mutations |
| `src/app/api` | REST endpoints, webhooks, uploads |
| `src/lib/ai` | OpenAI agent pipeline |
| `src/lib` | Auth, credits, storage, billing |
| `prisma` | Data model, migrations, seed |

## Security Controls

- JWT sessions via NextAuth
- Role-based admin access
- Rate limiting on upload/transform
- Stripe webhook signature verification
- File type and size validation
- Environment variable validation
- CSRF protection via Server Actions

## Scaling Considerations

- Stateless Next.js instances on Vercel
- PostgreSQL connection pooling (PgBouncer / Neon / Supabase)
- R2 for object storage at scale
- Background job queue recommended for high-volume generation (future)
