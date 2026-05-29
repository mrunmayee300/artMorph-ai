# Production Launch Checklist

## Infrastructure
- [ ] PostgreSQL provisioned with backups enabled
- [ ] R2 bucket created with lifecycle policies
- [ ] Vercel project connected to GitHub
- [ ] Custom domain configured with SSL
- [ ] Environment variables set in Vercel

## Security
- [ ] `AUTH_SECRET` is 32+ random characters
- [ ] Stripe webhook secret configured
- [ ] Admin account password rotated from seed defaults
- [ ] `.env` never committed to repository
- [ ] Rate limits verified under load test

## Payments
- [ ] Stripe products and prices created (live mode)
- [ ] Checkout flow tested end-to-end
- [ ] Billing portal accessible
- [ ] Webhook events delivering successfully
- [ ] Subscription credit grants verified

## AI
- [ ] OpenAI API key has sufficient quota
- [ ] Image edit pipeline tested with real uploads
- [ ] Error handling and credit refunds verified

## Monitoring
- [ ] `/api/health` uptime monitoring active
- [ ] PostHog receiving events
- [ ] Vercel log drains configured (optional)
- [ ] Stripe failure alerts enabled

## Legal & Product
- [ ] Terms of Service published
- [ ] Privacy Policy published
- [ ] Cookie consent (if EU traffic expected)
- [ ] Support email configured in Resend
