import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import {
  ShieldAlert,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  FileText,
  Users,
  Building2,
  Lock,
} from 'lucide-react';

export function ProtectedTestPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <div className="space-y-10 pb-8">
      {/* 1. EXECUTIVE FULL-WIDTH HERO SECTION */}
      <div className="w-full bg-gradient-to-r from-[#0B192C] via-[#1E3A5F] to-[#071A33] text-white p-8 sm:p-12 rounded-3xl shadow-xl border border-[#1E3A5F] corporate-banner-glow relative overflow-hidden flex flex-col justify-between min-h-[340px]">
        {/* Abstract Background Texture Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#1E3A5F_1px,transparent_1px)] [background-size:28px_28px] opacity-30 pointer-events-none" />
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#0F766E]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Hero Eyebrow */}
        <div className="flex items-center gap-3 z-10">
          <Badge variant="teal" className="bg-teal-900/70 text-teal-300 border-teal-700 font-mono text-[11px] px-3 py-1">
            ITSS BANKING &bull; OPS & COMPLIANCE
          </Badge>
          <span className="text-xs text-slate-400 font-mono">Operations Platform</span>
        </div>

        {/* Hero Main Heading & Description */}
        <div className="max-w-3xl space-y-3.5 z-10 my-4">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Intelligent oversight for modern banking operations.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal max-w-2xl">
            Monitor transactions, investigate suspicious activity, review customer KYC risk, and make evidence-grounded lending decisions across the banking enterprise.
          </p>
        </div>

        {/* Hero CTAs */}
        <div className="flex flex-wrap items-center gap-4 z-10 pt-4 border-t border-white/10">
          <Button
            variant="teal"
            size="lg"
            onClick={() => navigate('/transactions')}
            className="text-xs font-bold py-3 px-6 shadow-md cursor-pointer"
          >
            Open Operations <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate('/reports')}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-bold py-3 px-6 cursor-pointer"
          >
            View Reports
          </Button>
        </div>
      </div>

      {/* 2. OPERATIONS AT A GLANCE WITH RIGHT-ALIGNED BUTTON */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <div className="space-y-0.5">
            <h2 className="text-xs font-bold text-[#0B192C] uppercase tracking-widest">
              OPERATIONS AT A GLANCE
            </h2>
            <p className="text-[11px] text-[#64748B]">Authoritative Company Ledger Summary</p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/transactions')}
            aria-label="Go to Operations"
            title="Go to Operations"
            className="text-xs font-bold py-1.5 px-4 shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 corporate-card-shadow">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#E2E8F0] text-center md:text-left">
            {/* Stat 1 */}
            <div className="pb-6 md:pb-0 md:pr-8 space-y-1">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                TRANSACTIONS
              </span>
              <p className="text-4xl font-extrabold text-[#0F172A] tracking-tight font-mono">
                650
              </p>
              <p className="text-xs text-[#64748B] font-medium">Total ledger records processed</p>
            </div>

            {/* Stat 2 */}
            <div className="py-6 md:py-0 md:px-8 space-y-1">
              <span className="text-[11px] font-bold text-red-700 uppercase tracking-wider block flex items-center gap-1 justify-center md:justify-start">
                <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                FLAGGED FOR REVIEW
              </span>
              <p className="text-4xl font-extrabold text-red-700 tracking-tight font-mono">
                49
              </p>
              <p className="text-xs text-red-800 font-medium">Suspicious transfers require officer review</p>
            </div>

            {/* Stat 3 */}
            <div className="pt-6 md:pt-0 md:pl-8 space-y-1">
              <span className="text-[11px] font-bold text-[#0F766E] uppercase tracking-wider block">
                TOTAL VOLUME
              </span>
              <p className="text-4xl font-extrabold text-[#0B192C] tracking-tight font-mono">
                ₹7.68 Cr
              </p>
              <p className="text-xs text-[#64748B] font-medium">Aggregate INR transfer volume</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BANKING OPERATIONS — 2x2 GRID */}
      <div className="space-y-6">
        <div className="space-y-1 border-b border-[#E2E8F0] pb-3">
          <h2 className="text-xs font-bold text-[#0B192C] uppercase tracking-widest">
            BANKING OPERATIONS
          </h2>
          <p className="text-xs text-[#64748B]">
            A unified environment for transaction investigation, customer verification, credit assessment, and payee risk review.
          </p>
        </div>

        {/* 2x2 Grid on Desktop (md:grid-cols-2), 1 col on Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border-l-4 border-l-[#0F766E] border border-[#E2E8F0] rounded-2xl p-6 sm:p-7 corporate-card-shadow flex flex-col justify-between space-y-5 hover:border-[#0B192C] transition-all">
            <div className="space-y-2.5">
              <h3 className="text-xl font-extrabold text-[#0F172A] tracking-tight">
                SUSPICIOUS TRANSFER EXPLAINER
              </h3>

              <p className="text-xs text-[#64748B] leading-relaxed">
                Investigate suspicious transaction activity using verified ledger, customer and account evidence combined with grounded AI explanations.
              </p>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/transactions')}
              className="text-xs font-bold py-2.5 px-5 w-fit cursor-pointer"
            >
              Open Investigation <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>

          {/* E2 — KYC Profile Summarizer Active Card */}
          <div className="bg-white border-l-4 border-l-[#0F766E] border border-[#E2E8F0] rounded-2xl p-6 sm:p-7 corporate-card-shadow flex flex-col justify-between space-y-5 hover:border-[#0B192C] transition-all">
            <div className="space-y-2.5">
              <h3 className="text-xl font-extrabold text-[#0F172A] tracking-tight">
                KYC PROFILE SUMMARIZER
              </h3>

              <p className="text-xs text-[#64748B] leading-relaxed">
                Review customer identity, available KYC verification status, and linked account context using verified company records.
              </p>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/customers')}
              className="text-xs font-bold py-2.5 px-5 w-fit cursor-pointer"
            >
              Open KYC Profiles <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>

          <div className="bg-white border-l-4 border-l-[#0F766E] border border-[#E2E8F0] rounded-2xl p-6 sm:p-7 corporate-card-shadow flex flex-col justify-between space-y-5 hover:border-[#0B192C] transition-all">
            <div className="space-y-2.5">
              <h3 className="text-xl font-extrabold text-[#0F172A] tracking-tight">
                LOAN DECISION NOTE WRITER
              </h3>

              <p className="text-xs text-[#64748B] leading-relaxed">
                Review loan applications, credit scores, debt obligations, and applicant evidence to draft grounded decision notes.
              </p>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/loans')}
              className="text-xs font-bold py-2.5 px-5 w-fit cursor-pointer"
            >
              Open Loan Assessments <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>

          <div className="bg-white border-l-4 border-l-[#0F766E] border border-[#E2E8F0] rounded-2xl p-6 sm:p-7 corporate-card-shadow flex flex-col justify-between space-y-5 hover:border-[#0B192C] transition-all">
            <div className="space-y-2.5">
              <h3 className="text-xl font-extrabold text-[#0F172A] tracking-tight">
                PAYEE RISK NOTES
              </h3>

              <p className="text-xs text-[#64748B] leading-relaxed">
                Review first-time payee transactions using real ledger evidence, customer and account context, derived indicators, and grounded AI risk notes.
              </p>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/payees')}
              className="text-xs font-bold py-2.5 px-5 w-fit cursor-pointer"
            >
              Open Payee Risk Notes <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* 4. LARGE EDITORIAL VISUAL STORYTELLING SECTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Storytelling Section 1 */}
        <div className="bg-[#0B192C] text-white p-8 sm:p-10 rounded-3xl border border-[#1E3A5F] flex flex-col justify-between space-y-6 corporate-banner-glow">
          <div className="space-y-3">
            <span className="text-[10px] font-mono uppercase font-bold text-teal-300 tracking-widest block">
              RISK INTELLIGENCE
            </span>
            <h3 className="text-2xl font-extrabold tracking-tight text-white leading-snug">
              Make every investigation evidence-driven.
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Empower compliance officers with derived analytical indicators, baseline transfer ratios, and 100% grounded AI investigation drafts.
            </p>
          </div>

          <Button
            variant="teal"
            size="md"
            onClick={() => navigate('/transactions')}
            className="w-fit text-xs font-bold cursor-pointer"
          >
            Explore Investigations <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* Storytelling Section 2 */}
        <div className="bg-white border border-[#E2E8F0] p-8 sm:p-10 rounded-3xl corporate-card-shadow flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <span className="text-[10px] font-mono uppercase font-bold text-[#0F766E] tracking-widest block">
              COMPLIANCE OPERATIONS
            </span>
            <h3 className="text-2xl font-extrabold tracking-tight text-[#0F172A] leading-snug">
              Clarity across every decision.
            </h3>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed font-normal">
              Every officer action is assigned to authenticated employee IDs, recorded in tamper-evident compliance audit logs, and formatted strictly in Indian Rupees (₹).
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/reports')}
            className="w-fit text-xs font-bold cursor-pointer"
          >
            View Operations Audit <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
