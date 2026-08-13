import { USER_ROLES } from '../utils/constants.js';

/**
 * Enterprise Application Permissions Registry
 */
export const PERMISSIONS = {
  // Navigation & Management
  VIEW_USER_MANAGEMENT: 'VIEW_USER_MANAGEMENT',
  MANAGE_USERS: 'MANAGE_USERS',

  // Case Actions & Operations (E1, E2, E3, E4)
  VIEW_CASE_ACTIONS: 'VIEW_CASE_ACTIONS',
  EXECUTE_CASE_ACTION: 'EXECUTE_CASE_ACTION',
  APPROVE_TRANSACTION: 'APPROVE_TRANSACTION',
  DECLINE_TRANSACTION: 'DECLINE_TRANSACTION',
  ESCALATE_CASE: 'ESCALATE_CASE',

  // Audit Logs
  VIEW_AUDIT_LOGS: 'VIEW_AUDIT_LOGS',
  WRITE_AUDIT_LOGS: 'WRITE_AUDIT_LOGS',

  // General Access
  VIEW_DASHBOARD: 'VIEW_DASHBOARD',
  VIEW_REPORTS: 'VIEW_REPORTS',
};

/**
 * Role to Permission Mappings
 */
export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    PERMISSIONS.VIEW_USER_MANAGEMENT,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.WRITE_AUDIT_LOGS,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_REPORTS,
    // Note: ADMIN has NO case-action buttons per specification
  ],

  [USER_ROLES.COMPLIANCE_OFFICER]: [
    PERMISSIONS.VIEW_CASE_ACTIONS,
    PERMISSIONS.EXECUTE_CASE_ACTION,
    PERMISSIONS.APPROVE_TRANSACTION,
    PERMISSIONS.DECLINE_TRANSACTION,
    PERMISSIONS.ESCALATE_CASE,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.WRITE_AUDIT_LOGS,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_REPORTS,
    // Note: No User Management
  ],

  [USER_ROLES.RISK_ANALYST]: [
    PERMISSIONS.VIEW_CASE_ACTIONS,
    PERMISSIONS.EXECUTE_CASE_ACTION,
    PERMISSIONS.ESCALATE_CASE,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_REPORTS,
    // Note: Operational/risk access, read-only audit log, no User Management
  ],

  [USER_ROLES.AUDITOR]: [
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_REPORTS,
    // Note: Read-only access, NO case-action buttons, NO user management
  ],
};

/**
 * Helper function to check if a role has a specific permission
 * @param {string} role - The user's role
 * @param {string} permission - The permission key to check
 * @returns {boolean}
 */
export function hasPermission(role, permission) {
  if (!role || !permission) return false;
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

/**
 * Helper function to check if a user role is in the allowed roles list
 * @param {string} userRole - User's current role
 * @param {Array<string>} allowedRoles - List of permitted roles
 * @returns {boolean}
 */
export function isRoleAllowed(userRole, allowedRoles = []) {
  if (!userRole) return false;
  if (!allowedRoles || allowedRoles.length === 0) return true;
  return allowedRoles.includes(userRole);
}

/**
 * Check if the user role allows rendering case action controls
 * @param {string} role
 * @returns {boolean}
 */
export function canRenderCaseActions(role) {
  return hasPermission(role, PERMISSIONS.VIEW_CASE_ACTIONS);
}
