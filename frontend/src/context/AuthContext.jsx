import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMe } from '../services/api';

const AuthContext = createContext(null);

// Hook to access auth state from any component
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// Provides authentication state and actions to the component tree
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('kishanai_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  // Verify stored token on app mount by calling /auth/me
  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('kishanai_token');
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      try {
        const res = await getMe();
        const userData = res.data.data;
        setUser(userData);
        localStorage.setItem('kishanai_user', JSON.stringify(userData));
      } catch {
        setUser(null);
        localStorage.removeItem('kishanai_token');
        localStorage.removeItem('kishanai_user');
      }
      setIsLoading(false);
    };
    verifyAuth();
  }, []);

  // Stores user data and JWT token after successful login
  const login = useCallback((userData, token) => {
    setUser(userData);
    localStorage.setItem('kishanai_token', token);
    localStorage.setItem('kishanai_user', JSON.stringify(userData));
  }, []);

  // Alias for login — used after registration for consistent API
  const register = useCallback((userData, token) => {
    setUser(userData);
    localStorage.setItem('kishanai_token', token);
    localStorage.setItem('kishanai_user', JSON.stringify(userData));
  }, []);

  // Clears all auth state and redirects to login
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('kishanai_token');
    localStorage.removeItem('kishanai_user');
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
