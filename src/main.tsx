import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'
import { router } from './router'
import { AuthProvider } from './contexts/AuthContext'
import { SocketProvider } from './contexts/SocketContext'
import { apiService } from './services/api'

// Set up unauthorized handler for API service
const handleUnauthorized = () => {
  sessionStorage.removeItem('stratix_token');
  localStorage.removeItem('stratix_user');
  window.location.href = '/login';
};

apiService.setUnauthorizedHandler(handleUnauthorized);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <SocketProvider>
        <RouterProvider router={router} />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </SocketProvider>
    </AuthProvider>
  </StrictMode>,
)
