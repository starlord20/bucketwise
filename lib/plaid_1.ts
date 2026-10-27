// Plaid optional - you can also use CSV upload for hackathon demo
// For demo, use CSV fallback to avoid Plaid approval delay
export type Transaction = { date: string, merchant: string, amount: number, category: string };

export function parseCSVTransactions(csvText: string): Transaction[] {
  // Simple CSV: date,merchant,amount,category
  return csvText.split('\n').slice(1).map(line => {
    const [date, merchant, amount, category] = line.split(',');
    return { date, merchant, amount: parseFloat(amount||'0'), category: category||'other' };
  }).filter(t => !isNaN(t.amount));
}

export async function fetchPlaidTransactions(plaidAccessToken?: string) {
  if (!plaidAccessToken) return { note: 'Using CSV fallback for hackathon demo - upload bank CSV' };
  // Add Plaid SDK call here when ready
  return [];
}
