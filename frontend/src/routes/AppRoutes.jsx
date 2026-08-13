import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/auth/LoginPage.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';
import { ProtectedTestPage } from '../pages/dashboard/ProtectedTestPage.jsx';
import { TransactionListPage } from '../pages/transactions/TransactionListPage.jsx';
import { TransactionInvestigationPage } from '../pages/transactions/TransactionInvestigationPage.jsx';
import { CustomerListPage } from '../pages/customers/CustomerListPage.jsx';
import { CustomerDetailPage } from '../pages/customers/CustomerDetailPage.jsx';
import { LoanListPage } from '../pages/loans/LoanListPage.jsx';
import { LoanDetailPage } from '../pages/loans/LoanDetailPage.jsx';
import { PayeeListPage } from '../pages/payees/PayeeListPage.jsx';
import { PayeeDetailPage } from '../pages/payees/PayeeDetailPage.jsx';
import { ReportsPage } from '../pages/reports/ReportsPage.jsx';
import { RiskCompliancePage } from '../pages/risk/RiskCompliancePage.jsx';
import { ProfilePage } from '../pages/profile/ProfilePage.jsx';
import { ComponentShowcase } from '../pages/ComponentShowcase.jsx';
import { Unauthorized } from '../pages/errors/Unauthorized.jsx';
import { NotFound } from '../pages/errors/NotFound.jsx';
import { USER_ROLES } from '../utils/constants.js';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Auth Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Default Route - Redirect to Login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Executive Portal Entry (Protected) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <ProtectedTestPage />
          </ProtectedRoute>
        }
      />

      {/* Operations Portal (Alias / Route for /transactions) */}
      <Route
        path="/operations"
        element={
          <ProtectedRoute>
            <Navigate to="/transactions" replace />
          </ProtectedRoute>
        }
      />

      {/* Employee Profile Route */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* E1 — Suspicious Transfer Explainer Routes */}
      <Route
        path="/transactions"
        element={
          <ProtectedRoute>
            <TransactionListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/transactions/:id"
        element={
          <ProtectedRoute>
            <TransactionInvestigationPage />
          </ProtectedRoute>
        }
      />

      {/* E2 — KYC Profile Summarizer Routes */}
      <Route
        path="/customers"
        element={
          <ProtectedRoute>
            <CustomerListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers/:id"
        element={
          <ProtectedRoute>
            <CustomerDetailPage />
          </ProtectedRoute>
        }
      />

      {/* E3 — Loan Decision Note Writer Routes */}
      <Route
        path="/loans"
        element={
          <ProtectedRoute>
            <LoanListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/loans/:id"
        element={
          <ProtectedRoute>
            <LoanDetailPage />
          </ProtectedRoute>
        }
      />

      {/* E4 — First-Time Payee Risk Note Routes */}
      <Route
        path="/payees"
        element={
          <ProtectedRoute>
            <PayeeListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payees/:txnId"
        element={
          <ProtectedRoute>
            <PayeeDetailPage />
          </ProtectedRoute>
        }
      />

      {/* Risk & Compliance Dashboard */}
      <Route
        path="/risk-compliance"
        element={
          <ProtectedRoute
            allowedRoles={[
              USER_ROLES.ADMIN,
              USER_ROLES.COMPLIANCE_OFFICER,
              USER_ROLES.RISK_ANALYST,
              USER_ROLES.AUDITOR,
            ]}
          >
            <RiskCompliancePage />
          </ProtectedRoute>
        }
      />

      {/* Reports & Analytics */}
      <Route
        path="/reports"
        element={
          <ProtectedRoute
            allowedRoles={[
              USER_ROLES.ADMIN,
              USER_ROLES.COMPLIANCE_OFFICER,
              USER_ROLES.RISK_ANALYST,
              USER_ROLES.AUDITOR,
            ]}
          >
            <ReportsPage />
          </ProtectedRoute>
        }
      />

      {/* Stage 1 Development Route preserved */}
      <Route path="/showcase" element={<ComponentShowcase />} />

      {/* Error & Unauthorized Routes */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
