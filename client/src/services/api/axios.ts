import axios from 'axios';

// The base URL can be defined in .env.local as NEXT_PUBLIC_API_URL
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Helper: read JWT from Zustand's localStorage key ────────────────────────
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('auth-storage');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
}

// ── Request interceptor: attach token to every request ──────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.authorization = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: role-aware 401 redirect ───────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-storage');
        // Redirect to the correct login page based on which panel the user is in
        const isAdminRoute = window.location.pathname.startsWith('/admin');
        window.location.href = isAdminRoute ? '/admin/login' : '/login';
      }
    }
    return Promise.reject(error);
  }
);
