import React, { createContext, useState, useEffect } from 'react';
import { USER_ROLES } from '../utils/constants.js';

export const AuthContext = createContext(null);

/**
 * Stage 2 Demonstration Mock Accounts (reference only)
 */
export const DEMO_USERS = [
  {
    id: 'EMP-001',
    email: 'admin@itss.com',
    password: 'demo123',
    name: 'Sarah Jenkins',
    role: USER_ROLES.ADMIN,
  },
  {
    id: 'EMP-002',
    email: 'compliance@itss.com',
    password: 'demo123',
    name: 'Sarah Jenkins',
    role: USER_ROLES.COMPLIANCE_OFFICER,
  },
  {
    id: 'EMP-003',
    email: 'analyst@itss.com',
    password: 'demo123',
    name: 'Michael Raj',
    role: USER_ROLES.RISK_ANALYST,
  },
  {
    id: 'EMP-004',
    email: 'auditor@itss.com',
    password: 'demo123',
    name: 'Priya Sharma',
    role: USER_ROLES.AUDITOR,
  },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        const response = await fetch('/api/auth/session', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        const payload = await response.json();
        if (response.ok && payload && payload.user) {
          setUser(payload.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.warn('Failed to restore backend session:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  const login = async ({ email, password, rememberMe = true }) => {
    setLoading(true);

    try {
      const response = await fetch('https://itss-banking-website.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const payload = await response.json();
      if (!response.ok || !payload || !payload.user) {
        throw new Error(payload?.message || 'Invalid employee ID or password. Please try again.');
      }

      setUser(payload.user);
      return payload.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
    } catch (err) {
      console.warn('Failed to clear backend session:', err);
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    isAuthenticated: Boolean(user),
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
