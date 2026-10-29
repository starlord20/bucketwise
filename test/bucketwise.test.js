// Bucketwise verification harness — Node's built-in runner, zero new deps.
// Run: npm test        (fast unit checks, no API key needed)
// Run: npm run verify (tests + typecheck + production build)
// Live API proofs still need the browser + key; this guards the regressions
// that once broke the demo: blank-CSV 500, non-JSON fallback, mock fallback.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { num } from '../lib/buckets.ts';
import { parseCSVTransactions } from '../lib/plaid.ts';
import { safeParseJSON, shockTestWithWonder, detectLeaksFast, mockCFO } from '../lib/meta-api.ts';

describe('num() guard (lib/buckets.ts)', () => {
  it('passes numbers through', () => assert.equal(num(4200), 4200));
  it('coerces numeric strings', () => assert.equal(num('52.99'), 52.99));
  it('falls back instead of NaN', () => {
    assert.equal(num(undefined), 0);
    assert.equal(num(NaN), 0);
    assert.equal(num('abc', 7), 7);
  });
});

describe('parseCSVTransactions (lib/plaid.ts)', () => {
  it('skips blank lines (regression: toLowerCase 500)', () => {
    const txns = parseCSVTransactions('date,merchant,amount,category\n\n2026-10-20,Adobe,52.99,sub\n\n');
    assert.equal(txns.length, 1);
    assert.equal(txns[0].merchant, 'Adobe');
  });
  it('is safe on hostile and empty input', () => {
    assert.deepEqual(parseCSVTransactions(''), []);
    assert.deepEqual(parseCSVTransactions(',,,\n,,,\n'), []);
  });
  it('parses the 98-row demo sample', () => {
    const csv = readFileSync(new URL('../samples/sample-bank.csv', import.meta.url), 'utf8');
    const txns = parseCSVTransactions(csv);
    assert.equal(txns.length, 98);
    assert.ok(txns.every((t) => typeof t.merchant === 'string' && typeof t.amount === 'number'));
  });
});

describe('safeParseJSON (lib/meta-api.ts)', () => {
  it('parses clean JSON', () => assert.deepEqual(safeParseJSON('{"a":1}'), { a: 1 }));
  it('extracts JSON wrapped in prose (regression: m[1] fallback)', () => {
    assert.deepEqual(safeParseJSON('here you go {"leaks":[]} done'), { leaks: [] });
  });
  it('returns null on garbage', () => assert.equal(safeParseJSON('no braces here'), null));
});

describe('mock fallback without key (stranger test)', () => {
  it('shockTestWithWonder returns a mock', async () => {
    const saved = process.env.META_API_KEY;
    delete process.env.META_API_KEY;
    try {
      const r = await shockTestWithWonder([]);
      assert.ok(r.mock, 'expected mock fallback');
    } finally {
      if (saved !== undefined) process.env.META_API_KEY = saved;
    }
  });
  it('detectLeaksFast falls back to local detection', async () => {
    const saved = process.env.META_API_KEY;
    delete process.env.META_API_KEY;
    try {
      const r = await detectLeaksFast([
        { date: '2026-10-02', merchant: 'Adobe', amount: 52.99, category: 'sub' },
        { date: '2026-10-03', merchant: 'Adobe', amount: 52.99, category: 'sub' },
      ]);
      assert.equal(r.mock, true);
      assert.ok(r.leaks.length >= 1, 'local detector should flag the cluster');
    } finally {
      if (saved !== undefined) process.env.META_API_KEY = saved;
    }
  });
  it('mockCFO keeps demo targets', () => {
    const m = mockCFO();
    assert.deepEqual(m.buckets.map((b) => b.target), [15000, 250000, 30000]);
  });
});
