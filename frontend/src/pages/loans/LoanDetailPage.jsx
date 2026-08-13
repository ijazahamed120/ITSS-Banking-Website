import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  User,
  Building2,
  AlertTriangle,
  Copy,
  RefreshCw,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  Info,
  CheckCircle2,
  XCircle,
  Clock,
  Lock,
  Percent,
} from 'lucide-react';
import {
  getLoanApplicationById,
  getCustomerById,
  getCustomerAccounts,
  updateLoanDecision,
} from '../../services/data/csvLoader.js';
import { generateLoanDecisionNote } from '../../services/api/aiApi.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { hasPermission, PERMISSIONS } from '../../config/permissions.js';

import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx';

export function LoanDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [application, setApplication] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    const loadApplication = async () => {
      try {
        const app = await getLoanApplicationById(id);
        setApplication(app);
        if (app) {
          const cust = getCustomerById(app.customer_id);
          setCustomer(cust);
          const accts = cust ? getCustomerAccounts(cust.customer_id) : [];
          setAccounts(accts);
          setDecisionState(app.decision_label || 'REFER');
        }
      } catch (err) {
        console.error('Failed to load loan application:', err);
      }
    };

    loadApplication();
  }, [id]);

  // AI Note state
  const [aiNote, setAiNote] = useState('');
  const [initialGeneratedNote, setInitialGeneratedNote] = useState('');
  const [isEdited, setIsEdited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [aiProvider, setAiProvider] = useState(null);
  const [aiFallback, setAiFallback] = useState(false);
  const [isRegenerateConfirmOpen, setIsRegenerateConfirmOpen] = useState(false);
  const inFlightRef = useRef(false);

  // Decision State
  const [decisionState, setDecisionState] = useState('REFER');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingDecision, setPendingDecision] = useState(null);

  const canAct = user && hasPermission(user.role, PERMISSIONS.EXECUTE_CASE_ACTION);

  // Load AI Note on mount
  useEffect(() => {
    if (application) {
      executeRegenerate();
    }
  }, [id]);

  const executeRegenerate = async () => {
    if (!application || inFlightRef.current) return;
    inFlightRef.current = true;
    setIsLoading(true);
    setApiError(null);
    setAiProvider(null);
    setAiFallback(false);
    setIsRegenerateConfirmOpen(false);

    try {
      const res = await generateLoanDecisionNote(application.application_id);
      setAiNote(res.content);
      setInitialGeneratedNote(res.content);
      setIsEdited(false);
      setAiProvider(res.provider || null);
      setAiFallback(Boolean(res.fallback));
    } catch (err) {
      setApiError(err.message || 'Failed to generate AI loan decision note. Please retry.');
    } finally {
      setIsLoading(false);
      inFlightRef.current = false;
    }
  };

  const handleRegenerateClick = () => {
    if (isLoading || inFlightRef.current) return;
    if (isEdited) {
      setIsRegenerateConfirmOpen(true);
    } else {
      executeRegenerate();
    }
  };

  const handleCopyNote = () => {
    if (aiNote) {
      navigator.clipboard.writeText(aiNote);
      toast.success('Clipboard', 'AI Loan Decision Note copied to clipboard.');
    }
  };

  const handleOfficerDecision = (decisionType) => {
    if (!canAct) {
      toast.error('Permission Denied', 'Your assigned role does not have permission to execute loan decisions.');
      return;
    }
    setPendingDecision(decisionType);
    setIsConfirmOpen(true);
  };

  const confirmOfficerDecision = async () => {
    if (!pendingDecision || !application) return;

    let targetStatus = pendingDecision;
    if (pendingDecision === 'APPROVE') targetStatus = 'APPROVED';
    else if (pendingDecision === 'REFER') targetStatus = 'REFER_FOR_REVIEW';
    else if (pendingDecision === 'REJECT') targetStatus = 'REJECTED';

    try {
      await updateLoanDecision(application.application_id, targetStatus);
      setDecisionState(targetStatus);
      setIsConfirmOpen(false);
      toast.success('Decision Logged', `Loan decision '${targetStatus}' recorded successfully.`);
      navigate('/loans');
    } catch (err) {
      console.error('Failed to record decision:', err);
      toast.error('Error', 'Failed to record your decision. Please try again.');
    }
  };

  if (!application) {
    return (
      <div className="space-y-6">
        <Button variant="secondary" size="sm" onClick={() => navigate('/loans')}>
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Loan Assessments
        </Button>
        <Card className="p-12 text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold text-[#0F172A]">Loan Application Not Found</h2>
          <p className="text-xs text-[#64748B]">
            The requested application <code className="font-mono bg-slate-100 px-1 py-0.5">{id}</code> does not exist in the company ledger.
          </p>
        </Card>
      </div>
    );
  }

  // Calculate Factual Derived Indicators
  const reqAmt = parseFloat(application.requested_amount || 0);
  const tenure = parseInt(application.tenure_months || 12, 10);
  const existingEmi = parseFloat(application.existing_emi || 0);
  const monthlyEstAllocation = tenure > 0 ? reqAmt / tenure : 0;
  const totalMonthlyObligation = monthlyEstAllocation + existingEmi;
  const custIncome = customer ? parseFloat(customer.monthly_income || 0) : 0;
  const dtiRatioPct = custIncome > 0 ? ((totalMonthlyObligation / custIncome) * 100).toFixed(1) : null;

  return (
    <div className="space-y-8 pb-8">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-[#64748B]">
          <Link to="/loans" className="hover:text-[#0B192C] hover:underline font-semibold">
            Loans
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-mono font-bold text-[#0F172A]">{application.application_id}</span>
        </div>

        <Button variant="secondary" size="sm" onClick={() => navigate('/loans')} className="text-xs font-bold">
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Loan Applications
        </Button>
      </div>

      {/* Institutional Loan Header Banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 corporate-card-shadow space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-[#64748B]">LOAN APPLICATION &bull; APP ID: {application.application_id}</span>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B192C] tracking-tight font-mono">{application.application_id}</h1>
              <Badge variant={application.product === 'HOME' ? 'navy' : application.product === 'BUSINESS' ? 'teal' : 'default'} className="text-xs px-3 py-1 font-bold">
                {application.product} LOAN
              </Badge>
              {decisionState === 'APPROVE' || decisionState === 'APPROVED' ? (
                <span className="px-3 py-1 text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md uppercase">APPROVED</span>
              ) : decisionState === 'REFER' || decisionState === 'REFER_FOR_REVIEW' ? (
                <span className="px-3 py-1 text-xs font-extrabold bg-amber-50 text-amber-800 border border-amber-200 rounded-md uppercase">REFER FOR REVIEW</span>
              ) : (
                <span className="px-3 py-1 text-xs font-extrabold bg-red-50 text-red-800 border border-red-200 rounded-md uppercase">REJECTED</span>
              )}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-[#64748B] uppercase block">Requested Amount</span>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-[#0B192C]">
              {formatCurrency(application.requested_amount)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[10px] font-bold text-[#64748B] uppercase">Stated Purpose</span>
            <p className="font-bold text-[#0F172A] mt-0.5 uppercase">{application.purpose}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#64748B] uppercase">Tenure</span>
            <p className="font-mono font-bold text-[#0B192C] mt-0.5">{application.tenure_months} Months</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#64748B] uppercase">Credit Bureau Score</span>
            <p className={`font-mono font-bold mt-0.5 ${application.credit_score >= 750 ? 'text-emerald-800' : application.credit_score >= 650 ? 'text-amber-800' : 'text-red-700'}`}>
              {application.credit_score}
            </p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#64748B] uppercase">Existing EMI</span>
            <p className="font-mono font-bold text-[#0F172A] mt-0.5">{formatCurrency(application.existing_emi)}</p>
          </div>
        </div>
      </div>

      {/* Two-Column Workstation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN (60%): FACTUAL EVIDENCE & DERIVED INDICATORS */}
        <div className="lg:col-span-7 space-y-6">
          {/* Application Details Card */}
          <Card className="p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0B192C]" />
                <h3 className="text-xs font-bold text-[#0B192C] uppercase tracking-wider">
                  1. Application Details
                </h3>
              </div>
              <span className="text-[11px] font-mono font-bold text-[#64748B]">APP ID: {application.application_id}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-[#E2E8F0]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Requested Loan</span>
                <p className="text-sm font-extrabold font-mono text-[#0F172A] mt-0.5">
                  {formatCurrency(application.requested_amount)}
                </p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-[#E2E8F0]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Loan Tenure</span>
                <p className="text-xs font-bold text-[#0F172A] mt-1">{application.tenure_months} Months</p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-[#E2E8F0]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Existing EMI Obligation</span>
                <p className="text-xs font-bold font-mono text-[#0F172A] mt-1">
                  {formatCurrency(application.existing_emi)}
                </p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-[#E2E8F0]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Credit Bureau Rating</span>
                <p className="text-xs font-mono font-bold text-[#0B192C] mt-1">{application.credit_score}</p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-[#E2E8F0]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Product Line</span>
                <p className="text-xs font-bold text-[#0F172A] mt-1">{application.product}</p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-[#E2E8F0]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Stated Purpose</span>
                <p className="text-xs font-bold text-[#0F172A] mt-1 uppercase">{application.purpose}</p>
              </div>
            </div>
          </Card>

          {/* Applicant / Customer Profile Context Card */}
          <Card className="p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#0B192C]" />
                <h3 className="text-xs font-bold text-[#0B192C] uppercase tracking-wider">
                  2. Applicant Profile Context
                </h3>
              </div>
              <span className="text-[11px] font-mono font-bold text-[#64748B]">CUST ID: {application.customer_id}</span>
            </div>

            {customer ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-[#E2E8F0]">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase">Applicant Name</span>
                  <p className="text-xs font-bold text-[#0F172A] mt-0.5">{customer.name_1}</p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-[#E2E8F0]">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase">Employment Type</span>
                  <p className="text-xs font-semibold text-[#0F172A] mt-0.5">{customer.employment_type}</p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-[#E2E8F0]">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase">Declared Monthly Income</span>
                  <p className="text-xs font-bold font-mono text-[#0B192C] mt-0.5">
                    {formatCurrency(customer.monthly_income)}
                  </p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-[#E2E8F0]">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase">KYC Verification Status</span>
                  <div className="mt-1">
                    <StatusBadge status={customer.kyc_status} />
                  </div>
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
              <p className="text-xs text-[#64748B] italic">Customer profile record not available in supplied data.</p>
            )}
          </Card>

          {/* Account Context Card */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#0B192C]" />
                <h3 className="text-xs font-bold text-[#0B192C] uppercase tracking-wider">
                  3. Associated Account Evidence ({accounts.length} Accounts)
                </h3>
              </div>
            </div>

            {accounts.length > 0 ? (
              <div className="space-y-2.5">
                {accounts.map((acc) => (
                  <div key={acc.account_id} className="p-3 bg-slate-50 rounded-xl border border-[#E2E8F0] flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-[#0B192C]">{acc.account_id}</span>
                      <span className="text-[#64748B] ml-2">({acc.account_title})</span>
                    </div>
                    <span className="font-mono font-bold text-[#0F172A]">{formatCurrency(acc.working_balance)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#64748B] italic">No associated accounts found in supplied dataset.</p>
            )}
          </Card>

          {/* Transparent Derived Indicators */}
          <Card className="p-6 space-y-4 border-t-4 border-t-[#0B192C]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-xs font-bold text-[#0B192C] uppercase tracking-wider">
                4. Derived Financial Indicators
              </h3>
              <span className="text-[10px] font-bold text-[#0F766E] bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                Factual Derivations
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-[#E2E8F0] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0F172A]">Estimated Principal Allocation (Requested / Tenure):</span>
                  <span className="font-mono font-bold text-[#0B192C]">{formatCurrency(monthlyEstAllocation)} / mo</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-[#E2E8F0] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0F172A]">Total Monthly Debt Obligation (Est. Allocation + Existing EMI):</span>
                  <span className="font-mono font-bold text-[#0B192C]">{formatCurrency(totalMonthlyObligation)} / mo</span>
                </div>
              </div>

              {dtiRatioPct && (
                <div className={`p-3.5 rounded-xl border space-y-1 ${parseFloat(dtiRatioPct) > 50 ? 'bg-amber-50 border-amber-200 text-amber-950' : 'bg-slate-50 border-slate-200 text-slate-900'}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Debt Burden Ratio (Total Obligation vs Monthly Income):</span>
                    <span className="font-mono font-bold">{dtiRatioPct}%</span>
                  </div>
                  <p className="text-[11px] opacity-90 leading-normal">
                    {parseFloat(dtiRatioPct) > 50 ? 'Calculated total monthly obligations exceed 50% of declared monthly income.' : 'Calculated obligations are within standard parameters relative to monthly income.'}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Absent Data Assessment */}
          <Card className="p-6 space-y-3 border-l-4 border-l-amber-500">
            <h3 className="text-xs font-bold text-[#0B192C] uppercase tracking-wider border-b border-[#E2E8F0] pb-2">
              5. Absent Data Assessment
            </h3>
            <ul className="text-[11px] text-[#475569] space-y-1 list-disc list-inside">
              <li>Collateral / Property Asset Documentation: <strong>Not available in supplied data.</strong></li>
              <li>Bank Account Statements / Tax Uploads: <strong>Not available in supplied data.</strong></li>
              <li>Probability of Default Model Output: <strong>Not available in supplied data.</strong></li>
            </ul>
          </Card>
        </div>

        {/* RIGHT COLUMN (40% STICKY): AI DECISION NOTE & HUMAN DECISION WORKSTATION */}
        <div className="lg:col-span-5 space-y-6">
          {/* AI Loan Decision Note Card */}
          <Card className="p-6 space-y-4 border-l-4 border-l-[#0F766E] bg-white corporate-card-shadow">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0F766E]" />
                <h3 className="text-xs font-bold text-[#0B192C] uppercase tracking-wider">
                  AI Loan Decision Note
                </h3>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-[#0F766E] border border-teal-200">
                  AI-Assisted &bull; Review Required
                </span>
                {aiProvider && !isLoading && !apiError && (
                  <span className="text-[10px] text-[#64748B]">
                    Provider: {aiProvider}
                    {aiFallback ? ' · Fallback provider used' : ''}
                  </span>
                )}
              </div>
            </div>

            {/* Disclaimer Banner */}
            <div className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-lg text-[11px] text-[#64748B] flex items-start gap-2">
              <Info className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
              <p className="leading-normal">
                This loan decision note is AI-assisted and based only on supplied company records. A human officer must review the underlying evidence and make the final decision.
              </p>
            </div>

            {/* Note Area */}
            {isLoading ? (
              <div className="p-8 text-center space-y-3 bg-slate-50 rounded-xl border border-[#E2E8F0]">
                <div className="w-6 h-6 border-2 border-[#0F766E]/20 border-t-[#0F766E] rounded-full animate-spin mx-auto"></div>
                <p className="text-xs font-bold text-[#0B192C]">Drafting Grounded AI Loan Decision Note...</p>
              </div>
            ) : apiError ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 space-y-3">
                <p className="font-semibold leading-relaxed">{apiError}</p>
                <Button variant="secondary" size="sm" onClick={executeRegenerate} disabled={isLoading} className="text-xs font-bold">
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
                  rows={15}
                  className="w-full p-3.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs font-mono text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] leading-relaxed resize-y"
                  placeholder="AI Loan Decision Note will appear here..."
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

                    <Button variant="teal" size="sm" onClick={handleRegenerateClick} disabled={isLoading} className="text-xs py-1 px-2.5 font-bold">
                      <RefreshCw className="w-3.5 h-3.5 mr-1" /> Regenerate
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Human Decision Workstation Bar */}
          <Card className="p-6 space-y-4 border-t-2 border-t-[#0B192C]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
              <h3 className="text-xs font-bold text-[#0B192C] uppercase tracking-wider">
                Human Lending Decision
              </h3>
              <span className="text-[10px] font-mono text-[#64748B]">Assigned Role: {user?.role}</span>
            </div>

            {canAct ? (
              <div className="space-y-3">
                <p className="text-xs text-[#64748B] leading-normal">
                  Select a final lending decision for application {application.application_id}. Decisions are recorded in the audit trail against your authenticated employee credentials.
                </p>

                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="teal"
                    size="sm"
                    onClick={() => handleOfficerDecision('APPROVE')}
                    className="text-xs font-bold py-2.5"
                  >
                    Approve
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleOfficerDecision('REFER')}
                    className="text-xs font-bold py-2.5"
                  >
                    Refer for Review
                  </Button>

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleOfficerDecision('REJECT')}
                    className="text-xs font-bold py-2.5"
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-100 rounded-lg text-xs text-slate-700 flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                <p>Read-Only Access: Your assigned role ({user?.role}) does not have execution rights for loan decisions.</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Decision Confirmation Modal */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmOfficerDecision}
        title={`Confirm Lending Decision: ${pendingDecision}`}
        message={`Are you sure you want to log decision '${pendingDecision}' for application ${application.application_id}? This decision will update the application status and create an immutable audit record.`}
        confirmText="Confirm Decision"
        variant={pendingDecision === 'REJECT' ? 'danger' : 'primary'}
      />

      {/* Regenerate AI Note Confirmation Modal */}
      <ConfirmDialog
        isOpen={isRegenerateConfirmOpen}
        onClose={() => setIsRegenerateConfirmOpen(false)}
        onConfirm={executeRegenerate}
        isLoading={isLoading}
        title="Regenerate AI Loan Decision Note?"
        message="Your current edits will be replaced by a newly generated AI draft."
        confirmText="Regenerate"
        variant="warning"
      />
    </div>
  );
}
