import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage/LoginPage';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import UserPage from './pages/UsersPage/UserPage';
import EventsPage from './pages/EventsPage/EventsPage';
import TagsPage from './pages/TagsPage/TagsPage';
import CategoryPage from './pages/CategoryPage/CategoryPage';
import Sidebar from './components/common/Sidebar/Sidebar';
import './App.css';

// Import global styles
import './styles/variables.css';
import './styles/global.css';

// Component to handle token in URL
const TokenHandler = ({ children }) => {
  const location = useLocation();
  
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token');
    
    if (token) {
      // Store token in localStorage
      localStorage.setItem('admin_auth_token', token);
      // Remove token from URL without refreshing
    }
  }, [location]);

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <TokenHandler>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            {/* Redirect /admin to / */}
            <Route path="/admin" element={<Navigate to="/" replace />} />
            
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <div className="admin-app">
                    <Sidebar />
                    <main className="content">
                      <DashboardPage />
                    </main>
                  </div>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <div className="admin-app">
                    <Sidebar />
                    <main className="content">
                      <UserPage />
                    </main>
                  </div>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/events"
              element={
                <ProtectedRoute>
                  <div className="admin-app">
                    <Sidebar />
                    <main className="content">
                      <EventsPage />
                    </main>
                  </div>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/tags"
              element={
                <ProtectedRoute>
                  <div className="admin-app">
                    <Sidebar />
                    <main className="content">
                      <TagsPage />
                    </main>
                  </div>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/categories"
              element={
                <ProtectedRoute>
                  <div className="admin-app">
                    <Sidebar />
                    <main className="content">
                      <CategoryPage />
                    </main>
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </TokenHandler>
      </Router>
    </AuthProvider>
  );
}

export default App;