/**
 * E1 Suspicious Transfers — Audit Event API Client
 */

export const e1Api = {
  /**
   * Record a compliance action as an audit event
   * @param {object} params - { txnId, action, previousStatus, newStatus }
   * @returns {Promise<object>} audit event record
   */
  async recordAction(params) {
    const response = await fetch('/api/e1/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error('Failed to record audit event');
    }

    const data = await response.json();
    return data.event;
  },

  /**
   * Fetch all audit events
   * @returns {Promise<Array>} audit events sorted by most recent
   */
  async getEvents() {
    const response = await fetch('/api/e1/actions', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch audit events');
    }

    const data = await response.json();
    return data.events || [];
  },

  /**
   * Get the latest action status for a specific transaction
   * @param {string} txnId
   * @param {Array} events - audit events list
   * @returns {string|null} latest action status or null
   */
  getLatestStatus(txnId, events) {
    if (!txnId || !events) return null;
    const targetId = String(txnId).toUpperCase();
    const event = events.find((e) => String(e.entityId).toUpperCase() === targetId);
    return event ? event.newStatus : null;
  },

  /**
   * Build a map of txn_id → latest action status
   * @param {Array} events - audit events list
   * @returns {Record<string, string>}
   */
  buildStatusMap(events) {
    const map = {};
    if (!events) return map;
    for (const event of events) {
      const id = String(event.entityId).toUpperCase();
      if (!id || map[id]) continue;
      if (event.newStatus) {
        map[id] = event.newStatus;
      }
    }
    return map;
  },
};
