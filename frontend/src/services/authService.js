// /frontend/src/services/authService.js
const TOKEN_KEY = 'admin_auth_token';
const USER_KEY = 'admin_user';

const authService = {
  setToken: (token) => {
    if (token && token.trim() !== '') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },

  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  hasToken: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    return !!(token && token.trim() !== '');
  },

  removeToken: () => {
    localStorage.removeItem(TOKEN_KEY);
  },

  setUser: (user) => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  getUser: () => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    const token = authService.getToken();
    return !!token;
  },

  removeUser: () => {
    localStorage.removeItem(USER_KEY);
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  login: (token, user) => {
    if (token && token.trim() !== '') {
      localStorage.setItem(TOKEN_KEY, token);
    }
    
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  }
};

export default authService;