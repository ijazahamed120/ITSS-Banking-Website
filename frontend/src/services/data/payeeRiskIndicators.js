import { getCustomerById, getAccountById, getPriorDebitsToCounterparty } from './csvLoader.js';

/**
 * Derived Risk Indicators for E4 First-Time Payee Risk Note.
 * Every indicator is explicitly labeled as "Derived Indicator".
 * First-time status is an observed/derived signal — not proof of fraud.
 */

/**
 * @param {object} transaction - first-time payee DEBIT case
 * @returns {Array<{ id: string, label: string, description: string, severity: string, type: string }>}
 */
export function derivePayeeRiskIndicators(transaction) {
  if (!transaction) return [];

  const indicators = [];
  const absAmount = Math.abs(Number(transaction.amount) || 0);
  const customer = getCustomerById(transaction.customer_id);
  const account = getAccountById(transaction.account_id);
  const priorDebits = getPriorDebitsToCounterparty(transaction);

  // 1. First-time payee (derived from ledger history — not automatic suspicion)
  if (priorDebits.length === 0 && transaction.txn_type === 'DEBIT') {
    indicators.push({
      id: 'PAY-IND-01',
      label: 'First-Time Payee (Derived)',
      description: `No earlier DEBIT exists for customer ${transaction.customer_id} to counterparty '${transaction.counterparty}'. This is an observed first-occurrence signal only — not proof of fraud or automatic suspicion.`,
      severity: 'MEDIUM',
      type: 'Derived Indicator',
    });
  }

  // 2. Ground-truth suspicious flag (observed CSV field, surfaced for context)
  if (transaction.is_suspicious === 'Y') {
    indicators.push({
      id: 'PAY-IND-02',
      label: 'Ground-Truth Flagged Suspicious',
      description: 'Transaction is flagged as suspicious (is_suspicious = Y) in the core ledger. This is an observed field, separate from first-time status.',
      severity: 'CRITICAL',
      type: 'Derived Indicator',
    });
  }

  // 3. Amount vs monthly income
  if (customer && Number(customer.monthly_income) > 0) {
    const incomeRatio = absAmount / Number(customer.monthly_income);
    if (incomeRatio >= 5.0) {
      indicators.push({
        id: 'PAY-IND-03',
        label: 'Excessive Transfer vs Income Ratio',
        description: `Transfer value (₹${absAmount.toLocaleString('en-IN')}) is ${incomeRatio.toFixed(1)}x declared monthly income (₹${Number(customer.monthly_income).toLocaleString('en-IN')}).`,
        severity: incomeRatio >= 8.0 ? 'CRITICAL' : 'HIGH',
        type: 'Derived Indicator',
      });
    } else if (incomeRatio >= 2.0) {
      indicators.push({
        id: 'PAY-IND-03B',
        label: 'Elevated Transfer vs Income Ratio',
        description: `Transfer value is ${incomeRatio.toFixed(1)}x customer's declared monthly income.`,
        severity: 'MEDIUM',
        type: 'Derived Indicator',
      });
    }
  }

  // 4. Working balance drain
  if (account && Number(account.working_balance) > 0) {
    const balanceRatio = (absAmount / Number(account.working_balance)) * 100;
    if (balanceRatio >= 70.0) {
      indicators.push({
        id: 'PAY-IND-04',
        label: 'High Account Liquidity Drain',
        description: `Transfer consumes ${balanceRatio.toFixed(1)}% of current working balance (₹${Number(account.working_balance).toLocaleString('en-IN')}).`,
        severity: balanceRatio >= 90.0 ? 'CRITICAL' : 'HIGH',
        type: 'Derived Indicator',
      });
    }
  }

  // 5. High-risk counterparty keyword (observed name pattern only — not a watchlist match)
  const cp = String(transaction.counterparty || '').toUpperCase();
  if (
    cp.includes('OFFSHORE') ||
    cp.includes('CRYPTO') ||
    cp.includes('NEW.BEN') ||
    cp.includes('VENDOR.Z')
  ) {
    indicators.push({
      id: 'PAY-IND-05',
      label: 'Elevated-Risk Counterparty Name Pattern',
      description: `Beneficiary counterparty '${transaction.counterparty}' matches an elevated-risk naming pattern observed in the ledger. This is a name-pattern signal only — not a sanctions or watchlist result.`,
      severity: cp.includes('OFFSHORE') || cp.includes('CRYPTO') || cp.includes('NEW.BEN') ? 'HIGH' : 'MEDIUM',
      type: 'Derived Indicator',
    });
  }

  // 6. Narrative evidence
  const narrative = String(transaction.narrative || '').toUpperCase();
  if (
    narrative.includes('CRYPTO') ||
    narrative.includes('OFFSHORE') ||
    narrative.includes('GAMBLING') ||
    narrative.includes('NEW BENEFICIARY') ||
    narrative.includes('URGENT')
  ) {
    indicators.push({
      id: 'PAY-IND-06',
      label: 'Elevated-Risk Narrative Category',
      description: `Transaction narrative '${transaction.narrative}' indicates an elevated-risk payment category in supplied ledger text.`,
      severity: 'HIGH',
      type: 'Derived Indicator',
    });
  }

  // 7. High-value settlement rail
  const ch = String(transaction.channel || '').toUpperCase();
  if (ch === 'SWIFT' || ch === 'RTGS') {
    indicators.push({
      id: 'PAY-IND-07',
      label: 'High-Value Settlement Rail',
      description: `Executed via ${ch} channel commonly used for large-value transfers.`,
      severity: 'MEDIUM',
      type: 'Derived Indicator',
    });
  }

  // 8. Account KYC posting restriction
  if (account && account.posting_restrict === 'KYC') {
    indicators.push({
      id: 'PAY-IND-08',
      label: 'Account Posting Restriction (KYC Flag)',
      description: 'Associated account has an active KYC posting restriction on the ledger.',
      severity: 'HIGH',
      type: 'Derived Indicator',
    });
  }

  // 9. Customer KYC status context
  if (customer && (customer.kyc_status === 'EXPIRED' || customer.kyc_status === 'PENDING')) {
    indicators.push({
      id: 'PAY-IND-09',
      label: 'Customer KYC Status Attention',
      description: `Customer KYC status is '${customer.kyc_status}' in supplied customer records.`,
      severity: customer.kyc_status === 'EXPIRED' ? 'HIGH' : 'MEDIUM',
      type: 'Derived Indicator',
    });
  }

  return indicators;
}

/**
 * Deterministic recommended checks for first-time payee review
 * @param {object} transaction
 * @param {Array<object>} indicators
 * @returns {Array<{ id: string, text: string, required: boolean }>}
 */
export function derivePayeeRecommendedChecks(transaction, indicators = []) {
    if (!transaction) return [];
  const checks = [
    {
      id: 'PAY-CHK-01',
      text: `Confirm customer intent to pay first-time counterparty '${transaction.counterparty}' via registered channel ${transaction.channel}.`,
      required: true,
    },
    {
      id: 'PAY-CHK-02',
      text: 'Verify authentication / maker-checker evidence for this outbound DEBIT using internal channel logs.',
      required: true,
    },
  ];

  if (indicators.some((i) => i.id === 'PAY-IND-03' || i.id === 'PAY-IND-03B')) {
    checks.push({
      id: 'PAY-CHK-03',
      text: 'Request commercial invoice, contract, or Source of Funds (SoF) documentation proportional to transfer size vs income.',
      required: true,
    });
  }

  if (indicators.some((i) => i.id === 'PAY-IND-05' || i.id === 'PAY-IND-06')) {
    checks.push({
      id: 'PAY-CHK-04',
      text: 'Review narrative and counterparty naming against internal AML typology guidance (do not invent external watchlist results).',
      required: true,
    });
  }

  if (indicators.some((i) => i.id === 'PAY-IND-08' || i.id === 'PAY-IND-09')) {
    checks.push({
      id: 'PAY-CHK-05',
      text: 'Coordinate with KYC Compliance Unit regarding customer/account verification status before clearing.',
      required: true,
    });
  }

  return checks;
}
