import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldAlert,
  Search,
  Filter,
  ArrowUpRight,
  TrendingUp,
  FileText,
  AlertTriangle,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import {
  getAllTransactions,
  filterTransactions,
  getCustomerById,
} from '../../services/data/csvLoader.js';
import { getE1ActionStatusMap } from '../../services/audit/auditService.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { formatDate } from '../../utils/formatters.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { SearchBar } from '../../components/common/SearchBar.jsx';
import { DataTable } from '../../components/common/DataTable.jsx';

export function TransactionListPage() {
  const navigate = useNavigate();

  // Filter state
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'SUSPICIOUS_ONLY' | 'NORMAL_ONLY'
  const [typeFilter, setTypeFilter] = useState('ALL'); // 'ALL' | 'DEBIT' | 'CREDIT'
  const [channelFilter, setChannelFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionStatusMap, setActionStatusMap] = useState({});
  const [allTxns, setAllTxns] = useState([]);

  // Load transactions and action status on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const txns = getAllTransactions();
        setAllTxns(txns);
        const statusMap = await getE1ActionStatusMap();
        setActionStatusMap(statusMap);
      } catch (err) {
        console.error('Failed to load transactions:', err);
        setAllTxns([]);
        setActionStatusMap({});
      }
    };

    loadData();
  }, []);
  const suspiciousCount = useMemo(
    () => allTxns.filter((t) => t.is_suspicious === 'Y').length,
    [allTxns]
  );
  const normalCount = allTxns.length - suspiciousCount;
  const totalVolumeINR = useMemo(
    () => allTxns.reduce((acc, t) => acc + Math.abs(t.amount || 0), 0),
    [allTxns]
  );

  // Filtered dataset with E1 officer action status from audit persistence
  const filteredData = useMemo(() => {
    return filterTransactions({
      status: statusFilter,
      type: typeFilter,
      channel: channelFilter,
      searchQuery: searchQuery,
    }).map((t) => ({
      ...t,
      officer_action_status: actionStatusMap[String(t.txn_id).toUpperCase()] || null,
    }));
  }, [statusFilter, typeFilter, channelFilter, searchQuery, actionStatusMap]);

  const renderActionStatus = (status) => {
    if (!status) {
      return <span className="text-[10px] text-[#94A3B8] font-semibold">—</span>;
    }
    if (status === 'ESCALATED') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-extrabold bg-red-50 text-red-800 border border-red-200 rounded-md uppercase">
          Escalated
        </span>
      );
    }
    if (status === 'REVIEWED') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-extrabold bg-slate-100 text-slate-800 border border-slate-200 rounded-md uppercase">
          Reviewed
        </span>
      );
    }
    if (status === 'CLEARED') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md uppercase">
          Cleared
        </span>
      );
    }
    if (status === 'REFERRED') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200 rounded-md uppercase">
          Referred
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-extrabold bg-slate-50 text-slate-700 border border-slate-200 rounded-md uppercase">
        {status}
      </span>
    );
  };

  // Institutional Table Columns
  const columns = [
    {
      header: 'TXN ID',
      key: 'txn_id',
      render: (val, row) => (
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-[#0B192C] text-xs">{val}</span>
        </div>
      ),
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
      header: 'Counterparty',
      key: 'counterparty',
      render: (val, row) => (
        <div className="flex flex-col max-w-[170px]">
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
      header: 'Type',
      key: 'txn_type',
      render: (val) => (
        <Badge variant={val === 'DEBIT' ? 'default' : 'teal'}>
          {val}
        </Badge>
      ),
    },
    {
      header: 'Amount (INR)',
      key: 'amount',
      render: (val, row) => {
        const formatted = formatCurrency(Math.abs(val));
        const isDebit = row.txn_type === 'DEBIT' || val < 0;
        return (
          <span className={`text-xs font-bold font-mono ${isDebit ? 'text-[#0F172A]' : 'text-emerald-700'}`}>
            {isDebit ? '-' : '+'}{formatted}
          </span>
        );
      },
    },
    {
      header: 'Status',
      key: 'is_suspicious',
      render: (val) => (
        val === 'Y' ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-extrabold bg-red-50 text-red-800 border border-red-200 rounded-md uppercase">
            <ShieldAlert className="w-3 h-3 text-red-600" /> Flagged
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md uppercase">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Normal
          </span>
        )
      ),
    },
    {
      header: 'Officer Action',
      key: 'officer_action_status',
      render: (val) => renderActionStatus(val),
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
            navigate(`/transactions/${val}`);
          }}
          className="text-xs py-1 px-3 font-bold"
        >
          Investigate <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
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
        <span className="font-mono font-bold text-[#0B192C]">Suspicious Transfers</span>
      </div>

      {/* Institutional Heading */}
      <div className="space-y-2 border-b border-[#E2E8F0] pb-6">
        <div className="flex items-center gap-2">
          <Badge variant="navy">Official Company Ledger</Badge>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A]">
          Suspicious Transfer Operations
        </h1>
        <p className="text-sm text-[#64748B] font-normal">
          Review transaction activity using verified ledger evidence.
        </p>
      </div>

      {/* Editorial Statistics */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 corporate-card-shadow">
        <div className="grid grid-cols-1 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E2E8F0] text-center sm:text-left">
          <div className="pb-4 sm:pb-0 sm:pr-6 space-y-1">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
              TOTAL RECORDS
            </span>
            <p className="text-2xl font-extrabold text-[#0F172A] font-mono">{allTxns.length}</p>
          </div>

          <div className="py-4 sm:py-0 sm:px-6 space-y-1">
            <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block">
              FLAGGED SUSPICIOUS
            </span>
            <p className="text-2xl font-extrabold text-red-700 font-mono">{suspiciousCount}</p>
          </div>

          <div className="py-4 sm:py-0 sm:px-6 space-y-1">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
              NORMAL TRANSACTIONS
            </span>
            <p className="text-2xl font-extrabold text-emerald-800 font-mono">{normalCount}</p>
          </div>

          <div className="pt-4 sm:pt-0 sm:pl-6 space-y-1">
            <span className="text-[10px] font-bold text-[#0F766E] uppercase tracking-wider block">
              TOTAL VOLUME
            </span>
            <p className="text-2xl font-extrabold text-[#0B192C] font-mono">₹{(totalVolumeINR / 10000000).toFixed(2)} Cr</p>
          </div>
        </div>
      </div>

      {/* Status Preset Filter Bar */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-4">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            statusFilter === 'ALL'
              ? 'bg-[#0B192C] text-white shadow-xs'
              : 'bg-white text-[#475569] border border-[#E2E8F0] hover:bg-slate-50'
          }`}
        >
          All Transactions ({allTxns.length})
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
          Flagged Suspicious ({suspiciousCount})
        </button>

        <button
          onClick={() => setStatusFilter('NORMAL_ONLY')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            statusFilter === 'NORMAL_ONLY'
              ? 'bg-[#0F766E] text-white shadow-xs'
              : 'bg-white text-[#475569] border border-[#E2E8F0] hover:bg-slate-50'
          }`}
        >
          Normal Transactions ({normalCount})
        </button>
      </div>

      {/* Table Container & Controls */}
      <Card className="p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search TXN ID, Customer Name/ID, Counterparty, Narrative..."
          />

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
              <span className="font-bold">Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 text-xs text-[#0F172A] font-semibold focus:outline-none"
              >
                <option value="ALL">All Types</option>
                <option value="DEBIT">Debit</option>
                <option value="CREDIT">Credit</option>
              </select>
            </div>

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

            {(typeFilter !== 'ALL' || channelFilter !== 'ALL' || searchQuery !== '' || statusFilter !== 'ALL') && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setStatusFilter('ALL');
                  setTypeFilter('ALL');
                  setChannelFilter('ALL');
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
          onRowClick={(row) => navigate(`/transactions/${row.txn_id}`)}
        />
      </Card>
    </div>
  );
}
