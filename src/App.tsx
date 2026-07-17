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
import AcceptInvitationPage from './pages/auth/accept-invitation';
import DashboardPage from './pages/dashboard';
import AccountManagementPage from './pages/accounts';
import LandingPage from './pages/landing';
import RequestAccessPage from './pages/RequestAccess';
import SettingsPage from './pages/settings';
import ProfilePage from './pages/profile';
import ContactSalesPage from './pages/contact-sales';
import { ProtectedRoute } from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';

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
      <Route path="/app/invitations/:token" element={<AcceptInvitationPage />} />
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
        <Route
          index
          element={(
            <ProtectedRoute requiredPermission="canViewDashboard" deniedDescription="Your role does not allow access to the dashboard in this organization.">
              <DashboardPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="transactions"
          element={(
            <ProtectedRoute requiredPermission="canViewTransactions" deniedDescription="Your role does not allow access to transactions in this organization.">
              <TransactionsPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="loans"
          element={(
            <ProtectedRoute requiredPermission="canViewLoans" deniedDescription="Your role does not allow access to loans in this organization.">
              <LoanSummaryPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="bank-accounts"
          element={(
            <ProtectedRoute requiredPermission="canViewBankAccounts" deniedDescription="Your role does not allow access to bank accounts in this organization.">
              <AccountManagementPage />
            </ProtectedRoute>
          )}
        />
        <Route path="profile" element={<ProfilePage />} />
        <Route
          path="settings"
          element={(
            <ProtectedRoute requiredPermission="canManageSettings" deniedDescription="Your role does not allow access to organization settings.">
              <SettingsPage />
            </ProtectedRoute>
          )}
        />
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
          <ScrollToTop />
          <AppRoutes />
          <Toaster />
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
