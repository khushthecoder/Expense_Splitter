import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach token if we have one (future proofing)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (email, password) => api.post('/login', { username: email, password }),
  signup: (data) => api.post('/signup', data),
  getUsers: () => api.get('/users'),
};

export const friendService = {
  getAll: (userId) => api.get(`/friends?user_id=${userId}`),
  add: (userId, email) => api.post('/friends', { user_id: userId, email }),
  remove: (userId, friendId) => api.delete(`/friends/${friendId}?user_id=${userId}`),
  invite: (data) => api.post('/friends/invite', data),
};

export const groupService = {
  getAll: (userId) => api.get(`/groups?user_id=${userId}`),
  getById: (id) => api.get(`/groups/${id}`),
  create: (data) => api.post('/groups', data),
  addMember: (groupId, userId) => api.post(`/groups/${groupId}/members`, { user_id: userId }),
  removeMember: (groupId, userId) => api.delete(`/groups/${groupId}/members/${userId}`),
  invite: (groupId, data) => api.post(`/groups/${groupId}/invite`, data),
};

export const expenseService = {
  getByGroup: (groupId) => api.get(`/groups/${groupId}/expenses`),
  create: (data) => api.post('/expenses', data),
  delete: (id) => api.delete(`/expenses/${id}`),
};

export const settlementService = {
  getByGroup: (groupId) => api.get(`/groups/${groupId}/settlements`),
  create: (data) => api.post('/settlements', data),
};

export default api;
