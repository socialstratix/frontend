// Application constants

export const APP_NAME = 'Stratix';
export const APP_VERSION = '1.0.0';

// API Configuration - Hardcoded production URL
const API_BASE = 'https://backend-stratix.vercel.app';
const API_VERSION = 'v1';

export const API_BASE_URL = `${API_BASE}/api/${API_VERSION}`;

// Log API configuration
console.log('🔧 API Configuration:', {
  API_BASE,
  API_VERSION,
  API_BASE_URL,
});

export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
} as const;

// Export colors
export * from './colors';

// Export typography
export * from './typography';



