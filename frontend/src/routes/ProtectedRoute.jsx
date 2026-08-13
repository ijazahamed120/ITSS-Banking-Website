import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { isRoleAllowed } from '../config/permissions.js';
import { Unauthorized } from '../pages/errors/Unauthorized.jsx';

/**
 * Protected Route wrapper for authentication and role-based access control (RBAC)
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {Array<string>} [props.allowedRoles] - Optional list of permitted roles
 */
export function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading indicator while session state is being initialized from localStorage
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#1E3A5F]/20 border-t-[#1E3A5F] rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-[#6B7280]">Verifying Security Credentials...</span>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based permission if allowedRoles is specified
  if (allowedRoles && allowedRoles.length > 0 && !isRoleAllowed(user.role, allowedRoles)) {
    return <Unauthorized userRole={user.role} allowedRoles={allowedRoles} />;
  }

  return children;
}
