import { NextRequest, NextResponse } from 'next/server';
import { parseReceiptsWithSAM } from '../../../lib/meta-api';

// POST { image: "data:image/...;base64,..." } → { merchant, amount, date, category }
// SAM 3.1 on the Meta Muse API; no mock (a fabricated transaction is worse than an error).
export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();
    if (!image || typeof image !== 'string' || !image.startsWith('data:image')) {
      return NextResponse.json(
        { error: 'POST { image } with a data-URL of the receipt photo.' },
        { status: 400 }
      );
    }
    const parsed: any = await parseReceiptsWithSAM(image);
    if (!parsed || typeof parsed.merchant !== 'string' || typeof parsed.amount !== 'number') {
      return NextResponse.json(
        { error: 'Receipt parse returned no transaction — try a clearer, straight-on photo.', raw: parsed },
        { status: 422 }
      );
    }
    return NextResponse.json({ ...parsed, mock: false });
  } catch (e: any) {
    const status = /META_API_KEY/.test(e.message) ? 503 : 500;
    return NextResponse.json({ error: e.message }, { status });
  }
}
