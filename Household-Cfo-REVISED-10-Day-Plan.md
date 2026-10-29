# REVISED 10-Day Plan — Household CFO — To Win Indie Track ($150k Top Prize)
**You:** Karthik Ramani, Center Valley PA, Indie Track — Solo founder — Approved Oct 26
**Prize:** Indie track $400k pool, $150k top prize. Judging: real-world impact, depth of Meta tool use, technical depth, demo quality.
**Current Status (Oct 26 Evening):** ✅ Approved, ✅ Discord joined, ✅ Dashboard v3 working (screenshot proof), ✅ Starter repo + ingest layer built. You are 1.5 days AHEAD.

## Winning Strategy for YOUR idea
**One WOW Workflow:** Upload CSV OR Connect Gmail -> Wonder parses real transactions -> Spark builds 3 buckets (Emergency/College/Life Event) + leaks -> Wonder shock-test (2020/2008/2022) -> Daily CFO digest with actions. That's it. Judges remember ONE flow.

**Meta Depth Checklist (must show all to win):**
- Muse Wonder: long-context reasoning over 90 days of financial docs -> bucket strategy
- Muse Spark: fast cashflow + leak detection
- SAM 3.1: receipt photo -> structured JSON
- Muse Image: visual bucket cards (you have) + shock-test infographic
- Muse Wonder: private shock simulator (PII stays local, only anonymized summary sent)
- Muse Code: show you used it to generate API routes (mention in README)
- Meta Model API: single gateway for all

**Impact Number:** Claim: "Families save $200-400/mo by auto-canceling leaks + hitting buffer targets 3x faster." You will get this number from your own CSV test.

---
## REVISED DAILY PLAN

### Day 1 — Oct 26 TONIGHT (You're here — 2 hours max)
**Goal: Close Day 1 exit criteria early.**
- [x] Track confirmed: Indie Dev — DONE
- [x] Repo skeleton — DONE (v3)
- [ ] Claim $150 credits: Go to dev.meta.ai -> test with: `curl` one call to Spark. Screenshot it works. If portal not showing yet, note it and use CSV mock for now.
- [ ] Write 1-page concept.md (use text from application) + post in Discord #introductions: "Indie | Household CFO — 3 buckets + shock-test | Dashboard live, looking for feedback on shock-test UX" — Be visible Day 1.
- [ ] Update README with which Meta tools where (judges check README first)

**Exit:** API key tested (or noted), concept posted in Discord.

### Day 2 — Oct 27 (RISKEST SPIKE — Most Important Day)
**Goal: Make Wonder + Spark actually parse YOUR real data.**
- Workshop: Attend Meta Model API workshop (Oct 27)
- Build: Wire /api/ingest -> buildBucketsWithWonder() with REAL Meta API call. Replace mock with real. If credits not unlocked, build with fallback mock but show code ready.
- Spike: CSV upload -> Wonder returns JSON {buckets, leaks, actions}. Test with sample CSV I will give you.
- Demo story: Write 90-sec script: "As a PA family managing college savings, my finances lived in 6 places. Household CFO..." 

**Exit:** You can upload YOUR bank CSV and get buckets back — even if ugly.

### Day 3 — Oct 28 (VERTICAL SLICE)
**Goal: End-to-end ugly but real — Input to Daily Digest.**
- Flow: CSV upload -> Wonder -> Spark leaks -> Wonder shock-test (mock fallback if needed) -> UI shows Daily Digest: "Move $300 to Emergency, cancel Adobe"
- Hardcode nothing in UI — all from API
- Record 30-sec screen capture of it working — post in Discord #progress

**Exit:** Stranger can understand flow without you explaining.

### Day 4 — Oct 29 (MAKE IT GOOD)
**Goal: Depth of Meta tools.**
- Add SAM 3.1: Upload receipt photo -> parse -> add to transactions
- Add Muse Image: Generate shock-test infographic "If 2020 repeats, you need +$3200 buffer"
- Add Wonder shock simulator: Show architecture diagram (PII stays local, only anonymized summary sent to Wonder)
- Test with 1 REAL family dataset (your own or friend's anonymized) — not test data

**Exit:** Works with real input without babysitting. This is what separates winners from wrappers.

### Day 5 — Oct 30 (FEATURE FREEZE — CRITICAL)
**Goal: Freeze. No new features after 6pm.**
- Finish second feature ONLY if core solid: e.g., Gmail OAuth OR daily email digest via Resend API
- Fix top 3 bugs from real testing
- Collect impact evidence: Screenshot before/after — e.g., "Found $68.97/mo leaks, buffer target hit 2 months faster"
- **6pm: FEATURE FREEZE.** Write in Discord: "Household CFO feature frozen"

**Exit:** Feature list frozen, impact numbers in hand.

### Day 6 — Oct 31 (POLISH + STRESS TEST)
**Goal: Stranger can run it.**
- UI pass: Your current cards are good — add ConnectAccounts component + loading states + error handling
- Stress test: 10 inputs: empty CSV, huge CSV, receipt photo sideways, 2020 shock, 2008 shock
- Write README: Problem, Solution, How to run (npm install, env, npm dev), Which Meta tools and WHY (table format), Architecture diagram, Link to demo video placeholder
- Draft submission pitch text (copy from your application but add impact number)

**Exit:** README alone lets stranger run it.

### Day 7 — Nov 1 (DEMO VIDEO — 2nd Most Important Deliverable)
**Goal: Demo video DONE today.**
- Script (2.5 min):
  - 0-15s Hook: "70M US families — college + emergency + life events — 6 places. I live this in Center Valley PA."
  - 15-105s Live Workflow: Upload CSV -> Show Wonder parsing -> 3 buckets animate -> Run Shock Test -> Show Daily Digest action
  - 105-150s Impact: "Found $X leaks, need $Y buffer if 2020 repeats, 3 buckets auto-updated"
  - Close: "Built with Wonder, Spark, SAM 3.1, all on the Meta Muse API"
- Record happy path twice, no music, clean voiceover
- Cut 60-sec vertical for Discord / X
- Show to 1 person cold — if they can't repeat back, re-record hook

**Exit:** Video done, understood by cold viewer, uploaded to YouTube unlisted.

### Day 8 — Nov 2 (JUDGING RUBRIC PASS)
**Goal: Fix weakest rubric.**
- Re-read rubric: real-world impact, depth of Meta tool use, technical depth, demo quality
- Grade yourself 1-10 on each — strengthen weakest
- Add metrics: screenshots of buckets, shock-test results, leaks found
- Final bug sweep on demo path ONLY
- Ask Discord peer for 10-min review — offer to review theirs

**Exit:** Every rubric has visible evidence.

### Day 9 — Nov 3 (DRY RUN + SAFETY NET)
**Goal: No surprises on submission day.**
- Full dry run as judge: Fresh clone, README steps, video link, submission form draft
- Backup: If live API could fail during judging, video covers it — confirm YouTube link works
- Fill submission form completely, save draft
- Sleep — no structural changes after today

**Exit:** Submission draft filled, dry run passed.

### Day 10 — Nov 4 SUBMISSION DAY (Submit by NOON ET)
**Goal: Submit early.**
- Morning: Final check links, video, repo public, env vars not committed
- **Submit by noon ET** — not 9pm. Screenshot confirmation.
- Post in Discord: "Submitted — Household CFO — Indie Track — thanks to [names]"
- Evening: Rest. Judging Nov 5-9, winners Nov 10.

---
## If You Fall Behind (Rules)
- Cut features, never demo video. Core + great demo > big feature list
- Stuck >2hrs: Ask Discord, then cut around it
- Idea feels weak Day 2: Pivot Day 2. Day 5 pivot = loss

## Your Open Questions — ANSWERED
1. Indie or Startup? -> INDIE — Confirmed, stay Indie. Your strength is creativity + technical ambition solo.
2. Solo or team? -> Solo for now — you are ahead. If you add someone Day 3-4, make them own Gmail OAuth only.
3. Project idea? -> LOCKED: Household CFO — 3 buckets + shock-test + daily digest.

## Daily Rhythm (Stick to this)
- Morning 30m: Write single outcome for day on paper
- Build block 3-4hrs: No Discord, no tutorials
- Evening 30m: Post progress in Discord + what works now

You are ahead of 90% of hackers — dashboard live on Day 1 is huge. Now execute Days 2-5 to win.
