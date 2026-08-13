import React, { useState } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { AppLayout } from './components/layout/AppLayout.jsx';
import { AppRoutes } from './routes/AppRoutes.jsx';

function MainAppContent() {
  const [activeNav, setActiveNav] = useState('dashboard');
  const location = useLocation();

  // If on login page, render full screen without the main sidebar/header layout
  if (location.pathname === '/login') {
    return <AppRoutes />;
  }

  return (
    <AppLayout activeNav={activeNav} onSelectNav={setActiveNav}>
      <AppRoutes />
    </AppLayout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <MainAppContent />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
