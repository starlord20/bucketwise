import { NextRequest, NextResponse } from 'next/server';
import { shockTestWithLlama } from '../../../lib/meta-api';
export async function POST(req: NextRequest) {
  try {
    const { buckets } = await req.json();
    // In production this calls Meta Llama via Modal/Baseten
    const result = await shockTestWithLlama(buckets).catch(()=>({mock: '2020-style -30% income: Need +$3200 emergency buffer. Lesson from 2008: prioritize buffer over extra college contribution for 3 months.'}));
    return NextResponse.json(result);
  } catch (e:any) { return NextResponse.json({error: e.message}, {status: 500}); }
}
