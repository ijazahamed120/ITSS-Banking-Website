import { TRANSACTIONS_DATA, CUSTOMERS_DATA, ACCOUNTS_DATA, LOAN_APPLICATIONS_DATA } from './datasetStore.js';
import { e3Api } from '../api/e3Api.js';
import { e4Api } from '../api/e4Api.js';

let cachedLoanDecisions = {};
let cachedPayeeReviews = {};
let decisionsLoadedAt = 0;
let reviewsLoadedAt = 0;
const CACHE_TTL_MS = 30000; // 30 second cache

/**
 * Ensure cached loan decisions are fresh
 */
async function ensureCachedDecisions() {
  const now = Date.now();
  if (Object.keys(cachedLoanDecisions).length === 0 || now - decisionsLoadedAt > CACHE_TTL_MS) {
    try {
      cachedLoanDecisions = await e3Api.getDecisions();
      console.log('[DIAGNOSTIC] ensureCachedDecisions() fetched from backend:', cachedLoanDecisions);
      decisionsLoadedAt = now;
    } catch (err) {
      console.warn('Failed to load E3 loan decisions from backend:', err);
      console.log('[DIAGNOSTIC] ERROR: Cache set to empty {}');
      cachedLoanDecisions = {};
    }
  } else {
    console.log('[DIAGNOSTIC] ensureCachedDecisions() using cached:', cachedLoanDecisions);
  }
  return cachedLoanDecisions;
}

/**
 * Ensure cached payee reviews are fresh
 */
async function ensureCachedReviews() {
  const now = Date.now();
  if (Object.keys(cachedPayeeReviews).length === 0 || now - reviewsLoadedAt > CACHE_TTL_MS) {
    try {
      cachedPayeeReviews = await e4Api.getReviews();
      reviewsLoadedAt = now;
    } catch (err) {
      console.warn('Failed to load E4 payee reviews from backend:', err);
      cachedPayeeReviews = {};
    }
  }
  return cachedPayeeReviews;
}

/**
 * Update and persist loan application decision
 * @param {string} appId
 * @param {string} status - 'APPROVED' | 'REFER_FOR_REVIEW' | 'REJECTED'
 * @returns {Promise<object|null>}
 */
export async function updateLoanDecision(appId, status) {
  if (!appId) return null;
  const targetId = String(appId).trim().toUpperCase();

  try {
    console.log('[DIAGNOSTIC] POST /api/e3/decisions with:', { applicationId: targetId, decision: status });
    const response = await e3Api.updateDecision({
      applicationId: targetId,
      decision: status,
    });
    console.log('[DIAGNOSTIC] POST response:', response);
    console.log('[DIAGNOSTIC] Clearing cache: cachedLoanDecisions = {}');
    cachedLoanDecisions = {}; // Clear cached data
    decisionsLoadedAt = 0; // Clear timestamp to force fresh fetch
    console.log('[DIAGNOSTIC] Calling getLoanApplicationById() after cache clear');
    const result = await getLoanApplicationById(targetId);
    console.log('[DIAGNOSTIC] getLoanApplicationById returned:', result);
    return result;
  } catch (err) {
    console.error('Failed to update loan decision:', err);
    throw err;
  }
}

/**
 * Get all transactions
 * @returns {Array<object>}
 */
export function getAllTransactions() {
  return TRANSACTIONS_DATA;
}

/**
 * Get all customers
 * @returns {Array<object>}
 */
export function getAllCustomers() {
  return CUSTOMERS_DATA;
}

/**
 * Get all accounts
 * @returns {Array<object>}
 */
export function getAllAccounts() {
  return ACCOUNTS_DATA;
}

/**
 * Get all loan applications with persisted decisions merged
 * @returns {Promise<Array<object>>}
 */
export async function getAllLoanApplications() {
  const decisions = await ensureCachedDecisions();
  const result = (LOAN_APPLICATIONS_DATA || []).map((loan) => {
    const appId = String(loan.application_id).toUpperCase();
    if (decisions[appId]) {
      const merged = { ...loan, decision_label: decisions[appId] };
      if (appId === 'APP027') {
        console.log('[DIAGNOSTIC] APP027 merged decision_label:', merged.decision_label);
      }
      return merged;
    }
    if (appId === 'APP027') {
      console.log('[DIAGNOSTIC] APP027 kept original decision_label:', loan.decision_label);
    }
    return loan;
  });
  return result;
}

/**
 * Find loan application by application_id
 * @param {string} appId
 * @returns {Promise<object|null>}
 */
export async function getLoanApplicationById(appId) {
  if (!appId || !LOAN_APPLICATIONS_DATA) return null;
  const targetId = String(appId).trim().toUpperCase();
  const loan = LOAN_APPLICATIONS_DATA.find((l) => String(l.application_id).toUpperCase() === targetId);
  if (!loan) return null;

  const decisions = await ensureCachedDecisions();
  if (decisions[targetId]) {
    return { ...loan, decision_label: decisions[targetId] };
  }
  return loan;
}

/**
 * Filter loan applications based on status, product, purpose, or search query
 * @param {object} params
 * @param {string} [params.decisionStatus] - 'ALL' | 'APPROVE' | 'APPROVED' | 'REJECT' | 'REJECTED' | 'REFER' | 'REFER_FOR_REVIEW'
 * @param {string} [params.productType] - 'ALL' | 'PERSONAL' | 'BUSINESS' | 'HOME'
 * @param {string} [params.purposeType] - 'ALL' | specific purpose
 * @param {string} [params.searchQuery] - Search text (matches application_id, customer_id, customer name)
 * @returns {Promise<Array<object>>}
 */
export async function filterLoanApplications({
  decisionStatus = 'ALL',
  productType = 'ALL',
  purposeType = 'ALL',
  searchQuery = '',
} = {}) {
  let result = await getAllLoanApplications();

  if (decisionStatus && decisionStatus !== 'ALL') {
    result = result.filter((l) => {
      const status = l.decision_label;
      if (decisionStatus === 'APPROVE' || decisionStatus === 'APPROVED') {
        return status === 'APPROVE' || status === 'APPROVED';
      }
      if (decisionStatus === 'REFER' || decisionStatus === 'REFER_FOR_REVIEW') {
        return status === 'REFER' || status === 'REFER_FOR_REVIEW';
      }
      if (decisionStatus === 'REJECT' || decisionStatus === 'REJECTED') {
        return status === 'REJECT' || status === 'REJECTED';
      }
      return status === decisionStatus;
    });
  }

  if (productType && productType !== 'ALL') {
    result = result.filter((l) => l.product === productType);
  }

  if (purposeType && purposeType !== 'ALL') {
    result = result.filter((l) => l.purpose === purposeType);
  }

  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    result = result.filter((l) => {
      const cust = getCustomerById(l.customer_id);
      const custName = cust ? cust.name_1.toLowerCase() : '';
      return (
        String(l.application_id).toLowerCase().includes(q) ||
        String(l.customer_id).toLowerCase().includes(q) ||
        String(l.product || '').toLowerCase().includes(q) ||
        String(l.purpose || '').toLowerCase().includes(q) ||
        custName.includes(q)
      );
    });
  }

  return result;
}

/**
 * Find transaction by ID
 * @param {string} txnId
 * @returns {object|null}
 */
export function getTransactionById(txnId) {
  if (!txnId) return null;
  const targetId = String(txnId).trim().toUpperCase();
  return TRANSACTIONS_DATA.find((t) => String(t.txn_id).toUpperCase() === targetId) || null;
}

/**
 * Find customer by ID
 * @param {string} customerId
 * @returns {object|null}
 */
export function getCustomerById(customerId) {
  if (!customerId) return null;
  const targetId = String(customerId).trim();
  return CUSTOMERS_DATA.find((c) => String(c.customer_id) === targetId) || null;
}

/**
 * Find account by ID
 * @param {string} accountId
 * @returns {object|null}
 */
export function getAccountById(accountId) {
  if (!accountId) return null;
  const targetId = String(accountId).trim();
  return ACCOUNTS_DATA.find((a) => String(a.account_id) === targetId) || null;
}

/**
 * Get all accounts belonging to a customer
 * @param {string} customerId
 * @returns {Array<object>}
 */
export function getCustomerAccounts(customerId) {
  if (!customerId) return [];
  const targetId = String(customerId).trim();
  return ACCOUNTS_DATA.filter((a) => String(a.customer_id) === targetId);
}

/**
 * Get all transactions for a specific customer
 * @param {string} customerId
 * @returns {Array<object>}
 */
export function getCustomerTransactions(customerId) {
  if (!customerId) return [];
  const targetId = String(customerId).trim();
  return TRANSACTIONS_DATA.filter((t) => String(t.customer_id) === targetId);
}

/**
 * Get all transactions for a specific account
 * @param {string} accountId
 * @returns {Array<object>}
 */
export function getAccountTransactions(accountId) {
  if (!accountId) return [];
  const targetId = String(accountId).trim();
  return TRANSACTIONS_DATA.filter((t) => String(t.account_id) === targetId);
}

/**
 * Filter transactions based on operational parameters
 * @param {object} params
 * @param {string} [params.status] - 'ALL' | 'SUSPICIOUS_ONLY' | 'NORMAL_ONLY'
 * @param {string} [params.type] - 'ALL' | 'DEBIT' | 'CREDIT'
 * @param {string} [params.channel] - 'ALL' | 'IB' | 'UPI' | 'NEFT' | 'ACH' | 'SWIFT' | 'ATM' | 'RTGS'
 * @param {string} [params.searchQuery] - Search text (matches txn_id, customer_id, customer name, counterparty, narrative)
 * @returns {Array<object>}
 */
export function filterTransactions({
  status = 'ALL',
  type = 'ALL',
  channel = 'ALL',
  searchQuery = '',
} = {}) {
  let result = TRANSACTIONS_DATA;

  // Filter by Suspicious Status
  if (status === 'SUSPICIOUS_ONLY') {
    result = result.filter((t) => t.is_suspicious === 'Y');
  } else if (status === 'NORMAL_ONLY') {
    result = result.filter((t) => t.is_suspicious === 'N');
  }

  // Filter by Type
  if (type && type !== 'ALL') {
    result = result.filter((t) => t.txn_type === type);
  }

  // Filter by Channel
  if (channel && channel !== 'ALL') {
    result = result.filter((t) => t.channel === channel);
  }

  // Filter by Search Query
  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    result = result.filter((t) => {
      const customer = getCustomerById(t.customer_id);
      const custName = customer ? customer.name_1.toLowerCase() : '';
      return (
        String(t.txn_id).toLowerCase().includes(q) ||
        String(t.customer_id).toLowerCase().includes(q) ||
        String(t.account_id).toLowerCase().includes(q) ||
        String(t.counterparty || '').toLowerCase().includes(q) ||
        String(t.narrative || '').toLowerCase().includes(q) ||
        custName.includes(q)
      );
    });
  }

  return result;
}

/**
 * Filter customers based on KYC status, employment type, or search query
 * @param {object} params
 * @param {string} [params.kycStatus] - 'ALL' | 'COMPLETE' | 'EXPIRED' | 'PENDING'
 * @param {string} [params.employmentType] - 'ALL' | 'SALARIED' | 'BUSINESS' | 'SELF_EMP'
 * @param {string} [params.searchQuery] - Search text (matches customer_id, name_1, mnemonic, town_country)
 * @returns {Array<object>}
 */
export function filterCustomers({
  kycStatus = 'ALL',
  employmentType = 'ALL',
  searchQuery = '',
} = {}) {
  let result = CUSTOMERS_DATA;

  if (kycStatus && kycStatus !== 'ALL') {
    result = result.filter((c) => c.kyc_status === kycStatus);
  }

  if (employmentType && employmentType !== 'ALL') {
    result = result.filter((c) => c.employment_type === employmentType);
  }

  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    result = result.filter((c) => {
      return (
        String(c.customer_id).toLowerCase().includes(q) ||
        String(c.name_1 || '').toLowerCase().includes(q) ||
        String(c.mnemonic || '').toLowerCase().includes(q) ||
        String(c.town_country || '').toLowerCase().includes(q)
      );
    });
  }

  return result;
}

/**
 * Chronological comparator for ledger ordering: txn_date then txn_id
 * @param {object} a
 * @param {object} b
 * @returns {number}
 */
function compareTxnChronology(a, b) {
  const dateCmp = String(a.txn_date || '').localeCompare(String(b.txn_date || ''));
  if (dateCmp !== 0) return dateCmp;
  return String(a.txn_id || '').localeCompare(String(b.txn_id || ''));
}

/**
 * Returns true when this DEBIT has no earlier DEBIT for the same customer_id + counterparty.
 * First-time is an observed/derived ledger signal — not proof of fraud or suspicion.
 * @param {object} transaction
 * @returns {boolean}
 */
export function isFirstTimePayeeDebit(transaction) {
  if (!transaction || transaction.txn_type !== 'DEBIT') return false;

  const customerId = String(transaction.customer_id || '').trim();
  const counterparty = String(transaction.counterparty || '').trim();
  if (!customerId || !counterparty) return false;

  const earlierDebit = TRANSACTIONS_DATA.find((t) => {
    if (t.txn_type !== 'DEBIT') return false;
    if (String(t.customer_id).trim() !== customerId) return false;
    if (String(t.counterparty || '').trim() !== counterparty) return false;
    return compareTxnChronology(t, transaction) < 0;
  });

  return !earlierDebit;
}

/**
 * Get all first-time payee DEBIT cases derived from the company ledger.
 * Payee identity = transactions.counterparty (there is no payees.csv).
 * @returns {Promise<Array<object>>}
 */
export async function getAllFirstTimePayeeCases() {
  const reviews = await ensureCachedReviews();

  return TRANSACTIONS_DATA.filter((t) => isFirstTimePayeeDebit(t))
    .slice()
    .sort(compareTxnChronology)
    .map((t) => {
      const txnId = String(t.txn_id).toUpperCase();
      return {
        ...t,
        is_first_time_payee: true,
        review_status: reviews[txnId] || 'PENDING_REVIEW',
      };
    });
}

/**
 * Get a first-time payee case by txn_id (must be a first-time DEBIT).
 * @param {string} txnId
 * @returns {Promise<object|null>}
 */
export async function getFirstTimePayeeCaseById(txnId) {
  if (!txnId) return null;
  const targetId = String(txnId).trim().toUpperCase();
  const txn = TRANSACTIONS_DATA.find((t) => String(t.txn_id).toUpperCase() === targetId);
  if (!txn || !isFirstTimePayeeDebit(txn)) return null;

  const reviews = await ensureCachedReviews();
  return {
    ...txn,
    is_first_time_payee: true,
    review_status: reviews[targetId] || 'PENDING_REVIEW',
  };
}

/**
 * Persist human review status for an E4 first-time payee case.
 * @param {string} txnId
 * @param {string} status
 * @returns {Promise<object|null>}
 */
export async function updatePayeeReviewStatus(txnId, status) {
  if (!txnId || !status) return null;
  const targetId = String(txnId).trim().toUpperCase();

  try {
    await e4Api.updateReview({
      transactionId: targetId,
      reviewStatus: status,
    });
    cachedPayeeReviews = {}; // Clear cached data
    reviewsLoadedAt = 0; // Clear timestamp to force fresh fetch
    return await getFirstTimePayeeCaseById(targetId);
  } catch (err) {
    console.error('Failed to update payee review:', err);
    throw err;
  }
}

/**
 * Prior DEBIT transfers from this customer to the same counterparty (should be empty for first-time cases).
 * @param {object} transaction
 * @returns {Array<object>}
 */
export function getPriorDebitsToCounterparty(transaction) {
  if (!transaction) return [];
  const customerId = String(transaction.customer_id || '').trim();
  const counterparty = String(transaction.counterparty || '').trim();

  return TRANSACTIONS_DATA.filter((t) => {
    if (t.txn_type !== 'DEBIT') return false;
    if (String(t.customer_id).trim() !== customerId) return false;
    if (String(t.counterparty || '').trim() !== counterparty) return false;
    return compareTxnChronology(t, transaction) < 0;
  }).sort(compareTxnChronology);
}

/**
 * Filter first-time payee cases
 * @param {object} params
 * @param {string} [params.status] - 'ALL' | 'SUSPICIOUS_ONLY' | 'NORMAL_ONLY'
 * @param {string} [params.channel] - 'ALL' | channel code
 * @param {string} [params.reviewStatus] - 'ALL' | 'PENDING_REVIEW' | 'REVIEWED' | 'CLEARED' | 'HELD' | 'ESCALATED'
 * @param {string} [params.searchQuery]
 * @returns {Promise<Array<object>>}
 */
export async function filterFirstTimePayeeCases({
  status = 'ALL',
  channel = 'ALL',
  reviewStatus = 'ALL',
  searchQuery = '',
} = {}) {
  let result = await getAllFirstTimePayeeCases();

  if (status === 'SUSPICIOUS_ONLY') {
    result = result.filter((t) => t.is_suspicious === 'Y');
  } else if (status === 'NORMAL_ONLY') {
    result = result.filter((t) => t.is_suspicious === 'N');
  }

  if (channel && channel !== 'ALL') {
    result = result.filter((t) => t.channel === channel);
  }

  if (reviewStatus && reviewStatus !== 'ALL') {
    result = result.filter((t) => t.review_status === reviewStatus);
  }

  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    result = result.filter((t) => {
      const customer = getCustomerById(t.customer_id);
      const custName = customer ? customer.name_1.toLowerCase() : '';
      return (
        String(t.txn_id).toLowerCase().includes(q) ||
        String(t.customer_id).toLowerCase().includes(q) ||
        String(t.account_id).toLowerCase().includes(q) ||
        String(t.counterparty || '').toLowerCase().includes(q) ||
        String(t.narrative || '').toLowerCase().includes(q) ||
        custName.includes(q)
      );
    });
  }

  return result;
}
