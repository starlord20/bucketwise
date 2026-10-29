import { NextResponse } from 'next/server';

// Reports which account connections are configured (booleans only — never secrets).
export async function GET() {
  return NextResponse.json({
    gmailConfigured: !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET,
    investments: 'roadmap' as const, // Plaid Investments (401k/brokerage/529) — see BEYOND-HACKATHON.md
  });
}
