import { Bucket, num } from '../lib/buckets';
const ART: Record<string, string> = {
  Emergency: '/bucket-art/emergency.webp',
  College: '/bucket-art/college.webp',
  'Life Event': '/bucket-art/lifeevent.webp',
};
export default function BucketCard({ bucket }: { bucket: Bucket }) {
  return (
    <div style={{border: '1px solid #e5e7eb', borderRadius: 16, padding: 16, background: 'white'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
        {ART[bucket.name] && (
          <img src={ART[bucket.name]} alt={`${bucket.name} bucket art`} width={56} height={56} style={{borderRadius: 12, flexShrink: 0}} />
        )}
        <h3 style={{margin: 0}}>{bucket.name}</h3>
      </div>
      <p style={{color: '#666', fontSize: 14}}>${num(bucket.current).toLocaleString()} / ${num(bucket.target).toLocaleString()}</p>
      <div style={{height: 8, background: '#eee', borderRadius: 8, overflow: 'hidden'}}>
        <div style={{width: `${Math.min(100, Math.max(0, num(bucket.progress)))}%`, height: '100%', background: bucket.name==='Emergency'?'#3b82f6':bucket.name==='College'?'#10b981':'#f59e0b'}} />
      </div>
      <p style={{fontSize: 12, marginTop: 8}}>${num(bucket.monthly_needed)}/mo to stay on track</p>
      {bucket.source && (
        <p style={{fontSize: 12, marginTop: 4, color: '#4b5563'}}>
          Source: {bucket.source}{bucket.updatedAt ? ` · synced ${new Date(bucket.updatedAt).toLocaleString()}` : ''}
        </p>
      )}
    </div>
  );
}
