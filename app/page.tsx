'use client';
import { DEFAULT_BUCKETS, Bucket, num } from '../lib/buckets';
import { ACCOUNT_UNIVERSE } from '../lib/plaid';
import BucketCard from '../components/BucketCard';
import ConnectAccounts, { IngestResult, ReceiptResult } from '../components/ConnectAccounts';
import ImportProgress from '../components/ImportProgress';
import { useEffect, useRef, useState } from 'react';

const CSV_STAGES = ['Reading file', 'Parsing CSV', 'Wonder buckets', 'Spark leaks', 'Spark digest'];
const GMAIL_STAGES = ['Connecting Google', 'Reading Gmail receipts', 'Reading Drive statements', 'Wonder parsing', 'Buckets + digest'];

type BucketIn = { name: string; target: number; current: number; monthly_needed: number; source?: string; updatedAt?: string };
function withProgress(b: BucketIn): Bucket {
  const current = num(b.current);
  const target = num(b.target, 1);
  return { ...b, name: (['Emergency', 'College', 'Life Event'] as const).includes(b.name as Bucket['name']) ? (b.name as Bucket['name']) : 'Emergency', current, target, monthly_needed: num(b.monthly_needed), progress: Math.min(100, Math.max(0, Math.round((current / target) * 100))) };
}

type ShockData = { bufferNeeded?: string; checklist?: string[]; perShock?: { name: string; verdict: string }[]; mock?: string };

function ShockView({ text }: { text: string }) {
  let d: ShockData | null = null;
  try { d = JSON.parse(text); } catch { /* fall through to raw */ }
  if (!d || (!d.bufferNeeded && !d.checklist && !d.perShock && !d.mock)) {
    return <pre style={{background: '#111', color: '#0f0', padding: 12, borderRadius: 8, overflow: 'auto', marginTop: 12}}>{text}</pre>;
  }
  if (d.mock) return <p style={{marginTop: 12}}>{d.mock}</p>;
  return (
    <div style={{marginTop: 12}}>
      {d.bufferNeeded && <p><strong>Buffer needed:</strong> {d.bufferNeeded}</p>}
      {d.checklist && d.checklist.length > 0 && (
        <ul>{d.checklist.map((c, i) => <li key={i}>{c}</li>)}</ul>
      )}
      {d.perShock && d.perShock.length > 0 && (
        <ul>{d.perShock.map((s, i) => <li key={i}><strong>{s.name}:</strong> {s.verdict}</li>)}</ul>
      )}
    </div>
  );
}

export default function Page() {
  const [buckets, setBuckets] = useState<Bucket[]>(DEFAULT_BUCKETS);
  const [leaks, setLeaks] = useState<IngestResult['leaks']>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [meta, setMeta] = useState<{ count: number; mock?: boolean; digestBy?: string; source?: string; updatedAt?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [stages, setStages] = useState<string[]>(CSV_STAGES);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [shock, setShock] = useState<string | null>(null);
  const [shockBusy, setShockBusy] = useState(false);
  const [lastCsv, setLastCsv] = useState<string | null>(null);
  const [gmail, setGmail] = useState<{ gmailConfigured: boolean } | null>(null);
  const [receipt, setReceipt] = useState<ReceiptResult | null>(null);
  const [cancelDraft, setCancelDraft] = useState<IngestResult['cancelDraft']>(null);
  const lastCsvRef = useRef<string | null>(null);
  lastCsvRef.current = lastCsv;

  function startImport(kind: 'csv' | 'gmail') {
    setStages(kind === 'gmail' ? GMAIL_STAGES : CSV_STAGES);
    setStage(0);
    setLoading(true);
    setError(null);
  }

  function handleResult(data: IngestResult) {
    setLoading(false);
    if (data.error) { setError(data.error); return; }
    setError(null);
    if (data.raw) setLastCsv(data.raw);
    if (data.buckets) setBuckets(data.buckets.map(withProgress));
    setLeaks(data.leaks ?? []);
    setActions(data.actions ?? []);
    setCancelDraft(data.cancelDraft ?? null);
    setMeta({ count: data.transactionsCount, mock: data.mock, digestBy: data.actionsSource, source: data.source, updatedAt: data.updatedAt });
  }

  async function runIngest(payload: Record<string, unknown>, kind: 'csv' | 'gmail') {
    startImport(kind);
    try {
      const res = await fetch('/api/ingest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json() as IngestResult;
      if (payload.csv) setLastCsv(payload.csv as string);
      handleResult(data);
    } catch (err: any) {
      handleResult({ transactionsCount: 0, error: err?.message ?? 'Import failed' });
    }
  }

  // Advance stages on a timer while an import is in flight; result lands on Done.
  useEffect(() => {
    if (!loading) return;
    if (stage >= stages.length - 1) return;
    const t = setTimeout(() => setStage((s) => Math.min(s + 1, stages.length - 1)), 2200);
    return () => clearTimeout(t);
  }, [loading, stage, stages]);

  // Connections status + Gmail OAuth return (?gmailImport=<id> / ?gmailError=...).
  useEffect(() => {
    fetch('/api/auth/status').then((r) => r.json()).then(setGmail).catch(() => {});
    const q = new URLSearchParams(window.location.search);
    const err = q.get('gmailError');
    if (err) {
      setError(`Gmail import failed: ${err}`);
      window.history.replaceState({}, '', '/');
      return;
    }
    const id = q.get('gmailImport');
    if (!id) return;
    (async () => {
      startImport('gmail');
      try {
        const r = await fetch(`/api/import-result?id=${encodeURIComponent(id)}`);
        const imp = await r.json();
        if (!r.ok) throw new Error(imp.error ?? 'Gmail import expired.');
        const payload: Record<string, unknown> = { transactions: imp.txns };
        if (lastCsvRef.current) payload.csv = lastCsvRef.current;
        await runIngest(payload, 'gmail');
      } catch (e: any) {
        handleResult({ transactionsCount: 0, error: e?.message ?? 'Gmail import failed' });
      } finally {
        window.history.replaceState({}, '', '/');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runShockTest() {
    setShockBusy(true);
    try {
      const r = await fetch('/api/shock-test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ buckets }) });
      const d = await r.json();
      setShock(typeof d === 'string' ? d : JSON.stringify(d));
    } catch (e: any) {
      setShock(`Shock test failed: ${e?.message ?? 'unknown error'}`);
    } finally {
      setShockBusy(false);
    }
  }

  return (
    <main style={{maxWidth: 900, margin: '0 auto', padding: 24, fontFamily: 'system-ui'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
        <img src="/logo.png" alt="Bucketwise logo" width={56} height={56} style={{borderRadius: 12}} />
        <h1 style={{margin: 0}}>Bucketwise</h1>
      </div>
      <p>Household CFO — Financial Freedom OS. Meta Global AI Developer Hackathon, Indie Track.</p>
      <p style={{background: '#f0f4ff', padding: 12, borderRadius: 8}}>Status: Gmail ingest → Wonder parsing → Spark leak detection → Wonder shock-test</p>
      <ConnectAccounts onStart={(kind) => startImport(kind)} onResult={handleResult} onReceipt={setReceipt} />
      {loading && <ImportProgress stages={stages} current={stage} />}
      {receipt && (receipt.error ? (
        <p style={{color: '#b91c1c'}}>Receipt scan failed: {receipt.error}</p>
      ) : (
        <div style={{border: '1px solid #bbf7d0', background: '#f0fdf4', padding: 12, borderRadius: 12, marginTop: 16, fontSize: 14}}>
          <strong>Receipt parsed (SAM 3.1):</strong> {receipt.merchant} — ${Number(receipt.amount).toFixed(2)}{receipt.date ? ` on ${receipt.date}` : ''}{receipt.category ? ` (${receipt.category})` : ''}
          {' '}<button onClick={() => {
            const clean = (s: string) => s.replace(/,/g, ' ').trim() || 'Receipt';
            const line = `\n${receipt.date || new Date().toISOString().slice(0, 10)},${clean(receipt.merchant || 'Receipt')},${receipt.amount},${(receipt.category || 'receipt').replace(/,/g, ' ')}`;
            const csv = (lastCsvRef.current ?? 'date,merchant,amount,category') + line;
            setReceipt(null);
            runIngest({ csv }, 'csv');
          }} disabled={loading} style={{marginLeft: 8, padding: '4px 12px', borderRadius: 8, border: '1px solid #16a34a', background: '#16a34a', color: 'white', cursor: 'pointer'}}>Add to buckets</button>
        </div>
      ))}
      {error && <p style={{color: '#b91c1c'}}>Upload failed: {error}</p>}
      {meta && <p style={{color: '#666', fontSize: 14}}>Analyzed {meta.count} transactions{meta.mock ? ' (mock — set META_API_KEY for live Wonder/Spark)' : ' (live Wonder + Spark)'}.</p>}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginTop: 24}}>
        {buckets.map(b => <BucketCard key={b.name} bucket={b} />)}
      </div>
      {leaks && leaks.length > 0 && (
        <section style={{marginTop: 24, border: '1px solid #fecaca', background: '#fef2f2', padding: 16, borderRadius: 12}}>
          <h2>Leaks found ({leaks.length})</h2>
          <ul>
            {leaks.map((l, i) => <li key={i}>${num(l.amount).toFixed(2)} — {String(l.merchant ?? 'Unknown')}{l.reason ? ` (${l.reason})` : ''}</li>)}
          </ul>
        </section>
      )}
      <section style={{marginTop: 24, border: '1px solid #e5e7eb', padding: 16, borderRadius: 12}}>
        <h2>Sources</h2>
        <ul style={{margin: 0, paddingLeft: 20, fontSize: 14}}>
          <li>
            Bank CSV — {lastCsv ? `connected${meta?.updatedAt ? ` · last sync ${new Date(meta.updatedAt).toLocaleString()}` : ''}` : 'not connected — upload a CSV'}
            {' '}<button onClick={() => lastCsv && runIngest({ csv: lastCsv }, 'csv')} disabled={!lastCsv || loading} style={{marginLeft: 8, padding: '4px 12px', borderRadius: 8, border: '1px solid #ddd', cursor: lastCsv ? 'pointer' : 'not-allowed'}}>Refresh</button>
          </li>
          <li>Gmail + Drive — {gmail === null ? 'checking…' : gmail.gmailConfigured ? 'connected' : 'not configured — add GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET (CSV works for the demo)'}</li>
          <li>Investment + liability accounts — via Plaid — roadmap: buckets go near-realtime once connected</li>
        </ul>
        <h3 style={{fontSize: 14, margin: '16px 0 8px'}}>Every account that counts toward financial freedom</h3>
        {(['Emergency', 'College', 'Life Event', 'Context'] as const).map((group) => (
          <div key={group} style={{marginBottom: 8}}>
            <p style={{fontSize: 13, fontWeight: 600, margin: '8px 0 4px'}}>
              {group === 'Context' ? 'Shock-test context (income vs obligations)' : `${group} bucket`}
            </p>
            <div style={{display: 'flex', gap: 6, flexWrap: 'wrap'}}>
              {ACCOUNT_UNIVERSE.filter((a) => a.bucket === group).map((a) => (
                <span key={a.kind} title={`${a.via} — ${a.status === 'csv' ? 'works today via CSV' : a.status === 'manual' ? 'manual / CSV entry' : 'roadmap: needs ' + a.via}`} style={{fontSize: 12, padding: '3px 10px', borderRadius: 20, border: '1px solid #d1d5db', background: a.status === 'roadmap' ? '#f9fafb' : '#ecfdf5', color: '#374151'}}>
                  {a.label} · {a.status === 'csv' ? 'CSV' : a.status === 'manual' ? 'manual' : 'roadmap'}
                </span>
              ))}
            </div>
          </div>
        ))}
      </section>
      <section style={{marginTop: 32, border: '1px solid #ddd', padding: 16, borderRadius: 12}}>
        <h2>Shock-Test Simulator (2020 / 2008 / 2022)</h2>
        <p>What if income drops 30% for 4 months? Results will appear here after calling /api/shock-test</p>
        <button onClick={runShockTest} disabled={shockBusy} style={{cursor: 'pointer'}}>{shockBusy ? 'Running…' : 'Run Shock Test'}</button>
        {shock && <ShockView text={shock} />}
        {shock && !shock.startsWith('Shock test failed') && (
          <img src="/bucket-art/shock.webp" alt="Shock-test infographic: 2020, 2008 and 2022 crisis gauges" width={900} height={900} style={{maxWidth: '100%', height: 'auto', borderRadius: 12, marginTop: 12}} />
        )}
      </section>
      <section style={{marginTop: 24}}>
        <h3>Daily CFO Digest{meta?.digestBy ? ` — by ${meta.digestBy}` : ''}</h3>
        <pre style={{background: '#111', color: '#0f0', padding: 12, borderRadius: 8, overflow: 'auto'}}>{actions.length > 0 ? actions.map((a, i) => `${i + 1}. ${a}`).join('\n') : `Today: $45 leaked to subscriptions. Move $300 to Emergency. College on track +2%.\nAction: Cancel duplicate Adobe + Spotify family.`}</pre>
        {cancelDraft && (
          <div style={{border: '1px solid #d1d5db', background: '#fff', padding: 12, borderRadius: 12, marginTop: 12, fontSize: 14}}>
            <p style={{margin: '0 0 4px'}}><strong>Cancel email draft</strong> — {cancelDraft.merchant}</p>
            <p style={{margin: '0 0 4px', color: '#374151'}}>Subject: {cancelDraft.subject}</p>
            <p style={{margin: 0, color: '#374151', whiteSpace: 'pre-wrap'}}>{cancelDraft.body}</p>
          </div>
        )}
      </section>
    </main>
  );
}
