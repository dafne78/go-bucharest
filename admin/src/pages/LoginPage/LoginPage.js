// /admin/src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService';
import authService from '../../services/authService';
import './Login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!credentials.email || !credentials.password) {
      setError('Please fill in all fields.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Cerere de autentificare către API
      const response = await apiService.post('/auth/login', credentials);
      
      // Verifică structura răspunsului
      if (response.success && response.data) {
        const { token, ...userData } = response.data;
        
        // Salvăm token-ul și informațiile utilizatorului
        authService.login(token, userData);
        
        // Redirecționăm către dashboard
        navigate('/');
      } else {
        setError('Invalid response from server.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Authentication failed. Please check your email and password.');
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
            <span className="error-icon"></span>
            {error}
          </div>
        )}
        
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              disabled={loading}
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              disabled={loading}
              placeholder="Enter your password"
            />
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="button-spinner"></span>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;