import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import AppLayout from './components/AppLayout';
import DashboardPage from './pages/DashboardPage';
import ObservationsPage from './pages/ObservationsPage';
import SocialFeedPage from './pages/SocialFeedPage';
import { AppShell, Burger, Group, Skeleton, Text } from '@mantine/core';

// A component to handle redirection for logged-in users
function AuthRedirector() {
  const { user, loading } = useAuth();
  if (loading) return <Skeleton height="100vh" />;
  return user ? <Navigate to="/dashboard" replace /> : <LoginPage />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<AuthRedirector />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/observations" element={<ObservationsPage />} />
              <Route path="/social-feed" element={<SocialFeedPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;