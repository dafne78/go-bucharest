import { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(authService.isAuthenticated());

  useEffect(() => {
    // Check authentication status on mount
    const checkAuth = () => {
      setIsLoggedIn(authService.isAuthenticated());
    };
    checkAuth();
  }, []);

  const login = () => {
    setIsLoggedIn(true);
  };

  const logout = () => {
    authService.logout();
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}