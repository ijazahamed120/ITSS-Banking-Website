import React, { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileBarChart2,
  ChevronRight,
  ShieldAlert,
  Users,
  FileCheck,
  UserCheck,
  Download,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Activity,
} from 'lucide-react';
import {
  buildReportsSnapshot,
  toCsv,
  downloadCsv,
} from '../../services/data/reportsAnalytics.js';
import { formatCurrency, formatCompactINR } from '../../utils/formatCurrency.js';
import { useAuth } from '../../hooks/useAuth.js';
import { hasPermission, PERMISSIONS } from '../../config/permissions.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { UnauthorizedState } from '../../components/common/UnauthorizedState.jsx';

function KpiTile({ label, value, accent = 'navy' }) {
  const valueClass =
    accent === 'danger'
      ? 'text-red-700'
      : accent === 'teal'
        ? 'text-[#0F766E]'
        : accent === 'amber'
          ? 'text-amber-800'
          : 'text-[#0B192C]';

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 space-y-1.5">
      <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">{label}</span>
      <p className={`text-2xl font-extrabold font-mono ${valueClass}`}>{value}</p>
    </div>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="border-b border-[#E2E8F0] pb-3 mb-4">
      <h2 className="text-xs font-bold text-[#0B192C] uppercase tracking-wider">{title}</h2>
      {subtitle && <p className="text-[11px] text-[#64748B] mt-1">{subtitle}</p>}
    </div>
  );
}

function ProgressBar({ pct, tone = 'navy' }) {
  const bar =
    tone === 'danger'
      ? 'bg-red-600'
      : tone === 'teal'
        ? 'bg-[#0F766E]'
        : tone === 'amber'
          ? 'bg-amber-500'
          : 'bg-[#0B192C]';
  return (
    <div className="h-1.5 w-full bg-slate-100 rounded overflow-hidden">
      <div className={`h-full ${bar}`} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </div>
  );
}

export function ReportsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canView = user && hasPermission(user.role, PERMISSIONS.VIEW_REPORTS);

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [channel, setChannel] = useState('ALL');
  const [txnType, setTxnType] = useState('ALL');
  const [workflow, setWorkflow] = useState('ALL');
  const [snapshot, setSnapshot] = useState(null);
  const [isSnapshotLoading, setIsSnapshotLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadSnapshot() {
      setIsSnapshotLoading(true);
      try {
        const next = await buildReportsSnapshot({
          dateFrom,
          dateTo,
          channel,
          txnType,
          workflow,
        });
        if (!active) return;
        setSnapshot(next);
      } catch (e) {
        console.warn('Failed to build reports snapshot:', e);
        if (active) setSnapshot(null);
      } finally {
        if (active) setIsSnapshotLoading(false);
      }
    }

    loadSnapshot();
    return () => {
      active = false;
    };
  }, [dateFrom, dateTo, channel, txnType, workflow]);

  if (!canView) {
    return (
      <UnauthorizedState
        title="Reports Access Restricted"
        description="Your assigned role does not include VIEW_REPORTS permission."
        onNavigate={() => navigate('/dashboard')}
      />
    );
  }

  if (isSnapshotLoading) {
    return (
      <Card className="p-10 text-center space-y-3">
        <Activity className="w-10 h-10 text-[#0F766E] mx-auto animate-pulse" />
        <h2 className="text-lg font-bold text-[#0F172A]">Loading Reports</h2>
        <p className="text-xs text-[#64748B]">Loading the verified company reports snapshot.</p>
      </Card>
    );
  }

  if (!snapshot) {
    return (
      <Card className="p-10 text-center space-y-3">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-[#0F172A]">Unable to Load Reports</h2>
        <p className="text-xs text-[#64748B]">Verified company ledger data could not be loaded for reports.</p>
      </Card>
    );
  }

  const { meta, kpis, transactions, kyc, loans, firstTimePayees, compliance, riskSnapshot, sectionVisibility } =
    snapshot;

  const handleExportSummary = () => {
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Reporting Period', meta.reportingPeriodLabel],
      ['Total Transactions (Ledger)', kpis.totalTransactions],
      ['Filtered Transactions', kpis.filteredTransactions],
      ['Flagged Transactions (Ledger)', kpis.flaggedTransactions],
      ['Total Customers', kpis.totalCustomers],
      ['Total Loan Applications', kpis.totalLoanApplications],
      ['First-Time Payee Cases', kpis.firstTimePayeeCases],
      ['KYC Complete', kyc.complete],
      ['KYC Pending', kyc.pending],
      ['KYC Expired', kyc.expired],
      ['Loans Approved', loans.approved],
      ['Loans Rejected', loans.rejected],
      ['Loans Refer for Review', loans.referForReview],
      ['E4 First-Time (Filtered)', firstTimePayees.total],
      ['Audit Actions Recorded', compliance.totalRecordedActions],
    ];
    downloadCsv(
      `itss-reports-summary-${meta.datasetStart}-to-${meta.datasetEnd}.csv`,
      toCsv('ITSS Reports & Analytics Summary', headers, rows)
    );
  };

  const handleExportChannels = () => {
    const headers = ['Channel', 'Transaction Count', 'Total Volume', 'Flagged Count'];
    const rows = transactions.channels.map((c) => [c.channel, c.count, c.volume, c.flaggedCount]);
    downloadCsv('itss-channel-analysis.csv', toCsv('Transaction Channel Analysis', headers, rows));
  };

  const resetFilters = () => {
    setDateFrom('');
    setDateTo('');
    setChannel('ALL');
    setTxnType('ALL');
    setWorkflow('ALL');
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#64748B]">
        <Link to="/dashboard" className="hover:text-[#0B192C] hover:underline font-semibold">
          Overview
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-bold text-[#0F172A]">Reports</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-mono font-bold text-[#0B192C]">Analytics Console</span>
      </div>

      {/* Header */}
      <div className="space-y-3 border-b border-[#E2E8F0] pb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="navy">Official Company Ledger</Badge>
            <span className="text-xs font-mono text-[#0F766E] font-bold">REPORTS & ANALYTICS</span>
          </div>
          <Button variant="secondary" size="sm" onClick={handleExportSummary} className="text-xs font-bold">
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export Summary CSV
          </Button>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 bg-[#0B192C] rounded-lg text-white shrink-0">
            <FileBarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A]">REPORTS & ANALYTICS</h1>
            <p className="text-sm text-[#64748B] mt-1">
              Operational, risk and compliance reporting based on verified company ledger data.
            </p>
            <p className="text-[11px] text-[#64748B] mt-2 font-mono">
              Reporting Period / Dataset Coverage:{' '}
              <span className="font-bold text-[#0B192C]">{meta.reportingPeriodLabel}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#64748B] uppercase">Date From</label>
            <input
              type="date"
              value={dateFrom}
              min={meta.datasetStart}
              max={meta.datasetEnd}
              onChange={(e) => setDateFrom(e.target.value)}
              className="block bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 text-xs text-[#0F172A] font-semibold"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#64748B] uppercase">Date To</label>
            <input
              type="date"
              value={dateTo}
              min={meta.datasetStart}
              max={meta.datasetEnd}
              onChange={(e) => setDateTo(e.target.value)}
              className="block bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 text-xs text-[#0F172A] font-semibold"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#64748B] uppercase">Workflow</label>
            <select
              value={workflow}
              onChange={(e) => setWorkflow(e.target.value)}
              className="block bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 text-xs text-[#0F172A] font-semibold"
            >
              <option value="ALL">All Sections</option>
              <option value="TRANSACTIONS">Transactions</option>
              <option value="KYC">KYC Profiles</option>
              <option value="LOANS">Loan Assessments</option>
              <option value="PAYEES">Payee Risk Notes</option>
              <option value="COMPLIANCE">Compliance Actions</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#64748B] uppercase">Channel</label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="block bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 text-xs text-[#0F172A] font-semibold"
            >
              <option value="ALL">All Channels</option>
              {transactions.availableChannels.map((ch) => (
                <option key={ch} value={ch}>
                  {ch}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#64748B] uppercase">Txn Type</label>
            <select
              value={txnType}
              onChange={(e) => setTxnType(e.target.value)}
              className="block bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 text-xs text-[#0F172A] font-semibold"
            >
              <option value="ALL">All Types</option>
              <option value="DEBIT">Debit</option>
              <option value="CREDIT">Credit</option>
            </select>
          </div>
          {(dateFrom || dateTo || channel !== 'ALL' || txnType !== 'ALL' || workflow !== 'ALL') && (
            <Button variant="secondary" size="sm" onClick={resetFilters} className="text-xs">
              Reset Filters
            </Button>
          )}
        </div>
      </Card>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        <KpiTile label="Total Transactions" value={kpis.totalTransactions} />
        <KpiTile label="Flagged Transactions" value={kpis.flaggedTransactions} accent="danger" />
        <KpiTile label="Total Customers" value={kpis.totalCustomers} accent="teal" />
        <KpiTile label="Total Loan Applications" value={kpis.totalLoanApplications} />
        <KpiTile label="First-Time Payee Cases" value={kpis.firstTimePayeeCases} accent="amber" />
      </div>

      {/* Workflow shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[ 
          { label: 'View Investigations', path: '/transactions', icon: ShieldAlert },
          { label: 'View KYC Profiles', path: '/customers', icon: Users },
          { label: 'View Loan Assessments', path: '/loans', icon: FileCheck },
          { label: 'View Payee Risk Notes', path: '/payees', icon: UserCheck },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="bg-white border border-[#E2E8F0] rounded-xl p-4 text-left hover:border-[#0B192C] transition-all flex items-center justify-between gap-3 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 text-[#0F766E]" />
                <span className="text-xs font-bold text-[#0B192C]">{item.label}</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#64748B]" />
            </button>
          );
        })}
      </div>

      {/* Risk Snapshot */}
      <Card className="p-5">
        <SectionHeader
          title="Risk & Compliance Snapshot"
          subtitle="Metrics derived only from verified ledger evidence and existing workflow state."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            {
              label: 'Suspicious Transactions',
              value: riskSnapshot.suspiciousTransactions,
              path: '/transactions',
              icon: ShieldAlert,
            },
            {
              label: 'Expired KYC',
              value: riskSnapshot.expiredKyc,
              path: '/customers',
              icon: AlertTriangle,
            },
            {
              label: 'Pending KYC',
              value: riskSnapshot.pendingKyc,
              path: '/customers',
              icon: Clock,
            },
            {
              label: 'Loans Requiring Review',
              value: riskSnapshot.loansRequiringReview,
              path: '/loans',
              icon: FileCheck,
            },
            {
              label: 'First-Time Payee Cases',
              value: riskSnapshot.firstTimePayeeCases,
              path: '/payees',
              icon: UserCheck,
            },
            {
              label: 'Escalated Cases (Audit)',
              value: riskSnapshot.escalatedCases,
              path: '/transactions',
              icon: Activity,
            },
          ].map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.label}
                onClick={() => navigate(m.path)}
                className="border border-[#E2E8F0] rounded-lg p-3.5 text-left hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase">{m.label}</span>
                  <Icon className="w-3.5 h-3.5 text-[#0F766E]" />
                </div>
                <p className="text-xl font-extrabold font-mono text-[#0B192C] mt-1">{m.value}</p>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Transaction Overview */}
      {sectionVisibility.transactions && (
        <Card className="p-5 space-y-5">
          <SectionHeader
            title="Transaction Overview"
            subtitle="Calculated from transactions.csv using applied date/channel/type filters where set."
          />

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
            {[
              ['Total', transactions.total],
              ['Debit', transactions.debit],
              ['Credit', transactions.credit],
              ['Flagged', transactions.flagged],
              ['Normal', transactions.normal],
              ['Volume', formatCompactINR(transactions.totalVolume)],
            ].map(([label, val]) => (
              <div key={label} className="border border-[#E2E8F0] rounded-lg p-3">
                <span className="text-[10px] font-bold text-[#64748B] uppercase block">{label}</span>
                <p className="text-sm font-extrabold font-mono text-[#0B192C] mt-1">{val}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-[#E2E8F0] rounded-lg p-4 space-y-3">
              <p className="text-[10px] font-bold text-[#64748B] uppercase">Normal vs Flagged</p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-emerald-800">Normal</span>
                  <span className="font-mono font-bold">
                    {transactions.normal} ({transactions.normalPct}%)
                  </span>
                </div>
                <ProgressBar pct={transactions.normalPct} tone="teal" />
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-red-700">Flagged</span>
                  <span className="font-mono font-bold">
                    {transactions.flagged} ({transactions.flaggedPct}%)
                  </span>
                </div>
                <ProgressBar pct={transactions.flaggedPct} tone="danger" />
              </div>
            </div>

            <div className="border border-[#E2E8F0] rounded-lg p-4 space-y-3">
              <p className="text-[10px] font-bold text-[#64748B] uppercase">Debit vs Credit</p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-[#0B192C]">Debit</span>
                  <span className="font-mono font-bold">
                    {transactions.debit} ({transactions.debitPct}%)
                  </span>
                </div>
                <ProgressBar pct={transactions.debitPct} />
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-[#0F766E]">Credit</span>
                  <span className="font-mono font-bold">
                    {transactions.credit} ({transactions.creditPct}%)
                  </span>
                </div>
                <ProgressBar pct={transactions.creditPct} tone="teal" />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Channel Analysis */}
      {sectionVisibility.transactions && (
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3 mb-4">
            <div>
              <h2 className="text-xs font-bold text-[#0B192C] uppercase tracking-wider">
                Transaction Channel Analysis
              </h2>
              <p className="text-[11px] text-[#64748B] mt-1">
                Only channels present in the filtered ledger are shown.
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={handleExportChannels} className="text-xs font-bold">
              <Download className="w-3.5 h-3.5 mr-1" /> Export
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-left">
                  <th className="py-2 pr-3 font-bold text-[#64748B] uppercase text-[10px]">Channel</th>
                  <th className="py-2 pr-3 font-bold text-[#64748B] uppercase text-[10px]">Transaction Count</th>
                  <th className="py-2 pr-3 font-bold text-[#64748B] uppercase text-[10px]">Total Volume</th>
                  <th className="py-2 font-bold text-[#64748B] uppercase text-[10px]">Flagged Count</th>
                </tr>
              </thead>
              <tbody>
                {transactions.channels.map((row) => (
                  <tr key={row.channel} className="border-b border-[#E2E8F0]/70">
                    <td className="py-2.5 pr-3 font-mono font-bold text-[#0B192C]">{row.channel}</td>
                    <td className="py-2.5 pr-3 font-semibold text-[#0F172A]">{row.count}</td>
                    <td className="py-2.5 pr-3 font-mono text-[#0F172A]">{formatCurrency(row.volume)}</td>
                    <td className="py-2.5 font-semibold text-red-700">{row.flaggedCount}</td>
                  </tr>
                ))}
                {transactions.channels.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-[#64748B]">
                      No transactions match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* KYC */}
      {sectionVisibility.kyc && (
        <Card className="p-5 space-y-4">
          <SectionHeader
            title="KYC Compliance Summary"
            subtitle="Calculated from customers.csv kyc_status. Document inventories are not available in supplied data."
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiTile label="Total Customers" value={kyc.total} />
            <KpiTile label="Complete" value={kyc.complete} accent="teal" />
            <KpiTile label="Pending" value={kyc.pending} accent="amber" />
            <KpiTile label="Expired" value={kyc.expired} accent="danger" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-left">
                  <th className="py-2 pr-3 font-bold text-[#64748B] uppercase text-[10px]">Status</th>
                  <th className="py-2 pr-3 font-bold text-[#64748B] uppercase text-[10px]">Customer Count</th>
                  <th className="py-2 font-bold text-[#64748B] uppercase text-[10px]">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {kyc.breakdown.map((row) => (
                  <tr key={row.status} className="border-b border-[#E2E8F0]/70">
                    <td className="py-2.5 pr-3 font-bold text-[#0B192C]">{row.status}</td>
                    <td className="py-2.5 pr-3 font-mono">{row.count}</td>
                    <td className="py-2.5 font-mono">{row.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Loans */}
      {sectionVisibility.loans && (
        <Card className="p-5 space-y-4">
          <SectionHeader
            title="Loan Portfolio Summary"
            subtitle="Calculated from loan_applications.csv (including persisted officer decisions where recorded)."
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiTile label="Total Applications" value={loans.total} />
            <KpiTile label="Approved" value={loans.approved} accent="teal" />
            <KpiTile label="Rejected" value={loans.rejected} accent="danger" />
            <KpiTile label="Refer for Review" value={loans.referForReview} accent="amber" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="border border-[#E2E8F0] rounded-lg p-3.5">
              <span className="text-[10px] font-bold text-[#64748B] uppercase block">Requested Loan Volume</span>
              <p className="text-sm font-extrabold font-mono text-[#0B192C] mt-1">
                {formatCurrency(loans.requestedVolume)}
              </p>
            </div>
            <div className="border border-[#E2E8F0] rounded-lg p-3.5">
              <span className="text-[10px] font-bold text-[#64748B] uppercase block">
                Average Requested Amount
              </span>
              <p className="text-sm font-extrabold font-mono text-[#0B192C] mt-1">
                {loans.averageRequested != null
                  ? formatCurrency(loans.averageRequested)
                  : 'Not available in supplied data.'}
              </p>
            </div>
            <div className="border border-[#E2E8F0] rounded-lg p-3.5">
              <span className="text-[10px] font-bold text-[#64748B] uppercase block">Credit Score Summary</span>
              {loans.creditSummary ? (
                <p className="text-xs font-semibold text-[#0F172A] mt-1 font-mono">
                  Min {loans.creditSummary.min} · Avg {loans.creditSummary.average} · Max{' '}
                  {loans.creditSummary.max}
                </p>
              ) : (
                <p className="text-xs text-[#64748B] mt-1">Not available in supplied data.</p>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-left">
                  <th className="py-2 pr-3 font-bold text-[#64748B] uppercase text-[10px]">Product</th>
                  <th className="py-2 pr-3 font-bold text-[#64748B] uppercase text-[10px]">Applications</th>
                  <th className="py-2 font-bold text-[#64748B] uppercase text-[10px]">Requested Volume</th>
                </tr>
              </thead>
              <tbody>
                {loans.productBreakdown.map((row) => (
                  <tr key={row.product} className="border-b border-[#E2E8F0]/70">
                    <td className="py-2.5 pr-3 font-bold text-[#0B192C]">{row.product}</td>
                    <td className="py-2.5 pr-3 font-mono">{row.count}</td>
                    <td className="py-2.5 font-mono">{formatCurrency(row.volume)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* E4 First-Time Payees */}
      {sectionVisibility.payees && (
        <Card className="p-5 space-y-4">
          <SectionHeader
            title="First-Time Payee Risk Summary"
            subtitle="Reuses the existing E4 first-time DEBIT derivation (customer_id + counterparty)."
          />
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-[11px] text-amber-950">
            First-time status is a derived signal and does not automatically indicate suspicious activity.
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiTile label="Total First-Time Cases" value={firstTimePayees.total} accent="amber" />
            <KpiTile label="Flagged First-Time" value={firstTimePayees.flagged} accent="danger" />
            <KpiTile label="Normal First-Time" value={firstTimePayees.normal} accent="teal" />
            <KpiTile
              label="Pending Review"
              value={firstTimePayees.reviewCounts.PENDING_REVIEW || 0}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {[
              ['Reviewed', firstTimePayees.reviewCounts.REVIEWED || 0],
              ['Cleared', firstTimePayees.reviewCounts.CLEARED || 0],
              ['Held', firstTimePayees.reviewCounts.HELD || 0],
              ['Escalated', firstTimePayees.reviewCounts.ESCALATED || 0],
            ].map(([label, val]) => (
              <div key={label} className="border border-[#E2E8F0] rounded-lg p-3">
                <span className="text-[10px] font-bold text-[#64748B] uppercase block">{label}</span>
                <p className="font-mono font-extrabold text-[#0B192C] mt-1">{val}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Compliance Actions */}
      {sectionVisibility.compliance && (
        <Card className="p-5 space-y-4">
          <SectionHeader
            title="Compliance Action Summary"
            subtitle="Counts from the existing persisted audit/review architecture only. No fabricated activity."
          />
          {compliance.actions.length === 0 ? (
            <p className="text-xs text-[#64748B] italic py-2">No recorded actions available.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {compliance.actions.map((row) => (
                <div key={row.action} className="border border-[#E2E8F0] rounded-lg p-3">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase block">{row.action}</span>
                  <p className="text-lg font-extrabold font-mono text-[#0B192C] mt-1">{row.count}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Recent Activity */}
      {sectionVisibility.compliance && (
        <Card className="p-5">
          <SectionHeader
            title="Recent Compliance Activity"
            subtitle="Newest audit records first. Empty when no officer actions have been recorded."
          />
          {compliance.recentActivity.length === 0 ? (
            <p className="text-xs text-[#64748B] italic py-4">No recent compliance activity.</p>
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
                  {compliance.recentActivity.map((row, idx) => (
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
                          {row.status === 'ESCALATED' ? (
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                          ) : row.status === 'CLEARED' || row.status === 'REVIEWED' ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : null}
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
      )}

      <p className="text-[10px] text-[#94A3B8] text-center font-mono">
        Assigned Role: {user?.role} · VIEW_REPORTS · Source: company ledger CSVs + existing audit/review state
      </p>
    </div>
  );
}
