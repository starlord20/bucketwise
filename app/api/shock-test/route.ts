import { NextRequest, NextResponse } from 'next/server';
import { shockTestWithWonder } from '../../../lib/meta-api';
export async function POST(req: NextRequest) {
  try {
    const { buckets } = await req.json();
    // Muse Wonder on Meta Muse API (dev.meta.ai). PII stays local — only the anonymized bucket summary is sent.
    const result = await shockTestWithWonder(buckets).catch(() => ({ mock: '2020-style -30% income: Need +$3200 emergency buffer. Lesson from 2008: prioritize buffer over extra college contribution for 3 months.' }));
    const live = !(result as any).mock;
    return NextResponse.json({ ...result, live });
  } catch (e:any) { return NextResponse.json({error: e.message}, {status: 500}); }
}
