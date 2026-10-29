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

type ShockProjection = { y2026?: { Emergency?: number; College?: number; LifeEvent?: number }; y2027?: { Emergency?: number; College?: number; LifeEvent?: number }; shockAdjustedEmergency2026?: number; assumptions?: string };
type ShockData = { bufferNeeded?: string; checklist?: string[]; perShock?: { name: string; verdict: string; score?: number }[]; projection?: ShockProjection; mock?: string };

const GAUGE_COLORS = ['#3b82f6', '#10b981', '#f59e0b'];

function ScoreGauge({ score, label, color }: { score: number; label: string; color: string }) {
  const angle = (-90 + (score / 100) * 180) * (Math.PI / 180);
  const nx = 60 + 38 * Math.sin(angle);
  const ny = 60 - 38 * Math.cos(angle);
  return (
    <div style={{ textAlign: 'center', minWidth: 110 }}>
      <svg width="120" height="72" viewBox="0 0 120 72" role="img" aria-label={`${label} resilience score ${score} out of 100`}>
        <path d="M12,60 A48,48 0 0 1 108,60" fill="none" stroke="#e5e7eb" strokeWidth="10" strokeLinecap="round" />
        <path d="M12,60 A48,48 0 0 1 108,60" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(score / 100) * 151} 151`} opacity={0.45} />
        <line x1="60" y1="60" x2={nx} y2={ny} stroke={color} strokeWidth="4" strokeLinecap="round" />
        <circle cx="60" cy="60" r="6" fill={color} />
      </svg>
      <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color }}>{score}<span style={{ fontSize: 12, fontWeight: 400 }}>/100</span></div>
    </div>
  );
}

function ShockView({ text }: { text: string }) {
  const [tab, setTab] = useState(0);
  let d: (ShockData & { live?: boolean }) | null = null;
  try { d = JSON.parse(text); } catch { /* fall through to raw */ }
  if (!d || (!d.bufferNeeded && !d.checklist && !d.perShock && !d.mock)) {
    return <pre style={{background: '#17191d', color: '#e8eaed', padding: 12, borderRadius: 10, overflow: 'auto', marginTop: 12, fontSize: 13}}>{text}</pre>;
  }
  if (d.mock) return <p style={{marginTop: 12}}><strong>Reference scenario</strong> (live shock-test unavailable — hit Run Shock Test again): {d.mock}</p>;
  const proj = d.projection;
  const money = (v: unknown) => (typeof v === 'number' && !isNaN(v) ? '$' + Math.round(v).toLocaleString() : '—');
  const projView = proj && (proj.y2026 || proj.y2027) ? (
    <div style={{marginTop: 16, border: '1px solid #dbeafe', background: '#eff6ff', padding: 12, borderRadius: 12}}>
      <p style={{margin: '0 0 8px'}}><strong>Future state — where current contributions land you</strong></p>
      <table style={{fontSize: 13, borderCollapse: 'collapse', width: '100%', maxWidth: 480}}>
        <thead><tr style={{textAlign: 'left', color: '#1e3a5f'}}><th>Year-end</th><th>Emergency</th><th>College</th><th>Life Event</th></tr></thead>
        <tbody>
          {(['y2026', 'y2027'] as const).map((y) => proj[y] && (
            <tr key={y} style={{borderTop: '1px solid #dbeafe'}}>
              <td><strong>Dec {y === 'y2026' ? '2026' : '2027'}</strong></td>
              <td>{money(proj[y]!.Emergency)}</td>
              <td>{money(proj[y]!.College)}</td>
              <td>{money(proj[y]!.LifeEvent)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {typeof proj.shockAdjustedEmergency2026 === 'number' && !isNaN(proj.shockAdjustedEmergency2026) && (
        <p style={{margin: '8px 0 0', fontSize: 13}}>If a 2020-style shock hits mid-2026, Emergency lands at <strong>{money(proj.shockAdjustedEmergency2026)}</strong> instead.</p>
      )}
      {proj.assumptions && <p style={{margin: '8px 0 0', fontSize: 12, color: '#4b5563'}}>Assumes: {proj.assumptions}</p>}
    </div>
  ) : null;
  return (
    <div style={{marginTop: 12}}>
      {d.bufferNeeded && <p><strong>Buffer needed:</strong> {d.bufferNeeded}</p>}
      {d.checklist && d.checklist.length > 0 && (
        <ul>{d.checklist.map((c, i) => <li key={i}>{c}</li>)}</ul>
      )}
      {d.perShock && d.perShock.length > 0 && (
        <div style={{marginTop: 4}}>
          <div role="tablist" aria-label="Shock scenarios" style={{display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12}}>
            {d.perShock.map((s, i) => {
              const active = i === Math.min(tab, d.perShock!.length - 1);
              return (
                <button key={i} role="tab" aria-selected={active} onClick={() => setTab(i)} style={{padding: '6px 14px', borderRadius: 999, border: active ? '1px solid #17191d' : '1px solid #d4d7dc', background: active ? '#17191d' : 'white', color: active ? 'white' : '#2a3139', cursor: 'pointer', fontSize: 13, fontWeight: active ? 650 : 450}}>
                  {s.name}
                </button>
              );
            })}
          </div>
          {(() => {
            const s = d.perShock![Math.min(tab, d.perShock!.length - 1)];
            const score = typeof s.score === 'number' && !isNaN(s.score) ? Math.min(100, Math.max(0, Math.round(s.score))) : null;
            const color = score === null ? '#6b7280' : score >= 70 ? '#15803d' : score >= 40 ? '#b45309' : '#b91c1c';
            return (
              <div role="tabpanel" style={{border: '1px solid #e4e5e7', borderRadius: 10, padding: 12, background: 'white'}}>
                <p style={{margin: 0}}><strong>{s.name}{score !== null ? ` — ${score}/100` : ''}</strong></p>
                <p style={{margin: '6px 0 0', fontSize: 14, color: '#2a3139'}}>{s.verdict}</p>
                {score !== null && (
                  <div role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100} aria-label={`${s.name} score ${score} of 100`} style={{height: 8, background: '#eceef1', borderRadius: 6, overflow: 'hidden', marginTop: 8, maxWidth: 340}}>
                    <div style={{width: `${score}%`, height: '100%', background: color}} />
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
      {projView}
      {d.perShock && d.perShock.some((s) => typeof s.score === 'number' && !isNaN(s.score)) && (
        <div>
          <p style={{margin: '16px 0 8px'}}><strong>Stress-test gauges</strong> <span style={{color: '#6b7280', fontSize: 13}}>— needle position is the live score</span></p>
          <div style={{display: 'flex', gap: 16, flexWrap: 'wrap'}}>
            {d.perShock.map((s, i) => {
              const score = Math.min(100, Math.max(0, Math.round(Number(s.score))));
              return <ScoreGauge key={i} score={score} label={s.name} color={GAUGE_COLORS[i % GAUGE_COLORS.length]} />;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  const [buckets, setBuckets] = useState<Bucket[]>(DEFAULT_BUCKETS);
  const [leaks, setLeaks] = useState<IngestResult['leaks']>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [meta, setMeta] = useState<{ count: number; mock?: boolean; digestBy?: string; source?: string; updatedAt?: string; dateRange?: { from: string; to: string; days: number } | null } | null>(null);
  const today = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const [stages, setStages] = useState<string[]>(CSV_STAGES);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [shock, setShock] = useState<string | null>(null);
  const [shockBusy, setShockBusy] = useState(false);
  const [lastCsv, setLastCsv] = useState<string | null>(null);
  const [gmail, setGmail] = useState<{ gmailConfigured: boolean } | null>(null);
  const [receipt, setReceipt] = useState<ReceiptResult | null>(null);
  const [cancelDraft, setCancelDraft] = useState<IngestResult['cancelDraft']>(null);

  // Last good result survives reloads (demo insurance). Never the raw key —
  // only analysis output + the user's own last CSV text.
  const LS_KEY = 'bucketwise:lastResult';
  function persistResult(data: IngestResult, buckets: Bucket[], csv: string | null) {
    try {
      const { raw, ...rest } = data;
      localStorage.setItem(LS_KEY, JSON.stringify({ ...rest, buckets, csv }));
    } catch { /* quota or privacy mode — app works without it */ }
  }
  const lastCsvRef = useRef<string | null>(null);
  lastCsvRef.current = lastCsv;

  function startImport(kind: 'csv' | 'gmail') {
    setStages(kind === 'gmail' ? GMAIL_STAGES : CSV_STAGES);
    setStage(0);
    setFinished(false);
    setLoading(true);
    setError(null);
  }

  function handleResult(data: IngestResult) {
    setLoading(false);
    if (data.error) { setError(data.error); return; }
    setError(null);
    // Keep the bar up just long enough to show 100% + all checks.
    setFinished(true);
    setTimeout(() => setFinished(false), 1800);
    const csv = data.raw ?? lastCsvRef.current;
    if (data.raw) setLastCsv(data.raw);
    const mapped = (data.buckets ?? []).map(withProgress);
    if (data.buckets) setBuckets(mapped);
    setLeaks(data.leaks ?? []);
    setActions(data.actions ?? []);
    setCancelDraft(data.cancelDraft ?? null);
    setMeta({ count: data.transactionsCount, mock: data.mock, digestBy: data.actionsSource, source: data.source, updatedAt: data.updatedAt, dateRange: data.dateRange ?? null });
    persistResult(data, mapped.length > 0 ? mapped : buckets, csv);
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
    // Restore last good analysis so a reload never shows stale placeholders.
    try {
      const saved = JSON.parse(localStorage.getItem(LS_KEY) ?? 'null');
      if (saved && Array.isArray(saved.buckets) && saved.buckets.length > 0) {
        setBuckets(saved.buckets);
        setLeaks(Array.isArray(saved.leaks) ? saved.leaks : []);
        setActions(Array.isArray(saved.actions) ? saved.actions : []);
        setCancelDraft(saved.cancelDraft ?? null);
        if (saved.csv) { setLastCsv(saved.csv); lastCsvRef.current = saved.csv; }
        setMeta({
          count: num(saved.transactionsCount),
          mock: !!saved.mock,
          digestBy: saved.actionsSource,
          source: saved.source,
          updatedAt: saved.updatedAt,
          dateRange: saved.dateRange ?? null,
        });
      }
      const savedShock = localStorage.getItem('bucketwise:shock');
      if (savedShock) setShock(savedShock);
    } catch { /* corrupted cache — start fresh */ }
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
      const text = typeof d === 'string' ? d : JSON.stringify(d);
      setShock(text);
      try { localStorage.setItem('bucketwise:shock', text); } catch { /* ignore */ }
    } catch (e: any) {
      setShock(`Shock test failed: ${e?.message ?? 'unknown error'}`);
    } finally {
      setShockBusy(false);
    }
  }

  const total = buckets.reduce((s, b) => s + num(b.current), 0);
  const alloc = buckets.map((b) => ({ name: b.name, pct: total > 0 ? Math.round((num(b.current) / total) * 100) : 0 }));
  return (
    <main style={{maxWidth: 1120, margin: '0 auto', padding: 24}}>
      <header style={{display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap'}}>
        <img src="/icon-buckets.webp" alt="Bucketwise buckets mark" width={44} height={44} style={{borderRadius: 10}} />
        <div style={{flex: 1, minWidth: 220}}>
          <h1 style={{margin: 0, fontSize: 26, letterSpacing: '-0.015em'}}>Bucketwise</h1>
          <p style={{margin: '2px 0 0', fontSize: 13, color: '#5b6470'}}>Household CFO — Financial Freedom OS · Indie Track</p>
        </div>
        <div style={{fontSize: 12, color: '#5b6470', border: '1px solid #e4e5e7', background: 'white', padding: '6px 12px', borderRadius: 999}}>Gmail ingest → Wonder buckets → Spark leaks → Wonder shock-test</div>
      </header>
      <ConnectAccounts onStart={(kind) => startImport(kind)} onResult={handleResult} onReceipt={setReceipt} />
      {(loading || finished) && <ImportProgress stages={stages} current={stage} complete={!loading} />}
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
      {error && <p role="alert" style={{color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', padding: '8px 12px', borderRadius: 10}}>Upload failed: {error}</p>}
      {meta?.dateRange && (
        <p style={{color: '#1e3a5f', fontSize: 13, background: 'white', border: '1px solid #e4e5e7', padding: '8px 12px', borderRadius: 10}}>
          History: {meta.dateRange.from} → {meta.dateRange.to} ({meta.dateRange.days} days analyzed) · Report date: {today}
        </p>
      )}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14, marginTop: 20}}>
        {buckets.map(b => <BucketCard key={b.name} bucket={b} />)}
      </div>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14, marginTop: 14}}>
        <section aria-label="Transactions and leaks" style={{border: '1px solid #e4e5e7', background: 'white', padding: 16, borderRadius: 14, boxShadow: '0 1px 2px rgba(16,24,40,0.06)'}}>
          <h2 style={{margin: '0 0 4px', fontSize: 16}}>Money in — auto-classified</h2>
          <p style={{margin: '0 0 12px', fontSize: 13, color: '#5b6470'}}>{meta ? `Analyzed ${meta.count} transactions${meta.mock ? ' (mock)' : ' (live Wonder + Spark)'}` : 'Upload a CSV or connect Gmail to classify.'}</p>
          {leaks && leaks.length > 0 ? (
            <ul style={{margin: 0, paddingLeft: 18, fontSize: 14}}>
              {leaks.map((l, i) => <li key={i} style={{marginBottom: 6}}><strong>${num(l.amount).toFixed(2)}</strong> — {String(l.merchant ?? 'Unknown')}{l.reason ? <span style={{color: '#5b6470'}}> · {l.reason}</span> : ''} <span style={{fontSize: 12, color: '#b45309', border: '1px solid #f3d9ae', background: '#fdf6e9', padding: '1px 8px', borderRadius: 999, marginLeft: 6}}>leak</span></li>)}
            </ul>
          ) : (
            <p style={{margin: 0, fontSize: 14, color: '#5b6470'}}>No duplicate-subscription leaks in this import. Monthly bills are never flagged as leaks.</p>
          )}
        </section>
        <section aria-label="Bucket allocation" style={{border: '1px solid #e4e5e7', background: 'white', padding: 16, borderRadius: 14, boxShadow: '0 1px 2px rgba(16,24,40,0.06)'}}>
          <h2 style={{margin: '0 0 8px', fontSize: 16}}>Where the money sits</h2>
          {alloc.map((a, i) => (
            <div key={a.name} style={{marginBottom: 10}}>
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 13}}><span>{a.name}</span><span style={{fontVariantNumeric: 'tabular-nums'}}>{a.pct}%</span></div>
              <div style={{height: 8, background: '#eceef1', borderRadius: 6, overflow: 'hidden', marginTop: 4}}>
                <div style={{width: `${a.pct}%`, height: '100%', background: GAUGE_COLORS[i % GAUGE_COLORS.length]}} />
              </div>
            </div>
          ))}
          <p style={{margin: '8px 0 0', fontSize: 12, color: '#5b6470'}}>Shares of the ${total.toLocaleString()} currently in buckets.</p>
        </section>
      </div>
      <section style={{marginTop: 14, border: '1px solid #e4e5e7', background: 'white', padding: 16, borderRadius: 14, boxShadow: '0 1px 2px rgba(16,24,40,0.06)'}}>
        <h2 style={{margin: '0 0 8px', fontSize: 16}}>Sources</h2>
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
      <section style={{marginTop: 14, border: '1px solid #e4e5e7', background: 'white', padding: 16, borderRadius: 14, boxShadow: '0 1px 2px rgba(16,24,40,0.06)'}}>
        <h2 style={{margin: '0 0 4px', fontSize: 16}}>Shock-Test Simulator (2008 / 2020 / 2022)</h2>
        <p style={{margin: '0 0 12px', fontSize: 13, color: '#5b6470'}}>What if income drops 30% for 4 months? Runs live against your current buckets.</p>
        <button onClick={runShockTest} disabled={shockBusy} style={{padding: '10px 18px', borderRadius: 999, border: 0, background: '#17191d', color: 'white', fontWeight: 650, cursor: shockBusy ? 'wait' : 'pointer'}}>{shockBusy ? 'Running…' : 'Run Shock Test'}</button>
        {shock && <ShockView text={shock} />}
      </section>
      <section style={{marginTop: 14, border: '1px solid #e4e5e7', background: 'white', padding: 16, borderRadius: 14, boxShadow: '0 1px 2px rgba(16,24,40,0.06)'}}>
        <h3 style={{margin: '0 0 8px', fontSize: 16}}>Daily CFO Digest{meta?.digestBy ? <span style={{fontWeight: 450, fontSize: 13, color: '#5b6470'}}> — by {meta.digestBy}</span> : ''}</h3>
        <pre style={{background: '#17191d', color: '#e8eaed', padding: 12, borderRadius: 10, overflow: 'auto', fontSize: 13, margin: 0}}>{actions.length > 0 ? actions.map((a, i) => `${i + 1}. ${a}`).join('\n') : `Today: $45 leaked to subscriptions. Move $300 to Emergency. College on track +2%.\nAction: Cancel duplicate Adobe + Spotify family.`}</pre>
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
