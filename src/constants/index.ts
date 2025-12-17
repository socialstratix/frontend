// Application constants

export const APP_NAME = 'Stratix';
export const APP_VERSION = '1.0.0';

// API Configuration
// Remove trailing slashes and /api/v1 if accidentally included
let API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').trim();
API_BASE = API_BASE.replace(/\/+$/, ''); // Remove trailing slashes
API_BASE = API_BASE.replace(/\/api\/v\d+$/, ''); // Remove /api/v1 if already included

const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';

export const API_BASE_URL = `${API_BASE}/api/${API_VERSION}`;

// Debug log (remove in production if needed)
if (import.meta.env.DEV) {
  console.log('API Configuration:', {
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    API_BASE,
    API_VERSION,
    API_BASE_URL,
  });
}

export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
} as const;

// Export colors
export * from './colors';

// Export typography
export * from './typography';



