import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Enable HttpOnly Cookie support
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token to every request (header fallback alongside cookie)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexus_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Auth Services
export const authService = {
  googleAuth: (data) => api.post('/auth/google', data),
  checkEmail: (email) => api.post('/auth/check-email', { email }),
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCaptcha: () => api.get('/auth/captcha'),
  verifyEmail: (data) => api.post('/auth/verify-email', data),
  resendVerification: (data) => api.post('/auth/resend-verification', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  setupMfa: () => api.post('/auth/mfa/setup'),
  verifyMfaSetup: (data) => api.post('/auth/mfa/verify-setup', data),
  disableMfa: (data) => api.post('/auth/mfa/disable', data),
  getSecurityLogs: () => api.get('/auth/security-logs'),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  deleteAccount: (data) => api.delete('/auth/account', { data }),
};

// Admin Security Services
export const adminService = {
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  getUsers: () => api.get('/admin/users'),
  updateUserRole: (userId, role) => api.post('/admin/users/role', { userId, role }),
  unlockUser: (userId) => api.post(`/admin/users/${userId}/unlock`),
  getStats: () => api.get('/admin/stats'),
};

// Workspace Services
export const workspaceService = {
  getAll: () => api.get('/workspaces'),
  getById: (id) => api.get(`/workspaces/${id}`),
  create: (data) => api.post('/workspaces', data),
  delete: (id) => api.delete(`/workspaces/${id}`),
};

// Document Services
export const documentService = {
  upload: (formData) => api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getById: (id) => api.get(`/documents/${id}`),
  delete: (id) => api.delete(`/documents/${id}`),
};

// AI Research Services
export const aiService = {
  chat: (workspaceId, query, sessionId) => api.post('/ai/chat', { workspaceId, query, sessionId }),
  getChatSessions: (workspaceId) => api.get(`/ai/chat/${workspaceId}/sessions`),
  deleteChatSession: (workspaceId, sessionId) => api.delete(`/ai/chat/${workspaceId}/session/${sessionId}`),
  clearChat: (workspaceId) => api.delete(`/ai/chat/${workspaceId}`),
  getGraph: (workspaceId) => api.get(`/ai/graph/${workspaceId}`),
  createNote: (data) => api.post('/ai/note', data),
  autoExtractNotes: (workspaceId, tag) => api.post('/ai/auto-extract-notes', { workspaceId, tag }),
  deleteNote: (id) => api.delete(`/ai/note/${id}`),
};

// Report Services
export const reportService = {
  generate: (workspaceId, reportType) => api.post('/reports/generate', { workspaceId, reportType }),
  getReports: (workspaceId) => api.get(`/reports/workspace/${workspaceId}`),
  deleteReport: (id) => api.delete(`/reports/${id}`),
};

export default api;
