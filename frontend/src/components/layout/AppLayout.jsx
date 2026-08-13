import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from './Header.jsx';
import { Footer } from './Footer.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { ShieldCheck } from 'lucide-react';

export function AppLayout({ children }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const activeUser = auth?.user;
  const currentUser = activeUser || { name: 'Sarah Jenkins', role: 'COMPLIANCE_OFFICER' };

  const isOperationalPage =
    location.pathname.startsWith('/transactions') ||
    location.pathname.startsWith('/customers') ||
    location.pathname.startsWith('/loans') ||
    location.pathname.startsWith('/payees');

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      {/* Top Corporate Banking Header */}
      <Header currentUser={currentUser} onLogout={auth?.logout} />

      {/* Slim Secondary Sub-Navigation for Operational Pages */}
      {isOperationalPage && (
        <div className="bg-[#0B192C] text-white px-6 sm:px-8 py-2.5 flex items-center justify-between text-xs border-b border-[#1E3A5F] shadow-2xs">
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-teal-300 bg-teal-900/60 px-2 py-0.5 rounded border border-teal-700">
              Operations Sub-Console
            </span>
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => navigate('/transactions')}
                className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer ${
                  location.pathname.startsWith('/transactions')
                    ? 'bg-white/20 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Transfers
              </button>
              <span className="text-slate-600">&bull;</span>
              <button
                onClick={() => navigate('/customers')}
                className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer ${
                  location.pathname.startsWith('/customers')
                    ? 'bg-white/20 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                KYC Profiles
              </button>
              <span className="text-slate-600">&bull;</span>
              <button
                onClick={() => navigate('/loans')}
                className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer ${
                  location.pathname.startsWith('/loans')
                    ? 'bg-white/20 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Loan Assessments
              </button>
              <span className="text-slate-600">&bull;</span>
              <button
                onClick={() => navigate('/payees')}
                className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer ${
                  location.pathname.startsWith('/payees')
                    ? 'bg-white/20 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Payee Risk Notes
              </button>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>Assigned Role: <strong className="text-white font-mono">{currentUser.role}</strong></span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-8">
        {children}
      </main>

      {/* Professional Enterprise Banking Footer */}
      <Footer />
    </div>
  );
}
