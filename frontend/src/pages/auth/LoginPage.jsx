import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { BRAND_CONFIG } from '../../utils/constants.js';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import {
  Building2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Redirect if already authenticated (using useEffect, not in render)
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const authenticatedUser = await login({ email, password, rememberMe });
      if (authenticatedUser) {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setAuthError(err.message || 'Invalid employee ID or password. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F8FAFC]">
      {/* LEFT PANEL (55%): Deep Corporate Banking Visual Hero */}
      <div className="hidden lg:flex lg:w-[55%] bg-[#0B192C] text-white p-14 flex-col justify-between relative overflow-hidden corporate-banner-glow">
        {/* Abstract Background Texture */}
        <div className="absolute inset-0 bg-[radial-gradient(#1E3A5F_1px,transparent_1px)] [background-size:28px_28px] opacity-25 pointer-events-none" />

        {/* Corporate Header Logo */}
        <div className="flex items-center gap-3.5 z-10">
          <div className="p-2.5 bg-[#0F766E] rounded-lg text-white shadow-md">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white leading-none">
              ITSS BANKING
            </h1>
            <p className="text-xs text-teal-300 font-bold tracking-widest uppercase mt-0.5">
              Ops & Compliance Console
            </p>
          </div>
        </div>

        {/* Hero Narrative */}
        <div className="max-w-xl space-y-6 z-10 my-auto py-12">
          <Badge variant="teal" className="bg-teal-900/60 text-teal-300 border-teal-700 font-mono text-[11px] px-3 py-1">
            Institutional Banking Platform
          </Badge>

          <h2 className="text-4xl font-extrabold tracking-tight leading-tight text-white">
            Intelligent control for modern banking operations.
          </h2>

          <p className="text-base text-slate-300 leading-relaxed font-normal">
            Monitor transaction activity, investigate suspicious transfers, review customer risk context, and maintain complete compliance visibility across the banking enterprise.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10 text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
              <span className="font-medium">Verified Ledger Evidence</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
              <span className="font-medium">Grounded AI Investigation</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
              <span className="font-medium">Account-Assigned Security</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
              <span className="font-medium">Indian Rupee (₹) Ledger</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs text-slate-400 z-10 flex items-center justify-between border-t border-white/10 pt-4">
          <div className="flex items-center gap-2 text-teal-300 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Bank Security & Compliance Protocol</span>
          </div>
          <span className="font-mono text-[11px] text-slate-400">{BRAND_CONFIG.version}</span>
        </div>
      </div>

      {/* RIGHT PANEL (45%): Clean White Corporate Banking Login Panel */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Brand Header */}
          <div className="lg:hidden flex items-center gap-3">
            <div className="p-2 bg-[#0B192C] rounded-lg text-white">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-[#0B192C]">
                ITSS BANKING
              </h1>
              <p className="text-[10px] text-[#0F766E] font-bold tracking-wider uppercase">
                Ops & Compliance Console
              </p>
            </div>
          </div>

          {/* Title Header */}
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
              Welcome back
            </h2>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Sign in to access your authorized ITSS Banking Operations Console.
            </p>
          </div>

          {/* Authentication Error Banner */}
          {authError && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span className="font-medium">{authError}</span>
            </div>
          )}

          {/* Strictly Form Fields (NO ROLE SELECTORS) */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0F172A]">Employee Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter employee email"
                  className="w-full bg-white border border-[#E2E8F0] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#0F172A] font-medium focus:outline-none focus:ring-2 focus:ring-[#0B192C] transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#0F172A]">Password</label>
                <span className="text-[11px] text-[#64748B] hover:text-[#0B192C] cursor-pointer">Forgot password?</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full bg-white border border-[#E2E8F0] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#0F172A] font-medium focus:outline-none focus:ring-2 focus:ring-[#0B192C] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-[#475569] cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#E2E8F0] text-[#0B192C] focus:ring-[#0B192C]"
                />
                Keep session authenticated
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isAuthenticating}
              className="w-full text-xs font-bold py-3 shadow-xs"
            >
              {isAuthenticating ? 'Authenticating Account...' : 'Sign In'} <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
