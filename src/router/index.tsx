import { createBrowserRouter, Navigate } from 'react-router-dom';
import { BaseLayout } from '../components';
import { ProtectedRoute } from '../components/ProtectedRoute';
import {
  Home,
  InfluencerDiscovery,
  InfluencerDetail,
  InfluencerLanding,
  BrandDashboard,
  CampaignDetailInfluencer,
  Messages,
  Login,
  Signup,
  UserTypeSelection,
  PostCampaign,
  BrandProfile,
} from '../pages';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/user-type-selection',
    element: <UserTypeSelection />,
  },
  {
    path: '/signup',
    element: <Signup />,
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
        element: <BrandProfile />,
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
        element: <Home />,
      },
      {
        path: 'discover',
        element: <InfluencerDiscovery />,
      },
      {
        path: 'influencer/:id',
        element: <InfluencerDetail />,
      },
      {
        path: 'dashboard',
        element: <BrandDashboard />,
      },
     
      {
        path: 'campaigns/:id',
        element: <CampaignDetailInfluencer />,
      },
      {
        path: 'campaigns/create',
        element: <PostCampaign />,
      },
      {
        path: 'brand/:id',
        element: <BrandProfile />,
      },
      {
        path: 'messages',
        element: <Messages />,
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
        element: <InfluencerLanding />,
      },
      {
        path: 'influencer-dashboard',
        element: <BrandDashboard />,
      },
      {
        path: 'campaigns/create',
        element: <PostCampaign />,
      },
      {
        path: 'campaigns/:id',
        element: <CampaignDetailInfluencer />,
      },
      // {
      //   path: 'discover',
      //   element: <InfluencerDiscovery />,
      // },
      {
        path: 'influencer/:id',
        element: <InfluencerDetail />,
      },
      {
        path: 'brand/:id',
        element: <BrandProfile />,
      },
      {
        path: 'messages',
        element: <Messages />,
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
        element: <InfluencerDiscovery />,
      },
      {
        path: 'discover',
        element: <InfluencerDiscovery />,
      },
      {
        path: 'campaigns/create',
        element: <PostCampaign />,
      },
      {
        path: 'campaigns/:id',
        element: <CampaignDetailInfluencer />,
      },
      {
        path: 'profile/:id',
        element: <BrandProfile />,
      },
      {
        path: 'influencer/:id',
        element: <InfluencerDetail />,
      },
      {
        path: 'brand/:id',
        element: <BrandProfile />,
      },
      {
        path: 'messages',
        element: <Messages />,
      },
    ],
  },
]);

