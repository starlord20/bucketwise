import { NextRequest, NextResponse } from 'next/server';
import { importStore } from '../../../lib/importStore';

// One-shot read of a Gmail/Drive import stash (deleted on read).
export async function GET(req: NextRequest) {
  const id = new URL(req.url).searchParams.get('id');
  if (!id || !importStore.has(id)) {
    return NextResponse.json({ error: 'Import not found or expired — reconnect Gmail and try again.' }, { status: 404 });
  }
  const imp = importStore.get(id);
  importStore.delete(id);
  return NextResponse.json(imp);
}
