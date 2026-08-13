import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  UserCheck,
  ArrowUpRight,
  ChevronRight,
  CheckCircle2,
  ShieldAlert,
  Clock,
} from 'lucide-react';
import {
  getAllFirstTimePayeeCases,
  filterFirstTimePayeeCases,
  getCustomerById,
} from '../../services/data/csvLoader.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { formatDate } from '../../utils/formatters.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { SearchBar } from '../../components/common/SearchBar.jsx';
import { DataTable } from '../../components/common/DataTable.jsx';

export function PayeeListPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [channelFilter, setChannelFilter] = useState('ALL');
  const [reviewFilter, setReviewFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [allCases, setAllCases] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load all cases on mount and when location changes (e.g., returning from detail page)
  useEffect(() => {
    const loadCases = async () => {
      try {
        setIsLoading(true);
        const cases = await getAllFirstTimePayeeCases();
        setAllCases(cases);
      } catch (err) {
        console.error('Failed to load payee cases:', err);
        setAllCases([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCases();
  }, [location]);

  // Apply filters to cases when filter criteria or case data changes
  useEffect(() => {
    const applyFilters = async () => {
      try {
        const filtered = await filterFirstTimePayeeCases({
          status: statusFilter,
          channel: channelFilter,
          reviewStatus: reviewFilter,
          searchQuery,
        });
        setFilteredData(filtered);
      } catch (err) {
        console.error('Failed to apply payee filters:', err);
        setFilteredData([]);
      }
    };

    applyFilters();
  }, [statusFilter, channelFilter, reviewFilter, searchQuery, allCases]);
  const suspiciousCount = useMemo(
    () => allCases.filter((t) => t.is_suspicious === 'Y').length,
    [allCases]
  );
  const normalCount = allCases.length - suspiciousCount;
  const pendingCount = useMemo(
    () => allCases.filter((t) => t.review_status === 'PENDING_REVIEW').length,
    [allCases]
  );
  const totalVolumeINR = useMemo(
    () => allCases.reduce((acc, t) => acc + Math.abs(Number(t.amount) || 0), 0),
    [allCases]
  );

  const renderReviewBadge = (status) => {
    if (status === 'REVIEWED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-extrabold bg-slate-100 text-slate-800 border border-slate-200 rounded-md uppercase">
          Reviewed
        </span>
      );
    }
    if (status === 'CLEARED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md uppercase">
          Cleared
        </span>
      );
    }
    if (status === 'HELD') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200 rounded-md uppercase">
          Held
        </span>
      );
    }
    if (status === 'ESCALATED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-extrabold bg-red-50 text-red-800 border border-red-200 rounded-md uppercase">
          Escalated
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-extrabold bg-blue-50 text-blue-800 border border-blue-200 rounded-md uppercase">
        <Clock className="w-3 h-3" /> Pending
      </span>
    );
  };

  const columns = [
    {
      header: 'TXN ID',
      key: 'txn_id',
      render: (val) => <span className="font-mono font-bold text-[#0B192C] text-xs">{val}</span>,
    },
    {
      header: 'Date',
      key: 'txn_date',
      render: (val) => <span className="text-xs text-[#64748B] font-semibold">{formatDate(val, false)}</span>,
    },
    {
      header: 'Customer',
      key: 'customer_id',
      render: (val) => {
        const customer = getCustomerById(val);
        return (
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#0F172A]">{customer ? customer.name_1 : val}</span>
            <span className="text-[10px] font-mono text-[#64748B]">ID: {val}</span>
          </div>
        );
      },
    },
    {
      header: 'Payee (Counterparty)',
      key: 'counterparty',
      render: (val, row) => (
        <div className="flex flex-col max-w-[180px]">
          <span className="text-xs font-bold text-[#0F172A] truncate">{val || 'N/A'}</span>
          <span className="text-[10px] text-[#64748B] truncate">{row.narrative}</span>
        </div>
      ),
    },
    {
      header: 'Channel',
      key: 'channel',
      render: (val) => (
        <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200 rounded">
          {val}
        </span>
      ),
    },
    {
      header: 'Amount (INR)',
      key: 'amount',
      render: (val) => (
        <span className="text-xs font-bold font-mono text-[#0F172A]">
          -{formatCurrency(Math.abs(val))}
        </span>
      ),
    },
    {
      header: 'Ledger Flag',
      key: 'is_suspicious',
      render: (val) =>
        val === 'Y' ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-extrabold bg-red-50 text-red-800 border border-red-200 rounded-md uppercase">
            <ShieldAlert className="w-3 h-3 text-red-600" /> Flagged
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md uppercase">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Normal
          </span>
        ),
    },
    {
      header: 'Review',
      key: 'review_status',
      render: (val) => renderReviewBadge(val),
    },
    {
      header: 'Action',
      key: 'txn_id',
      render: (val) => (
        <Button
          variant="primary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/payees/${val}`);
          }}
          className="text-xs py-1 px-3 font-bold"
        >
          Review Payee <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-8 pb-8">
      <div className="flex items-center gap-2 text-xs text-[#64748B]">
        <Link to="/dashboard" className="hover:text-[#0B192C] hover:underline font-semibold">
          Overview
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-bold text-[#0F172A]">Operations</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-mono font-bold text-[#0B192C]">Payee Risk Notes</span>
      </div>

      <div className="space-y-2 border-b border-[#E2E8F0] pb-6">
        <div className="flex items-center gap-2">
          <Badge variant="navy">Official Company Ledger</Badge>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A]">
          Payee Risk Review
        </h1>
        <p className="text-sm text-[#64748B] font-normal">
          Review first-occurrence DEBIT transfers to a counterparty using verified ledger evidence.
          First-time status is a derived signal — not automatic suspicion.
        </p>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 corporate-card-shadow">
        <div className="grid grid-cols-1 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E2E8F0] text-center sm:text-left">
          <div className="pb-4 sm:pb-0 sm:pr-6 space-y-1">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
              FIRST-TIME CASES
            </span>
            <p className="text-2xl font-extrabold text-[#0F172A] font-mono">{allCases.length}</p>
          </div>

          <div className="py-4 sm:py-0 sm:px-6 space-y-1">
            <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block">
              FLAGGED (is_suspicious=Y)
            </span>
            <p className="text-2xl font-extrabold text-red-700 font-mono">{suspiciousCount}</p>
          </div>

          <div className="py-4 sm:py-0 sm:px-6 space-y-1">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
              NORMAL LEDGER FLAG
            </span>
            <p className="text-2xl font-extrabold text-emerald-800 font-mono">{normalCount}</p>
          </div>

          <div className="pt-4 sm:pt-0 sm:pl-6 space-y-1">
            <span className="text-[10px] font-bold text-[#0F766E] uppercase tracking-wider block">
              FIRST-TIME VOLUME
            </span>
            <p className="text-2xl font-extrabold text-[#0B192C] font-mono">
              ₹{(totalVolumeINR / 10000000).toFixed(2)} Cr
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-[#E2E8F0] pb-4">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            statusFilter === 'ALL'
              ? 'bg-[#0B192C] text-white shadow-xs'
              : 'bg-white text-[#475569] border border-[#E2E8F0] hover:bg-slate-50'
          }`}
        >
          All First-Time ({allCases.length})
        </button>

        <button
          onClick={() => setStatusFilter('SUSPICIOUS_ONLY')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            statusFilter === 'SUSPICIOUS_ONLY'
              ? 'bg-red-700 text-white shadow-xs'
              : 'bg-white text-red-700 border border-red-200 hover:bg-red-50'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          Flagged ({suspiciousCount})
        </button>

        <button
          onClick={() => setStatusFilter('NORMAL_ONLY')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            statusFilter === 'NORMAL_ONLY'
              ? 'bg-[#0F766E] text-white shadow-xs'
              : 'bg-white text-[#475569] border border-[#E2E8F0] hover:bg-slate-50'
          }`}
        >
          Normal Flag ({normalCount})
        </button>

        <button
          onClick={() => setReviewFilter(reviewFilter === 'PENDING_REVIEW' ? 'ALL' : 'PENDING_REVIEW')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            reviewFilter === 'PENDING_REVIEW'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'bg-white text-blue-800 border border-blue-200 hover:bg-blue-50'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          Pending Review ({pendingCount})
        </button>
      </div>

      <Card className="p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search TXN ID, Customer, Counterparty, Narrative..."
          />

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
              <span className="font-bold">Channel:</span>
              <select
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value)}
                className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 text-xs text-[#0F172A] font-semibold focus:outline-none"
              >
                <option value="ALL">All Channels</option>
                <option value="IB">Internet Banking (IB)</option>
                <option value="UPI">UPI</option>
                <option value="NEFT">NEFT</option>
                <option value="ACH">ACH</option>
                <option value="SWIFT">SWIFT</option>
                <option value="ATM">ATM</option>
                <option value="RTGS">RTGS</option>
              </select>
            </div>

            {(channelFilter !== 'ALL' || searchQuery !== '' || statusFilter !== 'ALL' || reviewFilter !== 'ALL') && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setStatusFilter('ALL');
                  setChannelFilter('ALL');
                  setReviewFilter('ALL');
                  setSearchQuery('');
                }}
                className="text-xs"
              >
                Reset Filters
              </Button>
            )}
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredData}
          onRowClick={(row) => navigate(`/payees/${row.txn_id}`)}
        />
      </Card>
    </div>
  );
}
