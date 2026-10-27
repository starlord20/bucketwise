'use client';
export default function ConnectAccounts() {
  return (
    <div style={{display: 'flex', gap: 12, flexWrap: 'wrap', margin: '16px 0'}}>
      <a href="/api/auth/gmail" style={{padding: '10px 16px', background: '#111', color: 'white', borderRadius: 8, textDecoration: 'none'}}>Connect Gmail + Drive</a>
      <label style={{padding: '10px 16px', border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer'}}>
        Upload Bank CSV
        <input type="file" hidden onChange={async (e)=>{
          const file = e.target.files?.[0]; if(!file) return;
          const text = await file.text();
          const res = await fetch('/api/ingest', {method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({csv: text})});
          const data = await res.json(); alert('Ingested '+data.transactionsCount+' txs'); console.log(data);
        }} />
      </label>
    </div>
  );
}
