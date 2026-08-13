import { mockTransactions } from '../mock/transactionsData.js';

/**
 * Transactions API abstraction service layer
 */
export const transactionsApi = {
  /**
   * Fetches list of transactions with optional filter criteria
   * @param {Object} params - Query filters (status, riskLevel, search)
   * @returns {Promise<Array>} List of transactions
   */
  async getTransactions(params = {}) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let results = [...mockTransactions];
        if (params.riskLevel) {
          results = results.filter((t) => t.riskLevel === params.riskLevel);
        }
        if (params.status) {
          results = results.filter((t) => t.status === params.status);
        }
        resolve(results);
      }, 200);
    });
  },

  /**
   * Fetches a single transaction by ID
   * @param {string} id - Transaction ID
   * @returns {Promise<Object|null>} Transaction record
   */
  async getTransactionById(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const found = mockTransactions.find((t) => t.transactionId === id);
        resolve(found || null);
      }, 150);
    });
  },

  /**
   * Updates transaction compliance status
   * @param {string} id - Transaction ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated record
   */
  async updateStatus(id, status) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ transactionId: id, status, updatedAt: new Date().toISOString() });
      }, 200);
    });
  },
};
