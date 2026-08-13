import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

/**
 * Hook to access AuthContext
 * @returns {{ user: object|null, isAuthenticated: boolean, loading: boolean, login: Function, logout: Function }}
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
