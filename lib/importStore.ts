// One-shot store for Gmail/Drive imports: the OAuth callback runs server-side,
// then redirects to /?gmailImport=<id> and the page picks the payload up here.
// NOTE: in-memory only (dev server = single process). Production needs KV/DB — roadmap.
export type GmailImport = {
  txns: { date: string; merchant: string; amount: number; category: string }[];
  gmailCount: number;
  driveCount: number;
  driveFiles: string[];
  createdAt: string;
};

const g = globalThis as unknown as { __bucketwiseImports?: Map<string, GmailImport> };
if (!g.__bucketwiseImports) g.__bucketwiseImports = new Map<string, GmailImport>();
export const importStore: Map<string, GmailImport> = g.__bucketwiseImports;

export function saveImport(imp: Omit<GmailImport, "createdAt">): string {
  const id = Math.random().toString(36).slice(2) + Date.now().toString(36);
  importStore.set(id, { ...imp, createdAt: new Date().toISOString() });
  return id;
}
