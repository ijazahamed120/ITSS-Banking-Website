import { RISK_LEVELS } from '../utils/riskUtils.js';

export const RISK_CONFIG = {
  levels: RISK_LEVELS,
  thresholds: {
    LOW_MAX: 34,
    MEDIUM_MAX: 64,
    HIGH_MAX: 84,
    CRITICAL_MIN: 85,
  },
  defaultCurrency: 'INR',
};
