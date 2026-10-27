'use client';
import { DEFAULT_BUCKETS } from '../lib/buckets';
import BucketCard from '../components/BucketCard';
import { useState } from 'react';

export default function Page() {
  const [buckets] = useState(DEFAULT_BUCKETS);
  return (
    <main style={{maxWidth: 900, margin: '0 auto', padding: 24, fontFamily: 'system-ui'}}>
      <h1>Household CFO — Financial Freedom OS</h1>
      <p>Meta Global AI Developer Hackathon — Indie Track. Approved Oct 26 - Nov 4.</p>
      <p style={{background: '#f0f4ff', padding: 12, borderRadius: 8}}>Status: Gmail ingest → Wonder parsing → Spark buckets → Llama shock-test</p>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginTop: 24}}>
        {buckets.map(b => <BucketCard key={b.name} bucket={b} />)}
      </div>
      <section style={{marginTop: 32, border: '1px solid #ddd', padding: 16, borderRadius: 12}}>
        <h2>Shock-Test Simulator (2020 / 2008 / 2022)</h2>
        <p>What if income drops 30% for 4 months? Results will appear here after calling /api/shock-test</p>
        <button onClick={async () => { const r = await fetch('/api/shock-test', {method: 'POST', body: JSON.stringify({buckets})}); alert('Check console: ' + r.status); }}>Run Shock Test</button>
      </section>
      <section style={{marginTop: 24}}>
        <h3>Daily CFO Digest</h3>
        <pre style={{background: '#111', color: '#0f0', padding: 12, borderRadius: 8, overflow: 'auto'}}>{`Today: $45 leaked to subscriptions. Move $300 to Emergency. College on track +2%.\nAction: Cancel duplicate Adobe + Spotify family.`}</pre>
      </section>
    </main>
  );
}
