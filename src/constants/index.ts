// Application constants

export const APP_NAME = 'Stratix';
export const APP_VERSION = '1.0.0';

// API Configuration
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';

export const API_BASE_URL = `${API_BASE}/api/${API_VERSION}`;

export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
} as const;

// Export colors
export * from './colors';

// Export typography
export * from './typography';



