import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { router } from './router'
import { AuthProvider } from './contexts/AuthContext'
import { apiService } from './services/api'

// Set up unauthorized handler for API service
const handleUnauthorized = () => {
  localStorage.removeItem('stratix_token');
  localStorage.removeItem('stratix_user');
  window.location.href = '/';
};

apiService.setUnauthorizedHandler(handleUnauthorized);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)
