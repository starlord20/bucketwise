// Verifies Meta Muse API key + credit usage (dev.meta.ai ONLY — no other endpoints).
// Usage: META_API_KEY and META_API_BASE from .env.local, then `node test-meta.js`
const fs = require('fs');

function loadEnv(path) {
  const env = {};
  try {
    for (const line of fs.readFileSync(path, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
      if (m) env[m[1]] = m[2];
    }
  } catch {}
  return env;
}

async function test() {
  const env = loadEnv('./.env.local');
  const key = process.env.META_API_KEY || env.META_API_KEY;
  const base = ((process.env.META_API_BASE || env.META_API_BASE) || '').replace(/\/+$/, '');
  console.log('Testing Meta Muse API with $150 credits...');
  console.log('Key exists:', !!key);
  console.log('Base:', base);
  if (!key || !base) throw new Error('Set META_API_KEY and META_API_BASE in .env.local (from dev.meta.ai)');

  const prompt = fs.readFileSync('./test-prompt.txt', 'utf8');

  const res = await fetch(base + '/chat/completions', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.META_WONDER_MODEL || 'muse-wonder-1.0',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 2000,
    }),
  });
  if (!res.ok) throw new Error('Meta Muse API error ' + res.status + ': ' + (await res.text()).slice(0, 300));
  const data = await res.json();

  console.log('\n=== WONDER/SPARK RESULT ===');
  console.log(data.choices[0].message.content);
  console.log('\n=== USAGE (Screenshot for judges) ===');
  console.log(data.usage);
  console.log('\nIf you see usage, $150 credits are being consumed — perfect for submission proof!');
}

test().catch(e => {
  console.error('Error:', e.message);
  console.error('Check: META_API_KEY + META_API_BASE in .env.local from dev.meta.ai');
});
