import {
  LayoutDashboard,
  ShieldAlert,
  Users,
  FileCheck,
  UserCheck,
  FileBarChart2,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { USER_ROLES } from '../utils/constants.js';

/**
 * Navigation item configuration for the Banking Operations Console
 */
export const NAVIGATION_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
    roles: [USER_ROLES.ADMIN, USER_ROLES.COMPLIANCE_OFFICER, USER_ROLES.RISK_ANALYST, USER_ROLES.AUDITOR],
  },
  {
    id: 'transactions',
    label: 'Suspicious Transfers',
    icon: ShieldAlert,
    path: '/transactions',
    badge: '12',
    roles: [USER_ROLES.ADMIN, USER_ROLES.COMPLIANCE_OFFICER, USER_ROLES.RISK_ANALYST],
  },
  {
    id: 'customers',
    label: 'KYC Profiles',
    icon: Users,
    path: '/customers',
    roles: [USER_ROLES.ADMIN, USER_ROLES.COMPLIANCE_OFFICER, USER_ROLES.AUDITOR],
  },
  {
    id: 'loans',
    label: 'Loan Assessments',
    icon: FileCheck,
    path: '/loans',
    roles: [USER_ROLES.ADMIN, USER_ROLES.RISK_ANALYST],
  },
  {
    id: 'payees',
    label: 'Payee Risk Notes',
    icon: UserCheck,
    path: '/payees',
    roles: [USER_ROLES.ADMIN, USER_ROLES.COMPLIANCE_OFFICER, USER_ROLES.RISK_ANALYST],
  },
  {
    id: 'reports',
    label: 'Audit & Reports',
    icon: FileBarChart2,
    path: '/reports',
    roles: [
      USER_ROLES.ADMIN,
      USER_ROLES.COMPLIANCE_OFFICER,
      USER_ROLES.RISK_ANALYST,
      USER_ROLES.AUDITOR,
    ],
  },
  {
    id: 'settings',
    label: 'System Settings',
    icon: Settings,
    path: '/settings',
    roles: [USER_ROLES.ADMIN],
  },
];
