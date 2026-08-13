import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  FileText,
  Search,
  ArrowUpRight,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Building2,
  Briefcase,
  Home,
  User,
} from 'lucide-react';
import {
  getAllLoanApplications,
  filterLoanApplications,
  getCustomerById,
} from '../../services/data/csvLoader.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { SearchBar } from '../../components/common/SearchBar.jsx';
import { DataTable } from '../../components/common/DataTable.jsx';

export function LoanListPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Filter state
  const [decisionFilter, setDecisionFilter] = useState('ALL'); // 'ALL' | 'APPROVE' | 'REFER' | 'REJECT'
  const [productFilter, setProductFilter] = useState('ALL'); // 'ALL' | 'PERSONAL' | 'BUSINESS' | 'HOME'
  const [searchQuery, setSearchQuery] = useState('');
  const [allLoans, setAllLoans] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load all loans on mount and when location changes (e.g., returning from detail page)
  useEffect(() => {
    const loadLoans = async () => {
      try {
        setIsLoading(true);
        const loans = await getAllLoanApplications();
        setAllLoans(loans);
      } catch (err) {
        console.error('Failed to load loans:', err);
        setAllLoans([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadLoans();
  }, [location]);

  // Apply filters to loans when filter criteria or loan data changes
  useEffect(() => {
    const applyFilters = async () => {
      try {
        const filtered = await filterLoanApplications({
          decisionStatus: decisionFilter,
          productType: productFilter,
          searchQuery: searchQuery,
        });
        setFilteredData(filtered);
      } catch (err) {
        console.error('Failed to apply loan filters:', err);
        setFilteredData([]);
      }
    };

    applyFilters();
  }, [decisionFilter, productFilter, searchQuery, allLoans]);
  const approvedCount = useMemo(
    () => allLoans.filter((l) => l.decision_label === 'APPROVE' || l.decision_label === 'APPROVED').length,
    [allLoans]
  );
  const referredCount = useMemo(
    () => allLoans.filter((l) => l.decision_label === 'REFER' || l.decision_label === 'REFER_FOR_REVIEW').length,
    [allLoans]
  );
  const rejectedCount = useMemo(
    () => allLoans.filter((l) => l.decision_label === 'REJECT' || l.decision_label === 'REJECTED').length,
    [allLoans]
  );
  const totalRequestedINR = useMemo(
    () => allLoans.reduce((acc, l) => acc + (l.requested_amount || 0), 0),
    [allLoans]
  );

  // Decision Badge Render
  const renderDecisionBadge = (status) => {
    if (status === 'APPROVE' || status === 'APPROVED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md uppercase">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> APPROVED
        </span>
      );
    }
    if (status === 'REFER' || status === 'REFER_FOR_REVIEW') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200 rounded-md uppercase">
          <AlertTriangle className="w-3 h-3 text-amber-600" /> REFER FOR REVIEW
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-extrabold bg-red-50 text-red-800 border border-red-200 rounded-md uppercase">
        <XCircle className="w-3 h-3 text-red-600" /> REJECTED
      </span>
    );
  };

  // Table Columns
  const columns = [
    {
      header: 'App ID',
      key: 'application_id',
      render: (val) => (
        <span className="font-mono font-bold text-[#0B192C] text-xs">{val}</span>
      ),
    },
    {
      header: 'Applicant',
      key: 'customer_id',
      render: (val) => {
        const cust = getCustomerById(val);
        return (
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#0F172A]">{cust ? cust.name_1 : val}</span>
            <span className="text-[10px] font-mono text-[#64748B]">ID: {val}</span>
          </div>
        );
      },
    },
    {
      header: 'Product',
      key: 'product',
      render: (val) => (
        <Badge variant={val === 'HOME' ? 'navy' : val === 'BUSINESS' ? 'teal' : 'default'}>
          {val}
        </Badge>
      ),
    },
    {
      header: 'Requested Amount (INR)',
      key: 'requested_amount',
      render: (val) => (
        <span className="text-xs font-bold font-mono text-[#0F172A]">
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      header: 'Tenure',
      key: 'tenure_months',
      render: (val) => <span className="text-xs font-semibold text-[#475569]">{val} Mo</span>,
    },
    {
      header: 'Credit Score',
      key: 'credit_score',
      render: (val) => (
        <span className={`text-xs font-mono font-bold ${val >= 750 ? 'text-emerald-800' : val >= 650 ? 'text-amber-800' : 'text-red-700'}`}>
          {val}
        </span>
      ),
    },
    {
      header: 'Stated Purpose',
      key: 'purpose',
      render: (val) => (
        <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200 rounded uppercase">
          {val}
        </span>
      ),
    },
    {
      header: 'Recorded Status',
      key: 'decision_label',
      render: (val) => renderDecisionBadge(val),
    },
    {
      header: 'Action',
      key: 'application_id',
      render: (val) => (
        <Button
          variant="primary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/loans/${val}`);
          }}
          className="text-xs py-1 px-3 font-bold"
        >
          Assess Loan <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
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
        <span className="font-mono font-bold text-[#0B192C]">Loan Assessments</span>
      </div>

      {/* Institutional Heading */}
      <div className="space-y-2 border-b border-[#E2E8F0] pb-6">
        <div className="flex items-center gap-2">
          <Badge variant="navy">Official Company Ledger</Badge>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A]">
          Loan Assessment Console
        </h1>
        <p className="text-sm text-[#64748B] font-normal">
          Review loan applications using official company records.
        </p>
      </div>

      {/* Editorial Statistics */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 corporate-card-shadow">
        <div className="grid grid-cols-1 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E2E8F0] text-center sm:text-left">
          <div className="pb-4 sm:pb-0 sm:pr-6 space-y-1">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
              TOTAL APPLICATIONS
            </span>
            <p className="text-2xl font-extrabold text-[#0F172A] font-mono">{allLoans.length}</p>
          </div>

          <div className="py-4 sm:py-0 sm:px-6 space-y-1">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
              APPROVED APPLICATIONS
            </span>
            <p className="text-2xl font-extrabold text-emerald-800 font-mono">{approvedCount}</p>
          </div>

          <div className="py-4 sm:py-0 sm:px-6 space-y-1">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
              REFERRED FOR REVIEW
            </span>
            <p className="text-2xl font-extrabold text-amber-800 font-mono">{referredCount}</p>
          </div>

          <div className="pt-4 sm:pt-0 sm:pl-6 space-y-1">
            <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block">
              REJECTED APPLICATIONS
            </span>
            <p className="text-2xl font-extrabold text-red-700 font-mono">{rejectedCount}</p>
          </div>
        </div>
      </div>

      {/* Preset Status Filter Bar */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-4">
        <button
          onClick={() => setDecisionFilter('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            decisionFilter === 'ALL'
              ? 'bg-[#0B192C] text-white shadow-xs'
              : 'bg-white text-[#475569] border border-[#E2E8F0] hover:bg-slate-50'
          }`}
        >
          All Applications ({allLoans.length})
        </button>

        <button
          onClick={() => setDecisionFilter('APPROVE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            decisionFilter === 'APPROVE'
              ? 'bg-[#0F766E] text-white shadow-xs'
              : 'bg-white text-[#475569] border border-[#E2E8F0] hover:bg-slate-50'
          }`}
        >
          Approved ({approvedCount})
        </button>

        <button
          onClick={() => setDecisionFilter('REFER')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            decisionFilter === 'REFER'
              ? 'bg-amber-700 text-white shadow-xs'
              : 'bg-white text-amber-800 border border-amber-200 hover:bg-amber-50'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Referred ({referredCount})
        </button>

        <button
          onClick={() => setDecisionFilter('REJECT')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            decisionFilter === 'REJECT'
              ? 'bg-red-700 text-white shadow-xs'
              : 'bg-white text-red-700 border border-red-200 hover:bg-red-50'
          }`}
        >
          Rejected ({rejectedCount})
        </button>
      </div>

      {/* Table Container & Controls */}
      <Card className="p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search App ID, Customer ID, Name, Product, Purpose..."
          />

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
              <span className="font-bold">Product:</span>
              <select
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
                className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 text-xs text-[#0F172A] font-semibold focus:outline-none"
              >
                <option value="ALL">All Products</option>
                <option value="PERSONAL">Personal Loan</option>
                <option value="BUSINESS">Business Loan</option>
                <option value="HOME">Home Loan</option>
              </select>
            </div>

            {(productFilter !== 'ALL' || searchQuery !== '' || decisionFilter !== 'ALL') && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setDecisionFilter('ALL');
                  setProductFilter('ALL');
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
          onRowClick={(row) => navigate(`/loans/${row.application_id}`)}
        />
      </Card>
    </div>
  );
}
