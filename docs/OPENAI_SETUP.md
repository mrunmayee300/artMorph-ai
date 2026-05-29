# OpenAI Setup Guide

## Required Access

ArtMorph uses:
- **GPT-4o** — Image analysis and quality evaluation (vision)
- **GPT-4o-mini** — Style recommendations and prompt optimization
- **DALL-E 2** — Image edit/transformation

Ensure your API key has access to these models.

## Configuration

```
OPENAI_API_KEY=sk-...
```

## Usage Per Transform

1. Analysis call (vision)
2. Style recommendation call
3. Prompt optimization call
4. Image edit call
5. Quality evaluation call (vision)

Monitor usage in OpenAI Dashboard → Usage.

## Rate Limits

Implement application-level rate limiting (included). Consider OpenAI tier upgrades for production volume.

## Cost Optimization

- Analysis uses `gpt-4o` for accuracy
- Recommendations and prompts use `gpt-4o-mini`
- Cache analysis results before regeneration

## Troubleshooting

**"Model not found"** — Verify account has image API access.

**Image edit fails** — Source must be square PNG for DALL-E 2 edit; app auto-converts via Sharp.

**Content policy** — Prompts are optimized for commercial use; review OpenAI usage policies.
