import { NextRequest, NextResponse } from 'next/server';
import { fetchGmailReceipts, fetchGmailMessageDetail } from '../../../../lib/gmail';
import { fetchDriveStatements } from '../../../../lib/drive';
import { saveImport } from '../../../../lib/importStore';

const AMOUNT_RE = /\$[\d,]+\.\d{2}/g;

function toISODate(internalDate?: string, headerDate?: string): string {
  const ms = internalDate ? Number(internalDate) : NaN;
  const d = !isNaN(ms) ? new Date(ms) : new Date(headerDate ?? '');
  return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
}

// Completes Google OAuth, pulls receipt emails + statement files, and stashes
// best-effort transactions for the dashboard (?gmailImport=<id> picks them up).
export async function GET(req: NextRequest) {
  const appUrl = new URL(req.url).origin;
  const code = new URL(req.url).searchParams.get('code');
  if (!code) return NextResponse.redirect(`${appUrl}/?gmailError=no_code`);

  try {
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/callback';
    const tok = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    if (!tok.ok) throw new Error(`token exchange ${tok.status}`);
    const { access_token } = await tok.json();

    const ids: { id: string }[] = await fetchGmailReceipts(access_token);
    const txns: { date: string; merchant: string; amount: number; category: string }[] = [];
    for (const m of ids.slice(0, 50)) {
      try {
        const det = await fetchGmailMessageDetail(m.id, access_token);
        const headers: { name: string; value: string }[] = det.payload?.headers ?? [];
        const subject = headers.find((h) => h.name === 'Subject')?.value ?? 'Gmail receipt';
        const date = toISODate(det.internalDate, headers.find((h) => h.name === 'Date')?.value);
        const amounts = `${subject} ${det.snippet ?? ''}`.match(AMOUNT_RE) ?? [];
        for (const a of amounts.slice(0, 3)) {
          const amount = parseFloat(a.replace(/[$,]/g, ''));
          if (!isNaN(amount) && amount > 0) {
            txns.push({ date, merchant: subject.slice(0, 60) || 'Gmail receipt', amount, category: 'gmail' });
          }
        }
      } catch {
        // Best effort per message — one bad email never fails the import.
      }
    }

    let driveFiles: string[] = [];
    try {
      const drive = await fetchDriveStatements(access_token);
      driveFiles = (drive.files ?? []).map((f: { name: string }) => f.name).slice(0, 10);
    } catch {
      // Drive listing is informational; Gmail receipts carry the import.
    }

    const id = saveImport({ txns, gmailCount: ids.length, driveCount: driveFiles.length, driveFiles });
    return NextResponse.redirect(`${appUrl}/?gmailImport=${id}`);
  } catch (e: any) {
    return NextResponse.redirect(`${appUrl}/?gmailError=${encodeURIComponent(e.message ?? 'import failed')}`);
  }
}
