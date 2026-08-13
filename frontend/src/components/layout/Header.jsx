import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, ChevronDown, LogOut, Building2, User } from 'lucide-react';
import { ROLE_CONFIG } from '../../config/roles.js';

export function Header({
  currentUser = { name: 'Sarah Jenkins', role: 'COMPLIANCE_OFFICER' },
  onLogout,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navTabs = [
    { label: 'Overview', path: '/' },
    { label: 'Operations', path: '/transactions' },
    { label: 'Risk & Compliance', path: '/risk-compliance' },
    { label: 'Customers', path: '/customers' },
    { label: 'Reports', path: '/reports' },
  ];

  const roleMeta = ROLE_CONFIG[currentUser.role] || { name: currentUser.role };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/transactions?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-[#E2E8F0] px-6 sm:px-8 flex items-center justify-between sticky top-0 z-40 shadow-xs">
      {/* Left Brand Identity */}
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => navigate('/dashboard')}>
          <div className="p-2 bg-[#0B192C] rounded-lg text-white shadow-xs">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight text-[#0B192C] leading-none">
              ITSS BANKING
            </span>
            <span className="text-[9px] text-[#0F766E] font-bold tracking-widest uppercase mt-0.5">
              Ops & Compliance
            </span>
          </div>
        </div>

        {/* Primary Corporate Header Navigation */}
        <nav className="hidden md:flex items-center gap-1 border-l border-[#E2E8F0] pl-6">
          {navTabs.map((tab) => {
            const isActive =
              location.pathname === tab.path ||
              (tab.path !== '/' && location.pathname.startsWith(tab.path));
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0B192C] text-white shadow-xs'
                    : 'text-[#475569] hover:bg-slate-50 hover:text-[#0B192C]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Center Extended Search Bar */}
      <div className="relative hidden md:flex items-center flex-1 max-w-md mx-6">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearchSubmit}
          placeholder="Search TXN ID, Customer ID/Name, Loan App ID..."
          className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-10 pr-4 py-2 text-xs text-[#0F172A] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C] transition-all shadow-xs"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Notifications Icon */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 rounded-lg relative transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl border border-[#E2E8F0] corporate-card-shadow p-3.5 z-50 text-xs space-y-2">
              <h4 className="font-bold text-[#0F172A] border-b border-[#E2E8F0] pb-2">
                System Alerts (2)
              </h4>
              <div className="space-y-2">
                <div className="p-2.5 bg-red-50/80 rounded-lg border border-red-200 text-red-900">
                  <p className="font-bold text-[11px]">Critical Risk Transfer Flagged</p>
                  <p className="text-[10px] text-red-700 mt-0.5">TXN FT900002 &bull; ₹11,51,342.19 to OFFSHORE.X</p>
                </div>
                <div className="p-2.5 bg-amber-50/80 rounded-lg border border-amber-200 text-amber-900">
                  <p className="font-bold text-[11px]">KYC Re-verification Due</p>
                  <p className="text-[10px] text-amber-700 mt-0.5">17 Customers with expired KYC</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Authenticated User Menu — Avatar/Name Click Navigates to /profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 pl-2.5 border-l border-[#E2E8F0] hover:opacity-90 focus:outline-none cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-[#0B192C] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {currentUser.name ? currentUser.name.split(' ').map((n) => n[0]).join('') : 'US'}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-[#0F172A] leading-tight">{currentUser.name}</span>
              <span className="text-[10px] text-[#64748B] font-semibold">{roleMeta.name}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-[#E2E8F0] corporate-card-shadow p-2 z-50 text-xs space-y-1">
              <div className="px-3 py-2.5 border-b border-[#E2E8F0]">
                <p className="font-bold text-[#0F172A]">{currentUser.name}</p>
                <p className="text-[10px] text-[#64748B]">{currentUser.email || 'Internal User'}</p>
              </div>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate('/profile');
                }}
                className="w-full px-3 py-2 text-left text-[#0F172A] hover:bg-slate-50 rounded-lg flex items-center gap-2 font-bold transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-[#0F766E]" />
                View Employee Profile
              </button>

              {onLogout && (
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout();
                  }}
                  className="w-full px-3 py-2 text-left text-red-700 hover:bg-red-50 rounded-lg flex items-center gap-2 font-bold transition-colors cursor-pointer border-t border-[#E2E8F0] mt-1 pt-2"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-600" />
                  Sign Out
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
