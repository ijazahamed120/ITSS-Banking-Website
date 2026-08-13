import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Building2 } from 'lucide-react';
import { NAVIGATION_ITEMS } from '../../config/navigation.js';
import { BRAND_CONFIG } from '../../utils/constants.js';
import { cn } from '../../utils/cn.js';

export function Sidebar({
  activeId = 'dashboard',
  userRole = 'COMPLIANCE_OFFICER',
  onSelectNav,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (item) => {
    if (onSelectNav) onSelectNav(item.id);
    if (item.path) {
      navigate(item.path);
    }
  };

  const coreItems = NAVIGATION_ITEMS.filter((i) => ['dashboard', 'transactions', 'customers', 'loans', 'payees'].includes(i.id));
  const reportingItems = NAVIGATION_ITEMS.filter((i) => i.id === 'reports');
  const systemItems = NAVIGATION_ITEMS.filter((i) => i.id === 'settings');

  const renderNavGroup = (title, items) => (
    <div className="space-y-1 py-1.5">
      <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        {title}
      </div>
      {items.map((item) => {
        const Icon = item.icon;
        const isAllowed = item.roles.includes(userRole);
        const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));

        return (
          <button
            key={item.id}
            onClick={() => isAllowed && handleNavClick(item)}
            disabled={!isAllowed}
            className={cn(
              'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all text-left relative cursor-pointer',
              isActive
                ? 'bg-[#0F766E] text-white shadow-xs font-bold'
                : isAllowed
                ? 'text-slate-300 hover:bg-white/10 hover:text-white'
                : 'text-slate-500 opacity-40 cursor-not-allowed'
            )}
          >
            <div className="flex items-center gap-3">
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </div>
            {item.badge && isAllowed && (
              <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <aside className="w-64 bg-[#0B192C] text-white flex flex-col h-screen sticky top-0 z-40 shrink-0 select-none shadow-lg border-r border-[#1E3A5F]">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center gap-3 border-b border-white/10 bg-[#060D18]">
        <div className="p-1.5 bg-[#0F766E] rounded-md text-white">
          <Building2 className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-sm tracking-tight text-white leading-none">
            ITSS BANKING
          </span>
          <span className="text-[9px] text-teal-300 font-bold tracking-wider uppercase mt-0.5">
            Ops & Compliance
          </span>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 py-3 px-3 space-y-3 overflow-y-auto divide-y divide-white/10">
        {renderNavGroup('Core Workflows', coreItems)}
        {renderNavGroup('Reporting', reportingItems)}
        {renderNavGroup('System', systemItems)}
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-white/10 bg-[#060D18]/70 text-[11px] text-slate-300 flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-teal-400 font-semibold">
          <Shield className="w-3.5 h-3.5" />
          <span>Internal Compliance Portal</span>
        </div>
        <span className="text-slate-400 text-[10px]">{BRAND_CONFIG.version}</span>
      </div>
    </aside>
  );
}
