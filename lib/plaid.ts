// Plaid optional - you can also use CSV upload for hackathon demo
// For demo, use CSV fallback to avoid Plaid approval delay
export type Transaction = { date: string, merchant: string, amount: number, category: string };

export function parseCSVTransactions(csvText: string): Transaction[] {
  // Simple CSV: date,merchant,amount,category — skips blanks/malformed rows.
  // (A blank line used to parse as {merchant: undefined, amount: 0} and pass
  // the filter, which crashed leak detection downstream.)
  return csvText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .slice(1) // header row
    .map((line) => {
      const [date, merchant, amount, category] = line.split(',');
      return {
        date: (date ?? '').trim(),
        merchant: (merchant ?? '').trim(),
        amount: parseFloat((amount ?? '').trim()),
        category: (category ?? 'other').trim() || 'other',
      };
    })
    .filter((t) => t.merchant.length > 0 && !isNaN(t.amount));
}

export async function fetchPlaidTransactions(plaidAccessToken?: string) {
  if (!plaidAccessToken) return { note: 'Using CSV fallback for hackathon demo - upload bank CSV' };
  // Add Plaid SDK call here when ready
  return [];
}

// Near-realtime investment accounts (401k, brokerage, 529 balances).
// Path: Plaid Investments API (/investments/holdings/get) returns securities +
// holdings with last-updated timestamps — poll it on Refresh and stamp each
// bucket with source + updatedAt. Needs PLAID_CLIENT_ID/SECRET + Link token;
// until then buckets carry source labels from CSV/Gmail imports. Roadmap:
// BEYOND-HACKATHON.md "Investment accounts".
export type InvestmentHolding = { account: string; security: string; quantity: number; value: number; asOf: string };
export async function fetchInvestmentHoldings(plaidAccessToken?: string): Promise<InvestmentHolding[] | { note: string }> {
  if (!plaidAccessToken) return { note: 'Plaid not configured — connect investment accounts to keep buckets near realtime' };
  // TODO: picks up PLAID_CLIENT_ID/SECRET, calls /investments/holdings/get
  return [];
}

// FULL account universe for a financial-freedom evaluation: every account kind
// a customer like you would want counted, mapped to the bucket it feeds.
// "Context" feeds the shock-test (income vs obligations), not a bucket.
// Status is integration state, not data presence:
//   csv = works today via CSV upload · manual = CSV/manual entry, no aggregator
//   roadmap = needs Plaid product (Transactions / Investments / Liabilities / Income)
export type AccountKind =
  'checking' | 'savings' | 'money_market' | 'cd' |
  'brokerage_taxable' | 'ira' | 'roth_ira' | '401k' | '403b' | 'hsa' |
  '529' | 'coverdell' |
  'mortgage' | 'home_equity' | 'auto_loan' | 'student_loan' | 'credit_card' | 'personal_loan' |
  'payroll';
export type AccountSource = {
  kind: AccountKind;
  label: string;
  bucket: 'Emergency' | 'College' | 'Life Event' | 'Context';
  via: 'Plaid Transactions' | 'Plaid Investments' | 'Plaid Liabilities' | 'Plaid Income' | 'Manual / CSV';
  status: 'csv' | 'manual' | 'roadmap';
};
export const ACCOUNT_UNIVERSE: AccountSource[] = [
  { kind: 'checking', label: 'Checking', bucket: 'Emergency', via: 'Plaid Transactions', status: 'csv' },
  { kind: 'savings', label: 'Savings', bucket: 'Emergency', via: 'Plaid Transactions', status: 'csv' },
  { kind: 'money_market', label: 'Money market', bucket: 'Emergency', via: 'Plaid Transactions', status: 'csv' },
  { kind: 'cd', label: 'CDs', bucket: 'Emergency', via: 'Manual / CSV', status: 'manual' },
  { kind: '529', label: '529 college savings', bucket: 'College', via: 'Manual / CSV', status: 'manual' },
  { kind: 'coverdell', label: 'Coverdell ESA', bucket: 'College', via: 'Manual / CSV', status: 'manual' },
  { kind: 'brokerage_taxable', label: 'Taxable brokerage', bucket: 'College', via: 'Plaid Investments', status: 'roadmap' },
  { kind: 'hsa', label: 'HSA', bucket: 'Life Event', via: 'Plaid Investments', status: 'roadmap' },
  { kind: 'ira', label: 'Traditional IRA', bucket: 'Life Event', via: 'Plaid Investments', status: 'roadmap' },
  { kind: 'roth_ira', label: 'Roth IRA', bucket: 'Context', via: 'Plaid Investments', status: 'roadmap' },
  { kind: '401k', label: '401k', bucket: 'Context', via: 'Plaid Investments', status: 'roadmap' },
  { kind: '403b', label: '403b', bucket: 'Context', via: 'Plaid Investments', status: 'roadmap' },
  { kind: 'payroll', label: 'Payroll / income', bucket: 'Context', via: 'Plaid Income', status: 'csv' },
  { kind: 'mortgage', label: 'Mortgage', bucket: 'Context', via: 'Plaid Liabilities', status: 'csv' },
  { kind: 'home_equity', label: 'Home equity line', bucket: 'Context', via: 'Plaid Liabilities', status: 'roadmap' },
  { kind: 'auto_loan', label: 'Auto loan', bucket: 'Context', via: 'Plaid Liabilities', status: 'csv' },
  { kind: 'student_loan', label: 'Student loans', bucket: 'Context', via: 'Plaid Liabilities', status: 'roadmap' },
  { kind: 'credit_card', label: 'Credit cards', bucket: 'Context', via: 'Plaid Liabilities', status: 'csv' },
  { kind: 'personal_loan', label: 'Personal loans', bucket: 'Context', via: 'Plaid Liabilities', status: 'csv' },
];
