import { apiService } from './api';

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
    
    return response.data.influencer;
  }

  /**
   * Get influencer profile by user ID
   */
  async getInfluencerByUserId(userId: string): Promise<Influencer> {
    const response = await apiService.get<{ influencer: Influencer }>(`/influencer/${userId}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch influencer');
    }
    
    return response.data.influencer;
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
}

export const influencerService = new InfluencerService();

