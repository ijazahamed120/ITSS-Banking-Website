import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  User,
  Building2,
  CreditCard,
  AlertTriangle,
  Copy,
  RefreshCw,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  Info,
  CheckCircle2,
  ShieldCheck,
  FileText,
  Lock,
} from 'lucide-react';
import {
  getCustomerById,
  getCustomerAccounts,
  getCustomerTransactions,
} from '../../services/data/csvLoader.js';
import { generateKycSummary } from '../../services/api/aiApi.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';

import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx';

export function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const customer = getCustomerById(id);
  const accounts = customer ? getCustomerAccounts(customer.customer_id) : [];
  const transactions = customer ? getCustomerTransactions(customer.customer_id) : [];

  // AI KYC Summary State
  const [kycSummary, setKycSummary] = useState('');
  const [initialGeneratedSummary, setInitialGeneratedSummary] = useState('');
  const [isEdited, setIsEdited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [aiProvider, setAiProvider] = useState(null);
  const [aiFallback, setAiFallback] = useState(false);
  const [isRegenerateConfirmOpen, setIsRegenerateConfirmOpen] = useState(false);
  const inFlightRef = useRef(false);

  // Load AI Summary on mount
  useEffect(() => {
    if (customer) {
      executeRegenerate();
    }
  }, [id]);

  const executeRegenerate = async () => {
    if (!customer || inFlightRef.current) return;
    inFlightRef.current = true;
    setIsLoading(true);
    setApiError(null);
    setAiProvider(null);
    setAiFallback(false);
    setIsRegenerateConfirmOpen(false);

    try {
      const res = await generateKycSummary(customer.customer_id);
      setKycSummary(res.content);
      setInitialGeneratedSummary(res.content);
      setIsEdited(false);
      setAiProvider(res.provider || null);
      setAiFallback(Boolean(res.fallback));
    } catch (err) {
      setApiError(err.message || 'Failed to generate AI KYC summary. Please retry.');
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

  const handleCopySummary = () => {
    if (kycSummary) {
      navigator.clipboard.writeText(kycSummary);
      toast.success('Clipboard', 'AI KYC Profile Summary copied to clipboard.');
    }
  };

  if (!customer) {
    return (
      <div className="space-y-6">
        <Button variant="secondary" size="sm" onClick={() => navigate('/customers')}>
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Customers
        </Button>
        <Card className="p-12 text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold text-[#0F172A]">Customer Not Found</h2>
          <p className="text-xs text-[#64748B]">
            The requested customer <code className="font-mono bg-slate-100 px-1 py-0.5">{id}</code> does not exist in the company ledger.
          </p>
        </Card>
      </div>
    );
  }

  const totalBalanceINR = accounts.reduce((acc, a) => acc + (a.currency === 'INR' ? Math.abs(parseFloat(a.working_balance || 0)) : 0), 0);
  const hasPostingRestrict = accounts.some((a) => a.posting_restrict === 'KYC');

  return (
    <div className="space-y-8 pb-8">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-[#64748B]">
          <Link to="/customers" className="hover:text-[#0B192C] hover:underline font-semibold">
            Customers
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-mono font-bold text-[#0F172A]">{customer.customer_id}</span>
        </div>

        <Button variant="secondary" size="sm" onClick={() => navigate('/customers')} className="text-xs font-bold">
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Customers List
        </Button>
      </div>

      {/* Institutional Customer Header Banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 corporate-card-shadow space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-[#64748B]">KYC PROFILE SUMMARIZER &bull; CUST ID: {customer.customer_id}</span>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B192C] tracking-tight">{customer.name_1}</h1>
              <StatusBadge status={customer.kyc_status} />
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-[#64748B] uppercase block">Total Working Balance</span>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-[#0B192C]">
              {formatCurrency(totalBalanceINR)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[10px] font-bold text-[#64748B] uppercase">Employment Type</span>
            <p className="font-bold text-[#0F172A] mt-0.5">{customer.employment_type}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#64748B] uppercase">Monthly Income</span>
            <p className="font-mono font-bold text-[#0B192C] mt-0.5">{formatCurrency(customer.monthly_income)}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#64748B] uppercase">Location</span>
            <p className="font-semibold text-[#0F172A] mt-0.5">{customer.town_country}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#64748B] uppercase">Active Accounts</span>
            <p className="font-mono font-bold text-[#0F766E] mt-0.5">{accounts.length} Account(s)</p>
          </div>
        </div>
      </div>

      {/* Two-Column Workstation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN (60%): FACTUAL CUSTOMER & ACCOUNT EVIDENCE */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customer Information Card */}
          <Card className="p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#0B192C]" />
                <h3 className="text-xs font-bold text-[#0B192C] uppercase tracking-wider">
                  1. Customer Information
                </h3>
              </div>
              <span className="text-[11px] font-mono font-bold text-[#64748B]">Mnemonic: {customer.mnemonic}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-[#E2E8F0]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Full Name</span>
                <p className="text-xs font-bold text-[#0F172A] mt-0.5">{customer.name_1}</p>
                <span className="text-[10px] text-[#64748B]">{customer.short_name}</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-[#E2E8F0]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Date of Birth</span>
                <p className="text-xs font-semibold text-[#0F172A] mt-0.5">{customer.date_of_birth}</p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-[#E2E8F0]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">KYC Status</span>
                <div className="mt-1">
                  <StatusBadge status={customer.kyc_status} />
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-[#E2E8F0]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Street Address</span>
                <p className="text-xs font-medium text-[#0F172A] mt-0.5">{customer.street}</p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-[#E2E8F0]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Town / Country</span>
                <p className="text-xs font-medium text-[#0F172A] mt-0.5">{customer.town_country}</p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-[#E2E8F0]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Nationality / Residence</span>
                <p className="text-xs font-medium text-[#0F172A] mt-0.5">{customer.nationality} / {customer.residence}</p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-[#E2E8F0]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Sector Code</span>
                <p className="text-xs font-mono font-semibold text-[#0F172A] mt-0.5">{customer.sector}</p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-[#E2E8F0]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Account Officer</span>
                <p className="text-xs font-mono font-semibold text-[#0F172A] mt-0.5">ID #{customer.account_officer}</p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-[#E2E8F0]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Customer Status</span>
                <p className="text-xs font-mono font-semibold text-[#0F172A] mt-0.5">Code {customer.customer_status}</p>
              </div>
            </div>
          </Card>

          {/* Account Context Card */}
          <Card className="p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#0B192C]" />
                <h3 className="text-xs font-bold text-[#0B192C] uppercase tracking-wider">
                  2. Account Context ({accounts.length} Linked Accounts)
                </h3>
              </div>
              <span className="text-[11px] font-mono font-bold text-[#0F766E]">Linked Records</span>
            </div>

            {accounts.length > 0 ? (
              <div className="space-y-3">
                {accounts.map((acc) => (
                  <div key={acc.account_id} className="p-4 bg-slate-50 rounded-xl border border-[#E2E8F0] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#0B192C]">{acc.account_id}</span>
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-white text-slate-800 border border-slate-200 rounded">
                          {acc.product} ({acc.currency})
                        </span>
                      </div>
                      <span className="font-mono font-bold text-xs text-[#0F172A]">
                        {formatCurrency(acc.working_balance)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1 border-t border-[#E2E8F0]">
                      <div>
                        <span className="text-[10px] text-[#64748B]">Account Title:</span>
                        <p className="font-semibold text-[#0F172A] truncate">{acc.account_title}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#64748B]">Opening Date:</span>
                        <p className="font-semibold text-[#0F172A]">{acc.opening_date}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#64748B]">Posting Restriction:</span>
                        <p className={`font-bold ${acc.posting_restrict === 'KYC' ? 'text-amber-800 font-mono' : 'text-[#64748B]'}`}>
                          {acc.posting_restrict || 'None'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#64748B] italic">No associated accounts found in supplied dataset.</p>
            )}
          </Card>

          {/* Completeness & Missing Data Assessment */}
          <Card className="p-6 space-y-4 border-l-4 border-l-amber-500">
            <h3 className="text-xs font-bold text-[#0B192C] uppercase tracking-wider border-b border-[#E2E8F0] pb-3">
              3. Data Completeness & Absent Fields Assessment
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 space-y-1">
                <span className="font-bold block">Available Verified Fields in Supplied Ledger:</span>
                <p className="text-[11px] leading-relaxed">
                  Customer ID, Name, Mnemonic, Address, Town/Country, Nationality, Residence, Date of Birth, Employment Type, Monthly Income, KYC Status, Account Officers, and Account Ledgers.
                </p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 space-y-1">
                <span className="font-bold block">Absent Data Fields (Not Available in Supplied CSV):</span>
                <ul className="text-[11px] space-y-1 list-disc list-inside">
                  <li>Specific identity document numbers (Aadhaar, PAN, Passport, Voter ID): <strong>Not available in supplied data.</strong></li>
                  <li>Document verification scan copies or scan dates: <strong>Not available in supplied data.</strong></li>
                  <li>Politically Exposed Person (PEP) / Sanctions screening flags: <strong>Not available in supplied data.</strong></li>
                  <li>Credit rating scores or risk numbers: <strong>Not available in supplied data.</strong></li>
                </ul>
              </div>

              <p className="text-[10px] text-[#64748B] italic">
                Note: Absence of a field in the dataset indicates data scope limitations only, not identity failure.
              </p>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN (40% STICKY): AI SUMMARY & ACTION */}
        <div className="lg:col-span-5 space-y-6">
          {/* AI KYC Profile Summary Card */}
          <Card className="p-6 space-y-4 border-l-4 border-l-[#0F766E] bg-white corporate-card-shadow">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0F766E]" />
                <h3 className="text-xs font-bold text-[#0B192C] uppercase tracking-wider">
                  AI KYC Profile Summary
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
                This KYC summary is AI-assisted and based only on the supplied company records. A human compliance officer must review the underlying evidence and make the final decision.
              </p>
            </div>

            {/* Note Area */}
            {isLoading ? (
              <div className="p-8 text-center space-y-3 bg-slate-50 rounded-xl border border-[#E2E8F0]">
                <div className="w-6 h-6 border-2 border-[#0F766E]/20 border-t-[#0F766E] rounded-full animate-spin mx-auto"></div>
                <p className="text-xs font-bold text-[#0B192C]">Generating Grounded AI KYC Summary...</p>
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
                  value={kycSummary}
                  onChange={(e) => {
                    const val = e.target.value;
                    setKycSummary(val);
                    if (val !== initialGeneratedSummary) {
                      setIsEdited(true);
                    } else {
                      setIsEdited(false);
                    }
                  }}
                  rows={15}
                  className="w-full p-3.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs font-mono text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] leading-relaxed resize-y"
                  placeholder="AI KYC Summary will appear here..."
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
                    <Button variant="secondary" size="sm" onClick={handleCopySummary} className="text-xs py-1 px-2.5 font-bold">
                      <Copy className="w-3.5 h-3.5 mr-1" /> Copy Summary
                    </Button>

                    <Button variant="teal" size="sm" onClick={handleRegenerateClick} disabled={isLoading} className="text-xs py-1 px-2.5 font-bold">
                      <RefreshCw className="w-3.5 h-3.5 mr-1" /> Regenerate
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Compliance Officer Decision Box */}
          <Card className="p-6 space-y-3 border-t-2 border-t-[#0B192C]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
              <h3 className="text-xs font-bold text-[#0B192C] uppercase tracking-wider">
                Human Compliance Decision
              </h3>
              <span className="text-[10px] font-mono text-[#64748B]">Assigned Role: {user?.role}</span>
            </div>

            <p className="text-xs text-[#64748B] leading-normal">
              Final verification status must be confirmed by the compliance officer based on physical documents or bank records.
            </p>

            <div className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs space-y-1">
              <span className="font-bold text-[#0B192C]">Current CSV Verification Status:</span>
              <p className="font-mono font-bold text-[#0F766E]">{customer.kyc_status}</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Regenerate AI Summary Confirmation Modal */}
      <ConfirmDialog
        isOpen={isRegenerateConfirmOpen}
        onClose={() => setIsRegenerateConfirmOpen(false)}
        onConfirm={executeRegenerate}
        isLoading={isLoading}
        title="Regenerate AI KYC Summary?"
        message="Your current edits will be replaced by a newly generated AI draft."
        confirmText="Regenerate"
        variant="warning"
      />
    </div>
  );
}
