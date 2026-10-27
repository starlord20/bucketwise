import { NextResponse } from 'next/server';
export async function GET() {
  // Redirect to Google OAuth - fill CLIENT_ID from .env
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirect = encodeURIComponent(process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/callback');
  const scope = encodeURIComponent('https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/drive.readonly');
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirect}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
  return NextResponse.redirect(url);
}
