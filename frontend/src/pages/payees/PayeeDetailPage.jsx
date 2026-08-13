import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  UserCheck,
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
  ShieldAlert,
} from 'lucide-react';
import {
  getFirstTimePayeeCaseById,
  getCustomerById,
  getAccountById,
  getCustomerTransactions,
  getPriorDebitsToCounterparty,
  updatePayeeReviewStatus,
} from '../../services/data/csvLoader.js';
import {
  derivePayeeRiskIndicators,
  derivePayeeRecommendedChecks,
} from '../../services/data/payeeRiskIndicators.js';
import { generatePayeeRiskNote } from '../../services/api/aiApi.js';
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

export function PayeeDetailPage() {
  const { txnId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [payeeCase, setPayeeCase] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [account, setAccount] = useState(null);
  const [customerHistory, setCustomerHistory] = useState([]);
  const [priorDebits, setPriorDebits] = useState([]);
  const [caseStatus, setCaseStatus] = useState('PENDING_REVIEW');

  useEffect(() => {
    const loadPayeeCase = async () => {
      try {
        const payee = await getFirstTimePayeeCaseById(txnId);
        setPayeeCase(payee);
        if (payee) {
          const cust = getCustomerById(payee.customer_id);
          setCustomer(cust);
          const acct = getAccountById(payee.account_id);
          setAccount(acct);
          const history = getCustomerTransactions(payee.customer_id);
          setCustomerHistory(history);
          const priors = getPriorDebitsToCounterparty(payee);
          setPriorDebits(priors);
          setCaseStatus(payee.review_status || 'PENDING_REVIEW');
        }
      } catch (err) {
        console.error('Failed to load payee case:', err);
      }
    };

    loadPayeeCase();
  }, [txnId]);

  // Load AI note when payee case is available
  useEffect(() => {
    if (payeeCase) {
      executeRegenerate();
    }
  }, [payeeCase?.txn_id]);

  const indicators = useMemo(() => derivePayeeRiskIndicators(payeeCase), [payeeCase]);
  const recommendedChecks = useMemo(
    () => derivePayeeRecommendedChecks(payeeCase, indicators),
    [payeeCase, indicators]
  );

  const [aiNote, setAiNote] = useState('');
  const [initialGeneratedNote, setInitialGeneratedNote] = useState('');
  const [isEdited, setIsEdited] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiProvider, setAiProvider] = useState(null);
  const [aiFallback, setAiFallback] = useState(false);
  const [isRegenerateConfirmOpen, setIsRegenerateConfirmOpen] = useState(false);
  const inFlightRef = useRef(false);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const canAct = user && hasPermission(user.role, PERMISSIONS.EXECUTE_CASE_ACTION);

  const executeRegenerate = async () => {
    if (!payeeCase || inFlightRef.current) return;
    inFlightRef.current = true;
    setIsAiLoading(true);
    setAiError(null);
    setAiProvider(null);
    setAiFallback(false);
    setIsRegenerateConfirmOpen(false);

    try {
      const res = await generatePayeeRiskNote(payeeCase.txn_id);
      setAiNote(res.content);
      setInitialGeneratedNote(res.content);
      setIsEdited(false);
      setAiProvider(res.provider || null);
      setAiFallback(Boolean(res.fallback));
    } catch (err) {
      setAiError(err.message || 'Failed to generate AI first-time payee risk note. Please retry.');
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
      toast.success('Clipboard', 'AI First-Time Payee Risk Note copied to clipboard.');
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
    if (!pendingAction || !payeeCase) return;

    const { actionName, newStatus } = pendingAction;
    try {
      await updatePayeeReviewStatus(payeeCase.txn_id, newStatus);
      setCaseStatus(newStatus);
      setIsConfirmOpen(false);
      toast.success('Action Logged', `Payee review action '${actionName}' recorded successfully.`);
    } catch (err) {
      console.error('Failed to record action:', err);
      toast.error('Error', 'Failed to record your action. Please try again.');
    }
  };

  if (!payeeCase) {
    return (
      <div className="space-y-6">
        <Button variant="secondary" size="sm" onClick={() => navigate('/payees')}>
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Payee Risk Notes
        </Button>
        <Card className="p-12 text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold text-[#0F172A]">First-Time Payee Case Not Found</h2>
          <p className="text-xs text-[#64748B]">
            Transaction <code className="font-mono bg-slate-100 px-1 py-0.5">{txnId}</code> is not a
            first-time DEBIT payee case in the company ledger (or does not exist).
          </p>
        </Card>
      </div>
    );
  }

  const formattedAmount = formatCurrency(Math.abs(Number(payeeCase.amount) || 0));

  return (
    <div className="space-y-8 pb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-[#64748B]">
          <Link to="/payees" className="hover:text-[#0B192C] hover:underline font-semibold">
            Payee Risk Notes
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-mono font-bold text-[#0F172A]">{payeeCase.txn_id}</span>
        </div>

        <Button variant="secondary" size="sm" onClick={() => navigate('/payees')} className="text-xs font-bold">
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to First-Time Payees
        </Button>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 corporate-card-shadow space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-[#64748B]">
              FIRST-TIME PAYEE WORKSTATION
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-extrabold text-[#0B192C] font-mono tracking-tight">
                {payeeCase.txn_id}
              </h1>
              <Badge variant="navy" className="text-xs px-3 py-1 font-bold">
                FIRST-TIME PAYEE
              </Badge>
              {payeeCase.is_suspicious === 'Y' ? (
                <Badge variant="danger" className="text-xs px-3 py-1 font-bold">
                  FLAGGED SUSPICIOUS (Y)
                </Badge>
              ) : (
                <Badge variant="teal" className="text-xs px-3 py-1 font-bold">
                  NORMAL (N)
                </Badge>
              )}
              <span className="px-2.5 py-1 text-[10px] font-extrabold bg-slate-100 text-slate-800 border border-slate-200 rounded-md uppercase">
                Review: {caseStatus}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-[#64748B] uppercase block">Transfer Value</span>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-[#0F172A]">-{formattedAmount}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[10px] font-bold text-[#64748B] uppercase">Payee Counterparty</span>
            <p className="font-bold text-[#0F172A] mt-0.5 truncate">{payeeCase.counterparty || 'N/A'}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#64748B] uppercase">Channel Rail</span>
            <p className="font-mono font-bold text-[#0B192C] mt-0.5">{payeeCase.channel}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#64748B] uppercase">Customer ID</span>
            <p className="font-mono font-bold text-[#0F172A] mt-0.5">{payeeCase.customer_id}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#64748B] uppercase">Account ID</span>
            <p className="font-mono font-bold text-[#0F172A] mt-0.5">{payeeCase.account_id}</p>
          </div>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-950 flex items-start gap-2">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            First-time status means no earlier DEBIT exists for this customer_id + counterparty
            combination. It is a derived ledger signal and does <strong>not</strong> by itself prove
            fraud or require treating the transfer as suspicious.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#0B192C]" />
                <h3 className="text-xs font-bold text-[#0B192C] uppercase tracking-wider">
                  Transaction Evidence
                </h3>
              </div>
              <span className="text-[11px] font-mono font-bold text-[#64748B]">TXN ID: {payeeCase.txn_id}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-[#E2E8F0]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Transfer Amount</span>
                <p className="text-base font-extrabold font-mono mt-0.5 text-[#0F172A]">-{formattedAmount}</p>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-[#E2E8F0]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Direction</span>
                <p className="text-xs font-bold text-[#0F172A] mt-1">{payeeCase.txn_type}</p>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-[#E2E8F0]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Channel Rail</span>
                <p className="text-xs font-mono font-bold text-[#0B192C] mt-1">{payeeCase.channel}</p>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-[#E2E8F0]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Txn Date</span>
                <p className="text-xs font-semibold text-[#0F172A] mt-1">{payeeCase.txn_date}</p>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-[#E2E8F0]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Value Date</span>
                <p className="text-xs font-semibold text-[#0F172A] mt-1">{payeeCase.value_date}</p>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-[#E2E8F0]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Ground Truth Flag</span>
                <p
                  className={`text-xs font-bold mt-1 ${
                    payeeCase.is_suspicious === 'Y' ? 'text-red-700' : 'text-emerald-700'
                  }`}
                >
                  {payeeCase.is_suspicious === 'Y' ? 'Suspicious (Y)' : 'Normal (N)'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#E2E8F0]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#64748B]">Narrative / Remark</span>
                <p className="text-xs font-medium text-[#0F172A] mt-0.5">{payeeCase.narrative || 'N/A'}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#64748B]">
                  Prior DEBITs to Counterparty
                </span>
                <p className="text-xs font-bold text-[#0F766E] mt-0.5">
                  {priorDebits.length} (must be 0 for first-time cases)
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#0B192C]" />
                <h3 className="text-xs font-bold text-[#0B192C] uppercase tracking-wider">
                  Payee / Counterparty Information
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-[#E2E8F0]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">
                  Counterparty (Payee Identity)
                </span>
                <p className="text-sm font-extrabold font-mono text-[#0B192C] mt-0.5">
                  {payeeCase.counterparty || 'Not available in supplied data'}
                </p>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-[#E2E8F0]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">First-Time Derived Flag</span>
                <p className="text-xs font-bold text-amber-800 mt-1">YES — Derived Indicator</p>
              </div>
            </div>

            <ul className="text-[11px] text-[#475569] space-y-1 list-disc list-inside border-t border-[#E2E8F0] pt-3">
              <li>Payee bank name / SWIFT / BIC: <strong>Not available in supplied data.</strong></li>
              <li>Payee country / jurisdiction: <strong>Not available in supplied data.</strong></li>
              <li>Sanctions / watchlist screening: <strong>Not available in supplied data.</strong></li>
              <li>Static payee risk score: <strong>Not available in supplied data.</strong></li>
            </ul>
          </Card>

          <Card className="p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#0B192C]" />
                <h3 className="text-xs font-bold text-[#0B192C] uppercase tracking-wider">Customer Context</h3>
              </div>
              <span className="text-[11px] font-mono font-bold text-[#64748B]">
                CUST ID: {payeeCase.customer_id}
              </span>
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
                  <span className="text-[10px] font-bold text-[#64748B] uppercase">Nationality / Residence</span>
                  <p className="text-xs font-medium text-[#0F172A] mt-0.5">
                    {customer.nationality} / {customer.residence}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#64748B] italic">Customer record not available in supplied data.</p>
            )}
          </Card>

          <Card className="p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#0B192C]" />
                <h3 className="text-xs font-bold text-[#0B192C] uppercase tracking-wider">Account Context</h3>
              </div>
              <span className="text-[11px] font-mono font-bold text-[#64748B]">
                ACC ID: {payeeCase.account_id}
              </span>
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
                  <p
                    className={`text-xs font-bold mt-0.5 ${
                      account.posting_restrict ? 'text-amber-800 font-mono' : 'text-[#64748B]'
                    }`}
                  >
                    {account.posting_restrict || 'None'}
                  </p>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-[#E2E8F0]">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase">Product / Currency</span>
                  <p className="text-xs font-medium text-[#0F172A] mt-0.5">
                    {account.product} / {account.currency}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#64748B] italic">Account record not available in supplied data.</p>
            )}
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="text-xs font-bold text-[#0B192C] uppercase tracking-wider border-b border-[#E2E8F0] pb-3">
              Customer Ledger History ({customerHistory.length} Total Txns)
            </h3>
            <div className="max-h-56 overflow-y-auto divide-y divide-[#E2E8F0] text-xs">
              {customerHistory.map((h) => (
                <div
                  key={h.txn_id}
                  className={`py-2.5 px-3 flex items-center justify-between transition-colors ${
                    h.txn_id === payeeCase.txn_id
                      ? 'bg-amber-50 font-bold border-l-3 border-l-amber-500 rounded'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-[11px] text-[#0B192C]">{h.txn_id}</span>
                    <span className="text-[#64748B] text-[11px]">{h.txn_date}</span>
                    <span className="text-[11px] font-bold text-[#0F172A] truncate max-w-[140px]">
                      {h.counterparty}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-xs">
                      {formatCurrency(Math.abs(h.amount))}
                    </span>
                    {h.is_suspicious === 'Y' && (
                      <span className="px-1.5 py-0.2 text-[9px] bg-red-100 text-red-800 rounded font-extrabold">
                        Y
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 space-y-4 border-t-4 border-t-[#0B192C]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-xs font-bold text-[#0B192C] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                Derived Risk Indicators
              </h3>
              <span className="text-[10px] font-bold text-[#0F766E] bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                Derived Indicator
              </span>
            </div>

            <div className="space-y-2.5">
              {indicators.length === 0 ? (
                <p className="text-xs text-[#64748B] italic">No elevated derived indicators for this case.</p>
              ) : (
                indicators.map((ind) => (
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
                ))
              )}
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="text-xs font-bold text-[#0B192C] uppercase tracking-wider border-b border-[#E2E8F0] pb-3">
              Recommended Checks
            </h3>
            <RecommendedChecksList checks={recommendedChecks} />
          </Card>

          <Card className="p-6 space-y-4 border-l-4 border-l-[#0F766E] bg-white corporate-card-shadow">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0F766E]" />
                <h3 className="text-xs font-bold text-[#0B192C] uppercase tracking-wider">
                  AI First-Time Payee Risk Note
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
                This note is AI-assisted and grounded only in supplied company ledger evidence. A human
                officer must review before action. Missing payee bank/SWIFT/watchlist data is stated as
                unavailable — not invented.
              </p>
            </div>

            {isAiLoading ? (
              <div className="p-8 text-center space-y-3 bg-slate-50 rounded-xl border border-[#E2E8F0]">
                <div className="w-6 h-6 border-2 border-[#0F766E]/20 border-t-[#0F766E] rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold text-[#0B192C]">Drafting Grounded Payee Risk Note...</p>
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
                    setIsEdited(val !== initialGeneratedNote);
                  }}
                  rows={14}
                  className="w-full p-3.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs font-mono text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] leading-relaxed resize-y"
                  placeholder="AI First-Time Payee Risk Note will appear here..."
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

          <Card className="p-6 space-y-4 border-t-2 border-t-[#0B192C]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
              <h3 className="text-xs font-bold text-[#0B192C] uppercase tracking-wider">
                Human Payee Review Decision
              </h3>
              <span className="text-[10px] font-mono text-[#64748B]">Assigned Role: {user?.role}</span>
            </div>

            {canAct ? (
              <div className="space-y-3">
                <p className="text-xs text-[#64748B] leading-normal">
                  Select an action for transaction {payeeCase.txn_id}. Decisions are logged to the audit
                  trail against your authenticated employee ID.
                </p>

                <div className="grid grid-cols-2 gap-2.5">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleOfficerAction('Mark Reviewed', 'REVIEWED')}
                    className="text-xs font-bold"
                  >
                    Mark Reviewed
                  </Button>
                  <Button
                    variant="teal"
                    size="sm"
                    onClick={() => handleOfficerAction('Clear Risk', 'CLEARED')}
                    className="text-xs font-bold"
                  >
                    Clear Risk
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleOfficerAction('Hold Transfer', 'HELD')}
                    className="text-xs font-bold"
                  >
                    Hold Transfer
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleOfficerAction('Escalate Case', 'ESCALATED')}
                    className="text-xs font-bold"
                  >
                    Escalate Case
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-100 rounded-lg text-xs text-slate-700 flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                <p>
                  Read-Only Access: Your assigned role ({user?.role}) does not have execution rights for
                  case actions.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmAction}
        title={`Confirm Action: ${pendingAction?.actionName}`}
        message={`Are you sure you want to execute '${pendingAction?.actionName}' for transaction ${payeeCase.txn_id}? This will update the review status and create an audit record.`}
        confirmText="Confirm Action"
        variant={pendingAction?.actionName === 'Escalate Case' ? 'danger' : 'primary'}
      />

      <ConfirmDialog
        isOpen={isRegenerateConfirmOpen}
        onClose={() => setIsRegenerateConfirmOpen(false)}
        onConfirm={executeRegenerate}
        isLoading={isAiLoading}
        title="Regenerate AI First-Time Payee Risk Note?"
        message="Your current edits will be replaced by a newly generated AI draft."
        confirmText="Regenerate"
        variant="warning"
      />
    </div>
  );
}
