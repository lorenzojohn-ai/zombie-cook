# Zombie Cook

A recipe box, meal planner and grocery list — revived from a half-built hackathon project.

## Stack

- Next.js 16 (App Router) + TypeScript + React 19
- SQLite (better-sqlite3) for persistence
- Cheerio for URL import
- Stripe SDK for checkout
- Plain CSS, no Tailwind

## Running locally

```bash
npm install
npm run dev
```

The app runs on port 3109.

## Environment variables

Put these in `.env.local` (git-ignored):

```
USDA_API_KEY=your_usda_fooddata_central_api_key
STRIPE_SECRET_KEY=sk_test_your_stripe_test_secret
STRIPE_PRICE_MONTHLY=price_your_monthly_price_id
STRIPE_PRICE_ANNUAL=price_your_annual_price_id
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NEXT_PUBLIC_URL=http://localhost:3109
```

## Notes

- On Vercel, SQLite is stored in `/tmp` which is wiped on serverless cold starts. User-added recipes will not survive a cold restart on Vercel. For production persistence, use a hosted Postgres (Neon, Supabase) or Turso (SQLite-as-a-service).
- Nutrition data comes from the USDA FoodData Central API and is cached per recipe. Values are approximate and not medical advice.
- Allergen badges are auto-detected from ingredient text for the nine major allergens.
