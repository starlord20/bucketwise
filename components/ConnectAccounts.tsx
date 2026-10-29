'use client';
import { useState } from 'react';
export type IngestResult = {
  transactionsCount: number;
  buckets?: { name: string; target: number; current: number; monthly_needed: number; source?: string; updatedAt?: string }[];
  leaks?: { merchant: string; amount: number; reason?: string }[];
  actions?: string[];
  actionsSource?: string;
  cancelDraft?: { merchant: string; subject: string; body: string } | null;
  shockBuffer?: string;
  mock?: boolean;
  source?: string;
  updatedAt?: string;
  dateRange?: { from: string; to: string; days: number } | null;
  raw?: string;
  error?: string;
};
export type ReceiptResult = { merchant?: string; amount?: number; date?: string; category?: string; error?: string };
export default function ConnectAccounts({ onResult, onStart, onReceipt }: { onResult?: (r: IngestResult) => void; onStart?: (kind: 'csv' | 'gmail') => void; onReceipt?: (r: ReceiptResult) => void }) {
  const [checking, setChecking] = useState(false);
  const [scanning, setScanning] = useState(false);
  async function connectGmail() {
    setChecking(true);
    try {
      const r = await fetch('/api/auth/status');
      const s = await r.json();
      if (!s.gmailConfigured) {
        onResult?.({ transactionsCount: 0, error: 'Gmail connect needs GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET in .env.local — use CSV upload for the demo.' });
        return;
      }
      onStart?.('gmail');
      window.location.href = '/api/auth/gmail';
    } catch {
      onResult?.({ transactionsCount: 0, error: 'Could not check Gmail setup.' });
    } finally {
      setChecking(false);
    }
  }
  return (
    <div style={{display: 'flex', gap: 12, flexWrap: 'wrap', margin: '16px 0'}}>
      <button onClick={connectGmail} disabled={checking} style={{padding: '10px 16px', background: '#111', color: 'white', borderRadius: 8, border: 0, cursor: 'pointer'}}>
        {checking ? 'Checking…' : 'Connect Gmail + Drive'}
      </button>
      <label style={{padding: '10px 16px', border: '1px solid #ddd', borderRadius: 8, cursor: scanning ? 'wait' : 'pointer', opacity: scanning ? 0.6 : 1}}>
        {scanning ? 'Scanning…' : 'Scan Receipt Photo'}
        <input type="file" accept="image/*" hidden onChange={async (e)=>{
          const file = e.target.files?.[0]; if(!file) return;
          setScanning(true);
          try {
            const dataUrl = await new Promise<string>((resolve, reject) => {
              const fr = new FileReader();
              fr.onload = () => resolve(fr.result as string);
              fr.onerror = reject;
              fr.readAsDataURL(file);
            });
            const res = await fetch('/api/parse-receipt', {method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({image: dataUrl})});
            const data = await res.json();
            onReceipt?.(data.error ? { error: data.error } : data);
          } catch (err:any) {
            onReceipt?.({ error: err?.message ?? 'Receipt scan failed' });
          } finally {
            setScanning(false);
            e.target.value = '';
          }
        }} />
      </label>
      <label style={{padding: '10px 16px', border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer'}}>
        Upload Bank CSV
        <input type="file" accept=".csv,text/csv" hidden onChange={async (e)=>{
          const file = e.target.files?.[0]; if(!file) return;
          onStart?.('csv');
          try {
            const text = await file.text();
            const res = await fetch('/api/ingest', {method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({csv: text})});
            const data = await res.json() as IngestResult;
            console.log(data);
            onResult?.({ ...data, raw: text });
          } catch (err:any) {
            onResult?.({ transactionsCount: 0, error: err?.message ?? 'Upload failed' });
          } finally {
            e.target.value = '';
          }
        }} />
      </label>
    </div>
  );
}
