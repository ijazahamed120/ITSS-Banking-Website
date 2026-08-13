import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  ShieldCheck,
  Lock,
  Mail,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Key,
  Activity,
  Award,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { ROLE_CONFIG } from '../../config/roles.js';
import { getAuditEvents } from '../../services/audit/auditService.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const currentUser = user || {
    name: 'Sarah Jenkins',
    email: 'compliance@itss.com',
    role: 'COMPLIANCE_OFFICER',
    id: 'EMP-9021',
  };

  const roleMeta = ROLE_CONFIG[currentUser.role] || {
    name: currentUser.role,
    description: 'Internal Banking Operations Employee',
  };

  // Get user audit history
  const allAuditEvents = getAuditEvents();
  const userAuditEvents = allAuditEvents.filter(
    (e) => e.actingUser?.email === currentUser.email || e.actingUser?.name === currentUser.name
  );

  return (
    <div className="space-y-8 pb-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-[#64748B]">
          <Link to="/dashboard" className="hover:text-[#0B192C] hover:underline font-semibold">
            Overview
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-bold text-[#0F172A]">Employee Profile</span>
        </div>

        <Button variant="secondary" size="sm" onClick={() => navigate('/dashboard')} className="text-xs font-bold">
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Overview
        </Button>
      </div>

      {/* Profile Header Banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 corporate-card-shadow space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-[#E2E8F0] pb-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-[#0B192C] text-white flex items-center justify-center font-extrabold text-2xl shadow-md border-2 border-teal-500">
              {currentUser.name ? currentUser.name.split(' ').map((n) => n[0]).join('') : 'US'}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B192C] tracking-tight">
                  {currentUser.name}
                </h1>
                <Badge variant="teal" className="text-xs px-3 py-1 font-bold">
                  ACTIVE EMPLOYEE
                </Badge>
              </div>

              <p className="text-sm font-semibold text-[#475569]">
                {roleMeta.name} &bull; ITSS Banking Operations & Compliance
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-1.5">
            <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 text-xs">
              <Lock className="w-3.5 h-3.5 text-[#0F766E]" />
              <span className="text-[10px] text-[#64748B] font-bold uppercase">Assigned Role:</span>
              <span className="font-mono font-bold text-[#0B192C] text-xs">
                {currentUser.role}
              </span>
            </div>
            <span className="text-[10px] text-[#64748B]">Role permissions assigned strictly by account credentials.</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2">
          <div>
            <span className="text-[10px] font-bold text-[#64748B] uppercase">Employee ID</span>
            <p className="font-mono font-bold text-[#0B192C] mt-0.5">{currentUser.id || 'EMP-9021'}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#64748B] uppercase">Corporate Email</span>
            <p className="font-mono font-bold text-[#0F172A] mt-0.5">{currentUser.email || 'compliance@itss.com'}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#64748B] uppercase">Department</span>
            <p className="font-bold text-[#0F172A] mt-0.5">Banking Operations & Compliance</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#64748B] uppercase">Authentication</span>
            <p className="font-semibold text-[#0F766E] mt-0.5">Enterprise SSO Verified</p>
          </div>
        </div>
      </div>

      {/* Main Profile Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN (60%): PERSONAL INFO & ROLE RESPONSIBILITIES */}
        <div className="lg:col-span-7 space-y-6">
          {/* Personal Information */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#0B192C]" />
                <h3 className="text-xs font-bold text-[#0B192C] uppercase tracking-wider">
                  Personal Information
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-[#E2E8F0]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase block">Full Official Name</span>
                <p className="font-bold text-[#0F172A] mt-1">{currentUser.name}</p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-[#E2E8F0]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase block">Account Email</span>
                <p className="font-mono font-bold text-[#0F172A] mt-1">{currentUser.email || 'compliance@itss.com'}</p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-[#E2E8F0]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase block">Employee ID Code</span>
                <p className="font-mono font-bold text-[#0B192C] mt-1">{currentUser.id || 'EMP-9021'}</p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-[#E2E8F0]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase block">Primary Work Location</span>
                <p className="font-bold text-[#0F172A] mt-1">Corporate HQ — Bangalore / Mumbai</p>
              </div>
            </div>
          </Card>

          {/* Role & Responsibilities */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#0B192C]" />
                <h3 className="text-xs font-bold text-[#0B192C] uppercase tracking-wider">
                  Role & Responsibilities
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#0F766E] font-bold">Assigned Scope</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-[#E2E8F0] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0F172A] text-sm">{roleMeta.name}</span>
                  <span className="font-mono text-[10px] bg-teal-50 text-[#0F766E] px-2 py-0.5 rounded font-bold border border-teal-200">
                    {currentUser.role}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed text-xs">
                  {roleMeta.description || 'Responsible for evaluating suspicious transfer alerts, verifying customer KYC compliance records, and executing credit decision notes.'}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-[#E2E8F0] space-y-2">
                <span className="font-bold text-[#0F172A] block">Operational Authority & Governance</span>
                <ul className="space-y-1.5 text-slate-600 list-disc list-inside text-[11px]">
                  <li>Authorized to review grounded AI investigation notes across E1, E2, and E3 ledgers.</li>
                  <li>Authorized to execute case actions (Mark Reviewed, Clear Flag, Escalate, Refer for Review) with immutable audit logging.</li>
                  <li>Strictly prohibited from modifying raw company CSV datasets or bypassing RBAC security policies.</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN (40%): SECURITY & ACCESS RIGHTS + AUDIT HISTORY */}
        <div className="lg:col-span-5 space-y-6">
          {/* Security & Access Rights */}
          <Card className="p-6 space-y-4 border-l-4 border-l-[#0B192C]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-[#0B192C]" />
                <h3 className="text-xs font-bold text-[#0B192C] uppercase tracking-wider">
                  Security & Access Rights
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#0F766E] font-bold">RBAC Enforced</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-[#E2E8F0] space-y-2">
                <span className="font-bold text-[#0F172A] block">Active Permission Grants:</span>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>View Official Company Ledgers</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-800 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Generate & Edit AI Analysis Notes</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-800 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Execute Compliance Case Decisions</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-800 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>View Audit Trail Logs</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-xl text-[11px] text-slate-600 space-y-1">
                <span className="font-bold text-[#0F172A]">Account Role Immutable:</span>
                <p className="leading-relaxed">
                  System roles are locked to employee login accounts and cannot be modified from the user interface.
                </p>
              </div>
            </div>
          </Card>

          {/* Recent Audit Activity */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#0B192C]" />
                <h3 className="text-xs font-bold text-[#0B192C] uppercase tracking-wider">
                  My Recent Compliance Actions ({userAuditEvents.length})
                </h3>
              </div>
            </div>

            {userAuditEvents.length > 0 ? (
              <div className="max-h-60 overflow-y-auto divide-y divide-[#E2E8F0] text-xs">
                {userAuditEvents.map((evt) => (
                  <div key={evt.id} className="py-2.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#0B192C]">{evt.txnId}</span>
                      <span className="text-[10px] text-[#64748B]">{new Date(evt.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="font-semibold text-[#0F172A]">{evt.action}</p>
                    <span className="text-[10px] text-[#64748B]">Status: {evt.previousStatus} &rarr; {evt.newStatus}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#64748B] italic">No compliance actions logged in current session.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
