import { apiService } from './api';

// Helper function to construct full URL for relative paths
// Converts Google Drive URLs to uc?export=view format for better React compatibility
const constructImageUrl = (url: string | undefined): string | undefined => {
  if (!url) return undefined;
  
  // If it's a Base64 data URL (from onboarding), return as is
  if (url.startsWith('data:')) {
    return url;
  }
  
  // If it's already in uc?export=view format, return as is (don't modify working URLs)
  if (url.includes('uc?export=view')) {
    return url;
  }
  
  // Handle Google Drive URLs - try multiple formats for better compatibility
  if (url.includes('drive.google.com')) {
    let fileId: string | null = null;
    
    // Extract file ID from various Google Drive URL formats
    // Format 1: https://drive.google.com/file/d/FILE_ID/view or /edit
    const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch && fileMatch[1]) {
      fileId = fileMatch[1];
    }
    // Format 2: https://drive.google.com/open?id=FILE_ID or uc?export=view&id=FILE_ID
    else {
      const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (idMatch && idMatch[1]) {
        fileId = idMatch[1];
      }
    }
    
    // If we found a file ID, use uc?export=view format
    // Note: This requires the file to be publicly accessible
    if (fileId) {
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
    
    // If we couldn't extract file ID but it's a Google Drive URL, return as is
    return url;
  }
  
  // If it's already a full URL (starts with http:// or https://), return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's a relative path starting with /, construct full URL using API base
  if (url.startsWith('/')) {
    // Get API base URL from environment or use default
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://backend-stratix.vercel.app';
    return `${apiBase}${url}`;
  }
  
  // If it looks like a file ID (24+ character alphanumeric), treat it as Google Drive file ID
  if (/^[a-zA-Z0-9_-]{20,}$/.test(url)) {
    return `https://drive.google.com/uc?export=view&id=${url}`;
  }
  
  return url;
};

export interface PlatformFollowers {
  x?: number;
  youtube?: number;
  facebook?: number;
  instagram?: number;
  tiktok?: number;
}

export interface Influencer {
  _id: string;
  userId: string;
  bio?: string;
  description?: string;
  location?: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
  };
  profileImage?: string;
  coverImage?: string;
  rating?: number;
  isTopCreator: boolean;
  hasVerifiedPayment: boolean;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  platformFollowers?: PlatformFollowers;
  socialProfiles?: Array<{
    platform: 'youtube' | 'facebook' | 'instagram' | 'tiktok' | 'x';
    username: string;
    profileUrl?: string;
    followers: number;
    isVerified: boolean;
  }>;
  // Engagement metrics (from followers API)
  avgViewPerPost?: number;
  highestView?: number;
  avgLikesPerPost?: number;
  highestLikes?: number;
}

export interface InfluencerListParams {
  page?: number;
  limit?: number;
  search?: string;
  tags?: string | string[];
  location?: string;
  isTopCreator?: boolean;
  platforms?: string[];
}

export interface InfluencerListResponse {
  influencers: Influencer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ContentItem {
  id: string;
  thumbnail: string;
  title: string;
  views: number;
  date: string;
  duration: string;
  platform: 'youtube' | 'instagram' | 'tiktok';
}

export interface FollowersResponse {
  influencerId: string;
  period: '7d' | '30d';
  platformFollowers: {
    youtube?: number;
    instagram?: number;
    tiktok?: number;
    facebook?: number;
    x?: number;
  };
  totalFollowers: number;
  periodLabel: string;
  avgViewPerPost?: number;
  highestView?: number;
  avgLikesPerPost?: number;
  highestLikes?: number;
}

export interface ContentResponse {
  influencerId: string;
  period: '7d' | '30d';
  periodLabel: string;
  items: ContentItem[];
}

class InfluencerService {
  /**
   * Get influencer profile by influencer ID (MongoDB _id)
   */
  async getInfluencerById(influencerId: string): Promise<Influencer> {
    const response = await apiService.get<{ influencer: Influencer }>(`/influencer/id/${influencerId}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch influencer');
    }
    
    // Construct full URLs for images if they're relative paths
    const influencer = response.data.influencer;
    if (influencer.profileImage) {
      influencer.profileImage = constructImageUrl(influencer.profileImage) || influencer.profileImage;
    }
    if (influencer.coverImage) {
      influencer.coverImage = constructImageUrl(influencer.coverImage) || influencer.coverImage;
    }
    
    return influencer;
  }

  /**
   * Get influencer profile by user ID
   */
  async getInfluencerByUserId(userId: string): Promise<Influencer> {
    const response = await apiService.get<{ influencer: Influencer }>(`/influencer/${userId}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch influencer');
    }
    
    // Construct full URLs for images if they're relative paths
    const influencer = response.data.influencer;
    if (influencer.profileImage) {
      influencer.profileImage = constructImageUrl(influencer.profileImage) || influencer.profileImage;
    }
    if (influencer.coverImage) {
      influencer.coverImage = constructImageUrl(influencer.coverImage) || influencer.coverImage;
    }
    
    return influencer;
  }

  /**
   * Get all influencers with pagination and filtering
   */
  async getAllInfluencers(params?: InfluencerListParams): Promise<InfluencerListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.location) queryParams.append('location', params.location);
    if (params?.isTopCreator !== undefined) queryParams.append('isTopCreator', params.isTopCreator.toString());
    
    if (params?.tags) {
      const tags = Array.isArray(params.tags) ? params.tags.join(',') : params.tags;
      queryParams.append('tags', tags);
    }
    if (params?.platforms && params.platforms.length > 0) {
      queryParams.append('platforms', params.platforms.join(','));
    }

    const queryString = queryParams.toString();
    const endpoint = `/influencer${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiService.get<{ influencers: Influencer[]; pagination: InfluencerListResponse['pagination'] }>(endpoint);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch influencers');
    }
    
    return {
      influencers: response.data.influencers,
      pagination: response.data.pagination,
    };
  }

  /**
   * Update influencer profile
   * @param userId - User ID of the influencer
   * @param data - Influencer data to update
   * @param profileImageFile - Optional profile image file to upload, or null to remove
   * @param coverImageFile - Optional cover/background image file to upload, or null to remove
   */
  async updateInfluencer(
    userId: string,
    data: {
      name?: string;
      description?: string;
      tags?: string[];
      location?: {
        address?: string;
        city?: string;
        state?: string;
        country?: string;
        pincode?: string;
      };
      socialMedia?: Array<{ platform: string; username: string; profileUrl: string }>;
    },
    profileImageFile?: File | null,
    coverImageFile?: File | null
  ): Promise<Influencer> {
    let requestData: any | FormData;
    
    // Check if we need to remove photos or upload files
    const shouldRemoveProfileImage = profileImageFile === null;
    const shouldRemoveCoverImage = coverImageFile === null;
    const hasFileUpload = (profileImageFile instanceof File) || (coverImageFile instanceof File);
    const hasSocialMedia = data.socialMedia !== undefined;
    
    // If any file is provided, removal flags needed, or socialMedia is provided, use FormData
    if (hasFileUpload || shouldRemoveProfileImage || shouldRemoveCoverImage || hasSocialMedia) {
      const formData = new FormData();
      
      if (profileImageFile instanceof File) {
        formData.append('profileImage', profileImageFile);
      } else if (shouldRemoveProfileImage) {
        formData.append('removeProfileImage', 'true');
      }
      
      if (coverImageFile instanceof File) {
        formData.append('coverImage', coverImageFile);
      } else if (shouldRemoveCoverImage) {
        formData.append('removeCoverImage', 'true');
      }
      
      // Append other fields to FormData
      if (data.description !== undefined) {
        formData.append('description', data.description);
      }
      if (data.location !== undefined) {
        formData.append('location', JSON.stringify(data.location));
      }
      if (data.socialMedia !== undefined) {
        formData.append('socialMedia', JSON.stringify(data.socialMedia));
      }
      
      requestData = formData;
    } else {
      // No file, use regular JSON
      requestData = data;
    }
    
    const response = await apiService.put<{ influencer: Influencer }>(`/influencer/${userId}`, requestData);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update influencer');
    }
    
    // Construct full URLs for images if they're relative paths
    const influencer = response.data.influencer;
    if (influencer.profileImage) {
      influencer.profileImage = constructImageUrl(influencer.profileImage) || influencer.profileImage;
    }
    if (influencer.coverImage) {
      influencer.coverImage = constructImageUrl(influencer.coverImage) || influencer.coverImage;
    }
    
    return influencer;
  }

  /**
   * Get influencer followers data
   * @param influencerId - MongoDB ObjectId of the influencer
   * @param period - Time period: '7d' or '30d' (default: '7d')
   */
  async getInfluencerFollowers(influencerId: string, period: '7d' | '30d' = '7d'): Promise<FollowersResponse> {
    const response = await apiService.get<FollowersResponse>(`/influencer/${influencerId}/followers?period=${period}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch influencer followers');
    }
    
    return response.data;
  }

  /**
   * Get influencer shorts data
   * @param influencerId - MongoDB ObjectId of the influencer
   * @param period - Time period: '7d' or '30d' (default: '7d')
   */
  async getInfluencerShorts(influencerId: string, period: '7d' | '30d' = '7d'): Promise<ContentResponse> {
    const response = await apiService.get<ContentResponse>(`/influencer/${influencerId}/shorts?period=${period}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch influencer shorts');
    }
    
    return response.data;
  }

  /**
   * Get influencer videos data
   * @param influencerId - MongoDB ObjectId of the influencer
   * @param period - Time period: '7d' or '30d' (default: '7d')
   */
  async getInfluencerVideos(influencerId: string, period: '7d' | '30d' = '7d'): Promise<ContentResponse> {
    const response = await apiService.get<ContentResponse>(`/influencer/${influencerId}/videos?period=${period}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch influencer videos');
    }
    
    return response.data;
  }
}

export const influencerService = new InfluencerService();

