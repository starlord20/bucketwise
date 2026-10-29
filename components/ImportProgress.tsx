'use client';

// Staged import progress: the backend analyzes in one request, so the UI
// advances through named stages while it works and lands on Done on result.
// No animation curves — width jumps, safe for prefers-reduced-motion.
const DONE = '\u2713';
const NOW = '\u25cf';
const TODO = '\u25cb';

export default function ImportProgress({ stages, current, complete }: { stages: string[]; current: number; complete?: boolean }) {
  const raw = Math.round(((Math.min(current, stages.length - 1) + 1) / stages.length) * 100);
  // While work is in flight the bar never claims 100% — it only fills up
  // once the result is actually in hand (complete=true).
  const pct = complete ? 100 : Math.min(90, raw);
  return (
    <div role="status" aria-live="polite" style={{ border: '1px solid #dbeafe', background: '#eff6ff', padding: 16, borderRadius: 12, marginTop: 16 }}>
      <div role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Import progress" style={{ height: 8, background: '#dbeafe', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: '#2563eb' }} />
      </div>
      <ol style={{ margin: '12px 0 0', paddingLeft: 20, color: '#1e3a5f', fontSize: 14 }}>
        {stages.map((s, i) => (
          <li key={s} style={{ fontWeight: i === current && !complete ? 600 : 400 }}>
            {complete || i < current ? `${DONE} ` : i === current ? `${NOW} ` : `${TODO} `}{s}{i === current && !complete ? '…' : ''}
          </li>
        ))}
      </ol>
    </div>
  );
}
