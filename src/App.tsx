// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';;
import RootLayout from './components/layout/root-layout';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { api } from '@/lib/api';
// Page imports
import TransactionsPage from './pages/transactions';
import LoanSummaryPage from './pages/loans';
import LoginPage from './pages/auth/login';
import DashboardPage from './pages/dashboard';
import AccountManagementPage from './pages/accounts';
import LandingPage from './pages/landing';
import RequestAccessPage from './pages/RequestAccess';
import SettingsAndProfilePage from './pages/settings';
import ContactSalesPage from './pages/contact-sales';
import { ProtectedRoute } from './components/ProtectedRoute';
import StokvelPage from './pages/stokvel';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Initialize API with query client
api.setQueryClient(queryClient);

function AppRoutes() {
  // No need to check user here - ProtectedRoute handles it
  // This allows public routes to render immediately without loading state

  return (
    <Routes>
      {/* Public routes accessible without authentication */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/contact-sales" element={<ContactSalesPage />} />
      <Route path="/app/login" element={<LoginPage />} />
      <Route path="/app/request-access" element={<RequestAccessPage />} />

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
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="loans" element={<LoanSummaryPage />} />
        <Route path="bank-accounts" element={<AccountManagementPage />} />
        <Route path="stokvel" element={<StokvelPage />} />
        <Route path="settings" element={<SettingsAndProfilePage />} />
        {/* Catch all route for /app/* */}
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Route>

      {/* Global catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
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