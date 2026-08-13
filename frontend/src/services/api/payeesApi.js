import {
  getAllFirstTimePayeeCases,
  getFirstTimePayeeCaseById,
  filterFirstTimePayeeCases,
} from '../data/csvLoader.js';

/**
 * E4 Payees API — derived from transactions.csv (counterparty = payee).
 * Does not use mock/payeesData.js as source of truth.
 */
export const payeesApi = {
  async getPayees(filters = {}) {
    return filterFirstTimePayeeCases(filters);
  },

  async getAllFirstTimeCases() {
    return getAllFirstTimePayeeCases();
  },

  async getPayeeByTxnId(txnId) {
    return getFirstTimePayeeCaseById(txnId);
  },
};
