export type Bucket = { name: 'Emergency'|'College'|'Life Event', target: number, current: number, monthly_needed: number, progress: number, source?: string, updatedAt?: string };

// Model output is untrusted: coerce anything numeric-ish, fall back instead of NaN/crash.
export const num = (v: unknown, d = 0): number => {
  const n = typeof v === 'number' ? v : Number(v);
  return typeof n === 'number' && !isNaN(n) ? n : d;
};
export const DEFAULT_BUCKETS: Bucket[] = [
  { name: 'Emergency', target: 15000, current: 4200, monthly_needed: 450, progress: 28 },
  { name: 'College', target: 250000, current: 38000, monthly_needed: 650, progress: 15 },
  { name: 'Life Event', target: 30000, current: 5000, monthly_needed: 300, progress: 16 },
];
