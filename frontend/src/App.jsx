import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CropRecommendation from './pages/CropRecommendation';
import DiseaseDetection from './pages/DiseaseDetection';
import Weather from './pages/Weather';
import MarketPrices from './pages/MarketPrices';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AgriBot from './components/AgriBot';

// Layout wrapper for authenticated pages — renders sidebar + main content + AgriBot
function AppLayout() {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <AgriBot />
    </div>
  );
}

// Redirects authenticated users away from login/register pages
function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bgMain">
        <div className="spinner" style={{ width: '2.5rem', height: '2.5rem' }}></div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

// Root application component — defines all routes
function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Protected routes — wrapped in AppLayout with sidebar + AgriBot */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/crop" element={<CropRecommendation />} />
        <Route path="/disease" element={<DiseaseDetection />} />
        <Route path="/weather" element={<Weather />} />
        <Route path="/market" element={<MarketPrices />} />
      </Route>

      {/* Catch-all — redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
