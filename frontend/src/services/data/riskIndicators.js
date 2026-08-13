import { getCustomerById, getAccountById, getCustomerTransactions } from './csvLoader.js';

/**
 * Derived Risk Indicators Service for E1 Suspicious Transfer Explainer
 * Note: Derived indicators are analytical observations calculated from factual data.
 * Every indicator is explicitly labeled as "Derived Indicator".
 */

/**
 * Compute derived risk indicators for a transaction
 * @param {object} transaction
 * @returns {Array<{ id: string, label: string, description: string, severity: 'CRITICAL'|'HIGH'|'MEDIUM'|'LOW', type: string }>}
 */
export function deriveRiskIndicators(transaction) {
  if (!transaction) return [];

  const indicators = [];
  const absAmount = Math.abs(Number(transaction.amount) || 0);

  const customer = getCustomerById(transaction.customer_id);
  const account = getAccountById(transaction.account_id);
  const customerHistory = getCustomerTransactions(transaction.customer_id);

  // 1. Ground-Truth Flag Signal
  if (transaction.is_suspicious === 'Y') {
    indicators.push({
      id: 'IND-01',
      label: 'Ground-Truth Flagged Suspicious',
      description: 'Transaction is flagged as suspicious (is_suspicious = Y) in core ledger.',
      severity: 'CRITICAL',
      type: 'Derived Indicator',
    });
  }

  // 2. Transfer Amount vs Customer Monthly Income Ratio
  if (customer && customer.monthly_income > 0) {
    const incomeRatio = absAmount / customer.monthly_income;
    if (incomeRatio >= 5.0) {
      indicators.push({
        id: 'IND-02',
        label: 'Excessive Transfer vs Income Ratio',
        description: `Transfer value (₹${absAmount.toLocaleString('en-IN')}) is ${incomeRatio.toFixed(1)}x greater than customer's declared monthly income (₹${customer.monthly_income.toLocaleString('en-IN')}).`,
        severity: incomeRatio >= 8.0 ? 'CRITICAL' : 'HIGH',
        type: 'Derived Indicator',
      });
    } else if (incomeRatio >= 2.0) {
      indicators.push({
        id: 'IND-02B',
        label: 'Elevated Transfer vs Income Ratio',
        description: `Transfer value is ${incomeRatio.toFixed(1)}x customer's declared monthly income.`,
        severity: 'MEDIUM',
        type: 'Derived Indicator',
      });
    }
  }

  // 3. Transfer Amount vs Working Balance Ratio
  if (account && account.working_balance > 0) {
    const balanceRatio = (absAmount / account.working_balance) * 100;
    if (balanceRatio >= 70.0) {
      indicators.push({
        id: 'IND-03',
        label: 'High Account Liquidity Drain',
        description: `Transfer consumes ${balanceRatio.toFixed(1)}% of total current working balance (₹${account.working_balance.toLocaleString('en-IN')}).`,
        severity: balanceRatio >= 90.0 ? 'CRITICAL' : 'HIGH',
        type: 'Derived Indicator',
      });
    }
  }

  // 4. High-Risk Counterparty Pattern
  const cp = String(transaction.counterparty || '').toUpperCase();
  if (cp.includes('OFFSHORE') || cp.includes('CRYPTO') || cp.includes('VENDOR.Z')) {
    indicators.push({
      id: 'IND-04',
      label: 'High-Risk Counterparty Keyword',
      description: `Beneficiary '${transaction.counterparty}' matches observed high-risk transfer target patterns.`,
      severity: cp.includes('OFFSHORE') || cp.includes('CRYPTO') ? 'CRITICAL' : 'HIGH',
      type: 'Derived Indicator',
    });
  }

  // 5. High-Risk Transaction Narrative
  const narrative = String(transaction.narrative || '').toUpperCase();
  if (narrative.includes('CRYPTO') || narrative.includes('OFFSHORE') || narrative.includes('TOPUP')) {
    indicators.push({
      id: 'IND-05',
      label: 'High-Risk Narrative Category',
      description: `Transaction narrative '${transaction.narrative}' indicates elevated risk asset class activity.`,
      severity: 'HIGH',
      type: 'Derived Indicator',
    });
  }

  // 6. High-Value Settlement Rail Channel
  const ch = String(transaction.channel || '').toUpperCase();
  if (ch === 'SWIFT' || ch === 'RTGS') {
    indicators.push({
      id: 'IND-06',
      label: 'High-Volume Settlement Rail',
      description: `Executed via ${ch} channel commonly utilized for large-value wires.`,
      severity: 'MEDIUM',
      type: 'Derived Indicator',
    });
  }

  // 7. Account Posting Restriction Flag
  if (account && account.posting_restrict === 'KYC') {
    indicators.push({
      id: 'IND-07',
      label: 'Account Posting Restriction (KYC Flag)',
      description: 'Associated account has an active KYC posting restriction on ledger.',
      severity: 'HIGH',
      type: 'Derived Indicator',
    });
  }

  // 8. Historical Baseline Deviation
  if (customerHistory.length > 1) {
    const otherTxns = customerHistory.filter((t) => t.txn_id !== transaction.txn_id);
    if (otherTxns.length > 0) {
      const avgHistAmount =
        otherTxns.reduce((acc, t) => acc + Math.abs(Number(t.amount) || 0), 0) / otherTxns.length;
      if (avgHistAmount > 0) {
        const devRatio = absAmount / avgHistAmount;
        if (devRatio >= 4.0) {
          indicators.push({
            id: 'IND-08',
            label: 'Historical Amount Spike',
            description: `Transfer value is ${devRatio.toFixed(1)}x higher than customer's historical average transfer (₹${avgHistAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}).`,
            severity: 'HIGH',
            type: 'Derived Indicator',
          });
        }
      }
    }
  }

  return indicators;
}

/**
 * Generate practical deterministic recommended checks for an investigation
 * @param {object} transaction
 * @param {Array<object>} indicators
 * @returns {Array<{ id: string, text: string, required: boolean }>}
 */
export function deriveRecommendedChecks(transaction, indicators = []) {
  if (!transaction) return [];

  const checks = [
    {
      id: 'CHK-01',
      text: `Verify beneficiary '${transaction.counterparty}' against bank watchlist ledger.`,
      required: true,
    },
    {
      id: 'CHK-02',
      text: `Confirm transaction channel ${transaction.channel} authentication logs and registered IP address.`,
      required: true,
    },
  ];

  const hasIncomeSpike = indicators.some((i) => i.id === 'IND-02');
  if (hasIncomeSpike) {
    checks.push({
      id: 'CHK-03',
      text: 'Request commercial invoice, proof of contract, or Source of Funds (SoF) document.',
      required: true,
    });
  }

  const hasOffshore = indicators.some((i) => i.id === 'IND-04');
  if (hasOffshore) {
    checks.push({
      id: 'CHK-04',
      text: 'Cross-reference cross-border remittance purpose code against FEMA / AML guidelines.',
      required: true,
    });
  }

  const hasKycRestriction = indicators.some((i) => i.id === 'IND-07');
  if (hasKycRestriction) {
    checks.push({
      id: 'CHK-05',
      text: 'Verify customer re-identification status with internal KYC Compliance Unit.',
      required: true,
    });
  }

  return checks;
}
