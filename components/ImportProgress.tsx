'use client';

// Staged import progress: the backend analyzes in one request, so the UI
// advances through named stages while it works and lands on Done on result.
// No animation curves — width jumps, safe for prefers-reduced-motion.
const DONE = '\u2713';
const NOW = '\u25cf';
const TODO = '\u25cb';

export default function ImportProgress({ stages, current }: { stages: string[]; current: number }) {
  const pct = Math.round(((Math.min(current, stages.length - 1) + 1) / stages.length) * 100);
  return (
    <div role="status" aria-live="polite" style={{ border: '1px solid #dbeafe', background: '#eff6ff', padding: 16, borderRadius: 12, marginTop: 16 }}>
      <div role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Import progress" style={{ height: 8, background: '#dbeafe', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: '#2563eb' }} />
      </div>
      <ol style={{ margin: '12px 0 0', paddingLeft: 20, color: '#1e3a5f', fontSize: 14 }}>
        {stages.map((s, i) => (
          <li key={s} style={{ fontWeight: i === current ? 600 : 400 }}>
            {i < current ? `${DONE} ` : i === current ? `${NOW} ` : `${TODO} `}{s}{i === current ? '…' : ''}
          </li>
        ))}
      </ol>
    </div>
  );
}
