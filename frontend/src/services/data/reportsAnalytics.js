import {
  getAllTransactions,
  getAllCustomers,
  getAllAccounts,
  getAllLoanApplications,
  getAllFirstTimePayeeCases,
} from './csvLoader.js';
import { getAuditLog, E1_COMPLIANCE_ACTIONS } from '../audit/auditService.js';

/**
 * Deterministic Reports & Analytics aggregations.
 * All metrics derive from company CSVs + existing E4 derivation + audit persistence.
 * No invented statistics.
 */

function pct(part, whole) {
  if (!whole || whole <= 0) return 0;
  return Math.round((part / whole) * 1000) / 10;
}

function absAmount(txn) {
  return Math.abs(Number(txn.amount) || 0);
}

function classifyWorkflow(action = '') {
  const a = String(action);
  if (a.startsWith('Loan Decision:')) return 'E3 Loan Assessments';
  if (a.startsWith('E4 Payee Review:')) return 'E4 Payee Risk Notes';
  if (E1_COMPLIANCE_ACTIONS.includes(a)) return 'E1 Suspicious Transfers';
  if (a.includes('E4')) return 'E4 Payee Risk Notes';
  if (a.includes('Loan')) return 'E3 Loan Assessments';
  return 'Compliance';
}

function normalizeLoanBucket(label) {
  const s = String(label || '').toUpperCase();
  if (s === 'APPROVE' || s === 'APPROVED') return 'APPROVED';
  if (s === 'REJECT' || s === 'REJECTED') return 'REJECTED';
  if (s === 'REFER' || s === 'REFER_FOR_REVIEW') return 'REFER_FOR_REVIEW';
  return s || 'UNKNOWN';
}

/**
 * @param {object} [filters]
 * @param {string} [filters.dateFrom]
 * @param {string} [filters.dateTo]
 * @param {string} [filters.channel]
 * @param {string} [filters.txnType]
 * @param {string} [filters.workflow] ALL | TRANSACTIONS | KYC | LOANS | PAYEES | COMPLIANCE
 */
export async function buildReportsSnapshot(filters = {}) {
  const {
    dateFrom = '',
    dateTo = '',
    channel = 'ALL',
    txnType = 'ALL',
    workflow = 'ALL',
  } = filters;

  const allTxns = getAllTransactions();
  const customers = getAllCustomers();
  const accounts = getAllAccounts();
  const loans = await getAllLoanApplications();
  const firstTimeCases = await getAllFirstTimePayeeCases();
  const auditLog = await getAuditLog();

  const dates = allTxns.map((t) => t.txn_date).filter(Boolean).sort();
  const datasetStart = dates[0] || 'Not available in supplied data';
  const datasetEnd = dates[dates.length - 1] || 'Not available in supplied data';

  let txns = allTxns;
  if (dateFrom) txns = txns.filter((t) => String(t.txn_date) >= dateFrom);
  if (dateTo) txns = txns.filter((t) => String(t.txn_date) <= dateTo);
  if (channel && channel !== 'ALL') txns = txns.filter((t) => t.channel === channel);
  if (txnType && txnType !== 'ALL') txns = txns.filter((t) => t.txn_type === txnType);

  const debitTxns = txns.filter((t) => t.txn_type === 'DEBIT');
  const creditTxns = txns.filter((t) => t.txn_type === 'CREDIT');
  const flaggedTxns = txns.filter((t) => t.is_suspicious === 'Y');
  const normalTxns = txns.filter((t) => t.is_suspicious !== 'Y');
  const totalVolume = txns.reduce((sum, t) => sum + absAmount(t), 0);

  const channelsPresent = [...new Set(txns.map((t) => t.channel).filter(Boolean))].sort();
  const channelAnalysis = channelsPresent.map((ch) => {
    const rows = txns.filter((t) => t.channel === ch);
    return {
      channel: ch,
      count: rows.length,
      volume: rows.reduce((s, t) => s + absAmount(t), 0),
      flaggedCount: rows.filter((t) => t.is_suspicious === 'Y').length,
    };
  });

  const kycStatuses = ['COMPLETE', 'PENDING', 'EXPIRED'];
  const kycBreakdown = kycStatuses.map((status) => {
    const count = customers.filter((c) => c.kyc_status === status).length;
    return {
      status,
      count,
      percentage: pct(count, customers.length),
    };
  });

  const loanBuckets = { APPROVED: 0, REJECTED: 0, REFER_FOR_REVIEW: 0 };
  for (const loan of loans) {
    const bucket = normalizeLoanBucket(loan.decision_label);
    if (loanBuckets[bucket] !== undefined) loanBuckets[bucket] += 1;
  }

  const requestedVolume = loans.reduce((s, l) => s + (Number(l.requested_amount) || 0), 0);
  const avgRequested =
    loans.length > 0 ? requestedVolume / loans.length : null;

  const creditScores = loans
    .map((l) => Number(l.credit_score))
    .filter((n) => !Number.isNaN(n));
  const creditSummary =
    creditScores.length > 0
      ? {
          min: Math.min(...creditScores),
          max: Math.max(...creditScores),
          average: Math.round((creditScores.reduce((a, b) => a + b, 0) / creditScores.length) * 10) / 10,
          count: creditScores.length,
        }
      : null;

  const productsPresent = [...new Set(loans.map((l) => l.product).filter(Boolean))].sort();
  const productBreakdown = productsPresent.map((product) => ({
    product,
    count: loans.filter((l) => l.product === product).length,
    volume: loans
      .filter((l) => l.product === product)
      .reduce((s, l) => s + (Number(l.requested_amount) || 0), 0),
  }));

  // E4 first-time cases — reuse existing derivation; apply txn filters where applicable
  let e4Cases = firstTimeCases;
  if (dateFrom) e4Cases = e4Cases.filter((t) => String(t.txn_date) >= dateFrom);
  if (dateTo) e4Cases = e4Cases.filter((t) => String(t.txn_date) <= dateTo);
  if (channel && channel !== 'ALL') e4Cases = e4Cases.filter((t) => t.channel === channel);

  const e4ReviewCounts = {
    PENDING_REVIEW: 0,
    REVIEWED: 0,
    CLEARED: 0,
    HELD: 0,
    ESCALATED: 0,
  };
  for (const c of e4Cases) {
    const st = c.review_status || 'PENDING_REVIEW';
    if (e4ReviewCounts[st] !== undefined) e4ReviewCounts[st] += 1;
    else e4ReviewCounts.PENDING_REVIEW += 1;
  }

  // Compliance action counts from real audit log only
  const actionCountKeys = {
    'Mark Reviewed': 0,
    'Clear Flag': 0,
    'Clear Risk': 0,
    'Escalate Case': 0,
    'Refer for Review': 0,
    'Hold Transfer': 0,
  };

  for (const e of auditLog) {
    const action = String(e.action || '');
    if (actionCountKeys[action] !== undefined) {
      actionCountKeys[action] += 1;
      continue;
    }
    // E4 actions stored as "E4 Payee Review: <Action>"
    if (action.startsWith('E4 Payee Review:')) {
      const inner = action.replace('E4 Payee Review:', '').trim();
      if (inner === 'Mark Reviewed') actionCountKeys['Mark Reviewed'] += 1;
      else if (inner === 'Clear Risk') actionCountKeys['Clear Risk'] += 1;
      else if (inner === 'Escalate Case') actionCountKeys['Escalate Case'] += 1;
      else if (inner === 'Hold Transfer') actionCountKeys['Hold Transfer'] += 1;
      else if (inner === 'Refer for Review') actionCountKeys['Refer for Review'] += 1;
    }
  }

  const complianceActions = Object.entries(actionCountKeys)
    .map(([action, count]) => ({ action, count }))
    .filter((row) => row.count > 0);

  const recentActivity = auditLog.slice(0, 25).map((e) => ({
    timestamp: e.timestamp,
    workflow: classifyWorkflow(e.action),
    caseId: e.txnId,
    action: e.action,
    officer:
      typeof e.actingUser === 'object'
        ? e.actingUser.name || e.actingUser.email || 'Unknown'
        : String(e.actingUser || 'Unknown'),
    status: e.newStatus || '—',
  }));

  const escalatedFromAudit = auditLog.filter((e) => {
    const st = String(e.newStatus || '').toUpperCase();
    const act = String(e.action || '');
    return st === 'ESCALATED' || act.includes('Escalate');
  }).length;

  const snapshot = {
    meta: {
      datasetStart,
      datasetEnd,
      reportingPeriodLabel:
        dateFrom || dateTo
          ? `${dateFrom || datasetStart} → ${dateTo || datasetEnd}`
          : `${datasetStart} → ${datasetEnd}`,
      generatedAt: new Date().toISOString(),
      totalAccounts: accounts.length,
      filters: { dateFrom, dateTo, channel, txnType, workflow },
    },
    kpis: {
      totalTransactions: allTxns.length,
      filteredTransactions: txns.length,
      flaggedTransactions: allTxns.filter((t) => t.is_suspicious === 'Y').length,
      filteredFlagged: flaggedTxns.length,
      totalCustomers: customers.length,
      totalLoanApplications: loans.length,
      firstTimePayeeCases: firstTimeCases.length,
      filteredFirstTimePayeeCases: e4Cases.length,
    },
    transactions: {
      total: txns.length,
      debit: debitTxns.length,
      credit: creditTxns.length,
      flagged: flaggedTxns.length,
      normal: normalTxns.length,
      totalVolume,
      flaggedPct: pct(flaggedTxns.length, txns.length),
      normalPct: pct(normalTxns.length, txns.length),
      debitPct: pct(debitTxns.length, txns.length),
      creditPct: pct(creditTxns.length, txns.length),
      channels: channelAnalysis,
      availableChannels: [...new Set(allTxns.map((t) => t.channel).filter(Boolean))].sort(),
    },
    kyc: {
      total: customers.length,
      complete: kycBreakdown.find((k) => k.status === 'COMPLETE')?.count || 0,
      pending: kycBreakdown.find((k) => k.status === 'PENDING')?.count || 0,
      expired: kycBreakdown.find((k) => k.status === 'EXPIRED')?.count || 0,
      breakdown: kycBreakdown,
    },
    loans: {
      total: loans.length,
      approved: loanBuckets.APPROVED,
      rejected: loanBuckets.REJECTED,
      referForReview: loanBuckets.REFER_FOR_REVIEW,
      requestedVolume,
      averageRequested: avgRequested,
      creditSummary,
      productBreakdown,
    },
    firstTimePayees: {
      total: e4Cases.length,
      flagged: e4Cases.filter((t) => t.is_suspicious === 'Y').length,
      normal: e4Cases.filter((t) => t.is_suspicious !== 'Y').length,
      reviewCounts: e4ReviewCounts,
    },
    compliance: {
      actions: complianceActions,
      totalRecordedActions: auditLog.length,
      recentActivity,
      escalatedCases: escalatedFromAudit,
    },
    riskSnapshot: {
      suspiciousTransactions: allTxns.filter((t) => t.is_suspicious === 'Y').length,
      expiredKyc: customers.filter((c) => c.kyc_status === 'EXPIRED').length,
      pendingKyc: customers.filter((c) => c.kyc_status === 'PENDING').length,
      loansRequiringReview: loanBuckets.REFER_FOR_REVIEW,
      firstTimePayeeCases: firstTimeCases.length,
      escalatedCases: escalatedFromAudit,
    },
  };

  // Workflow filter only affects which report sections are "in focus" for UI; data remains accurate.
  snapshot.sectionVisibility = {
    transactions: workflow === 'ALL' || workflow === 'TRANSACTIONS',
    kyc: workflow === 'ALL' || workflow === 'KYC',
    loans: workflow === 'ALL' || workflow === 'LOANS',
    payees: workflow === 'ALL' || workflow === 'PAYEES',
    compliance: workflow === 'ALL' || workflow === 'COMPLIANCE',
  };

  return snapshot;
}

/**
 * Build a simple CSV string from report rows for client-side download.
 * @param {string} title
 * @param {string[]} headers
 * @param {Array<Array<string|number>>} rows
 */
export function toCsv(title, headers, rows) {
  const escape = (v) => {
    const s = String(v ?? '');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const lines = [
    `# ${title}`,
    headers.map(escape).join(','),
    ...rows.map((r) => r.map(escape).join(',')),
  ];
  return lines.join('\n');
}

export function downloadCsv(filename, csvContent) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
