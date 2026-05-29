# Domain Configuration Guide

## Vercel

1. Project Settings → Domains
2. Add `artmorph.ai` and `www.artmorph.ai`
3. Configure DNS per Vercel instructions

## DNS Records

| Type | Name | Value |
|------|------|-------|
| A | @ | 76.76.21.21 |
| CNAME | www | cname.vercel-dns.com |

## Environment Updates

```
NEXT_PUBLIC_APP_URL=https://artmorph.ai
AUTH_URL=https://artmorph.ai
```

## SSL

Vercel provisions certificates automatically.

## Email Domain (Resend)

1. Add domain in Resend
2. Configure SPF, DKIM, DMARC records
3. Set `EMAIL_FROM=ArtMorph <noreply@artmorph.ai>`

## Stripe

Update webhook URL to production domain.

## PostHog

No domain changes required; verify events in dashboard after deploy.
