import { mockLoans } from '../mock/loansData.js';

export const loansApi = {
  async getLoans() {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockLoans]), 200);
    });
  },

  async getLoanById(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const loan = mockLoans.find((l) => l.loanId === id);
        resolve(loan || null);
      }, 150);
    });
  },
};
