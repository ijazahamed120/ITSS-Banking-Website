export const PORT = process.env.PORT || 3001;

export const CORS_CONFIG = {
  methods: ['GET', 'POST', 'OPTIONS'],
  headers: ['Content-Type'],
};

export const API_ROUTES = {
  AUTH_LOGIN: '/api/auth/login',
  AUTH_SESSION: '/api/auth/session',
  AUTH_LOGOUT: '/api/auth/logout',
  E1_ACTIONS: '/api/e1/actions',
  E3_DECISIONS: '/api/e3/decisions',
  E4_REVIEWS: '/api/e4/reviews',
  AI_INVESTIGATION_NOTE: '/api/ai/investigation-note',
  AI_KYC_SUMMARY: '/api/ai/kyc-summary',
  AI_LOAN_DECISION_NOTE: '/api/ai/loan-decision-note',
  AI_PAYEE_RISK_NOTE: '/api/ai/payee-risk-note',
  AI_COMPLIANCE_SUMMARY: '/api/ai/compliance-summary',
};

export const WORKFLOWS = {
  E1: 'E1',
  E2: 'E2',
  E3: 'E3',
  E4: 'E4',
  E5: 'E5',
};
