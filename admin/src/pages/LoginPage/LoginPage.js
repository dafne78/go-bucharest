// /admin/src/pages/LoginPage/LoginPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import './Login.css';

const LoginPage = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Check if already authenticated
    if (isAuthenticated) {
      navigate('/');
      return;
    }

    // Check for token in localStorage
    const token = localStorage.getItem('admin_auth_token');
    if (token) {
      handleLogin(token);
    }
  }, []);

  const handleLogin = async (token) => {
    setError('');
    setLoading(true);

    try {
      if (!token) {
        setError('No authentication token found. Please access the admin panel through the main application.');
        return;
      }

      const success = await authService.setToken(token);
      if (success) {
        navigate('/');
      } else {
        setError('Authentication failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during authentication. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Admin Dashboard</h1>
          <p>Sign in to continue</p>
        </div>
        
        {error && (
          <div className="error-alert">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}
        
        <form className="login-form" onSubmit={(e) => {
          e.preventDefault();
          const token = localStorage.getItem('admin_auth_token');
          handleLogin(token);
        }}>
          <p className="login-message">
            Please access the admin panel through the main application using your admin account.
          </p>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="button-spinner"></span>
                Authenticating...
              </>
            ) : (
              'Authenticate'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;