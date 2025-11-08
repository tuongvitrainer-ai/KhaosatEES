import axios from 'axios';
import { getAuthToken, removeAuthToken } from '../utils/auth';
import { API_BASE_URL } from '../utils/constants';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - logout
      removeAuthToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// Survey APIs
export const surveyAPI = {
  getActiveSurvey: () => api.get('/surveys/active'),
  getSurveyProgress: (surveyId) => api.get(`/surveys/${surveyId}/progress`),
};

// Response APIs
export const responseAPI = {
  submitResponse: (data) => api.post('/responses/submit', data),
  completeSurvey: (surveyId) => api.post('/responses/complete', { survey_id: surveyId }),
  getUserResponses: (surveyId) => api.get(`/responses/survey/${surveyId}`),
};

// Admin APIs
export const adminAPI = {
  // Users
  getAllUsers: () => api.get('/admin/users'),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  resetUserPassword: (id, password) =>
    api.post(`/admin/users/${id}/reset-password`, { new_password: password }),

  // Surveys
  getAllSurveys: () => api.get('/admin/surveys'),
  createSurvey: (data) => api.post('/admin/surveys', data),
  updateSurvey: (id, data) => api.put(`/admin/surveys/${id}`, data),

  // Questions
  createQuestion: (data) => api.post('/admin/questions', data),
  updateQuestion: (id, data) => api.put(`/admin/questions/${id}`, data),
  deleteQuestion: (id) => api.delete(`/admin/questions/${id}`),

  // Reports
  getSurveyResponses: (surveyId) => api.get(`/admin/surveys/${surveyId}/responses`),
  getSurveySummary: (surveyId) => api.get(`/admin/surveys/${surveyId}/summary`),

  // Sync
  syncToSheets: (surveyId) => api.post(`/admin/surveys/${surveyId}/sync`),
};

export default api;
