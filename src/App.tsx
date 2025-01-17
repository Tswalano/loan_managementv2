// src/App.tsx
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import { AuthContext } from './lib/auth';
import { supabase } from './lib/supabase';
import { ProtectedRoute } from './components/auth/protected-route';
import RootLayout from './components/layout/root-layout';
import TransactionsPage from './pages/transactions';
import LoanSummaryPage from './pages/loans';
import LoginPage from './pages/auth/login';
import type { User } from '@supabase/supabase-js';
import BalanceOperationsUI from './pages/test';
import DashboardPage from './pages/dashboard';
import { Toaster } from '@/components/ui/toaster';
import AccountManagementPage from './pages/accounts';
import LandingPage from './pages/landing';
import RequestAccessPage from './pages/RequestAccess';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and set the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes in auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      <ThemeProvider defaultTheme="light" storageKey="loan-manager-theme">
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/request-access" element={<RequestAccessPage />} />

            {/* Protected routes */}
            <Route
              path="/app/*"
              element={
                <ProtectedRoute>
                  <RootLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="test" element={<BalanceOperationsUI />} />
              <Route path="transactions" element={<TransactionsPage />} />
              <Route path="loans" element={<LoanSummaryPage />} />
              <Route path="bank-accounts" element={<AccountManagementPage />} />
              {/* Catch all route for /app/* */}
              <Route path="*" element={<Navigate to="/app" replace />} />
            </Route>

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster />
        </Router>
      </ThemeProvider>
    </AuthContext.Provider>
  );
}

export default App;
