/**
 * E4 Payee Risk Reviews — Payee Review API Client
 */

export const e4Api = {
  /**
   * Create or update a payee review status
   * @param {object} params - { transactionId, reviewStatus }
   * @returns {Promise<object>} payee review record
   */
  async updateReview(params) {
    const response = await fetch('/api/e4/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error('Failed to save payee review');
    }

    const data = await response.json();
    return data.review;
  },

  /**
   * Fetch all payee reviews (as a map of transactionId → reviewStatus)
   * @returns {Promise<Record<string, string>>} reviews map
   */
  async getReviews() {
    const response = await fetch('/api/e4/reviews', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payee reviews');
    }

    const data = await response.json();
    return data.reviews || {};
  },
};
