// /admin/src/services/authService.js
const TOKEN_KEY = 'admin_auth_token';
const USER_KEY = 'admin_user';

const authService = {
  setToken: (token) => {
    console.log('setToken called with:', token);
    if (token && token.trim() !== '') {
      localStorage.setItem(TOKEN_KEY, token);
      console.log('Token saved to localStorage');
    } else {
      console.log('Token is empty or invalid');
    }
  },

  getToken: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    console.log('getToken returned:', token);
    return token && token.trim() !== '' ? token : null;
  },

  hasToken: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    return !!(token && token.trim() !== '');
  },

  removeToken: () => {
    localStorage.removeItem(TOKEN_KEY);
  },

  setUser: (user) => {
    console.log('setUser called with:', user);
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      console.log('User saved to localStorage');
    } else {
      console.log('User is invalid');
    }
  },

  getUser: () => {
    const userStr = localStorage.getItem(USER_KEY);
    const user = userStr ? JSON.parse(userStr) : null;
    console.log('getUser returned:', user);
    return user;
  },

  isAuthenticated: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = localStorage.getItem(USER_KEY);
    const isAuth = !!(token && token.trim() !== '' && user);
    console.log('isAuthenticated:', isAuth);
    return isAuth;
  },

  removeUser: () => {
    localStorage.removeItem(USER_KEY);
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    console.log('Logged out - localStorage cleared');
  },

  login: (token, user) => {
    console.log('login called with token:', token, 'user:', user);
    
    // Salvează token-ul și user-ul doar dacă sunt valide
    if (token && token.trim() !== '') {
      localStorage.setItem(TOKEN_KEY, token);
      console.log('Token saved in login function');
    } else {
      console.log('Invalid token in login function');
    }
    
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      console.log('User saved in login function');
    } else {
      console.log('Invalid user in login function');
    }
    
    // Verifică dacă s-au salvat corect
    console.log('After login - Token in localStorage:', localStorage.getItem(TOKEN_KEY));
    console.log('After login - User in localStorage:', localStorage.getItem(USER_KEY));
  }
};

export default authService;