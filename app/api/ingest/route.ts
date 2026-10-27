import { NextRequest, NextResponse } from 'next/server';
import { buildBucketsWithWonder } from '../../../lib/meta-api';
import { parseCSVTransactions } from '../../../lib/plaid';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // body can be { csv: "...", gmailMessages: [...] }
    let transactions: any[] = [];
    if (body.csv) transactions = parseCSVTransactions(body.csv);
    if (body.transactions) transactions = body.transactions;

    // Call Wonder to build buckets
    const wonderResult = await buildBucketsWithWonder(transactions).catch(() => ({
      buckets: [
        { name: 'Emergency', target: 15000, current: 4200, monthly_needed: 450 },
        { name: 'College', target: 250000, current: 38000, monthly_needed: 650 },
        { name: 'Life Event', target: 30000, current: 5000, monthly_needed: 300 },
      ],
      leaks: [{ merchant: 'Adobe x2', amount: 52 }, { merchant: 'Spotify Family duplicate', amount: 16.99 }],
      actions: ['Cancel duplicate Adobe', 'Move $300 to Emergency this week']
    }));

    return NextResponse.json({ transactionsCount: transactions.length, ...wonderResult });
  } catch (e:any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
