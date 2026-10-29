// Gmail OAuth + ingestion - uses Google OAuth 2.0
// 1. Enable Gmail API in Google Cloud Console
// 2. Add redirect URI: http://localhost:3000/api/auth/callback
export async function fetchGmailReceipts(accessToken: string) {
  // Example: fetch last 90 days receipts
  const q = 'category:finance OR 529 OR receipt OR statement newer_than:90d';
  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(q)}&maxResults=50`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const data = await res.json();
  // For each message, fetch body -> parse with Wonder
  return data.messages || [];
}

export async function fetchGmailMessageDetail(id: string, accessToken: string) {
  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=Subject&metadataHeaders=Date`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!res.ok) throw new Error(`Gmail message ${res.status}`);
  return res.json();
}

export async function parseWithWonder(emailBody: string) {
  // Call lib/meta-api.ts buildBucketsWithWonder inside
  // This keeps PII local - only send anonymized summary to Llama if needed
  return { merchant: 'parsed', amount: 0, category: 'college' };
}
