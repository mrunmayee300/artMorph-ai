# Scaling Guide

## Phase 1: Launch (0–1K users)

- Vercel Hobby/Pro
- Managed PostgreSQL (Neon free tier → paid)
- Cloudflare R2 storage
- In-memory rate limiting (single instance)

## Phase 2: Growth (1K–10K users)

- Upgrade Vercel plan for longer function timeouts
- Enable PgBouncer connection pooling
- Move rate limiting to Upstash Redis
- Add CDN caching for static assets and public images

## Phase 3: Scale (10K+ users)

### Background Jobs
Move AI pipeline to async queue:
- Inngest, BullMQ, or AWS SQS
- Return job ID immediately
- Poll or use WebSocket for completion

### Database
- Read replicas for history/analytics queries
- Partition `Generation` by `createdAt` if table exceeds 10M rows
- Archive old generations to cold storage

### AI Costs
- Cache analysis results per image hash
- Batch OpenAI requests where possible
- Tiered model usage by plan

### Multi-Region
- Deploy Vercel to multiple regions
- R2 global distribution
- PostgreSQL read replicas per region

## Capacity Estimates

| Resource | Per Transform |
|----------|---------------|
| API duration | 30–90 seconds |
| OpenAI calls | 5 requests |
| Storage | ~2–5 MB |
| DB writes | ~5 rows |

Plan ~60 concurrent transforms per Vercel Pro instance before queueing is recommended.
