import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const baseURL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:8080/api'
  : 'https://your-production-server.com/api';

const api: AxiosInstance = axios.create({ baseURL });

// API 요청 인터셉터 (필요한 경우)
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
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

export default api; 