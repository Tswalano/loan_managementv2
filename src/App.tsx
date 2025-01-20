// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import { AuthContext } from './lib/auth';
import { ProtectedRoute } from './components/auth/protected-route';
import RootLayout from './components/layout/root-layout';
import { Toaster } from '@/components/ui/toaster';
import {
  QueryClient,
  QueryClientProvider
} from '@tanstack/react-query';

// Page imports
import TransactionsPage from './pages/transactions';
import LoanSummaryPage from './pages/loans';
import LoginPage from './pages/auth/login';
import BalanceOperationsUI from './pages/test';
import DashboardPage from './pages/dashboard';
import AccountManagementPage from './pages/accounts';
import LandingPage from './pages/landing';
import RequestAccessPage from './pages/RequestAccess';
import useUserSession from './hooks/useUserSession';
// import SettingsPage from './pages/settings';
import SettingsAndProfilePage from './pages/settings';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function AppRoutes() {
  const {
    user,
    isLoading,
    error
  } = useUserSession();

  // Show loading state

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-emerald-500 rounded-full animate-spin border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Error: {error.message}</p>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, loading: isLoading }}>
      <Routes>
        {/* Public routes accessible without authentication */}
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/app/login"
          element={
            user ? <Navigate to="/app" replace /> : <LoginPage />
          }
        />
        <Route
          path="/app/request-access"
          element={
            user ? <Navigate to="/app" replace /> : <RequestAccessPage />
          }
        />

        {/* Protected routes requiring authentication */}
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
          <Route path="settings" element={<SettingsAndProfilePage />} />
          {/* Catch all route for /app/* */}
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Route>

        {/* Global catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthContext.Provider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="loan-manager-theme">
        <Router>
          <AppRoutes />
          <Toaster />
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;