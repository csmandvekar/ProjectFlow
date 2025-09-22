import axios from 'axios';
import useAuthStore from './stores/auth-store';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log("API: Authorization header set");
  } else {
    delete api.defaults.headers.common['Authorization'];
    console.log("API: Authorization header removed");
  }
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Log request details
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      data: config.data,
      params: config.params
    });
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log response
    console.log(`API Response: ${response.status} ${response.config.url}`, {
      data: response.data
    });
    return response;
  },
  (error) => {
    // Log error details
    console.error("API Response Error:", {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data
    });

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.warn("API: 401 Unauthorized - Logging out");
      useAuthStore.getState().logout();
    }

    return Promise.reject({
      status: error.response?.status,
      url: error.config?.url,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    });
  }
);

export default api;