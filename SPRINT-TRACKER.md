# Sprint Tracker — Household CFO (Oct 26 – Nov 4)

Submission: Nov 4 9pm ET (aim noon). Freeze: Oct 30 6pm ET.
Judging: Nov 5–9, winners Nov 10.

## Burndown

| Day | Planned exit | Status |
|---|---|---|
| Day 1 (Oct 26) | Key tested, concept posted | Partial: key applied, never live-tested |
| Day 2 (Oct 27) | CSV → real buckets | Partial: code ready, build green, unproven live |
| Day 3 (Oct 28) TODAY | Ugly end-to-end + capture + #progress | In progress (3 boxes below) |
| Day 4 (Oct 29) | Meta depth: SAM spike, Image, host decision | Queued |
| Day 5 (Oct 30) | Freeze 6pm + impact numbers | Queued |
| Day 6 (Oct 31) | Stranger-can-run + README | Queued |
| Day 7 (Nov 1) | Demo video done | Queued |
| Day 8 (Nov 2) | Rubric pass | Queued |
| Day 9 (Nov 3) | Dry run + draft filed | Queued |
| Day 10 (Nov 4) | Submit by noon | Queued |

## Today (Day 3) — definition of done

- [ ] Box 1: `.env.local` set, `node test-meta.js` prints result + usage (screenshot for judges)
- [ ] Box 2: CSV upload in `page.tsx` → POST `/api/ingest` → live buckets/leaks rendered
- [ ] Box 3: 30-sec screen capture, Discord #progress post, 1 cold viewer repeats it back

## Blockers / risks

- Model ID 404 → set `META_WONDER_MODEL` / `META_SPARK_MODEL` env, 1 hr box, then mock-forward
- OAuth + Resend gated behind working CSV → digest path
- SAM/Image: 2 hr timeboxes each, cut to diagram + mock on resistance

## Log

- Oct 28: ingest wired (Wonder + Spark parallel, JSON mode, usage log, mock fallback); `tsc` + `next build` green.
- Oct 28 Box 2 done: `page.tsx` renders live buckets/leaks/actions from `/api/ingest` via `ConnectAccounts` upload (loading + error states, mock badge); shock result shown inline; build green. Live proof still blocked on Box 1 (no key).
- Oct 28 bugfix: blank CSV lines crashed ingest (500 via `toLowerCase`); fixed `parseCSVTransactions` + hardened `norm` + route sanitize. Probed real code (`/tmp/probe-ingest.js`): 61 rows, Adobe/Spotify leaks found, hostile/empty input safe. No test harness in repo — probe kept at `/tmp/probe-ingest.js`, `/tmp/cfo-dist/`.
- Oct 28 housekeeping (Meta-only): `lib/meta-api.ts` rewritten to native `fetch` against `META_API_BASE` only; `openai` dep uninstalled; model IDs from live `GET /models` (`muse-wonder-1.0`, `muse-spark-1.3`, `sam-3.1`, `muse-image-1.0`); shock-test moved from Llama/Baseten to Wonder; docs (AGENTS/README/plan) updated. Box 1 DONE: live Wonder returned real Adobe $52.99 + Spotify $16.99 leaks with usage (1977 tokens).
- Oct 28 reasoning-budget bug: full-CSV upload fell back to mock ("Wonder returned non-JSON") — Muse models burned the whole `max_tokens` on reasoning (`content: null`). Fix: `reasoning_effort` on every call (Wonder/shock `low`, Spark `minimal`; verified: full payload now returns complete JSON, ~2.4k tokens). Re-upload needed to confirm in browser.
- Oct 28 digest → Spark: Daily Digest actions now written by `buildDigestWithSpark` (`muse-spark-1.3`, `minimal`, prompt = counts + leaks only). Live probe: 3 dollar-amount actions, 433 total tokens (vs ~2-5k on Wonder). Route falls back to Wonder actions if Spark digest fails; UI shows "Daily CFO Digest — by spark/wonder/mock". `tsc` + build green.
- Oct 28 Box 2 CONFIRMED in browser: 61 txns live (Wonder + Spark), 3 buckets rendered, 4 leaks found, digest "by spark". Day 3 vertical slice done pending Box 3 post.
- Oct 28 coach's flags applied: H1 + tab title now "Bucketwise"; status bar corrected (Spark leak detection, Wonder shock-test); Spark leak prompt + local fallback tightened (monthly bills never leaks; only 3-day clusters or variant names). Live check: only Adobe $52.99 + Spotify $16.99 flagged, 529/daycare clean. Build green.
- Oct 28 flags CONFIRMED in browser: 2 leaks with within-3-days reasons, digest by spark with honest $69.98 math. Impact number locked: $69.98/mo.
- Oct 28 pre-Day-4 design pass: staged ImportProgress (CSV 5 stages, Gmail 5 stages, progressbar roles + aria-live); Gmail OAuth callback + one-shot import-result + auto-merge with CSV; Sources panel (CSV connected/time + Refresh, Gmail status via /api/auth/status, investments roadmap); per-bucket source/synced stamps; shock-test renders formatted verdicts. Plaid investments stubbed (`fetchInvestmentHoldings`). BEYOND-HACKATHON.md written (customers, roadmap, gaps, metrics). tsc + build green. NOT live-tested: Gmail OAuth + Plaid (need user creds).
- Oct 28 ALL-accounts clarification: `ACCOUNT_UNIVERSE` in `lib/plaid.ts` (19 kinds: bank, retirement, 529/Coverdell, HSA, loans, cards, payroll) mapped to buckets + shock-test context with CSV/manual/roadmap status; Sources panel renders the universe as chips; roadmap doc updated (Plaid product per kind, 529 manual-first). Build green.
- Oct 28 shock-test validated live: Wonder returns {bufferNeeded, checklist, perShock} (1337 tokens) — renders via ShockView. Muse Image spike viable (`/images/generations`, b64 webp): generated + wired `public/bucket-art/{emergency,college,lifeevent,shock}.webp` into BucketCard + shock section. Build green. Artwork not eyeball-verified (no image viewer here) — confirm on sight at localhost:3000.
- Oct 28 SAM receipts shipped: `sam-3.1` is NOT on /chat/completions (404 "Use /v1/responses") — implemented `parseReceiptsWithSAM` on `/responses` (probe 200, images_processed:1). New `POST /api/parse-receipt` (400/422/503 handling, no mock — honest errors) + "Scan Receipt Photo" button + parsed preview + one-tap "Add to buckets" merge. README fixed (proven $69.98/mo, Wonder shock-test, exact file paths, no Llama). Build green with `/api/parse-receipt` route. Live photo test needs user (no receipt image here).
- Oct 28 submission prep: `.env.example` created (README referenced a missing file — stranger test would break at step 2); `DEMO-SCRIPT.md` written (2:30 script + shot list + 60s vertical cut + pitch beats). Remote `origin` confirmed (starlord20/bucketwise). Build green, tree clean.
- Oct 28 demo-day hardening: model output now treated as untrusted — new `num()` guard in `lib/buckets.ts`; BucketCard/page/withProgress coerce bad numbers; leaks render `Unknown` merchant instead of crashing; unknown bucket names fall back to Emergency. A judge uploading a weird CSV can no longer blank the page. Build green.
- Oct 28 asset audit: README referenced `public/logo.png` (missing) and `/deck` (missing) — generated real logo via Muse Image (61KB, wired into header) and wrote `PITCH-DECK.md` (6 slides), README linked. Build green.
- Oct 28 Indie-scope alignment: PA-family lens in Wonder + digest prompts (529 deduction, 401k match, HSA, no stock picking); Spark digest now returns a cancel-email draft for the biggest leak (live-verified, 688 tokens, renders under digest); README Llama-consolidation footnote; sample-bank.csv extended to 90 days (101 txns, Aug–Oct, duplicates only in Oct). Build green.
- Oct 28 verification sweep: full 101-row Wonder run returned clean buckets + Adobe/Spotify-only leaks; found the extension had pulled monthly transfers into leak range — tightened Wonder to one-month-overcharge reporting, removed 3 artifact-dupe CSV rows (98 txns final), re-verified Spark = exactly 2 leaks ($69.98). Reconciled docs (DEMO-SCRIPT 98 txns, AGENTS sample line); staged SUBMIT-CHECKLIST.md for filing. Build green.
- Oct 28 commit 141abe4 pushed-to-be: full worktree committed locally (code, 98-txn sample, art, docs); `git push` blocked in this environment (SSH auth) — run it from your terminal. tsc + build re-verified green on the committed tree.
