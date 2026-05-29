# Stripe Setup Guide

## 1. Create Products

In Stripe Dashboard → Products, create:

| Product | Price | Billing |
|---------|-------|---------|
| Creator | $9 | Monthly |
| Pro | $29 | Monthly |
| Team | $99 | Monthly |

## 2. Copy Price IDs

Add to environment:
```
STRIPE_PRICE_CREATOR=price_xxx
STRIPE_PRICE_PRO=price_xxx
STRIPE_PRICE_TEAM=price_xxx
```

## 3. API Keys

```
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
```

## 4. Webhook

Endpoint: `https://yourdomain.com/api/webhooks/stripe`

Events:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`

Copy signing secret to `STRIPE_WEBHOOK_SECRET`.

## 5. Customer Portal

Enable in Stripe Dashboard → Settings → Billing → Customer portal.

Allows users to manage subscriptions via `/dashboard/billing`.

## 6. Test Cards

| Card | Result |
|------|--------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Decline |
