# Bucketwise — Household CFO
Meta Global AI Developer Hackathon 2026 — Indie Track
Team: Bucketwise | Dev: Karthik Ramani | Center Valley, PA

## Project Summary
Building Household CFO — turns messy family finances (Gmail, bank CSVs, 529s, Drive) into 3 buckets: Emergency ($15k), College ($250k), Life Event ($30k) with shock-test for 2008/2020/2022 crises.
Tagline: Financial Freedom OS — Actions, Not Charts.

## Stack
- Frontend: Next.js 16 (app router, Turbopack), React 19, Tailwind, TypeScript
- Backend: Next.js API Routes (/api/ingest, /api/shock-test, /api/parse-receipt)
- AI: Meta Muse API via native fetch (dev.meta.ai ONLY — no other endpoints)
- Auth: Google OAuth for Gmail/Drive (optional)
- Storage: LocalStorage for demo → Postgres roadmap

## Meta Tool Usage (Judging Criteria #2 — Must Prove Depth)
- Muse Wonder (muse-wonder-1.0): lib/buildBucketsWithWonder.ts — long-context 90-day reasoning → bucket allocation + Daily Digest actions. Model IDs: GET {META_API_BASE}/models
- Muse Spark (muse-spark-1.3): Fast leak detection (<2s for 500 txns) — duplicate subs
- SAM 3.1: /api/parse-receipt — receipt image → bounding boxes → structured JSON
- Muse Image: components/BucketCard.tsx — generates bucket visuals + shock infographic
- Muse Wonder: /api/shock-test — PII-safe simulation (Income -30%, Expenses +20%, College +6%/yr), PII stays local, only anonymized summary sent
- Muse Code: This CLI agent — scaffolding and wiring

## Env Vars
META_API_KEY=... ($150 credits from dev.meta.ai, balance check via muse usage)
META_API_BASE=... (from dev.meta.ai — the ONLY endpoint used)
GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... (optional for Gmail/Drive)
RESEND_API_KEY=... (optional for daily digest email)

## Project Layout
app/
  page.tsx — Main dashboard: 3 buckets progress + shock-test simulator + daily digest
  layout.tsx — Root layout (fix for Next.js 16)
  api/
    ingest/route.ts — Upload CSV/Gmail → calls buildBucketsWithWonder + detectLeaksFast
    shock-test/route.ts — Calls Muse Wonder on Meta Muse API for crisis simulation
    parse-receipt/route.ts — SAM 3.1 receipt parsing
lib/
  meta-api.ts — Native-fetch client for Meta Muse API only, exports buildBucketsWithWonder(), detectLeaksFast()
  gmail.ts, drive.ts, plaid.ts — ingest helpers
components/
  ConnectAccounts.tsx — Gmail/Drive connect UI
  BucketCard.tsx — 3 buckets UI + Image generation
samples/
  sample-bank.csv — 98 realistic PA family transactions across 90 days (Aug–Oct) for demo without real Gmail
public/
  logo.png — Bucketwise 3-bucket logo (blue/green/amber) + wordmark

## Commands
npm install
npm run dev — opens http://localhost:3000
node test-meta.js — verifies Meta API key + credit usage
muse --version — check CLI
muse usage — check $150 burn
muse — start interactive session
muse exec "prompt" — headless task

## Rules for Muse
1. Always call Meta Muse API from server routes (/api/*), never from client components — env keys must not leak
2. Use response_format: {type: "json_object"} for Wonder calls — return {buckets, leaks, actions, shockBuffer}
3. Log usage: console.log(resp.usage) for judge screenshot proving $150 consumption
4. Keep mock fallback if META_API_KEY missing — return sample data so stranger test passes
5. Feature freeze Oct 30 6pm ET — no new features after, only polish
6. Demo video Day 7 (Nov 1) — 2.5 min: Upload → 3 Buckets → Shock-Test → Daily Digest
7. README must show Tech Stack table with Meta Depth Checklist (Wonder+Spark+SAM+Image+Muse Code)
8. Cost control: Use /effort medium, max-model-steps 40 for CI
9. Meta Muse API (dev.meta.ai) is the ONLY endpoint — no OpenAI, Llama, Fireworks, Baseten, or Modal anywhere (code, deps, or docs)

## Current Status (Day 1 Done)
- Dashboard works with mock data (screenshot: Emergency $4,200/$15k, College $38k/$250k, Life Event $5k/$30k)
- Starter repo v3 with layout.tsx fix — npm run dev works
- $150 credits applied — need to wire real API calls (mock → real)
- Logo: public/logo.png generated (Muse Image) + bucket art in public/bucket-art/

## Next Tasks (In Priority Order)
1. Wire lib/meta-api.ts to real Meta API — replace mock with native-fetch Muse calls (use test-prompt.txt to test)
2. Update app/api/ingest/route.ts to use real Wonder + Spark
3. Create /samples/sample-bank.csv if not exists
4. Implement /api/shock-test with Muse Wonder — PII stays local, only anonymized summary sent
5. Add ConnectAccounts to page.tsx
6. Polish BucketCard with Muse Image
7. Generate pitch deck + Loom script

## Judging
- Indie Track: $150k top prize, judged Nov 5-9, winners Nov 10
- Criteria: Impact (real numbers $68.97/mo leaks saved), Meta Depth, Wow Workflow, Stranger Test
- Must post daily in Discord #progress as Bucketwise | Karthik
- Submission by Nov 4 9pm ET — aim for noon Nov 4 for buffer
