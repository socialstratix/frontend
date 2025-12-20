import { apiService } from './api';

// Helper function to construct full URL for relative paths
const constructImageUrl = (url: string | undefined): string | undefined => {
  if (!url) return undefined;
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
}

export interface InfluencerListParams {
  page?: number;
  limit?: number;
  search?: string;
  tags?: string | string[];
  location?: string;
  isTopCreator?: boolean;
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
   * @param profileImageFile - Optional profile image file to upload
   * @param coverImageFile - Optional cover/background image file to upload
   */
  async updateInfluencer(
    userId: string,
    data: {
      name?: string;
      description?: string;
      location?: {
        address?: string;
        city?: string;
        state?: string;
        country?: string;
        pincode?: string;
      };
    },
    profileImageFile?: File,
    coverImageFile?: File
  ): Promise<Influencer> {
    let requestData: any | FormData;
    
    // If any file is provided, use FormData
    if (profileImageFile || coverImageFile) {
      const formData = new FormData();
      
      if (profileImageFile) {
        formData.append('profileImage', profileImageFile);
      }
      
      if (coverImageFile) {
        formData.append('coverImage', coverImageFile);
      }
      
      // Append other fields to FormData
      if (data.description !== undefined) {
        formData.append('description', data.description);
      }
      if (data.location !== undefined) {
        formData.append('location', JSON.stringify(data.location));
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
}

export const influencerService = new InfluencerService();

