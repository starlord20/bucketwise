import { Bucket, num } from '../lib/buckets';
const ART: Record<string, string> = {
  Emergency: '/bucket-art/emergency.webp',
  College: '/bucket-art/college.webp',
  'Life Event': '/bucket-art/lifeevent.webp',
};
const ACCENT: Record<string, string> = { Emergency: '#2563eb', College: '#0f766e', 'Life Event': '#b45309' };

export default function BucketCard({ bucket }: { bucket: Bucket }) {
  const current = num(bucket.current);
  const target = num(bucket.target, 1);
  const pct = Math.min(100, Math.max(0, num(bucket.progress)));
  const health = pct >= 60 ? '#15803d' : pct >= 30 ? '#b45309' : '#b91c1c';
  const stat =
    bucket.name === 'Emergency' ? `≈ ${(current / 3500).toFixed(1)} mo runway at $3.5k burn`
    : bucket.name === 'College' ? `${pct}% funded · $${Math.max(0, target - current).toLocaleString()} to go`
    : 'Goals: house · car · move';
  return (
    <div style={{border: '1px solid #e4e5e7', borderRadius: 14, padding: 16, background: 'white', boxShadow: '0 1px 2px rgba(16,24,40,0.06)'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
        {ART[bucket.name] && (
          <img src={ART[bucket.name]} alt={`${bucket.name} bucket art`} width={52} height={52} style={{borderRadius: 10, flexShrink: 0}} />
        )}
        <div>
          <h3 style={{margin: 0, fontSize: 15}}>{bucket.name}</h3>
          <div style={{fontSize: 12, color: '#5b6470'}}>{stat}</div>
        </div>
      </div>
      <p style={{margin: '12px 0 4px', fontSize: 26, fontWeight: 750, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums'}}>${current.toLocaleString()} <span style={{fontSize: 13, fontWeight: 500, color: '#5b6470'}}>/ ${target.toLocaleString()}</span></p>
      <div role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={`${bucket.name} funded ${Math.round(pct)} percent`} style={{height: 8, background: '#eceef1', borderRadius: 6, overflow: 'hidden'}}>
        <div style={{width: `${pct}%`, height: '100%', background: ACCENT[bucket.name] ?? '#2563eb'}} />
      </div>
      <p style={{fontSize: 12, margin: '8px 0 0', color: '#2a3139'}}><span style={{display: 'inline-block', width: 8, height: 8, borderRadius: 4, background: health, marginRight: 6}} />${num(bucket.monthly_needed)}/mo to stay on track</p>
      {bucket.source && (
        <p style={{fontSize: 12, marginTop: 4, color: '#4b5563'}}>
          Source: {bucket.source}{bucket.updatedAt ? ` · synced ${new Date(bucket.updatedAt).toLocaleString()}` : ''}
        </p>
      )}
    </div>
  );
}
