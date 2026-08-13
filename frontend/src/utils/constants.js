/**
 * Core Application User Roles
 */
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  COMPLIANCE_OFFICER: 'COMPLIANCE_OFFICER',
  RISK_ANALYST: 'RISK_ANALYST',
  AUDITOR: 'AUDITOR',
};

/**
 * Enterprise Banking Workflows
 */
export const WORKFLOWS = {
  SUSPICIOUS_TRANSFER: 'SUSPICIOUS_TRANSFER_EXPLAINER',
  KYC_SUMMARY: 'KYC_SUMMARY_ASSISTANT',
  LOAN_DECISION: 'LOAN_DECISION_NOTE_WRITER',
  PAYEE_RISK: 'FIRST_TIME_PAYEE_RISK_NOTE',
};

/**
 * Demo Account Credentials
 */
export const DEMO_CREDENTIALS = {
  ADMIN: { email: 'admin@itss.com', password: 'demo123' },
  COMPLIANCE_OFFICER: { email: 'compliance@itss.com', password: 'demo123' },
  RISK_ANALYST: { email: 'analyst@itss.com', password: 'demo123' },
  AUDITOR: { email: 'auditor@itss.com', password: 'demo123' },
};

/**
 * Transaction Statuses
 */
export const TRANSACTION_STATUS = {
  FLAGGED: 'FLAGGED',
  PENDING_REVIEW: 'PENDING_REVIEW',
  APPROVED: 'APPROVED',
  DECLINED: 'DECLINED',
  ESCALATED: 'ESCALATED',
};

/**
 * System Brand Details
 */
export const BRAND_CONFIG = {
  name: 'ITSS Banking Operations Console',
  shortName: 'ITSS Ops',
  version: '1.0.0 Stage 3',
  supportEmail: 'compliance-ops@itss-bank.internal',
};
