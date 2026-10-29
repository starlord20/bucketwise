# Changelog — Bucketwise Household CFO

All notable changes, newest last within each day. Times are session order, Oct 27–29 2026.

## Oct 27 — Foundation
- Reviewed new `AGENTS.md`; locked rules: server-only Meta calls, JSON mode, usage logging, mock fallback, freeze Oct 30 6pm, submit Nov 4 noon.
- Answered leak-analysis task on 8 sample transactions (Adobe + Spotify duplicates, 3-bucket split, 2 digest actions).
- Rewrote `lib/meta-api.ts` on OpenAI-compat client: Wonder (`Llama-4-Maverick-…`) + Spark (`Llama-3.2-3B`), `response_format: json_object`, `console.log(usage)`, mock fallback without key.
- Rewrote `app/api/ingest/route.ts`: Wonder + Spark in parallel, Spark leaks preferred.
- `tsc` clean, `next build` green. Installed `openai` dep (npm cache workaround).
- Accidentally reverted uncommitted `AGENTS.md` during collateral cleanup; restored byte-identical (4884 bytes).

## Oct 28 — Upload crash, Meta-only cutover
- Fixed 500 on CSV upload: blank lines parsed as `{merchant: undefined}` → crash in `toLowerCase`. Hardened `parseCSVTransactions` (skip blanks/malformed), `norm()` (non-string safe), route-level sanitize.
- Verified against real code via `/tmp/probe-ingest.js`: 61 rows, Adobe/Spotify leaks, hostile/empty input safe. No test harness in repo — probe kept, no framework added.
- Housekeeping (Meta-only): replaced OpenAI SDK with native `fetch` to `META_API_BASE`; uninstalled `openai`; live `GET /models` gave real IDs (`muse-wonder-1.0`, `muse-spark-1.3`, `sam-3.1`, `muse-image-1.0`); shock-test moved off Llama/Baseten to Wonder; docs updated; `test-meta.js` rewritten fetch-based. Box 1 live proof passed (real leaks + usage).
- Reasoning-budget bug: full-CSV calls returned `content: null` (reasoning ate the budget) → added `reasoning_effort` (Wonder/shock `low`, Spark `minimal`); Wonder 4000 / Spark 1500 tokens.
- Daily Digest moved to Spark/`minimal` (433 tokens vs ~2–5k); route falls back to Wonder actions; UI shows "by spark/wonder/mock".
- Box 2 confirmed in browser: 61 txns live, buckets, 4→2 leaks, digest by spark.
- Coach's flags: H1 + tab title "Bucketwise"; status bar corrected; leak rule tightened (monthly bills never leaks; 3-day clusters or variant names only). Live check: only Adobe $52.99 + Spotify $16.99.
- Sources question answered (static labels → Gmail merge → Plaid near-realtime vision).
- Mock data pack: `mock-checking-90day.csv` (64 rows), `mock-savings-529.csv` (26 rows), 3 Drive statements, 5 copy-paste Gmail samples with single-amount rule, `samples/README.md`.

## Oct 28 (cont.) — Design pass + business docs
- Sprint tracking live: `SPRINT-TRACKER.md`, memory note, todos; Day 3 boxes tracked.
- Design pass: staged `ImportProgress` (CSV + Gmail stages, progressbar roles, aria-live); Gmail OAuth callback + one-shot import-result + auto-merge; Sources panel (CSV/Refresh, Gmail status via `/api/auth/status`, investments roadmap); per-bucket source/synced stamps; formatted shock verdicts. Plaid investments stubbed.
- `BEYOND-HACKATHON.md` written (customers, roadmap, gaps, pricing, milestones).
- ALL-accounts clarification: `ACCOUNT_UNIVERSE` (19 kinds → buckets + shock context) rendered as chips; roadmap updated per Plaid product.
- Session goal created: win Indie Track, submit by Nov 4 noon.
- Shock validated live (1337 tokens, `{bufferNeeded, checklist, perShock}`); Muse Image probed (`/images/generations` 200) — generated + wired bucket art (`public/bucket-art/`) into cards + shock section.
- README audit: proven $69.98/mo, Wonder shock-test, exact model IDs/paths, Llama removed.
- SAM receipts: `sam-3.1` 404s on `/chat/completions` ("use `/responses`") — implemented `parseReceiptsWithSAM` on `/responses`; new `POST /api/parse-receipt` (400/422/503, no mock); Scan Receipt Photo button + preview + Add-to-buckets merge.
- Submission prep: `.env.example` created; `DEMO-SCRIPT.md` (2:30 + vertical cut + pitch beats).
- Hardening: `num()` guard; BucketCard/page coerce bad numbers; leaks render "Unknown"; unknown bucket names fall back to Emergency.
- Asset audit: generated `public/logo.png` (wired into header), `PITCH-DECK.md` (6 slides); README now uses the logo.
- Indie-scope alignment: PA-family lens in Wonder/digest prompts (529 deduction, 401k match, HSA); cancel-email draft from Spark (live-verified, 688 tokens); README Llama-consolidation footnote; sample extended to 90 days.
- Verification sweep: 101-row Wonder run pulled monthly transfers into leaks → tightened Wonder to one-month-overcharge reporting; removed 3 artifact-dupe CSV rows (98 txns final); re-verified exactly 2 leaks. Staged `SUBMIT-CHECKLIST.md`.
- Committed `141abe4`; `git push` blocked by sandbox SSH (uid 501, no passwd entry — unfixable here).
- Progress-bar completion behavior: capped at 90% while working, jumps to 100% with all checks only when the result lands; lingers 1.8s; hides on error.
- Digest persistence: last good analysis (buckets, leaks, actions, draft, shock, last CSV) saved to localStorage and restored on reload — reload amnesia fixed.
- Shocktober fixes: `{"raw":null}` root-caused (default 800-token budget eaten by reasoning) → explicit 2500 + low effort + mock fallback with console error; year order fixed to 2008/2020/2022 everywhere (title, prompt order, regenerated banner); added live `live` flag — mock now labeled "Reference scenario … hit Run again".
- Site logo de-duplicated: generated icon-only mark (`public/icon-buckets.webp`); browser tab via `app/icon.png` (auto favicon route); header uses the mark + H1 text; `public/logo.png` kept for repo/README.
- Shock scores added: prompt requires 0–100 `score` per shock; rendered with color bars (verified live: 2008:4, 2020:8, 2022:6 — honest given $900 buffer).
- Future-state panel: Wonder projects Dec 2026/Dec 2027 per bucket + shock-adjusted Emergency + stated assumptions (verified live: 2026 $15k/$33.5k/$15.3k).
- `DEMO-NOTES.md` started: Emergency $15k cap is by design (overflow redirects to College).
- Date strip: API returns `dateRange {from,to,days}`; UI shows "History: … → … (N days analyzed) · Report date: …".
- Live SVG gauges replaced the static "No scores" banner: needle = live score, year colors, aria labels.

## Oct 29 — Publish
- Pushed via `gh auth git-credential` HTTPS helper (no config changed): remote confirms public `starlord20/bucketwise`, `main`, commits `141abe4` + `e5be1e8` (+ tracker commit `4d52157`). `tsc` + build re-verified green.
