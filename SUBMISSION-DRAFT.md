# Submission Draft — copy-paste into the hackathon form (Indie Track)

## Project Title
Bucketwise — Household CFO

## One-line summary
An AI Household CFO that learns from past economic shocks (2008, 2020, 2022 inflation) and turns messy personal finances into 3 clear buckets — Emergency, College, Life Events — with automated actions and a shock-test simulator.

## Project description
Problem I know firsthand: as a family managing college savings and life-event costs, our financial picture lives in 6 places — Gmail receipts, bank statements, 529 emails, Drive docs. Past crises taught the same lesson: families with a buffer and a simple plan survived better. Most tools give charts, not actions.

What I built: a privacy-first web app that ingests with permission (bank CSVs, Gmail/Drive via OAuth, receipt photos), reasons with Muse Wonder over 90 days of transactions into 3 buckets (Emergency $15k, College $250k, Life Event $30k), finds duplicate-subscription leaks with Muse Spark, shock-tests with Muse Wonder (income -30%, expenses +20%, college +6%/yr), and writes a Daily CFO Digest with a cancel-email draft. PII stays local — only anonymized summaries reach models.

Live proof on my own data (98 txns, 90 days): $69.98/mo recovered ($839.76/yr) — Adobe billed twice under two names, Spotify Family overlapping Spotify — plus per-shock resilience scores and a 2026/2027 projection.

Meta stack, one API, zero other endpoints: Wonder `muse-wonder-1.0` (buckets + shock), Spark `muse-spark-1.3` (leaks + digest), SAM 3.1 (receipts via `/responses`), Image `muse-image-1.0` (logo, bucket art), Muse Code (scaffolded the routes).

## Links
- Code: https://github.com/starlord20/bucketwise
- Live demo: https://bucketwise.vercel.app/
- Demo video: https://youtu.be/KFze_MqESo8 (backup: https://www.loom.com/share/1d965246b5e4492ea5329a3e7e98fe6d)
- Pitch deck: https://bucketwise.vercel.app/pitch-deck.html

## Numbers (keep identical everywhere)
$69.98/mo, $839.76/yr, 98 txns / 90 days, Emergency $15k / College $250k / Life Event $30k.

---

# Discord posts

## #progress (today, after filing)
Bucketwise | Karthik — Submitted ✅ Indie Track. Household CFO: CSV → 3 buckets → shock-test → digest. Found $69.98/mo in my own subs. Live: https://bucketwise.vercel.app/ — thanks to everyone who gave feedback!

## Cold-viewer ask (if Box 3 still open)
@[name] — one line after watching the 30s clip: what does Bucketwise do? Even a wrong answer helps — testing whether the hook lands.
