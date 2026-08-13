import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users,
  Search,
  ArrowUpRight,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Building2,
  CreditCard,
} from 'lucide-react';
import {
  getAllCustomers,
  filterCustomers,
  getCustomerAccounts,
} from '../../services/data/csvLoader.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { SearchBar } from '../../components/common/SearchBar.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { DataTable } from '../../components/common/DataTable.jsx';

export function CustomerListPage() {
  const navigate = useNavigate();

  // Filter state
  const [kycStatusFilter, setKycStatusFilter] = useState('ALL'); // 'ALL' | 'COMPLETE' | 'EXPIRED' | 'PENDING'
  const [employmentFilter, setEmploymentFilter] = useState('ALL'); // 'ALL' | 'SALARIED' | 'BUSINESS' | 'SELF_EMP'
  const [searchQuery, setSearchQuery] = useState('');

  // Total Summary Metrics
  const allCustomers = useMemo(() => getAllCustomers(), []);
  const completeCount = useMemo(
    () => allCustomers.filter((c) => c.kyc_status === 'COMPLETE').length,
    [allCustomers]
  );
  const expiredCount = useMemo(
    () => allCustomers.filter((c) => c.kyc_status === 'EXPIRED').length,
    [allCustomers]
  );
  const pendingCount = useMemo(
    () => allCustomers.filter((c) => c.kyc_status === 'PENDING').length,
    [allCustomers]
  );

  // Filtered dataset
  const filteredData = useMemo(() => {
    return filterCustomers({
      kycStatus: kycStatusFilter,
      employmentType: employmentFilter,
      searchQuery: searchQuery,
    });
  }, [kycStatusFilter, employmentFilter, searchQuery]);

  // Table Columns
  const columns = [
    {
      header: 'Customer ID',
      key: 'customer_id',
      render: (val) => (
        <span className="font-mono font-bold text-[#0B192C] text-xs">{val}</span>
      ),
    },
    {
      header: 'Customer Name',
      key: 'name_1',
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-[#0F172A]">{val}</span>
          <span className="text-[10px] font-mono text-[#64748B]">{row.mnemonic}</span>
        </div>
      ),
    },
    {
      header: 'Location',
      key: 'town_country',
      render: (val) => <span className="text-xs text-[#475569] font-medium">{val}</span>,
    },
    {
      header: 'Employment',
      key: 'employment_type',
      render: (val) => (
        <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200 rounded">
          {val}
        </span>
      ),
    },
    {
      header: 'Monthly Income (INR)',
      key: 'monthly_income',
      render: (val) => (
        <span className="text-xs font-bold font-mono text-[#0F172A]">
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      header: 'KYC Status',
      key: 'kyc_status',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      header: 'Accounts',
      key: 'customer_id',
      render: (val) => {
        const accs = getCustomerAccounts(val);
        return (
          <span className="text-xs font-bold font-mono text-[#0F766E] bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
            {accs.length} Account(s)
          </span>
        );
      },
    },
    {
      header: 'Action',
      key: 'customer_id',
      render: (val) => (
        <Button
          variant="primary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/customers/${val}`);
          }}
          className="text-xs py-1 px-3 font-bold"
        >
          View KYC Profile <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-8 pb-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-[#64748B]">
        <Link to="/dashboard" className="hover:text-[#0B192C] hover:underline font-semibold">
          Overview
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-bold text-[#0F172A]">Operations</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-mono font-bold text-[#0B192C]">KYC Profiles</span>
      </div>

      {/* Institutional Heading */}
      <div className="space-y-2 border-b border-[#E2E8F0] pb-6">
        <div className="flex items-center gap-2">
          <Badge variant="navy">Official Company Ledger</Badge>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A]">
          KYC Profile Summary
        </h1>
        <p className="text-sm text-[#64748B] font-normal">
          Review customer identity and available KYC information using verified company records.
        </p>
      </div>

      {/* Editorial Statistics */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 corporate-card-shadow">
        <div className="grid grid-cols-1 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E2E8F0] text-center sm:text-left">
          <div className="pb-4 sm:pb-0 sm:pr-6 space-y-1">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
              TOTAL CUSTOMERS
            </span>
            <p className="text-2xl font-extrabold text-[#0F172A] font-mono">{allCustomers.length}</p>
          </div>

          <div className="py-4 sm:py-0 sm:px-6 space-y-1">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
              COMPLETE KYC
            </span>
            <p className="text-2xl font-extrabold text-emerald-800 font-mono">{completeCount}</p>
          </div>

          <div className="py-4 sm:py-0 sm:px-6 space-y-1">
            <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block">
              EXPIRED KYC
            </span>
            <p className="text-2xl font-extrabold text-red-700 font-mono">{expiredCount}</p>
          </div>

          <div className="pt-4 sm:pt-0 sm:pl-6 space-y-1">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
              PENDING KYC
            </span>
            <p className="text-2xl font-extrabold text-amber-800 font-mono">{pendingCount}</p>
          </div>
        </div>
      </div>

      {/* Preset Status Filter Bar */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-4">
        <button
          onClick={() => setKycStatusFilter('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            kycStatusFilter === 'ALL'
              ? 'bg-[#0B192C] text-white shadow-xs'
              : 'bg-white text-[#475569] border border-[#E2E8F0] hover:bg-slate-50'
          }`}
        >
          All Customers ({allCustomers.length})
        </button>

        <button
          onClick={() => setKycStatusFilter('COMPLETE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            kycStatusFilter === 'COMPLETE'
              ? 'bg-[#0F766E] text-white shadow-xs'
              : 'bg-white text-[#475569] border border-[#E2E8F0] hover:bg-slate-50'
          }`}
        >
          Complete ({completeCount})
        </button>

        <button
          onClick={() => setKycStatusFilter('EXPIRED')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            kycStatusFilter === 'EXPIRED'
              ? 'bg-red-700 text-white shadow-xs'
              : 'bg-white text-red-700 border border-red-200 hover:bg-red-50'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Expired ({expiredCount})
        </button>

        <button
          onClick={() => setKycStatusFilter('PENDING')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            kycStatusFilter === 'PENDING'
              ? 'bg-amber-700 text-white shadow-xs'
              : 'bg-white text-amber-800 border border-amber-200 hover:bg-amber-50'
          }`}
        >
          Pending ({pendingCount})
        </button>
      </div>

      {/* Table Container & Controls */}
      <Card className="p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search Customer ID, Name, Mnemonic, Town/Country..."
          />

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
              <span className="font-bold">Employment:</span>
              <select
                value={employmentFilter}
                onChange={(e) => setEmploymentFilter(e.target.value)}
                className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 text-xs text-[#0F172A] font-semibold focus:outline-none"
              >
                <option value="ALL">All Types</option>
                <option value="SALARIED">Salaried</option>
                <option value="BUSINESS">Business</option>
                <option value="SELF_EMP">Self-Employed</option>
              </select>
            </div>

            {(employmentFilter !== 'ALL' || searchQuery !== '' || kycStatusFilter !== 'ALL') && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setKycStatusFilter('ALL');
                  setEmploymentFilter('ALL');
                  setSearchQuery('');
                }}
                className="text-xs"
              >
                Reset Filters
              </Button>
            )}
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={filteredData}
          onRowClick={(row) => navigate(`/customers/${row.customer_id}`)}
        />
      </Card>
    </div>
  );
}
