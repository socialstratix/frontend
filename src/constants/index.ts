// Application constants

export const APP_NAME = 'Stratix';
export const APP_VERSION = '1.0.0';

// API Configuration - From environment variables
// Vite requires VITE_ prefix for environment variables to be exposed to client
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://backend-stratix.vercel.app';
const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';

export const API_BASE_URL = `${API_BASE}/api/${API_VERSION}`;

// Log API configuration (only in development)
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:', {
    API_BASE,
    API_VERSION,
    API_BASE_URL,
    source: import.meta.env.VITE_API_BASE_URL ? 'environment variable' : 'default (hardcoded)',
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

// Export tags
export * from './tags';

// Placeholder/Dummy image URL
export const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/400x400/783C91/FFFFFF?text=No+Image';



