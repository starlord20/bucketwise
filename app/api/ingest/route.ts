import { NextRequest, NextResponse } from 'next/server';
import { buildBucketsWithWonder, detectLeaksFast, buildDigestWithSpark } from '../../../lib/meta-api';
import { parseCSVTransactions } from '../../../lib/plaid';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // body can be { csv: "...", gmailMessages: [...] }
    let transactions: any[] = [];
    if (body.csv) transactions = parseCSVTransactions(body.csv);
    if (body.transactions) transactions = transactions.concat(body.transactions);
    // Sanitize raw client JSON: drop merchant-less / amount-less rows so
    // leak detection never sees undefined (was a 500 via toLowerCase).
    transactions = (Array.isArray(transactions) ? transactions : []).filter(
      (t) => t && typeof t.merchant === 'string' && t.merchant.trim().length > 0 && !isNaN(Number(t.amount))
    );

    // Real Wonder (bucket allocation) + Spark (fast leak detection) in parallel.
    // Both fall back to mock/local data inside lib/meta-api.ts when
    // META_API_KEY is missing, so the stranger test never 500s.
    const [wonderResult, sparkResult] = await Promise.all([
      buildBucketsWithWonder(transactions),
      detectLeaksFast(transactions),
    ]);

    // Prefer Spark leaks when it found any (faster, specialized); else Wonder's.
    const leaks =
      !sparkResult.mock && sparkResult.leaks.length > 0
        ? sparkResult.leaks
        : (wonderResult as any).leaks ?? sparkResult.leaks;

    // Daily Digest is written by Spark (minimal reasoning = cheapest).
    // Falls back to Wonder's actions if the Spark digest fails.
    const digest = await buildDigestWithSpark(transactions, leaks);
    const actions =
      digest.actions.length > 0 ? digest.actions : (wonderResult as any).actions;
    const cancelDraft = digest.mock ? null : digest.cancelDraft;

    const source =
      body.csv && (body.transactions?.length ?? 0) > 0
        ? "CSV + Gmail"
        : body.transactions
          ? "Gmail + Drive"
          : "Bank CSV";
    const updatedAt = new Date().toISOString();
    // Historical window: the actual date span the analysis covers.
    const times = transactions
      .map((t: any) => new Date(t.date).getTime())
      .filter((n: number) => !isNaN(n))
      .sort((a: number, b: number) => a - b);
    const dateRange =
      times.length > 0
        ? {
            from: new Date(times[0]).toISOString().slice(0, 10),
            to: new Date(times[times.length - 1]).toISOString().slice(0, 10),
            days: Math.max(1, Math.round((times[times.length - 1] - times[0]) / 86400000) + 1),
          }
        : null;
    const buckets = ((wonderResult as any).buckets ?? []).map((b: any) => ({ ...b, source, updatedAt }));

    return NextResponse.json({
      transactionsCount: transactions.length,
      buckets,
      leaks,
      actions,
      actionsSource: digest.mock ? ((wonderResult as any).mock ? "mock" : "wonder") : "spark",
      cancelDraft,
      shockBuffer: (wonderResult as any).shockBuffer,
      mock: (wonderResult as any).mock && sparkResult.mock && digest.mock,
      source,
      updatedAt,
      dateRange,
    });
  } catch (e:any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
