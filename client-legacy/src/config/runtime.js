const trimTrailingSlash = (value) => String(value || '').replace(/\/$/, '');

export const API_ORIGIN = trimTrailingSlash(import.meta.env.VITE_API_URL);
export const API_BASE_URL = API_ORIGIN ? `${API_ORIGIN}/api` : '/api';
export const WS_URL = trimTrailingSlash(
  import.meta.env.VITE_WS_URL || import.meta.env.VITE_API_URL || 'http://localhost:5001'
);

export const REQUEST_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS || 30000);
