/**
 * E3 Loan Assessments — Loan Decision API Client
 */

export const e3Api = {
  /**
   * Create or update a loan decision
   * @param {object} params - { applicationId, decision }
   * @returns {Promise<object>} loan decision record
   */
  async updateDecision(params) {
    console.log('[DIAGNOSTIC] POST /api/e3/decisions request body:', params);
    const response = await fetch('/api/e3/decisions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      console.log('[DIAGNOSTIC] POST failed with status:', response.status);
      throw new Error('Failed to save loan decision');
    }

    const data = await response.json();
    console.log('[DIAGNOSTIC] POST /api/e3/decisions response:', data);
    console.log('[DIAGNOSTIC] POST response.decision.decision:', data.decision?.decision);
    return data.decision;
  },

  /**
   * Fetch all loan decisions (as a map of applicationId → decision)
   * @returns {Promise<Record<string, string>>} decisions map
   */
  async getDecisions() {
    const response = await fetch('/api/e3/decisions', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch loan decisions');
    }

    const data = await response.json();
    console.log('[DIAGNOSTIC] GET /api/e3/decisions response:', data);
    if (data.decisions && data.decisions['APP027']) {
      console.log('[DIAGNOSTIC] APP027 in GET response:', data.decisions['APP027']);
    } else {
      console.log('[DIAGNOSTIC] APP027 NOT found in GET response');
    }
    return data.decisions || {};
  },
};
