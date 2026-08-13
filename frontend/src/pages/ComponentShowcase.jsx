import React, { useState } from 'react';
import {
  Shield,
  Activity,
  AlertTriangle,
  TrendingUp,
  Search,
  CheckCircle2,
  Lock,
  Layers,
  FileCode,
  Sparkles,
} from 'lucide-react';

// Layout & UI
import { PageHeader } from '../components/layout/PageHeader.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Select } from '../components/ui/Select.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { ConfirmDialog } from '../components/ui/ConfirmDialog.jsx';

// Common
import { StatCard } from '../components/common/StatCard.jsx';
import { RiskBadge } from '../components/common/RiskBadge.jsx';
import { RiskScoreGauge } from '../components/common/RiskScoreGauge.jsx';
import { DataTable } from '../components/common/DataTable.jsx';
import { FilterBar } from '../components/common/FilterBar.jsx';
import { SearchBar } from '../components/common/SearchBar.jsx';
import { StatusBadge } from '../components/common/StatusBadge.jsx';
import { LoadingState } from '../components/common/LoadingState.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { ErrorState } from '../components/common/ErrorState.jsx';
import { UnauthorizedState } from '../components/common/UnauthorizedState.jsx';

// Domain
import { TransactionCard } from '../components/domain/TransactionCard.jsx';
import { CustomerCard } from '../components/domain/CustomerCard.jsx';
import { LoanCard } from '../components/domain/LoanCard.jsx';
import { PayeeCard } from '../components/domain/PayeeCard.jsx';
import { RiskReasonCard } from '../components/domain/RiskReasonCard.jsx';
import { RecommendedChecksList } from '../components/domain/RecommendedChecksList.jsx';
import { AiNoteCard } from '../components/domain/AiNoteCard.jsx';
import { AlertCard } from '../components/domain/AlertCard.jsx';
import { OfficerActionBar } from '../components/domain/OfficerActionBar.jsx';

// Charts
import { TrendLineChart } from '../components/charts/TrendLineChart.jsx';
import { RiskDistributionDonut } from '../components/charts/RiskDistributionDonut.jsx';
import { TransactionHistoryBarChart } from '../components/charts/TransactionHistoryBarChart.jsx';

// Mock Data & Toast
import { mockTransactions, mockCustomers, mockLoans, mockPayees, mockRiskReasons, mockRecommendedChecks, mockAiNotes } from '../services/mock/index.js';
import { useToast } from '../hooks/useToast.js';
import { formatCurrency } from '../utils/formatters.js';

export function ComponentShowcase() {
  const toast = useToast();

  // State for modals & interactive controls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchValue, setSearchValue] = useState('');
  const [filterValues, setFilterValues] = useState({});
  const [aiNoteContent, setAiNoteContent] = useState(mockAiNotes.suspiciousTransfer);

  // Table Columns Setup
  const columns = [
    { header: 'TXN ID', key: 'transactionId', render: (val) => <span className="font-mono font-bold text-[#1E3A5F]">{val}</span> },
    { header: 'Recipient', key: 'recipientName' },
    { header: 'Amount', key: 'amount', render: (val) => formatCurrency(val) },
    { header: 'Risk Level', key: 'riskLevel', render: (val, row) => <RiskBadge level={val} score={row.riskScore} /> },
    { header: 'Status', key: 'status', render: (val) => <StatusBadge status={val} /> },
  ];

  return (
    <div className="space-y-10">
      {/* Dev Stage Banner */}
      <div className="bg-[#1E3A5F] text-white p-4 rounded-lg shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-l-4 border-l-[#0F766E]">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#0F766E] text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">
              STAGE 1 ONLY
            </span>
            <h2 className="font-bold text-sm tracking-wide">Component Showcase & Design System Verification</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Visual inspection suite for UI components, risk indicators, AI cards, layout frames, and charts.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="teal">React + Vite JS/JSX</Badge>
          <Badge variant="primary">Enterprise Theme</Badge>
        </div>
      </div>

      <PageHeader
        title="Stage 1 — Design System Showcase"
        subtitle="Verification environment for banking operations design tokens, atomic UI primitives, and domain component contracts."
        badge={<Badge variant="primary">Internal Dev Build</Badge>}
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => toast.info('Showcase Info', 'All components rendering properly.')}>
              Trigger Info Toast
            </Button>
            <Button variant="teal" size="sm" onClick={() => setIsModalOpen(true)}>
              Open Demo Modal
            </Button>
          </div>
        }
      />

      {/* SECTION 1: RISK BADGES & GAUGES */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-[#1E3A5F] uppercase tracking-wider border-b border-[#E2E5EA] pb-2">
          1. Risk Badges & Visual Gauges
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 flex flex-col items-center justify-center space-y-3">
            <span className="text-xs font-semibold text-[#6B7280]">LOW Risk Level</span>
            <RiskBadge level="LOW" score={15} />
            <RiskScoreGauge score={15} size="sm" />
          </Card>
          <Card className="p-4 flex flex-col items-center justify-center space-y-3">
            <span className="text-xs font-semibold text-[#6B7280]">MEDIUM Risk Level</span>
            <RiskBadge level="MEDIUM" score={45} />
            <RiskScoreGauge score={45} size="sm" />
          </Card>
          <Card className="p-4 flex flex-col items-center justify-center space-y-3">
            <span className="text-xs font-semibold text-[#6B7280]">HIGH Risk Level</span>
            <RiskBadge level="HIGH" score={78} />
            <RiskScoreGauge score={78} size="md" />
          </Card>
          <Card className="p-4 flex flex-col items-center justify-center space-y-3">
            <span className="text-xs font-semibold text-[#6B7280]">CRITICAL Risk Level</span>
            <RiskBadge level="CRITICAL" score={92} />
            <RiskScoreGauge score={92} size="lg" />
          </Card>
        </div>
      </section>

      {/* SECTION 2: STAT CARDS */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-[#1E3A5F] uppercase tracking-wider border-b border-[#E2E5EA] pb-2">
          2. Metrics & Stat Cards
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Pending SAR Reviews"
            value="142"
            trend="+12%"
            trendDirection="up"
            trendIsPositive={false}
            subtitle="vs prior 7 days"
            icon={Shield}
          />
          <StatCard
            title="Total Transfer Volume"
            value="₹1.84 Crore"
            trend="+8.5%"
            trendDirection="up"
            trendIsPositive={true}
            subtitle="Processed today"
            icon={TrendingUp}
          />
          <StatCard
            title="KYC Reverifications"
            value="38"
            trend="-4%"
            trendDirection="down"
            trendIsPositive={true}
            subtitle="High risk customers"
            icon={Activity}
          />
          <StatCard
            title="Watchlist Matches"
            value="5"
            trend="+2"
            trendDirection="up"
            trendIsPositive={false}
            subtitle="Requires immediate review"
            icon={AlertTriangle}
          />
        </div>
      </section>

      {/* SECTION 3: DOMAIN CARDS (TRANSACTION, CUSTOMER, LOAN, PAYEE) */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-[#1E3A5F] uppercase tracking-wider border-b border-[#E2E5EA] pb-2">
          3. Reusable Workflow Domain Cards
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <TransactionCard
            transaction={mockTransactions[0]}
            onViewDetails={(id) => toast.info('Transaction Action', `Clicked details for ${id}`)}
          />
          <CustomerCard customer={mockCustomers[0]} />
          <LoanCard loan={mockLoans[0]} />
          <PayeeCard payee={mockPayees[0]} />
        </div>
      </section>

      {/* SECTION 4: AI NOTE CARD & OFFICER ACTIONS */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-[#1E3A5F] uppercase tracking-wider border-b border-[#E2E5EA] pb-2">
          4. AI Assistant Card & Compliance Officer Action Bar
        </h3>
        <OfficerActionBar
          onMarkReviewed={() => toast.success('Status Updated', 'Marked transaction as reviewed.')}
          onEscalate={() => setIsConfirmOpen(true)}
          onClear={() => toast.info('Risk Cleared', 'Flag removed with officer justification.')}
          onApprove={() => toast.success('Approved', 'Loan assessment approved.')}
          onDecline={() => toast.error('Declined', 'Transfer declined per AML policy.')}
          onRefer={() => toast.warning('Referred', 'Case referred to Legal & Audit.')}
        />
        <AiNoteCard
          title="Suspicious Transfer Explainer — AI Note Card Foundation"
          note={aiNoteContent}
          onRegenerate={() => toast.info('AI Service', 'Simulated AI regeneration requested.')}
          onCopy={() => toast.success('Clipboard', 'AI Note text copied to clipboard.')}
        />
      </section>

      {/* SECTION 5: RISK REASONS, ALERTS & CHECKLIST */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-[#1E3A5F] uppercase tracking-wider border-b border-[#E2E5EA] pb-2">
          5. Risk Drivers, Alert Banners & Compliance Checklist
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#6B7280]">Risk Reason Cards</h4>
            {mockRiskReasons.slice(0, 2).map((r) => (
              <RiskReasonCard key={r.id} reason={r} />
            ))}
          </div>
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#6B7280]">Alert Banners</h4>
            <AlertCard
              alert={{
                id: 'A-1',
                title: 'High Velocity Transfer Spike',
                description: 'Account ACC-99201482 initiated 4 wires within 2 hours totaling ₹1.2 Crore.',
                severity: 'CRITICAL',
                timestamp: new Date().toISOString(),
              }}
              onDismiss={(id) => toast.info('Alert', `Acknowledged alert ${id}`)}
            />
            <AlertCard
              alert={{
                id: 'A-2',
                title: 'Expired UBO Identification Document',
                description: 'Customer CUST-10482 primary passport document expired.',
                severity: 'HIGH',
                timestamp: new Date().toISOString(),
              }}
            />
          </div>
          <div>
            <RecommendedChecksList
              checks={mockRecommendedChecks}
              onToggleCheck={(id) => toast.info('Checklist', `Toggled check ${id}`)}
            />
          </div>
        </div>
      </section>

      {/* SECTION 6: CHARTS */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-[#1E3A5F] uppercase tracking-wider border-b border-[#E2E5EA] pb-2">
          6. Responsive Analytics Charts (Recharts)
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <TrendLineChart />
          <RiskDistributionDonut />
          <TransactionHistoryBarChart />
        </div>
      </section>

      {/* SECTION 7: DATA TABLE & CONTROLS */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-[#1E3A5F] uppercase tracking-wider border-b border-[#E2E5EA] pb-2">
          7. DataTable, SearchBar & FilterBar
        </h3>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SearchBar value={searchValue} onChange={setSearchValue} />
            <FilterBar
              filters={[
                {
                  key: 'riskLevel',
                  label: 'Risk Level',
                  options: [
                    { label: 'Low Risk', value: 'LOW' },
                    { label: 'High Risk', value: 'HIGH' },
                    { label: 'Critical Risk', value: 'CRITICAL' },
                  ],
                },
                {
                  key: 'status',
                  label: 'Status',
                  options: [
                    { label: 'Flagged', value: 'FLAGGED' },
                    { label: 'Approved', value: 'APPROVED' },
                  ],
                },
              ]}
              activeFilters={filterValues}
              onFilterChange={(k, v) => setFilterValues({ ...filterValues, [k]: v })}
              onReset={() => setFilterValues({})}
            />
          </div>
          <DataTable
            columns={columns}
            data={mockTransactions}
            onRowClick={(row) => toast.info('Table Click', `Selected transaction ${row.transactionId}`)}
          />
        </div>
      </section>

      {/* SECTION 8: SYSTEM STATES (LOADING, EMPTY, ERROR, UNAUTHORIZED) */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-[#1E3A5F] uppercase tracking-wider border-b border-[#E2E5EA] pb-2">
          8. Operational System States (Skeleton Loading, Empty, Error, Unauthorized)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs font-bold text-[#6B7280] mb-2">Skeleton Loading State</h4>
            <LoadingState variant="detail" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#6B7280] mb-2">Empty State</h4>
            <EmptyState
              title="No First-Time Payee Cases"
              description="There are currently no first-time DEBIT counterparty cases under review."
              actionText="Refresh Ledger"
              onAction={() => toast.info('Action', 'Clicked Refresh Ledger')}
            />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#6B7280] mb-2">Error State</h4>
            <ErrorState
              title="Failed to Sync AML Database"
              message="The connection to the central AML compliance ledger timed out."
              onRetry={() => toast.success('Retrying', 'Connecting to database...')}
            />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#6B7280] mb-2">Unauthorized State</h4>
            <UnauthorizedState
              onNavigate={() => toast.info('Navigation', 'Navigated back to Dashboard')}
            />
          </div>
        </div>
      </section>

      {/* SECTION 9: FORM CONTROLS & MODALS */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-[#1E3A5F] uppercase tracking-wider border-b border-[#E2E5EA] pb-2">
          9. Form Controls, Buttons, Modals & Toast Triggers
        </h3>
        <Card className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="Officer ID" placeholder="OFF-88219" defaultValue="OFF-88219" />
            <Input label="Investigation Case #" placeholder="CASE-2026-99" error="Mandatory case ID required" />
            <Select
              label="Escalation Department"
              options={[
                { label: 'Financial Intelligence Unit (FIU)', value: 'FIU' },
                { label: 'Legal & Regulatory Affairs', value: 'LEGAL' },
                { label: 'Senior Risk Committee', value: 'RISK_COMM' },
              ]}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#E2E5EA]">
            <Button variant="primary" onClick={() => toast.success('Success Toast', 'Record updated successfully.')}>
              Trigger Success Toast
            </Button>
            <Button variant="secondary" onClick={() => toast.error('Error Toast', 'Critical SAR validation failed.')}>
              Trigger Error Toast
            </Button>
            <Button variant="teal" onClick={() => toast.warning('Warning Toast', 'Reverification deadline approaching.')}>
              Trigger Warning Toast
            </Button>
            <Button variant="danger" onClick={() => setIsConfirmOpen(true)}>
              Trigger Confirm Dialog
            </Button>
          </div>
        </Card>
      </section>

      {/* Modals for verification */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Compliance Demonstration Modal"
        subtitle="Reusable dialog component with backdrop blur and keyboard escape handler."
      >
        <div className="space-y-4">
          <p className="text-xs text-[#6B7280] leading-relaxed">
            This modal is keyboard accessible, trapping focus and closing on Escape key press.
          </p>
          <Input label="Reason for Escalate" placeholder="Type reason for escalation..." />
          <div className="flex justify-end gap-2 pt-4 border-t border-[#E2E5EA]">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setIsModalOpen(false);
                toast.success('Escalated', 'Case escalated to FIU.');
              }}
            >
              Confirm Escalation
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          setIsConfirmOpen(false);
          toast.error('Escalation Sent', 'Case TXN-908215 has been escalated to senior compliance officers.');
        }}
        title="Confirm SAR Escalation"
        message="Are you sure you want to escalate transaction TXN-908215 to the Financial Intelligence Unit (FIU)? This action will automatically file a draft SAR notification."
        confirmText="Yes, Escalate Case"
        variant="danger"
      />
    </div>
  );
}
