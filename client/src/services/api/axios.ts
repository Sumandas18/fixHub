import axios from 'axios';
import Cookies from 'js-cookie';

// The base URL can be defined in .env.local as NEXT_PUBLIC_API_URL
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token from cookies
apiClient.interceptors.request.use(
  (config) => {
    // Read the token from cookies. This works because we use js-cookie 
    // and don't strictly enforce HttpOnly for the token itself, 
    // allowing the client-side axios to attach it to requests sent to the backend.
    const token = Cookies.get('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Global Error Handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Add logic here for token expiration (e.g., 401 status)
    if (error.response?.status === 401) {
      Cookies.remove('token');
      Cookies.remove('role');
      // Optionally handle full redirect to login if not already there, 
      // though typically handled at the application level via Zustand or route wrapper.
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
