# API Documentation

Base URL: `{APP_URL}/api`

## Authentication

Protected routes require a valid NextAuth session cookie.

## Endpoints

### `POST /api/upload`

Upload an image for transformation.

**Body:** `multipart/form-data`
- `file` (required): Image file (JPEG, PNG, WebP, GIF, max 10MB)
- `projectId` (optional): Project ID

**Response:**
```json
{
  "generationId": "clx...",
  "originalUrl": "https://..."
}
```

### `POST /api/analyze`

Run AI analysis on an uploaded generation.

**Body:**
```json
{ "generationId": "clx..." }
```

### `POST /api/transform`

Execute the full transformation pipeline.

**Body:**
```json
{
  "generationId": "clx...",
  "style": "PHOTOREALISTIC",
  "mode": "STANDARD"
}
```

**Modes:** `STANDARD` (1 credit), `HD` (2 credits), `BATCH` (3 credits)

### `GET /api/files/[...key]`

Serve locally stored files (development only).

### `POST /api/webhooks/stripe`

Stripe webhook endpoint. Requires `stripe-signature` header.

**Events handled:**
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`

### `GET /api/health`

Health check with database connectivity status.

## Server Actions

| Action | Description |
|--------|-------------|
| `registerAction` | Create account |
| `loginAction` | Sign in |
| `createProjectAction` | Create project |
| `generateTransformAction` | Run transform |
| `createCheckoutSessionAction` | Stripe checkout |
| `createBillingPortalAction` | Stripe billing portal |

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| Upload | 20/min per user |
| Transform | 10/min per user |
