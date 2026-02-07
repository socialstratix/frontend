import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { BaseLayout } from '../components';
import { ProtectedRoute } from '../components/ProtectedRoute';

// Lazy load pages for code splitting
const Home = lazy(() => import('../pages/Home/Home').then(module => ({ default: module.Home })));
const InfluencerDiscovery = lazy(() => import('../pages/InfluencerDiscovery/InfluencerDiscovery').then(module => ({ default: module.InfluencerDiscovery })));
const InfluencerDetail = lazy(() => import('../pages/InfluencerDetail/InfluencerDetail').then(module => ({ default: module.InfluencerDetail })));
const InfluencerLanding = lazy(() => import('../pages/InfluencerLanding/InfluencerLanding').then(module => ({ default: module.InfluencerLanding })));
const BrandDashboard = lazy(() => import('../pages/BrandDashboard/BrandDashboard').then(module => ({ default: module.BrandDashboard })));
const CampaignDetailInfluencer = lazy(() => import('../pages/CampaignDetailInfluencer/CampaignDetailInfluencer').then(module => ({ default: module.CampaignDetailInfluencer })));
const Messages = lazy(() => import('../pages/Messages/Messages').then(module => ({ default: module.Messages })));
const Login = lazy(() => import('../pages/Login/Login').then(module => ({ default: module.Login })));
const Signup = lazy(() => import('../pages/Signup/Signup').then(module => ({ default: module.Signup })));
const UserTypeSelection = lazy(() => import('../pages/UserTypeSelection/UserTypeSelection').then(module => ({ default: module.UserTypeSelection })));
const PostCampaign = lazy(() => import('../pages/PostCampaign/PostCampaign').then(module => ({ default: module.PostCampaign })));
const BrandProfile = lazy(() => import('../pages/BrandProfile/BrandProfile').then(module => ({ default: module.BrandProfile })));

// Loading component
const PageLoader = () => (
  <>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontFamily: 'Poppins, sans-serif',
      color: '#783C91'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #783C91',
          borderTop: '4px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }}></div>
        <p>Loading...</p>
      </div>
    </div>
  </>
);

// Wrapper component for Suspense
const LazyPage = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoader />}>
    {children}
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <LazyPage><Login /></LazyPage>,
  },
  {
    path: '/user-type-selection',
    element: <LazyPage><UserTypeSelection /></LazyPage>,
  },
  {
    path: '/signup',
    element: <LazyPage><Signup /></LazyPage>,
  },
  // Shared brand profile route - accessible to all authenticated users
  {
    path: '/brand/brand/:id',
    element: (
      <ProtectedRoute>
        <BaseLayout
          headerProps={{
            userAvatar: undefined,
            userName: 'User',
            userId: '1',
          }}
          footerProps={{}}
        />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <LazyPage><BrandProfile /></LazyPage>,
      },
    ],
  },
  {
    path: '/home',
    element: (
      <ProtectedRoute>
        <BaseLayout
          headerProps={{
            userAvatar: undefined,
            userName: 'User',
            userId: '1',
          }}
          footerProps={{}}
        />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <LazyPage><Home /></LazyPage>,
      },
      {
        path: 'discover',
        element: <LazyPage><InfluencerDiscovery /></LazyPage>,
      },
      {
        path: 'influencer/:id',
        element: <LazyPage><InfluencerDetail /></LazyPage>,
      },
      {
        path: 'dashboard',
        element: <LazyPage><BrandDashboard /></LazyPage>,
      },
     
      {
        path: 'campaigns/:id',
        element: <LazyPage><CampaignDetailInfluencer /></LazyPage>,
      },
      {
        path: 'campaigns/create',
        element: <LazyPage><PostCampaign /></LazyPage>,
      },
      {
        path: 'brand/:id',
        element: <LazyPage><BrandProfile /></LazyPage>,
      },
      {
        path: 'messages',
        element: <LazyPage><Messages /></LazyPage>,
      },
      {
        path: 'messages/:conversationId',
        element: <LazyPage><Messages /></LazyPage>,
      },
    ],
  },
  // Influencer routes
  {
    path: '/influencer',
    element: (
      <ProtectedRoute requiredUserType="influencer">
        <BaseLayout
          headerProps={{}}
          footerProps={{}}
        />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <LazyPage><InfluencerLanding /></LazyPage>,
      },
      {
        path: 'influencer-dashboard',
        element: <LazyPage><BrandDashboard /></LazyPage>,
      },
      {
        path: 'campaigns/create',
        element: <LazyPage><PostCampaign /></LazyPage>,
      },
      {
        path: 'campaigns/:id',
        element: <LazyPage><CampaignDetailInfluencer /></LazyPage>,
      },
      // {
      //   path: 'discover',
      //   element: <LazyPage><InfluencerDiscovery /></LazyPage>,
      // },
      {
        path: 'influencer/:id',
        element: <LazyPage><InfluencerDetail /></LazyPage>,
      },
      {
        path: 'brand/:id',
        element: <LazyPage><BrandProfile /></LazyPage>,
      },
      {
        path: 'messages',
        element: <LazyPage><Messages /></LazyPage>,
      },
      {
        path: 'messages/:conversationId',
        element: <LazyPage><Messages /></LazyPage>,
      },
    ],
  },
  // Brand routes
  {
    path: '/brand',
    element: (
      <ProtectedRoute requiredUserType="brand">
        <BaseLayout
          headerProps={{
            userAvatar: undefined,
            userName: 'Brand',
            userId: '1',
          }}
          footerProps={{}}
        />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <LazyPage><InfluencerDiscovery /></LazyPage>,
      },
      {
        path: 'discover',
        element: <LazyPage><InfluencerDiscovery /></LazyPage>,
      },
      {
        path: 'campaigns/create',
        element: <LazyPage><PostCampaign /></LazyPage>,
      },
      {
        path: 'campaigns/:id',
        element: <LazyPage><CampaignDetailInfluencer /></LazyPage>,
      },
      {
        path: 'profile/:id',
        element: <LazyPage><BrandProfile /></LazyPage>,
      },
      {
        path: 'influencer/:id',
        element: <LazyPage><InfluencerDetail /></LazyPage>,
      },
      {
        path: 'brand/:id',
        element: <LazyPage><BrandProfile /></LazyPage>,
      },
      {
        path: 'messages',
        element: <LazyPage><Messages /></LazyPage>,
      },
      {
        path: 'messages/:conversationId',
        element: <LazyPage><Messages /></LazyPage>,
      },
    ],
  },
]);

