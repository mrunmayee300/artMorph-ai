# Monitoring Guide

## Health Checks

- **Endpoint:** `GET /api/health`
- **Expected:** `{ "status": "ok", "database": "connected" }`
- Configure uptime monitoring (Better Uptime, Pingdom) at 1-minute intervals.

## Application Monitoring

### Vercel Analytics
Enable in project settings for Web Vitals and traffic.

### PostHog
- Product analytics: signups, generations, conversions
- Funnels: register → upload → generate → subscribe
- Set up alerts for error rate spikes

### Logs
- Vercel → Logs for runtime errors
- Filter by `/api/transform` for generation failures

## Database

- Monitor connection count and query latency
- Set alerts for disk usage > 80%
- Enable slow query logging

## Stripe

- Dashboard → Developers → Webhooks — verify delivery success
- Alert on `invoice.payment_failed`

## OpenAI

- Monitor daily spend limits
- Set usage alerts at 80% of budget

## Admin Panel

`/admin` provides:
- Failed job count
- User and subscription metrics
- Recent analytics events

## Incident Response

1. Check `/api/health`
2. Review Vercel function logs
3. Verify external service status (OpenAI, Stripe)
4. Check admin failed generations list
