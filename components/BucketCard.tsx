import { Bucket } from '../lib/buckets';
export default function BucketCard({ bucket }: { bucket: Bucket }) {
  return (
    <div style={{border: '1px solid #e5e7eb', borderRadius: 16, padding: 16, background: 'white'}}>
      <h3 style={{margin: 0}}>{bucket.name}</h3>
      <p style={{color: '#666', fontSize: 14}}>${bucket.current.toLocaleString()} / ${bucket.target.toLocaleString()}</p>
      <div style={{height: 8, background: '#eee', borderRadius: 8, overflow: 'hidden'}}>
        <div style={{width: `${bucket.progress}%`, height: '100%', background: bucket.name==='Emergency'?'#3b82f6':bucket.name==='College'?'#10b981':'#f59e0b'}} />
      </div>
      <p style={{fontSize: 12, marginTop: 8}}>${bucket.monthly_needed}/mo to stay on track</p>
    </div>
  );
}
