import { buildReportsSnapshot } from '../data/reportsAnalytics.js';

/**
 * Reports API — deterministic aggregates from company ledger + audit state.
 * Does not use fabricated report catalogues.
 */
export const reportsApi = {
  async getReportsSnapshot(filters = {}) {
    return buildReportsSnapshot(filters);
  },

  async getAuditReports() {
    const snapshot = buildReportsSnapshot();
    return {
      recentActivity: snapshot.compliance.recentActivity,
      totalRecordedActions: snapshot.compliance.totalRecordedActions,
    };
  },
};
