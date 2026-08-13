import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#071A33] text-white border-t border-[#1E3A5F] pt-12 pb-8 px-6 sm:px-8 mt-auto w-full">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 text-xs">
          {/* Col 1: Brand & Tagline */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-600 rounded-lg text-white shadow-xs">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-white leading-none">
                  ITSS BANKING
                </span>
                <span className="text-[10px] text-teal-400 font-bold tracking-widest uppercase mt-0.5">
                  Ops & Compliance Platform
                </span>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Advanced compliance and operations intelligence for modern financial institutions. Grounded in authoritative company ledgers with human-in-the-loop AI assistance.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-teal-300 font-medium">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Verified Ledger Data &bull; Human Final Decision</span>
            </div>
          </div>

          {/* Col 2: Platform Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider border-b border-[#1E3A5F] pb-2">
              Platform
            </h4>
            <ul className="space-y-2 text-slate-300 text-[11px]">
              <li><Link to="/dashboard" className="hover:text-teal-400 transition-colors">Overview</Link></li>
              <li><Link to="/transactions" className="hover:text-teal-400 transition-colors">Operations</Link></li>
              <li><Link to="/customers" className="hover:text-teal-400 transition-colors">Customers</Link></li>
              <li><Link to="/loans" className="hover:text-teal-400 transition-colors">Loan Assessments</Link></li>
              <li><Link to="/profile" className="hover:text-teal-400 transition-colors">Employee Profile</Link></li>
            </ul>
          </div>

          {/* Col 3: Workflows */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider border-b border-[#1E3A5F] pb-2">
              Workflows
            </h4>
            <ul className="space-y-2 text-slate-300 text-[11px]">
              <li><Link to="/transactions" className="hover:text-teal-400 transition-colors">Suspicious Transfers</Link></li>
              <li><Link to="/customers" className="hover:text-teal-400 transition-colors">KYC Profiles</Link></li>
              <li><Link to="/loans" className="hover:text-teal-400 transition-colors">Loan Assessments</Link></li>
              <li><span className="text-slate-500">Payee Risk Notes</span></li>
            </ul>
          </div>

          {/* Col 4: Compliance & Policy */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider border-b border-[#1E3A5F] pb-2">
              Compliance
            </h4>
            <ul className="space-y-2 text-slate-400 text-[11px]">
              <li>Regulatory Framework</li>
              <li>AML Policy & Control</li>
              <li>Data Retention Guidelines</li>
              <li>Audit Trail & Logging</li>
            </ul>
          </div>

          {/* Col 5: Security & Trust */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider border-b border-[#1E3A5F] pb-2">
              Security & Trust
            </h4>
            <ul className="space-y-2 text-slate-400 text-[11px]">
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> ISO 27001 Certified</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> SOC 2 Compliant</li>
              <li className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-teal-400" /> Data Encrypted</li>
              <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> RBAC Access Controlled</li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-6 border-t border-[#1E3A5F] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2026 ITSS Banking Operations & Compliance. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Internal Banking Operations</span>
            <span>&bull;</span>
            <span>Version 3.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
