import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  FileCheck,
  UserCheck,
  FileBarChart2,
  ChevronRight,
  ArrowRight,
  AlertTriangle,
  Activity,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  Copy,
  Info,
} from 'lucide-react';
import { buildReportsSnapshot } from '../../services/data/reportsAnalytics.js';
import { generateComplianceSummary } from '../../services/api/aiApi.js';
import { formatCurrency, formatCompactINR } from '../../utils/formatCurrency.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { hasPermission, PERMISSIONS } from '../../config/permissions.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { UnauthorizedState } from '../../components/common/UnauthorizedState.jsx';

function KpiCard({ label, value, tone = 'navy', onClick }) {
  const valueClass =
    tone === 'danger'
      ? 'text-red-700'
      : tone === 'amber'
        ? 'text-amber-800'
        : tone === 'teal'
          ? 'text-[#0F766E]'
          : 'text-[#0B192C]';

  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-white border border-[#E2E8F0] rounded-xl p-4 text-left hover:border-[#0B192C] transition-all cursor-pointer space-y-1.5 w-full"
    >
      <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">{label}</span>
      <p className={`text-2xl font-extrabold font-mono ${valueClass}`}>{value}</p>
    </button>
  );
}

function SectionTitle({ title, subtitle }) {
  return (
    <div className="border-b border-[#E2E8F0] pb-3 mb-4">
      <h2 className="text-xs font-bold text-[#0B192C] uppercase tracking-wider">{title}</h2>
      {subtitle && <p className="text-[11px] text-[#64748B] mt-1 leading-relaxed">{subtitle}</p>}
    </div>
  );
}

function MetricCell({ label, value }) {
  return (
    <div className="border border-[#E2E8F0] rounded-lg p-3">
      <span className="text-[10px] font-bold text-[#64748B] uppercase block">{label}</span>
      <p className="text-sm font-extrabold font-mono text-[#0B192C] mt-1">{value}</p>
    </div>
  );
}

export function RiskCompliancePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const canView = user && hasPermission(user.role, PERMISSIONS.VIEW_DASHBOARD);

  const [workflowFilter, setWorkflowFilter] = useState('ALL');
  const [flagFilter, setFlagFilter] = useState('ALL');
  const [snapshot, setSnapshot] = useState(null);
  const [isSnapshotLoading, setIsSnapshotLoading] = useState(true);

  // AI Compliance Summary state
  const [aiSummary, setAiSummary] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiProvider, setAiProvider] = useState(null);
  const [aiFallback, setAiFallback] = useState(false);
  const inFlightRef = useRef(false);

  useEffect(() => {
    let active = true;

    async function loadSnapshot() {
      setIsSnapshotLoading(true);
      try {
        const next = await buildReportsSnapshot();
        if (!active) return;
        setSnapshot(next);
      } catch (e) {
        console.warn('Failed to build risk & compliance snapshot:', e);
        if (active) setSnapshot(null);
      } finally {
        if (active) setIsSnapshotLoading(false);
      }
    }

    loadSnapshot();
    return () => {
      active = false;
    };
  }, []);

  const handleGenerateAiSummary = async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setIsAiLoading(true);
    setAiError(null);
    setAiProvider(null);
    setAiFallback(false);

    try {
      const res = await generateComplianceSummary({
        totalRecordedActions: snapshot?.compliance?.totalRecordedActions || 0,
        escalatedCases: snapshot?.riskSnapshot?.escalatedCases || 0,
      });
      setAiSummary(res.content);
      setAiProvider(res.provider || null);
      setAiFallback(Boolean(res.fallback));
    } catch (err) {
      setAiError(err.message || 'Failed to generate AI compliance summary. Please retry.');
    } finally {
      setIsAiLoading(false);
      inFlightRef.current = false;
    }
  };

  const handleCopyAiSummary = () => {
    if (aiSummary) {
      navigator.clipboard.writeText(aiSummary);
      toast.success('Clipboard', 'AI Risk & Compliance Summary copied to clipboard.');
    }
  };

  const filteredActivity = useMemo(() => {
    const rowsBase = snapshot?.compliance?.recentActivity || [];
    let rows = rowsBase;
    if (workflowFilter === 'E1') {
      rows = rows.filter((r) => String(r.workflow).includes('E1'));
    } else if (workflowFilter === 'E3') {
      rows = rows.filter((r) => String(r.workflow).includes('E3'));
    } else if (workflowFilter === 'E4') {
      rows = rows.filter((r) => String(r.workflow).includes('E4'));
    }
    if (flagFilter === 'ESCALATED') {
      rows = rows.filter((r) => String(r.status).toUpperCase() === 'ESCALATED');
    } else if (flagFilter === 'CLEARED') {
      rows = rows.filter((r) => String(r.status).toUpperCase() === 'CLEARED');
    } else if (flagFilter === 'REVIEWED') {
      rows = rows.filter((r) => String(r.status).toUpperCase().includes('REVIEW'));
    }
    return rows;
  }, [snapshot, workflowFilter, flagFilter]);

  if (!canView) {
    return (
      <UnauthorizedState
        title="Risk & Compliance Access Restricted"
        description="Your assigned role does not include dashboard access for Risk & Compliance."
        onNavigate={() => navigate('/dashboard')}
      />
    );
  }

  if (isSnapshotLoading) {
    return (
      <Card className="p-10 text-center space-y-3">
        <Activity className="w-10 h-10 text-[#0F766E] mx-auto animate-pulse" />
        <h2 className="text-lg font-bold text-[#0F172A]">Loading Risk Data</h2>
        <p className="text-xs text-[#64748B]">Loading the verified company ledger risk snapshot.</p>
      </Card>
    );
  }

  if (!snapshot) {
    return (
      <Card className="p-10 text-center space-y-3">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-[#0F172A]">Unable to Load Risk Data</h2>
        <p className="text-xs text-[#64748B]">
          Verified company ledger data could not be loaded. Please refresh the page and try again.
        </p>
      </Card>
    );
  }

  const { meta, kpis, transactions, kyc, loans, firstTimePayees, compliance, riskSnapshot } = snapshot;

  const workflowCards = [
    {
      title: 'Suspicious Transfer Explainer',
      description:
        'Investigate suspicious transaction activity using verified transaction, customer and account evidence.',
      button: 'Open Investigations',
      path: '/transactions',
      icon: ShieldAlert,
    },
    {
      title: 'KYC Profile Summarizer',
      description: 'Review customer identity, KYC status and linked account context.',
      button: 'Open KYC Profiles',
      path: '/customers',
      icon: Users,
    },
    {
      title: 'Loan Decision Note Writer',
      description: 'Review loan applications and supporting applicant evidence.',
      button: 'Open Loan Assessments',
      path: '/loans',
      icon: FileCheck,
    },
    {
      title: 'First-Time Payee Risk Notes',
      description: 'Review first-time DEBIT transfers using actual counterparty and ledger evidence.',
      button: 'Open Payee Reviews',
      path: '/payees',
      icon: UserCheck,
    },
  ];

  return (
    <div className="space-y-8 pb-8">
      <div className="flex items-center gap-2 text-xs text-[#64748B]">
        <Link to="/dashboard" className="hover:text-[#0B192C] hover:underline font-semibold">
          Overview
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-bold text-[#0F172A]">Risk & Compliance</span>
      </div>

      {/* Header */}
      <div className="space-y-3 border-b border-[#E2E8F0] pb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="navy">Verified Company Ledger</Badge>
            <span className="text-xs font-mono text-[#0F766E] font-bold">RISK & COMPLIANCE</span>
          </div>
          <Button variant="secondary" size="sm" onClick={() => navigate('/reports')} className="text-xs font-bold">
            <FileBarChart2 className="w-3.5 h-3.5 mr-1.5" /> View Reports
          </Button>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 bg-[#0B192C] rounded-lg text-white shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A]">RISK & COMPLIANCE</h1>
            <p className="text-sm text-[#64748B] mt-1 max-w-3xl">
              Monitor operational risk, compliance exceptions and officer review activity using verified
              company ledger data.
            </p>
            <p className="text-[11px] text-[#64748B] mt-2 font-mono">
              Ledger coverage:{' '}
              <span className="font-bold text-[#0B192C]">{meta.reportingPeriodLabel}</span>
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <KpiCard
          label="Suspicious Transactions"
          value={riskSnapshot.suspiciousTransactions}
          tone="danger"
          onClick={() => navigate('/transactions')}
        />
        <KpiCard
          label="Expired KYC"
          value={riskSnapshot.expiredKyc}
          tone="danger"
          onClick={() => navigate('/customers')}
        />
        <KpiCard
          label="Pending KYC"
          value={riskSnapshot.pendingKyc}
          tone="amber"
          onClick={() => navigate('/customers')}
        />
        <KpiCard
          label="Loans Requiring Review"
          value={riskSnapshot.loansRequiringReview}
          tone="amber"
          onClick={() => navigate('/loans')}
        />
        <KpiCard
          label="First-Time Payee Cases"
          value={riskSnapshot.firstTimePayeeCases}
          tone="teal"
          onClick={() => navigate('/payees')}
        />
        <KpiCard
          label="Escalated Cases"
          value={riskSnapshot.escalatedCases}
          tone="danger"
          onClick={() => navigate('/transactions')}
        />
      </div>

      {/* AI COMPLIANCE INSIGHTS CARD */}
      <Card className="p-6 space-y-4 border-l-4 border-l-[#0F766E] bg-white corporate-card-shadow">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#0F766E]" />
            <h2 className="text-xs font-bold text-[#0B192C] uppercase tracking-wider">
              AI COMPLIANCE INSIGHTS
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-[#0F766E] border border-teal-200">
              AI-Assisted &bull; Review Required
            </span>
            {aiProvider && !isAiLoading && !aiError && (
              <span className="text-[10px] text-[#64748B]">
                Provider: {aiProvider}
                {aiFallback ? ' · Fallback provider used' : ''}
              </span>
            )}
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-lg text-[11px] text-[#64748B] flex items-start gap-2">
          <Info className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
          <p className="leading-normal">
            Synthesizes overall risk and compliance metrics across core transactions, customer KYC, loan applications, and first-time payee reviews into an executive management summary.
          </p>
        </div>

        {isAiLoading ? (
          <div className="p-8 text-center space-y-3 bg-slate-50 rounded-xl border border-[#E2E8F0]">
            <div className="w-6 h-6 border-2 border-[#0F766E]/20 border-t-[#0F766E] rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-[#0B192C]">Generating AI Risk &amp; Compliance Summary...</p>
          </div>
        ) : aiError ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 space-y-3">
            <p className="font-semibold leading-relaxed">{aiError}</p>
            <Button variant="secondary" size="sm" onClick={handleGenerateAiSummary} disabled={isAiLoading} className="text-xs font-bold">
              Retry Generation
            </Button>
          </div>
        ) : aiSummary ? (
          <div className="space-y-3">
            <textarea
              value={aiSummary}
              readOnly
              rows={16}
              className="w-full p-3.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs font-mono text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] leading-relaxed resize-y"
            />
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-[#64748B]">Executive Compliance Assessment</span>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={handleCopyAiSummary} className="text-xs py-1 px-2.5 font-bold">
                  <Copy className="w-3.5 h-3.5 mr-1" /> Copy Summary
                </Button>
                <Button variant="teal" size="sm" onClick={handleGenerateAiSummary} disabled={isAiLoading} className="text-xs py-1 px-2.5 font-bold">
                  <RefreshCw className="w-3.5 h-3.5 mr-1" /> Regenerate
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center space-y-3 bg-slate-50 rounded-xl border border-[#E2E8F0]">
            <Sparkles className="w-8 h-8 text-[#0F766E] mx-auto opacity-80" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#0B192C]">Generate AI Compliance Summary</h3>
              <p className="text-xs text-[#64748B]">
                Analyze company-wide risk indicators, KYC exceptions, loan review workload, and compliance actions using grounded AI.
              </p>
            </div>
            <Button
              variant="teal"
              size="sm"
              onClick={handleGenerateAiSummary}
              disabled={isAiLoading}
              className="text-xs font-bold px-4 py-2"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Generate Insights
            </Button>
          </div>
        )}
      </Card>

      {/* Compliance Workflow */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-[#0B192C] uppercase tracking-wider">Compliance Workflow</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workflowCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.code}
                className="p-5 border-l-4 border-l-[#0F766E] flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="teal">{card.code}</Badge>
                    <Icon className="w-4 h-4 text-[#0B192C]" />
                  </div>
                  <h3 className="text-sm font-extrabold text-[#0F172A] uppercase tracking-tight">
                    {card.title}
                  </h3>
                  <p className="text-xs text-[#64748B] leading-relaxed">{card.description}</p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(card.path)}
                  className="text-xs font-bold w-fit"
                >
                  {card.button} <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Transaction Risk + KYC */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 space-y-4">
          <SectionTitle
            title="Transaction Risk"
            subtitle="Derived from transactions.csv via existing ledger services."
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <MetricCell label="Total" value={kpis.totalTransactions} />
            <MetricCell label="Suspicious" value={transactions.flagged} />
            <MetricCell label="Normal" value={transactions.normal} />
            <MetricCell label="Debit" value={transactions.debit} />
            <MetricCell label="Credit" value={transactions.credit} />
            <MetricCell label="Volume" value={formatCompactINR(transactions.totalVolume)} />
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/transactions')}
            className="text-xs font-bold w-fit"
          >
            Review Suspicious Transactions <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </Card>

        <Card className="p-5 space-y-4">
          <SectionTitle
            title="KYC Compliance"
            subtitle="Calculated from customers.csv kyc_status. No invented verification results."
          />
          <div className="grid grid-cols-2 gap-2.5">
            <MetricCell label="Total Customers" value={kyc.total} />
            <MetricCell label="Complete KYC" value={kyc.complete} />
            <MetricCell label="Pending KYC" value={kyc.pending} />
            <MetricCell label="Expired KYC" value={kyc.expired} />
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/customers')}
            className="text-xs font-bold w-fit"
          >
            Review KYC Profiles <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </Card>
      </div>

      {/* Loan + First-Time Payee */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 space-y-4">
          <SectionTitle
            title="Loan Portfolio Risk"
            subtitle="From loan_applications.csv and existing E3 persisted officer decisions."
          />
          <div className="grid grid-cols-2 gap-2.5">
            <MetricCell label="Total Applications" value={loans.total} />
            <MetricCell label="Approved" value={loans.approved} />
            <MetricCell label="Rejected" value={loans.rejected} />
            <MetricCell label="Refer for Review" value={loans.referForReview} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <MetricCell label="Requested Volume" value={formatCurrency(loans.requestedVolume)} />
            <MetricCell
              label="Avg Requested"
              value={
                loans.averageRequested != null
                  ? formatCurrency(loans.averageRequested)
                  : 'Not available in supplied data.'
              }
            />
            <MetricCell
              label="Credit Score"
              value={
                loans.creditSummary
                  ? `Min ${loans.creditSummary.min} · Avg ${loans.creditSummary.average} · Max ${loans.creditSummary.max}`
                  : 'Not available in supplied data.'
              }
            />
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/loans')}
            className="text-xs font-bold w-fit"
          >
            Review Loan Assessments <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </Card>

        <Card className="p-5 space-y-4">
          <SectionTitle
            title="First-Time Payee Risk"
            subtitle="Reuses existing E4 first-time DEBIT derivation and review persistence."
          />
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-[11px] text-amber-950">
            First-time status is a derived signal and does not automatically indicate suspicious activity.
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <MetricCell label="Total First-Time" value={firstTimePayees.total} />
            <MetricCell label="Flagged First-Time" value={firstTimePayees.flagged} />
            <MetricCell label="Normal First-Time" value={firstTimePayees.normal} />
            <MetricCell label="Pending Review" value={firstTimePayees.reviewCounts.PENDING_REVIEW || 0} />
            <MetricCell label="Reviewed" value={firstTimePayees.reviewCounts.REVIEWED || 0} />
            <MetricCell label="Cleared" value={firstTimePayees.reviewCounts.CLEARED || 0} />
            <MetricCell label="Held" value={firstTimePayees.reviewCounts.HELD || 0} />
            <MetricCell label="Escalated" value={firstTimePayees.reviewCounts.ESCALATED || 0} />
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/payees')}
            className="text-xs font-bold w-fit"
          >
            Review E4 Payee Cases <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </Card>
      </div>

      {/* Officer Compliance Actions */}
      <Card className="p-5 space-y-4">
        <SectionTitle
          title="Officer Compliance Actions"
          subtitle="Counts are based on persisted officer audit/review activity."
        />
        {compliance.actions.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {['Mark Reviewed', 'Clear Flag', 'Escalate Case', 'Refer for Review'].map((action) => (
              <MetricCell key={action} label={action} value={0} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {compliance.actions.map((row) => (
              <MetricCell key={row.action} label={row.action} value={row.count} />
            ))}
          </div>
        )}
        <p className="text-[11px] text-[#64748B]">
          Total recorded audit events: <span className="font-mono font-bold text-[#0B192C]">{compliance.totalRecordedActions}</span>
        </p>
      </Card>

      {/* Recent Activity */}
      <Card className="p-5 space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#E2E8F0] pb-3">
          <div>
            <h2 className="text-xs font-bold text-[#0B192C] uppercase tracking-wider">
              Recent Compliance Activity
            </h2>
            <p className="text-[11px] text-[#64748B] mt-1">
              Newest persisted audit records first. No fabricated activity.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={workflowFilter}
              onChange={(e) => setWorkflowFilter(e.target.value)}
              className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 text-xs font-semibold"
            >
              <option value="ALL">All Workflows</option>
              <option value="E1">Suspicious Transfers</option>
              <option value="E3">Loan Assessments</option>
              <option value="E4">Payee Risk Notes</option>
            </select>
            <select
              value={flagFilter}
              onChange={(e) => setFlagFilter(e.target.value)}
              className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 text-xs font-semibold"
            >
              <option value="ALL">All Statuses</option>
              <option value="ESCALATED">Escalated</option>
              <option value="REVIEWED">Reviewed</option>
              <option value="CLEARED">Cleared</option>
            </select>
          </div>
        </div>

        {filteredActivity.length === 0 ? (
          <p className="text-xs text-[#64748B] italic py-4">No officer activity recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-left">
                  <th className="py-2 pr-3 font-bold text-[#64748B] uppercase text-[10px]">Timestamp</th>
                  <th className="py-2 pr-3 font-bold text-[#64748B] uppercase text-[10px]">Workflow</th>
                  <th className="py-2 pr-3 font-bold text-[#64748B] uppercase text-[10px]">
                    Case / Transaction ID
                  </th>
                  <th className="py-2 pr-3 font-bold text-[#64748B] uppercase text-[10px]">Action</th>
                  <th className="py-2 pr-3 font-bold text-[#64748B] uppercase text-[10px]">Officer</th>
                  <th className="py-2 font-bold text-[#64748B] uppercase text-[10px]">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredActivity.map((row, idx) => (
                  <tr key={`${row.caseId}-${row.timestamp}-${idx}`} className="border-b border-[#E2E8F0]/70">
                    <td className="py-2.5 pr-3 font-mono text-[11px] text-[#475569]">
                      {row.timestamp ? new Date(row.timestamp).toLocaleString('en-IN') : '—'}
                    </td>
                    <td className="py-2.5 pr-3 font-semibold text-[#0F172A]">{row.workflow}</td>
                    <td className="py-2.5 pr-3 font-mono font-bold text-[#0B192C]">{row.caseId}</td>
                    <td className="py-2.5 pr-3 text-[#0F172A]">{row.action}</td>
                    <td className="py-2.5 pr-3 text-[#0F172A]">{row.officer}</td>
                    <td className="py-2.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-[#E2E8F0] bg-slate-50 text-[10px] font-bold uppercase">
                        {String(row.status).toUpperCase() === 'ESCALATED' ? (
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                        ) : String(row.status).toUpperCase() === 'CLEARED' ||
                          String(row.status).toUpperCase() === 'REVIEWED' ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Clock className="w-3 h-3 text-slate-400" />
                        )}
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <Card className="p-5 space-y-4">
        <SectionTitle title="Quick Actions" subtitle="Navigate to existing operational workflows." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {[
            { label: 'Investigate Suspicious Transactions', path: '/transactions', icon: ShieldAlert },
            { label: 'Review KYC Exceptions', path: '/customers', icon: Users },
            { label: 'Review Loan Assessments', path: '/loans', icon: FileCheck },
            { label: 'Review First-Time Payees', path: '/payees', icon: UserCheck },
            { label: 'View Reports', path: '/reports', icon: FileBarChart2 },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path + item.label}
                type="button"
                onClick={() => navigate(item.path)}
                className="border border-[#E2E8F0] rounded-lg p-3.5 text-left hover:bg-slate-50 hover:border-[#0B192C] transition-all cursor-pointer"
              >
                <Icon className="w-4 h-4 text-[#0F766E] mb-2" />
                <span className="text-xs font-bold text-[#0B192C] block leading-snug">{item.label}</span>
              </button>
            );
          })}
        </div>
      </Card>

      <p className="text-[10px] text-[#94A3B8] text-center font-mono flex items-center justify-center gap-1.5">
        <Activity className="w-3 h-3" />
        Assigned Role: {user?.role} · Metrics from verified ledger + existing audit/review state
      </p>
    </div>
  );
}
