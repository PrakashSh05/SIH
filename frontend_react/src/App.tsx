import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import AppLayout from './components/AppLayout';
import DashboardPage from './pages/DashboardPage';
import ObservationsPage from './pages/ObservationsPage';
import SocialFeedPage from './pages/SocialFeedPage';
import MapAnalysisPage from './pages/MapAnalysisPage';
import RoleBasedRedirector from './components/RoleBasedRedirector';
import CitizenLayout from './components/CitizenLayout';
import CitizenMapPage from './pages/CitizenMapPage';
import CitizenReportPage from './pages/CitizenReportPage';
import OfficialDashboardPage from './pages/OfficialDashboardPage';

// This component now handles the initial login and redirects to the role checker
/*function AuthRedirector() {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>; // Or a spinner
  return user ? <RoleBasedRedirector /> : <LoginPage />;
}*/

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            {/* The redirector that sends users to the correct dashboard */}
            <Route path="/" element={<RoleBasedRedirector />} />

            {/* Citizen Routes */}
            <Route path="/citizen" element={<CitizenLayout />}>
              <Route path="map" element={<CitizenMapPage />} />
              <Route path="report" element={<CitizenReportPage />} />
            </Route>

            {/* Official Routes */}
            <Route path="/official/dashboard" element={<OfficialDashboardPage />} />

            {/* Admin/Analyst Routes */}
            <Route path="/admin" element={<AppLayout />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="observations" element={<ObservationsPage />} />
              <Route path="map-analysis" element={<MapAnalysisPage />} />
              <Route path="social-feed" element={<SocialFeedPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;