// /admin/src/services/authService.js
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const TOKEN_KEY = 'admin_auth_token';
const USER_KEY = 'admin_user';

const authService = {
  setToken: async (token) => {
    if (token && token.trim() !== '') {
      try {
        // Store the token first
        localStorage.setItem(TOKEN_KEY, token);
        
        // Decode the JWT token to get user info
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const userData = JSON.parse(jsonPayload);
        
        // Store user info
        localStorage.setItem(USER_KEY, JSON.stringify({
          uid: userData.sub,
          email: userData.email,
          role: userData.role
        }));
        
        return true;
      } catch (error) {
        console.error('Error processing token:', error);
        // Clear any partial data
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        return false;
      }
    }
    return false;
  },

  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  hasToken: () => {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  removeToken: () => {
    localStorage.removeItem(TOKEN_KEY);
  },

  getUser: () => {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return false;

    try {
      // Check if token is expired
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const { exp } = JSON.parse(jsonPayload);
      return exp * 1000 > Date.now();
    } catch (error) {
      console.error('Error checking token:', error);
      return false;
    }
  },

  removeUser: () => {
    localStorage.removeItem(USER_KEY);
  },

  logout: async () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      return true;
    } catch (error) {
      console.error('Error signing out:', error);
      return false;
    }
  },

  // Initialize auth state listener
  initAuthStateListener: (callback) => {
    // Check authentication state immediately
    const isAuth = authService.isAuthenticated();
    const user = authService.getUser();
    callback(isAuth, user);

    // Set up interval to check token expiration
    const interval = setInterval(() => {
      const isAuth = authService.isAuthenticated();
      const user = authService.getUser();
      callback(isAuth, user);
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }
};

export default authService;