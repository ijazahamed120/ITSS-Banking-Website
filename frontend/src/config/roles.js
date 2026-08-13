import { USER_ROLES } from '../utils/constants.js';

export const ROLE_CONFIG = {
  [USER_ROLES.ADMIN]: {
    name: 'Administrator',
    description: 'Full system management and configuration access',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  [USER_ROLES.COMPLIANCE_OFFICER]: {
    name: 'Compliance Officer',
    description: 'AML investigation and suspicious activity review',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  [USER_ROLES.RISK_ANALYST]: {
    name: 'Risk Analyst',
    description: 'Credit risk assessment and transaction risk modeling',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  [USER_ROLES.AUDITOR]: {
    name: 'Auditor',
    description: 'Read-only compliance audit and report inspection',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
  },
};
