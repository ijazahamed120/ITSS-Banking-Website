import { mockCustomers } from '../mock/customersData.js';

export const customersApi = {
  async getCustomers() {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockCustomers]), 200);
    });
  },

  async getCustomerById(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const customer = mockCustomers.find((c) => c.customerId === id);
        resolve(customer || null);
      }, 150);
    });
  },
};
