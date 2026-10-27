// Meta Model API client - works with Muse Spark, Wonder, Image, SAM 3.1
export async function callMetaModel({ model, prompt, image }: { model: string, prompt: string, image?: string }) {
  const key = process.env.META_API_KEY;
  if (!key) throw new Error('Missing META_API_KEY');
  // Replace URL with actual Meta Model API endpoint from dev.meta.ai portal
  const res = await fetch('https://api.meta.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model, // e.g. "Llama-4-Maverick", "Muse-Spark", "Muse-Wonder"
      messages: [{ role: 'user', content: prompt }],
      // image: for SAM 3.1 / Image models
    })
  });
  if (!res.ok) throw new Error(`Meta API error ${res.status}: ${await res.text()}`);
  return res.json();
}

export const MODELS = {
  spark: 'muse-spark-1.3', // replace with exact name from portal
  wonder: 'muse-wonder',
  image: 'muse-image',
  sam: 'sam-3.1',
  llama: 'llama-4-maverick'
};

export async function parseReceiptsWithSAM(imageUrl: string) {
  return callMetaModel({ model: MODELS.sam, prompt: `Parse this receipt into {merchant, amount, date, category}`, image: imageUrl });
}
export async function buildBucketsWithWonder(transactions: any[]) {
  return callMetaModel({ model: MODELS.wonder, prompt: `You are Household CFO. Given transactions ${JSON.stringify(transactions).slice(0,4000)}, create 3 buckets: Emergency (3-6mo expenses), College (target 2034), Life Event. Return JSON {buckets:[{name,target,current,monthly_needed}], leaks:[], actions:[]}. Lessons from 2008/2020: prioritize buffer.` });
}
export async function shockTestWithLlama(buckets: any) {
  return callMetaModel({ model: MODELS.llama, prompt: `Simulate 3 shocks on buckets ${JSON.stringify(buckets)}: 1) Income -30% 4mo like 2020, 2) Expenses +20% like 2022 inflation, 3) College cost +6%/yr. Return buffer needed and behavior checklist.` });
}
