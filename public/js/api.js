// public/js/api.js
// Shared API helper for all pages

const API = {
  base: '/api',

  token() {
    return localStorage.getItem('ms_token');
  },

  setToken(t) {
    localStorage.setItem('ms_token', t);
  },

  clearToken() {
    localStorage.removeItem('ms_token');
    localStorage.removeItem('ms_user');
  },

  setUser(u) {
    localStorage.setItem('ms_user', JSON.stringify(u));
  },

  getUser() {
    try {
      return JSON.parse(localStorage.getItem('ms_user'));
    } catch {
      return null;
    }
  },

  async request(path, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    const token = this.token();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let res;
    try {
      res = await fetch(this.base + path, { ...options, headers });
    } catch (err) {
      throw new Error('Network error. Please check your connection.');
    }

    let data;
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    if (!res.ok) {
      throw new Error(data.error || 'Something went wrong');
    }
    return data;
  },

  get(path) { return this.request(path, { method: 'GET' }); },
  post(path, body) { return this.request(path, { method: 'POST', body: JSON.stringify(body) }); },
};

function requireAuth() {
  if (!API.token()) {
    window.location.href = '/';
    return false;
  }
  return true;
}

function logout() {
  API.clearToken();
  window.location.href = '/';
}
