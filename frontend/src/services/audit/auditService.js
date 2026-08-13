/**
 * Audit Log Service for Stage 3 E1 Compliance Actions
 * Uses backend MongoDB AuditEvent storage instead of localStorage
 */

import { e1Api } from '../api/e1Api.js';

let cachedEvents = [];
let eventsLoadedAt = 0;
const CACHE_TTL_MS = 30000; // 30 second cache

/** E1 officer compliance actions recorded via recordAuditEvent */
export const E1_COMPLIANCE_ACTIONS = [
  'Mark Reviewed',
  'Clear Flag',
  'Escalate Case',
  'Refer for Review',
];

/**
 * Ensure cached events are fresh (with TTL)
 */
async function ensureCachedEvents() {
  const now = Date.now();
  if (cachedEvents.length === 0 || now - eventsLoadedAt > CACHE_TTL_MS) {
    try {
      cachedEvents = await e1Api.getEvents();
      eventsLoadedAt = now;
    } catch (err) {
      console.warn('Failed to load E1 audit events from backend:', err);
      cachedEvents = [];
    }
  }
  return cachedEvents;
}

/**
 * Record a compliance action audit event
 * @param {object} event - { txnId, action, actingUser, previousStatus, newStatus }
 * @returns {Promise<object>} recorded audit log entry
 */
export async function recordAuditEvent({ txnId, action, actingUser, previousStatus, newStatus }) {
  try {
    const recorded = await e1Api.recordAction({
      txnId,
      action,
      previousStatus,
      newStatus,
    });
    eventsLoadedAt = 0; // Invalidate cache
    return recorded;
  } catch (err) {
    console.error('Failed to record audit event:', err);
    throw err;
  }
}

/**
 * Retrieve all audit log entries
 * @returns {Promise<Array<object>>}
 */
export async function getAuditLog() {
  return ensureCachedEvents();
}

export const getAuditEvents = getAuditLog;

/**
 * Latest E1 compliance action status for a transaction, derived from the E1 audit log.
 * Audit entries are stored newest-first.
 * @param {string} txnId
 * @returns {Promise<string|null>} e.g. 'REVIEWED' | 'CLEARED' | 'ESCALATED' | 'REFERRED'
 */
export async function getLatestE1ActionStatus(txnId) {
  if (!txnId) return null;
  const events = await ensureCachedEvents();
  return e1Api.getLatestStatus(txnId, events);
}

/**
 * Map of txn_id → latest E1 compliance action status from the audit log.
 * @returns {Promise<Record<string, string>>}
 */
export async function getE1ActionStatusMap() {
  const events = await ensureCachedEvents();
  return e1Api.buildStatusMap(events);
}

/**
 * Resolve display case status for an E1 transaction (persisted action or ledger default).
 * @param {object} transaction
 * @returns {Promise<string>}
 */
export async function resolveE1CaseStatus(transaction) {
  if (!transaction) return 'NORMAL';
  const persisted = await getLatestE1ActionStatus(transaction.txn_id);
  if (persisted) return persisted;
  return transaction.is_suspicious === 'Y' ? 'FLAGGED' : 'NORMAL';
}
