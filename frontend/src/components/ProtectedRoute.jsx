import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Wraps protected routes — redirects to /login if user is not authenticated
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading screen while verifying auth token
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bgMain">
        <div className="text-center slide-up">
          <div className="text-5xl mb-4">🌾</div>
          <div className="spinner mx-auto mb-4" style={{ width: '2.5rem', height: '2.5rem' }}></div>
          <p className="text-textMuted font-medium">Loading KishanAi...</p>
        </div>
      </div>
    );
  }

  // Redirect unauthenticated users to login, preserving intended destination
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
