import fs from 'node:fs';
import path from 'node:path';

/**
 * Parse CSV file and convert to array of objects
 */
function parseCSVFile(filename) {
  const dataDir = path.join(process.cwd(), 'data');
  const filepath = path.join(dataDir, filename);
  if (!fs.existsSync(filepath)) return [];
  
  const content = fs.readFileSync(filepath, 'utf-8');
  const lines = content.split('\n').filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"/, '').replace(/"$/, ''));
  return lines.slice(1).map((line) => {
    const vals = line.split(',').map((v) => v.trim().replace(/^"/, '').replace(/"$/, ''));
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = vals[i] || '';
    });
    return obj;
  });
}

/**
 * Load all CSV datasets synchronously on server start
 */
export function loadCSVDatasets() {
  const transactions = parseCSVFile('transactions.csv');
  const customers = parseCSVFile('customers.csv');
  const accounts = parseCSVFile('accounts.csv');
  const loanApplications = parseCSVFile('loan_applications.csv');

  console.log(`[CSV Loader] Loaded ${transactions.length} transactions, ${customers.length} customers, ${accounts.length} accounts, ${loanApplications.length} loan applications.`);

  return {
    transactions,
    customers,
    accounts,
    loanApplications,
  };
}
