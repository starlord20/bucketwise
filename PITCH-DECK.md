# Bucketwise — Pitch Deck (6 slides)

## 1. Problem
70M US families run college savings, emergency buffers, and life events across
6+ apps — bank statements, Gmail receipts, 529 emails, Drive tax docs. Existing
tools give charts. Families with a buffer + a simple plan survived 2008/2020/2022
better. Families without didn't.

## 2. Solution: Financial Freedom OS — Actions, Not Charts
Upload CSV or connect Gmail → Muse Wonder allocates every dollar into 3 buckets
(Emergency $15k, College $250k, Life Event $30k) → Muse Spark finds duplicate
charges + writes a daily digest of dollar-amount actions → Wonder shock-tests
against 2008/2020/2022.

## 3. Proof (real numbers, our own test)
- **$69.98/mo recovered ($839.76/yr)** — Adobe billed twice under two names,
  Spotify Family overlapping Spotify. Traced to named charges, with dates.
- Monthly bills are never flagged — only 3-day clusters and variant names.
- Full run: ~5k tokens. Blended cost per family: pennies per month.

## 4. Meta depth (1 API, 0 other endpoints)
| Model | Job |
|---|---|
| Wonder `muse-wonder-1.0` | Buckets + shock-test (long-context reasoning) |
| Spark `muse-spark-1.3` | Leak detection + Daily Digest (`minimal` reasoning) |
| SAM 3.1 | Receipt photo → transaction JSON (`/responses` API) |
| Image `muse-image-1.0` | Logo, bucket art, shock infographic |

PII stays local — only anonymized summaries reach models. Every call has a
local fallback; the demo never 500s (mock mode without a key).

## 5. Business beyond the hackathon
19-account universe mapped (bank, 529/Coverdell, HSA, IRA, 401k, loans, cards,
payroll) → Plaid rollout sequenced. Customers: suburban families ($8–12/mo),
529 gifters, fee-only planners ($49–99/mo), credit unions (B2B2C).
Full roadmap: `BEYOND-HACKATHON.md`.

## 6. Ask
Indie Track top prize to fund the Plaid + 529 live integrations and the 10-family
Center Valley pilot. Bucketwise: Household CFO. Actions, not charts.
