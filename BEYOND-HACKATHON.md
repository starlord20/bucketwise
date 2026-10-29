# Beyond the Hackathon — Bucketwise as a Business

Bucketwise wins the hackathon as a demo. It becomes a business by staying correct,
current, and trusted with a family's real money. This doc lists what that takes:
features, functionality, gaps, and who pays.

Assumption: "AL investment accounts" = **all** investment accounts (401k, brokerage,
529). If you meant Ally specifically — covered: Ally is on Plaid, same integration.

## Customers (who pays, in order)

1. **PA-style suburban families** (us): 2 incomes, mortgage, daycare, 529s. Pain:
   money picture lives in 6+ places; charts don't change behavior. Pays $8–12/mo
   for actions that save $70+/mo (proven: $69.98/mo leak find).
2. **Grandparent/parent 529 contributors**: gift + track college bucket. Pays per gift or $5/mo.
3. **Fee-only financial planners / CPAs**: white-label shock-test + digest for clients. $49–99/mo per advisor.
4. **Credit unions / community banks**: retention widget ("Household CFO inside checking"). B2B2C revenue share.

## Features: now → next → later

**Now (hackathon):** CSV upload → Wonder buckets → Spark leaks → Wonder shock-test →
Spark daily digest. Mock fallback, local-first.

**Next (MVP, 60 days):**
- Plaid Transactions + Investments sync (bank + 401k + brokerage + 529 balances),
  per-bucket source labels + last-synced timestamps (scaffolded: `fetchInvestmentHoldings`, Sources panel).
- Gmail/Drive receipt parsing end-to-end (OAuth callback exists; email-body →
  transaction parsing via Wonder is a stub).
- Scheduled Daily Digest email (Resend), weekly shock re-run.
- 529 plan integration: PA 529 (Ascensus) balance import — CSV/manual first (no aggregator covers Ascensus well), API where available.
- Full account universe (see `ACCOUNT_UNIVERSE` in `lib/plaid.ts`): Emergency ← checking/savings/money-market/CDs; College ← 529/Coverdell/taxable brokerage; Life Event ← HSA/IRA/brokerage share; shock-test context ← payroll, 401k/403b/Roth, mortgage, HELOC, auto/student/personal loans, credit cards. Plaid products: Transactions (bank), Investments (brokerage/retirement/HSA), Liabilities (loans/cards), Income (payroll).
- Multi-month trend: are buckets converging on targets? Streaks.
- Auth + private accounts (Clerk/Auth.js), encrypted token vault (no plaintext .env in prod).

**Later (moat):**
- Bill negotiation / cancel concierge (leak → action → done, revenue share).
- Tax-aware moves (529 superfunding, Roth timing) with CPA review flag.
- Household multi-profile (spouse + kids + grandparents gifting).
- Anomaly alerts (paycheck missing, bill spike) via push.

## Functionality requirements (non-negotiable for real money)

- **Correctness over coverage**: never flag a legitimate bill (lesson learned:
  monthly-repeat rule). Every dollar claim traceable to a transaction.
- **Freshness**: buckets stamped with source + synced time; stale badges after 7 days.
- **Privacy**: PII stays local; only anonymized summaries to models (already the
  architecture). SOC 2 Type I before advisor tier.
- **Reliability**: every model call has a local fallback; demo never 500s (done).
- **Cost control**: Spark/`minimal` for digest + leaks (~400 tokens); Wonder/`low`
  for buckets/shock (~2.5k). Blended cost pennies per family per month.

## Gaps (honest list — what is NOT done)

1. Plaid product integration (Link + Transactions + Investments) — stubbed only.
2. 529 balance APIs (plan-by-plan; CSV fallback works today).
3. Email-body → transaction parsing (`parseWithWonder` stub).
4. Production token storage (import cache is in-memory; Vercel needs KV/DB).
5. Auth, multi-user, mobile, push/email scheduling.
6. Compliance: no fiduciary advice claims; "suggestions, not advice" + CPA review path.
7. Backtesting shock model against real 2008/2020 household data.

## Metrics that matter

- Leak $ found per household (today: $69.98/mo sample).
- Buffer-months to target (Emergency $15k, College $250k, Life Event $30k).
- Digest action completion rate (did they cancel / move?).
- Churn proxy: refresh cadence (are sources re-synced weekly?).

## 60-day milestones

- Week 1–2: Plaid sandbox → live Transactions + Liabilities sync (bank + loans + cards); kill CSV-only path for beta users.
- Week 3–4: digest email + 529/Coverdell manual balances; 10 pilot families (Center Valley network).
- Week 5–6: Plaid Investments (brokerage/401k/IRA/HSA) → College/Life Event buckets near-realtime.
- Week 7–8: advisor white-label pilot (1 planner); price test $8 vs $12.
