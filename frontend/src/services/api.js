import axios from "axios";

// Single Axios instance – all services import this.
// Base URL: env var or fallback to localhost (adjust port if needed).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5050/api",
});

// Request interceptor – attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor – clear stale token on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      // Consumer (e.g., AuthContext) decides whether to redirect
    }
    return Promise.reject(error);
  }
);

export default api;