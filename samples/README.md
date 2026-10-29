# Mock inputs for testing (no real money, no real accounts)

## CSV upload (works today — Upload Bank CSV)
| File | Rows | What it proves |
|---|---|---|
| `sample-bank.csv` | 98, Aug–Oct | Full demo: Adobe + Spotify duplicates ($69.98/mo), 90-day reasoning |
| `mock-checking-90day.csv` | 64 | Checking life: payroll, mortgage, loans, cards, same 2 leaks |
| `mock-savings-529.csv` | 26 | Savings/529/HSA/IRA/brokerage/Coverdell — should find ZERO leaks |

Upload either mock alone, or all three back-to-back (transactions accumulate
per upload; Refresh re-runs the last file).

## Gmail (needs GOOGLE_CLIENT_ID + SECRET, then Connect Gmail + Drive)
`gmail/sample-emails.txt` has 5 copy-paste emails. Send them to yourself from
your own address. Bucketwise searches Gmail for `finance OR 529 OR receipt OR
statement` (last 90 days) — the bracketed keyword in each subject guarantees a
hit. Each $ amount in the body becomes one transaction dated the send day:
emails 1, 2, 4, 5 create 1 txn each; email 3 creates the intentional Adobe
duplicate pair. Email 5 (PECO, monthly bill) must NEVER flag as a leak.

## Drive (needs same OAuth; listing only for now)
`drive/` has 3 statements (checking, PA 529, brokerage). Upload them to Drive,
then connect: they show up in the import file count. Honest limit: Drive file
*contents* are not parsed into transactions yet — Gmail receipts are. The
import tells you exactly that.
