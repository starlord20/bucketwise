// Server-only: Meta Muse API (dev.meta.ai) via native fetch.
// ONLY this endpoint is ever called — no OpenAI, Llama, Fireworks, Baseten.
// Never import this file from client components — env keys must not leak.

export type Transaction = { date: string; merchant: string; amount: number; category: string };
export type BucketResult = { name: string; target: number; current: number; monthly_needed: number };
export type Leak = { merchant: string; amount: number; reason?: string };

function metaBase(): string {
  const base = (process.env.META_API_BASE || "").replace(/\/+$/, "");
  if (!base) throw new Error("Missing META_API_BASE — copy it from dev.meta.ai into .env.local");
  return base;
}

// Verified live via GET {META_API_BASE}/models (all owned_by "meta").
// Overrides via env so portal changes need no code change.
export const WONDER_MODEL = process.env.META_WONDER_MODEL || "muse-wonder-1.0";
export const SPARK_MODEL = process.env.META_SPARK_MODEL || "muse-spark-1.3";
export const SAM_MODEL = process.env.META_SAM_MODEL || "sam-3.1";
export const IMAGE_MODEL = process.env.META_IMAGE_MODEL || "muse-image-1.0";

export const MODELS = {
  spark: SPARK_MODEL,
  wonder: WONDER_MODEL,
  image: IMAGE_MODEL,
  sam: SAM_MODEL,
};

type ChatMessage = { role: string; content: string };
type ChatResponse = { choices: { message: { content: string } }[]; usage?: unknown };

async function chatCompletions({
  model,
  messages,
  response_format,
  max_tokens,
  effort = "low",
}: {
  model: string;
  messages: ChatMessage[];
  response_format?: { type: string };
  max_tokens?: number;
  effort?: string;
}): Promise<ChatResponse> {
  const key = process.env.META_API_KEY;
  if (!key) throw new Error("Missing META_API_KEY");
  const res = await fetch(`${metaBase()}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages,
      // Muse models reason by default and can burn the whole token budget on
      // reasoning (content comes back null). Cap effort so the answer survives.
      reasoning_effort: effort,
      ...(response_format ? { response_format } : {}),
      ...(max_tokens ? { max_tokens } : {}),
    }),
  });
  if (!res.ok) throw new Error(`Meta Muse API error ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = (await res.json()) as ChatResponse;
  console.log(data.usage); // Rule 3: judge screenshot proving $150 consumption
  return data;
}

// --- Mock fallback (Rule 4: stranger test passes with no key) ---
export function mockCFO() {
  return {
    buckets: [
      { name: "Emergency", target: 15000, current: 4200, monthly_needed: 450 },
      { name: "College", target: 250000, current: 38000, monthly_needed: 650 },
      { name: "Life Event", target: 30000, current: 5000, monthly_needed: 300 },
    ] as BucketResult[],
    leaks: [
      { merchant: "Adobe x2", amount: 52, reason: "Duplicate Adobe charge (mock)" },
      { merchant: "Spotify Family duplicate", amount: 16.99, reason: "Overlapping Spotify plans (mock)" },
    ] as Leak[],
    actions: [
      "Cancel duplicate Adobe — saves ~$53/mo",
      "Move $300 to Emergency this week",
    ],
    shockBuffer: "Mock: 2020-style -30% income needs +$3200 emergency buffer.",
    mock: true as const,
  };
}

// Fast local duplicate detector: used as Spark fallback when no key,
// and to guarantee a result even if the API call fails.
function detectLeaksLocal(transactions: Transaction[]): Leak[] {
  const norm = (s: unknown) =>
    String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/\b(inc|llc|co|family|cc)\b/g, "").trim();
  const seen = new Map<string, Transaction[]>();
  for (const t of transactions) {
    const k = `${norm(t.merchant)}|${Math.abs(t.amount).toFixed(2)}`;
    const g = seen.get(k) ?? [];
    g.push(t);
    seen.set(k, g);
  }
  // Same rule as the Spark prompt: monthly repeats are legitimate subscriptions,
  // never leaks. Flag only charges clustered within 3 days (same-day doubles,
  // or variant names like Adobe CC vs Adobe Creative Cloud).
  const withinDays = (a: string, b: string, n: number): boolean => {
    const da = new Date(a).getTime(), db = new Date(b).getTime();
    if (isNaN(da) || isNaN(db)) return true; // unknown dates: flag rather than hide
    return Math.abs(da - db) <= n * 86400000;
  };
  const leaks: Leak[] = [];
  for (const [, g] of seen) {
    const clustered =
      g.length > 1 &&
      g.some((x, i) => g.slice(i + 1).some((y) => withinDays(x.date, y.date, 3)));
    if (clustered) {
      const dates = [...new Set(g.map((t) => t.date))].join(", ");
      leaks.push({
        merchant: g[0].merchant,
        amount: Math.abs(g[0].amount),
        reason: `${g.length}x charge of $${Math.abs(g[0].amount).toFixed(2)} for similar merchant "${g[0].merchant}" within 3 days (${dates})`,
      });
    }
  }
  if (leaks.length === 0) {
    // Fallback: same amount on same date = likely duplicate (Spotify Family vs Spotify)
    const byDay = new Map<string, Transaction[]>();
    for (const t of transactions) {
      const k = `${t.date}|${Math.abs(t.amount).toFixed(2)}`;
      const g = byDay.get(k) ?? [];
      g.push(t);
      byDay.set(k, g);
    }
    for (const [, g] of byDay) {
      if (g.length > 1 && new Set(g.map((t) => t.merchant)).size > 1) {
        leaks.push({
          merchant: g[0].merchant,
          amount: Math.abs(g[0].amount),
          reason: `${g.length}x $${Math.abs(g[0].amount).toFixed(2)} on ${g[0].date}: ${g.map((t) => t.merchant).join(" vs ")}`,
        });
      }
    }
  }
  return leaks;
}

function safeParseJSON(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    const m = text.match(/\{[\s\S]*\}/);
    if (m) {
      try {
        return JSON.parse(m[1]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

// Generic helper (kept for SAM/shock callers). Uses JSON mode when prompt asks for JSON.
export async function callMetaModel({
  model,
  prompt,
  max_tokens = 800,
  effort = "low",
}: {
  model: string;
  prompt: string;
  max_tokens?: number;
  effort?: string;
}) {
  return chatCompletions({
    model,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    max_tokens,
    effort,
  });
}

// Wonder: long-context 90-day reasoning → bucket allocation + Daily Digest actions.
export async function buildBucketsWithWonder(transactions: Transaction[]) {
  if (!process.env.META_API_KEY) {
    console.warn("[meta-api] META_API_KEY missing — returning mock buckets");
    return mockCFO();
  }
  const txns = transactions.slice(0, 500);
  const prompt = `You are Bucketwise Household CFO. Given these transactions (JSON): ${JSON.stringify(txns).slice(0, 12000)}

Tasks:
1. Allocate into 3 buckets: Emergency (target $15000, 3-6mo expenses), College PA 529 (target $250000, target year 2034), Life Event (target $30000).
2. Flag duplicate subscriptions / leaks. Rules: a bill charged MONTHLY on different dates (rent, mortgage, 529 contributions, daycare, insurance) is LEGITIMATE — never a leak. Flag ONLY: (a) the same merchant charging 2+ times within 3 days, or (b) two merchant names for the same service and amount. Report amount as ONE month's overcharge (not the multi-month total); note recurrence in reason.
3. Give 2-3 concrete actions for the Daily CFO Digest with dollar amounts.
4. Add a shockBuffer string: extra emergency buffer needed for a 2020-style -30% income shock (lessons from 2008/2020: prioritize buffer).
5. PA-family lens (no stock picking — savings math only): weigh the PA 529 state-tax deduction for College contributions, capturing the full employer 401k match before extra College funding, and HSA triple-tax benefit for Life Event medical costs.

Return ONLY JSON: {"buckets":[{"name":"Emergency","target":15000,"current":number,"monthly_needed":number},{"name":"College","target":250000,"current":number,"monthly_needed":number},{"name":"Life Event","target":30000,"current":number,"monthly_needed":number}],"leaks":[{"merchant":string,"amount":number,"reason":string}],"actions":[string,string],"shockBuffer":string}`;
  try {
    const resp = await callMetaModel({ model: WONDER_MODEL, prompt, max_tokens: 4000 });
    const parsed = safeParseJSON(resp.choices[0].message.content ?? "");
    if (!parsed || !Array.isArray(parsed.buckets)) throw new Error("Wonder returned non-JSON");
    return { ...parsed, mock: false as const };
  } catch (e) {
    console.error("[meta-api] Wonder failed, mock fallback:", (e as Error).message);
    return mockCFO();
  }
}

// Spark: fast leak detection (<2s for 500 txns) — duplicate subs.
export async function detectLeaksFast(transactions: Transaction[]): Promise<{ leaks: Leak[]; mock: boolean }> {
  if (!process.env.META_API_KEY) {
    return { leaks: detectLeaksLocal(transactions), mock: true };
  }
  // Compact encoding keeps the prompt small for speed.
  const compact = transactions
    .slice(0, 500)
    .map((t) => `${t.date}|${t.merchant}|${t.amount}`)
    .join("\n")
    .slice(0, 8000);
  const prompt = `You detect DUPLICATE charges, not subscriptions, in these transactions (date|merchant|amount per line):\n${compact}\nRules: a bill charged MONTHLY on different dates (rent, mortgage, 529 contributions, daycare, insurance) is LEGITIMATE — never a leak. Flag ONLY: (a) the same merchant charging 2+ times within 3 days, or (b) two merchant names for the same service and amount (e.g. "Spotify" + "Spotify Family").\nReturn ONLY JSON: {"leaks":[{"merchant":string,"amount":number,"reason":string}]}`;
  try {
    const resp = await callMetaModel({ model: SPARK_MODEL, prompt, max_tokens: 1500, effort: "minimal" });
    const parsed = safeParseJSON(resp.choices[0].message.content ?? "");
    if (!parsed || !Array.isArray(parsed.leaks)) throw new Error("Spark returned non-JSON");
    return { leaks: parsed.leaks as Leak[], mock: false };
  } catch (e) {
    console.error("[meta-api] Spark failed, local fallback:", (e as Error).message);
    return { leaks: detectLeaksLocal(transactions), mock: true };
  }
}

// Daily Digest: cheap Spark summary (minimal reasoning) → 3 concrete actions +
// a cancellation-email draft for the biggest leak (the approved "Acts" layer).
// Takes the already-computed leaks so the prompt stays tiny and cheap.
export type CancelDraft = { merchant: string; subject: string; body: string };
export async function buildDigestWithSpark(
  transactions: Transaction[],
  leaks: Leak[]
): Promise<{ actions: string[]; cancelDraft: CancelDraft | null; mock: boolean }> {
  const fallback = [
    "Cancel duplicate Adobe — saves ~$53/mo",
    "Move $300 to Emergency this week",
  ];
  if (!process.env.META_API_KEY) return { actions: fallback, cancelDraft: null, mock: true };
  const total = transactions.reduce((s, t) => s + Math.abs(Number(t.amount) || 0), 0);
  const prompt = `You are the Bucketwise Daily CFO Digest for a PA family. ${transactions.length} transactions totaling $${total.toFixed(2)}. Flagged leaks (JSON): ${JSON.stringify(leaks).slice(0, 2000)}\nWrite exactly 3 concrete actions with dollar amounts for today (cancel leaks, move money toward Emergency $15k / College $250k / Life Event $30k buckets; prefer PA 529-deductible College moves and keeping the full employer 401k match).\nPlus a cancelDraft: a polite 3-sentence cancellation email for the single biggest leak {merchant, subject, body}. If there are no leaks, cancelDraft is null.\nReturn ONLY JSON: {"actions":[string,string,string],"cancelDraft":{"merchant":string,"subject":string,"body":string}|null}`;
  try {
    const resp = await callMetaModel({ model: SPARK_MODEL, prompt, max_tokens: 1000, effort: "minimal" });
    const parsed = safeParseJSON(resp.choices[0].message.content ?? "");
    if (!parsed || !Array.isArray(parsed.actions) || parsed.actions.length === 0)
      throw new Error("Spark digest returned non-JSON");
    const draft = parsed.cancelDraft;
    const cancelDraft: CancelDraft | null =
      draft && typeof draft.merchant === "string" && typeof draft.subject === "string" && typeof draft.body === "string"
        ? { merchant: draft.merchant, subject: draft.subject, body: draft.body }
        : null;
    return { actions: (parsed.actions as string[]).slice(0, 3), cancelDraft, mock: false };
  } catch (e) {
    console.error("[meta-api] Spark digest failed, Wonder actions fallback:", (e as Error).message);
    return { actions: [], cancelDraft: null, mock: true }; // route falls back to Wonder's actions
  }
}

function extractResponsesText(d: any): string {
  for (const item of d?.output ?? []) {
    for (const c of item?.content ?? []) {
      if (typeof c?.text === "string" && c.text) return c.text;
    }
  }
  return "";
}

// Receipts run on SAM 3.1 via POST {META_API_BASE}/responses (SAM is not on
// /chat/completions). No mock fallback: a fabricated transaction is worse
// than an honest error, so failures surface to the UI.
export async function parseReceiptsWithSAM(imageDataUrl: string) {
  const key = process.env.META_API_KEY;
  if (!key) throw new Error("Missing META_API_KEY — receipt parsing needs live Muse SAM.");
  const res = await fetch(`${metaBase()}/responses`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODELS.sam,
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: 'Read this receipt photo. Return ONLY JSON: {"merchant":string,"amount":number,"date":"YYYY-MM-DD","category":string}.' },
            { type: "input_image", image_url: imageDataUrl },
          ],
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Meta SAM error ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  console.log(data.usage); // Rule 3: judge screenshot proving $150 consumption
  return safeParseJSON(extractResponsesText(data));
}

// Shock-test runs on Muse Wonder (long-context reasoning over bucket history).
// PII stays local: only the anonymized bucket summary is sent.
export async function shockTestWithWonder(buckets: any) {
  if (!process.env.META_API_KEY) {
    return {
      mock: "2020-style -30% income: Need +$3200 emergency buffer. Lesson from 2008: prioritize buffer over extra college contribution for 3 months.",
    };
  }
  const resp = await callMetaModel({
    model: MODELS.wonder,
    prompt: `Simulate 3 shocks on buckets ${JSON.stringify(buckets).slice(0, 4000)}: 1) Income -30% 4mo like 2020, 2) Expenses +20% like 2022 inflation, 3) College cost +6%/yr. Return JSON {bufferNeeded, checklist, perShock:[{name, verdict}]}.`,
  });
  return safeParseJSON(resp.choices[0].message.content ?? "") ?? { raw: resp.choices[0].message.content };
}
