# Deployment Guide (Vercel)

## 1. Repository

Push to GitHub and import into Vercel.

## 2. Database

Provision PostgreSQL (Neon, Supabase, or RDS). Set `DATABASE_URL`.

Run migrations after first deploy:
```bash
npx prisma migrate deploy
npm run db:seed
```

## 3. Environment Variables

Set all variables from `.env.example` in Vercel project settings.

Required for production:
- `DATABASE_URL`
- `AUTH_SECRET`
- `NEXT_PUBLIC_APP_URL` (production domain)
- `OPENAI_API_KEY`
- All Stripe variables
- `STORAGE_DRIVER=r2` with R2 credentials

## 4. Storage (R2)

1. Create Cloudflare R2 bucket
2. Generate API tokens
3. Set `R2_*` variables
4. Configure public access or custom domain for `R2_PUBLIC_URL`

## 5. Stripe Webhook

Add endpoint: `https://yourdomain.com/api/webhooks/stripe`

Events:
- checkout.session.completed
- customer.subscription.*
- invoice.paid

## 6. Domain

Add custom domain in Vercel → Domains. Update `NEXT_PUBLIC_APP_URL` and `AUTH_URL`.

## 7. Post-Deploy Checklist

- [ ] Health check: `/api/health`
- [ ] Register/login flow
- [ ] Upload and transform
- [ ] Stripe checkout (test mode first)
- [ ] Webhook delivery confirmed
- [ ] PostHog receiving events
