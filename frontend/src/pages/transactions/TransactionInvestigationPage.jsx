import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShieldAlert,
  ArrowLeft,
  User,
  Building2,
  CreditCard,
  AlertTriangle,
  Copy,
  RefreshCw,
  Sparkles,
  Lock,
  ChevronRight,
  Info,
} from 'lucide-react';
import {
  getTransactionById,
  getCustomerById,
  getAccountById,
  getCustomerTransactions,
} from '../../services/data/csvLoader.js';
import { deriveRiskIndicators, deriveRecommendedChecks } from '../../services/data/riskIndicators.js';
import { generateInvestigationNote } from '../../services/api/aiApi.js';
import { recordAuditEvent, resolveE1CaseStatus } from '../../services/audit/auditService.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { hasPermission, PERMISSIONS } from '../../config/permissions.js';
import { formatCurrency } from '../../utils/formatCurrency.js';

import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { RecommendedChecksList } from '../../components/domain/RecommendedChecksList.jsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx';

function renderCaseStatusBadge(status) {
  const base = 'inline-flex items-center px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase rounded border';

  if (status === 'ESCALATED') {
    return <span className={`${base} bg-amber-50 text-amber-900 border-amber-200`}>Escalated</span>;
  }
  if (status === 'REVIEWED') {
    return <span className={`${base} bg-slate-100 text-slate-700 border-slate-200`}>Reviewed</span>;
  }
  if (status === 'CLEARED') {
    return <span className={`${base} bg-emerald-50 text-emerald-800 border-emerald-200`}>Cleared</span>;
  }
  if (status === 'REFERRED') {
    return <span className={`${base} bg-amber-50 text-amber-800 border-amber-200`}>Referred</span>;
  }
  if (status === 'FLAGGED') {
    return <span className={`${base} bg-slate-50 text-[#0B192C] border-[#E2E8F0]`}>Flagged</span>;
  }
  return <span className={`${base} bg-slate-50 text-slate-600 border-[#E2E8F0]`}>Normal</span>;
}

function isRecordedOfficerAction(status) {
  return ['REVIEWED', 'CLEARED', 'ESCALATED', 'REFERRED'].includes(status);
}

function officerActionButtonClass(isActive) {
  return isActive
    ? 'text-xs font-bold ring-2 ring-[#0B192C]/30 ring-offset-1 border border-[#0B192C]'
    : 'text-xs font-bold';
}

export function TransactionInvestigationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [transaction, setTransaction] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [account, setAccount] = useState(null);
  const [customerHistory, setCustomerHistory] = useState([]);
  const [caseStatus, setCaseStatus] = useState('NORMAL');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    const loadTransaction = async () => {
      try {
        const txn = getTransactionById(id);
        setTransaction(txn);
        if (txn) {
          const cust = getCustomerById(txn.customer_id);
          setCustomer(cust);
          const acct = getAccountById(txn.account_id);
          setAccount(acct);
          const history = getCustomerTransactions(txn.customer_id);
          setCustomerHistory(history);
          const status = await resolveE1CaseStatus(txn);
          setCaseStatus(status);
        }
      } catch (err) {
        console.error('Failed to load transaction:', err);
      }
    };

    loadTransaction();
  }, [id]);

  // Derived Risk Indicators & Recommended Checks
  const indicators = useMemo(() => deriveRiskIndicators(transaction), [transaction]);
  const recommendedChecks = useMemo(() => deriveRecommendedChecks(transaction, indicators), [transaction, indicators]);

  // AI Note state
  const [aiNote, setAiNote] = useState('');
  const [initialGeneratedNote, setInitialGeneratedNote] = useState('');
  const [isEdited, setIsEdited] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiProvider, setAiProvider] = useState(null);
  const [aiFallback, setAiFallback] = useState(false);
  const [isRegenerateConfirmOpen, setIsRegenerateConfirmOpen] = useState(false);
  const inFlightRef = useRef(false);

  // Check RBAC permission for executing case actions
  const canAct = user && hasPermission(user.role, PERMISSIONS.EXECUTE_CASE_ACTION);

  // Load AI Note automatically when transaction is available
  useEffect(() => {
    if (transaction) {
      executeRegenerate();
    }
  }, [transaction?.txn_id]);

  const executeRegenerate = async () => {
    if (!transaction || inFlightRef.current) return;
    inFlightRef.current = true;
    setIsAiLoading(true);
    setAiError(null);
    setAiProvider(null);
    setAiFallback(false);
    setIsRegenerateConfirmOpen(false);

    try {
      const res = await generateInvestigationNote(transaction.txn_id);
      setAiNote(res.content);
      setInitialGeneratedNote(res.content);
      setIsEdited(false);
      setAiProvider(res.provider || null);
      setAiFallback(Boolean(res.fallback));
    } catch (err) {
      setAiError(err.message || 'Failed to generate AI investigation note. Please retry.');
    } finally {
      setIsAiLoading(false);
      inFlightRef.current = false;
    }
  };

  const handleRegenerateClick = () => {
    if (isAiLoading || inFlightRef.current) return;
    if (isEdited) {
      setIsRegenerateConfirmOpen(true);
    } else {
      executeRegenerate();
    }
  };

  const handleCopyNote = () => {
    if (aiNote) {
      navigator.clipboard.writeText(aiNote);
      toast.success('Clipboard', 'AI Investigation Note copied to clipboard.');
    }
  };

  const handleOfficerAction = (actionName, newStatus) => {
    if (!canAct) {
      toast.error('Permission Denied', 'Your role does not have permission to take case actions.');
      return;
    }

    setPendingAction({ actionName, newStatus });
    setIsConfirmOpen(true);
  };

  const confirmAction = async () => {
    if (!pendingAction || !transaction) return;

    const { actionName, newStatus } = pendingAction;
    const prevStatus = caseStatus;

    try {
      // Persist via existing E1 audit architecture (source of truth for action status)
      await recordAuditEvent({
        txnId: transaction.txn_id,
        action: actionName,
        actingUser: user,
        previousStatus: prevStatus,
        newStatus: newStatus,
      });

      setCaseStatus(newStatus);
      setIsConfirmOpen(false);
      toast.success('Action Logged', `Transaction investigation action '${actionName}' recorded in audit log.`);
    } catch (err) {
      console.error('Failed to record action:', err);
      toast.error('Error', 'Failed to record your action. Please try again.');
    }
  };

  if (!transaction) {
    return (
      <div className="space-y-6">
        <Button variant="secondary" size="sm" onClick={() => navigate('/transactions')}>
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Operations
        </Button>
        <Card className="p-12 text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold text-[#0F172A]">Transaction Not Found</h2>
          <p className="text-xs text-[#64748B]">
            The requested transaction <code className="font-mono bg-slate-100 px-1 py-0.5">{id}</code> does not exist in the company ledger.
          </p>
        </Card>
      </div>
    );
  }

  const isDebit = transaction.txn_type === 'DEBIT' || transaction.amount < 0;
  const formattedAmount = formatCurrency(Math.abs(transaction.amount));

  return (
    <div className="space-y-8 pb-8">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-[#64748B]">
          <Link to="/transactions" className="hover:text-[#0B192C] hover:underline font-semibold">
            Operations
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-mono font-bold text-[#0F172A]">{transaction.txn_id}</span>
        </div>

        <Button variant="secondary" size="sm" onClick={() => navigate('/transactions')} className="text-xs font-bold">
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Operations Ledger
        </Button>
      </div>

      {/* Institutional Investigation Header */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 corporate-card-shadow space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-[#64748B]">INVESTIGATION WORKSTATION</span>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-[#0B192C] font-mono tracking-tight">{transaction.txn_id}</h1>
              {transaction.is_suspicious === 'Y' ? (
                <Badge variant="danger" className="text-xs px-3 py-1 font-bold">FLAGGED SUSPICIOUS (Y)</Badge>
              ) : (
                <Badge variant="teal" className="text-xs px-3 py-1 font-bold">NORMAL (N)</Badge>
              )}
              {renderCaseStatusBadge(caseStatus)}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-[#64748B] uppercase block">Transfer Value</span>
            <p className={`text-2xl sm:text-3xl font-extrabold font-mono ${isDebit ? 'text-[#0F172A]' : 'text-emerald-700'}`}>
              {isDebit ? '-' : '+'}{formattedAmount}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[10px] font-bold text-[#64748B] uppercase">Counterparty</span>
            <p className="font-bold text-[#0F172A] mt-0.5 truncate">{transaction.counterparty || 'N/A'}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#64748B] uppercase">Channel Rail</span>
            <p className="font-mono font-bold text-[#0B192C] mt-0.5">{transaction.channel}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#64748B] uppercase">Customer ID</span>
            <p className="font-mono font-bold text-[#0F172A] mt-0.5">{transaction.customer_id}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#64748B] uppercase">Account ID</span>
            <p className="font-mono font-bold text-[#0F172A] mt-0.5">{transaction.account_id}</p>
          </div>
        </div>
      </div>

      {/* Institutional Two-Column Workstation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN (60%): FACTUAL EVIDENCE */}
        <div className="lg:col-span-7 space-y-6">
          {/* Transaction Evidence Card */}
          <Card className="p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#0B192C]" />
                <h3 className="text-xs font-bold text-[#0B192C] uppercase tracking-wider">
                  Transaction Evidence
                </h3>
              </div>
              <span className="text-[11px] font-mono font-bold text-[#64748B]">TXN ID: {transaction.txn_id}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-[#E2E8F0]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Transfer Amount</span>
                <p className={`text-base font-extrabold font-mono mt-0.5 ${isDebit ? 'text-[#0F172A]' : 'text-emerald-700'}`}>
                  {isDebit ? '-' : '+'}{formattedAmount}
                </p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-[#E2E8F0]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Direction</span>
                <p className="text-xs font-bold text-[#0F172A] mt-1">{transaction.txn_type}</p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-[#E2E8F0]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Channel Rail</span>
                <p className="text-xs font-mono font-bold text-[#0B192C] mt-1">{transaction.channel}</p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-[#E2E8F0]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Txn Date</span>
                <p className="text-xs font-semibold text-[#0F172A] mt-1">{transaction.txn_date}</p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-[#E2E8F0]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Value Date</span>
                <p className="text-xs font-semibold text-[#0F172A] mt-1">{transaction.value_date}</p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-[#E2E8F0]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Ground Truth Flag</span>
                <p className={`text-xs font-bold mt-1 ${transaction.is_suspicious === 'Y' ? 'text-red-700' : 'text-emerald-700'}`}>
                  {transaction.is_suspicious === 'Y' ? 'Suspicious (Y)' : 'Normal (N)'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#E2E8F0]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#64748B]">Beneficiary Counterparty</span>
                <p className="text-xs font-bold text-[#0F172A] mt-0.5">{transaction.counterparty || 'N/A'}</p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-[#64748B]">Narrative / Remark</span>
                <p className="text-xs font-medium text-[#0F172A] mt-0.5">{transaction.narrative || 'N/A'}</p>
              </div>
            </div>
          </Card>

          {/* Customer Context Card */}
          <Card className="p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#0B192C]" />
                <h3 className="text-xs font-bold text-[#0B192C] uppercase tracking-wider">
                  Customer Context
                </h3>
              </div>
              <span className="text-[11px] font-mono font-bold text-[#64748B]">CUST ID: {transaction.customer_id}</span>
            </div>

            {customer ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-[#E2E8F0]">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase">Customer Name</span>
                  <p className="text-xs font-bold text-[#0F172A] mt-0.5">{customer.name_1}</p>
                  <span className="text-[10px] text-[#64748B]">{customer.mnemonic}</span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-[#E2E8F0]">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase">KYC Status</span>
                  <div className="mt-1">
                    <StatusBadge status={customer.kyc_status} />
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-[#E2E8F0]">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase">Monthly Income</span>
                  <p className="text-xs font-bold font-mono text-[#0F172A] mt-0.5">
                    {formatCurrency(customer.monthly_income)}
                  </p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-[#E2E8F0]">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase">Employment Type</span>
                  <p className="text-xs font-semibold text-[#0F172A] mt-0.5">{customer.employment_type}</p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-[#E2E8F0]">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase">Town / Country</span>
                  <p className="text-xs font-semibold text-[#0F172A] mt-0.5">{customer.town_country}</p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-[#E2E8F0]">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase">Date of Birth</span>
                  <p className="text-xs font-medium text-[#0F172A] mt-0.5">{customer.date_of_birth}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#64748B] italic">Customer record not available in supplied data.</p>
            )}
          </Card>

          {/* Account Context Card */}
          <Card className="p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#0B192C]" />
                <h3 className="text-xs font-bold text-[#0B192C] uppercase tracking-wider">
                  Account Context
                </h3>
              </div>
              <span className="text-[11px] font-mono font-bold text-[#64748B]">ACC ID: {transaction.account_id}</span>
            </div>

            {account ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-[#E2E8F0]">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase">Account Title</span>
                  <p className="text-xs font-bold text-[#0F172A] mt-0.5 truncate">{account.account_title}</p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-[#E2E8F0]">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase">Working Balance</span>
                  <p className="text-xs font-bold font-mono text-[#0B192C] mt-0.5">
                    {formatCurrency(account.working_balance)}
                  </p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-[#E2E8F0]">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase">Posting Restrict</span>
                  <p className={`text-xs font-bold mt-0.5 ${account.posting_restrict ? 'text-amber-800 font-mono' : 'text-[#64748B]'}`}>
                    {account.posting_restrict || 'None'}
                  </p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-[#E2E8F0]">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase">Opening Date</span>
                  <p className="text-xs font-medium text-[#0F172A] mt-0.5">{account.opening_date}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#64748B] italic">Account record not available in supplied data.</p>
            )}
          </Card>

          {/* Historical Transactions Ledger Context */}
          <Card className="p-6 space-y-4">
            <h3 className="text-xs font-bold text-[#0B192C] uppercase tracking-wider border-b border-[#E2E8F0] pb-3">
              Customer Ledger History ({customerHistory.length} Total Txns)
            </h3>
            <div className="max-h-56 overflow-y-auto divide-y divide-[#E2E8F0] text-xs">
              {customerHistory.map((h) => (
                <div
                  key={h.txn_id}
                  className={`py-2.5 px-3 flex items-center justify-between transition-colors ${
                    h.txn_id === transaction.txn_id ? 'bg-amber-50 font-bold border-l-3 border-l-amber-500 rounded' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-[11px] text-[#0B192C]">{h.txn_id}</span>
                    <span className="text-[#64748B] text-[11px]">{h.txn_date}</span>
                    <span className="text-[11px] font-bold text-[#0F172A] truncate max-w-[140px]">{h.counterparty}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-xs">{formatCurrency(Math.abs(h.amount))}</span>
                    {h.is_suspicious === 'Y' && (
                      <span className="px-1.5 py-0.2 text-[9px] bg-red-100 text-red-800 rounded font-extrabold">Y</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN (40%): RISK INDICATORS, RECOMMENDED CHECKS, AI NOTE & OFFICER ACTIONS */}
        <div className="lg:col-span-5 space-y-6">
          {/* Ground-Truth & Derived Risk Indicators */}
          <Card className="p-6 space-y-4 border-t-4 border-t-[#0B192C]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-xs font-bold text-[#0B192C] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                Derived Risk Indicators
              </h3>
              <span className="text-[10px] font-bold text-[#0F766E] bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                Factual Derivations
              </span>
            </div>

            <div className="space-y-2.5">
              {indicators.map((ind) => (
                <div
                  key={ind.id}
                  className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                    ind.severity === 'CRITICAL'
                      ? 'bg-red-50/80 border-red-200 text-red-950'
                      : ind.severity === 'HIGH'
                      ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{ind.label}</span>
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 bg-black/10 rounded font-extrabold">
                      {ind.type}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-90 leading-normal">{ind.description}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Recommended Verification Checks */}
          <Card className="p-6 space-y-4">
            <h3 className="text-xs font-bold text-[#0B192C] uppercase tracking-wider border-b border-[#E2E8F0] pb-3">
              Recommended Checks
            </h3>
            <RecommendedChecksList checks={recommendedChecks} />
          </Card>

          {/* AI Investigation Note Card */}
          <Card className="p-6 space-y-4 border-l-4 border-l-[#0F766E] bg-white corporate-card-shadow">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0F766E]" />
                <h3 className="text-xs font-bold text-[#0B192C] uppercase tracking-wider">
                  AI Investigation Note
                </h3>
              </div>

              <div className="flex flex-col items-end gap-1">
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
                This note is AI-assisted and generated strictly from observed ledger evidence. A human compliance officer must review and edit before finalizing.
              </p>
            </div>

            {isAiLoading ? (
              <div className="p-8 text-center space-y-3 bg-slate-50 rounded-xl border border-[#E2E8F0]">
                <div className="w-6 h-6 border-2 border-[#0F766E]/20 border-t-[#0F766E] rounded-full animate-spin mx-auto"></div>
                <p className="text-xs font-bold text-[#0B192C]">Constructing Grounded Investigation Note...</p>
              </div>
            ) : aiError ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 space-y-3">
                <p className="font-semibold leading-relaxed">{aiError}</p>
                <Button variant="secondary" size="sm" onClick={executeRegenerate} disabled={isAiLoading} className="text-xs font-bold">
                  Retry Generation
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <textarea
                  value={aiNote}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAiNote(val);
                    if (val !== initialGeneratedNote) {
                      setIsEdited(true);
                    } else {
                      setIsEdited(false);
                    }
                  }}
                  rows={14}
                  className="w-full p-3.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs font-mono text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] leading-relaxed resize-y"
                  placeholder="AI investigation note will appear here..."
                />

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-[#64748B] font-medium">Editable Note Text</span>
                    {isEdited && (
                      <span className="text-[9px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                        Manually Edited
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" onClick={handleCopyNote} className="text-xs py-1 px-2.5 font-bold">
                      <Copy className="w-3.5 h-3.5 mr-1" /> Copy Note
                    </Button>

                    <Button variant="teal" size="sm" onClick={handleRegenerateClick} disabled={isAiLoading} className="text-xs py-1 px-2.5 font-bold">
                      <RefreshCw className="w-3.5 h-3.5 mr-1" /> Regenerate
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Officer Compliance Action */}
          <Card className="p-5 space-y-4 border border-[#E2E8F0]">
            <div className="flex items-start justify-between gap-3 border-b border-[#E2E8F0] pb-3">
              <div className="space-y-1 min-w-0">
                <h3 className="text-xs font-bold text-[#0B192C] uppercase tracking-wider">
                  Officer Compliance Action
                </h3>
                <p className="text-[10px] text-[#64748B]">
                  Assigned Role: <span className="font-mono font-semibold text-[#0F172A]">{user?.role}</span>
                </p>
              </div>
              {renderCaseStatusBadge(caseStatus)}
            </div>

            <div className="space-y-1">
              <p className="text-xs text-[#0F172A]">
                Transaction <span className="font-mono font-semibold text-[#0B192C]">{transaction.txn_id}</span>
              </p>
              {isRecordedOfficerAction(caseStatus) ? (
                <p className="text-[11px] text-[#64748B] leading-relaxed">
                  Officer action has been recorded in the compliance audit trail.
                </p>
              ) : (
                <p className="text-[11px] text-[#64748B] leading-relaxed">
                  Select a compliance action for this case. Decisions are logged to the audit trail.
                </p>
              )}
            </div>

            {canAct ? (
              <div className="space-y-3 pt-1">
                <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                  Available Compliance Actions
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleOfficerAction('Mark Reviewed', 'REVIEWED')}
                    className={officerActionButtonClass(caseStatus === 'REVIEWED')}
                  >
                    Mark Reviewed
                  </Button>

                  <Button
                    variant="teal"
                    size="sm"
                    onClick={() => handleOfficerAction('Clear Flag', 'CLEARED')}
                    className={officerActionButtonClass(caseStatus === 'CLEARED')}
                  >
                    Clear Flag
                  </Button>

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleOfficerAction('Escalate Case', 'ESCALATED')}
                    className={officerActionButtonClass(caseStatus === 'ESCALATED')}
                  >
                    Escalate Case
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleOfficerAction('Refer for Review', 'REFERRED')}
                    className={officerActionButtonClass(caseStatus === 'REFERRED')}
                  >
                    Refer for Review
                  </Button>
                </div>

                {isRecordedOfficerAction(caseStatus) && (
                  <p className="text-[10px] text-[#0F766E] font-medium pt-0.5">
                    Action recorded · Audit trail updated
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-[11px] text-[#64748B] pt-1">
                <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <p>Read-only access for role {user?.role}. Case actions are not available.</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Action Confirmation Modal */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmAction}
        title={`Confirm Action: ${pendingAction?.actionName}`}
        message={`Are you sure you want to execute '${pendingAction?.actionName}' for transaction ${transaction.txn_id}? This action will update the compliance status and create an immutable audit record.`}
        confirmText="Confirm Action"
        variant={pendingAction?.actionName === 'Escalate Case' ? 'danger' : 'primary'}
      />

      {/* Regenerate AI Note Confirmation Modal */}
      <ConfirmDialog
        isOpen={isRegenerateConfirmOpen}
        onClose={() => setIsRegenerateConfirmOpen(false)}
        onConfirm={executeRegenerate}
        isLoading={isAiLoading}
        title="Regenerate AI Note?"
        message="Your current edits will be replaced by a newly generated AI draft."
        confirmText="Regenerate"
        variant="warning"
      />
    </div>
  );
}
