# Epstein Files Empire (Netlify + Neon + Functions) — v4

✅ Newsroom layout (original)  
✅ RSS ingest + images (from RSS media/enclosure when available)  
✅ Optional AI enrichment (OpenAI Responses API)  
✅ Stripe paywall (Day Pass default, switch to Subscription)  
✅ Names index (entities)

## Deploy (Netlify)
- Build command: `npm run build`
- Publish directory: `site`
- Functions: `netlify/functions` (auto via netlify.toml)

## Neon
Run: `database/schema.sql` in Neon SQL Editor once.

## Required env vars
- `DATABASE_URL`
- `STRIPE_SECRET_KEY`
- `ADMIN_TOKEN` (long random string)

## Optional env vars
- `OPENAI_API_KEY` (for /api/enrich)
- `OPENAI_MODEL` (default: gpt-4o-mini)
- `CRON_SECRET` (for safe scheduled ingest)
- `CHECKOUT_MODE` = `payment` (default) or `subscription`
- `STRIPE_PRICE_ID` (required for subscription mode)

## First run
1) Deploy
2) Open `/admin.html`
3) Paste ADMIN_TOKEN
4) Add RSS sources
5) Click **Ingest**
6) Optional: **Enrich latest 5**
