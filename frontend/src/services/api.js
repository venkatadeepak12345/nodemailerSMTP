import axios from 'axios';

// Create base Axios instance pointing to backend server
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to automatically inject JWT Bearer tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth Service Endpoints
export const authAPI = {
  register: (name, email, password) =>
    api.post('/auth/register', { name, email, password }),

  verifyEmail: (email, otp) =>
    api.post('/auth/verify-email', { email, otp }),

  resendVerifyOtp: (email) =>
    api.post('/auth/resend-verify-otp', { email }),

  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  verifyLoginOtp: (email, otp) =>
    api.post('/auth/verify-login-otp', { email, otp }),

  forgotPassword: (email) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token, newPassword) =>
    api.post('/auth/reset-password', { token, newPassword }),
};

// Public contact service
export const contactAPI = {
  submitContactForm: (name, email, subject, message) =>
    api.post('/contact/submit', { name, email, subject, message }),
};

// Transactional confirmations service
export const actionAPI = {
  sendActionConfirmation: (actionName, actionDetails) =>
    api.post('/action/confirm-action', { actionName, actionDetails }),
};

export default api;
