import { apiService } from './api';

export interface Campaign {
  _id: string;
  brandId: string;
  brandName?: string;
  brandAvatar?: string;
  name: string;
  description: string;
  budget: number;
  status: 'draft' | 'active' | 'closed' | 'completed';
  platforms: string[];
  tags?: string[];
  location?: string;
  publishDate?: string;
  publishTime?: string;
  deadline?: string;
  requirements?: string;
  attachments?: string[];
  isClosed: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCampaignData {
  brandId: string;
  name: string;
  description: string;
  budget: number;
  platforms: string[];
  tags?: string[];
  location?: string;
  publishDate?: string;
  publishTime?: string;
  deadline?: string;
  requirements?: string;
  attachments?: string[];
}

export interface UpdateCampaignData {
  name?: string;
  description?: string;
  budget?: number;
  status?: 'draft' | 'active' | 'closed' | 'completed';
  platforms?: string[];
  tags?: string[];
  location?: string;
  publishDate?: string;
  publishTime?: string;
  deadline?: string;
  requirements?: string;
  attachments?: string[];
  isClosed?: boolean;
}

export interface CampaignListResponse {
  campaigns: Campaign[];
  count: number;
}

class CampaignService {
  /**
   * Get all campaigns
   */
  async getAllCampaigns(
    status?: 'active' | 'previous' | 'draft' | 'closed' | 'completed'
  ): Promise<CampaignListResponse> {
    const queryParams = new URLSearchParams();
    if (status) {
      queryParams.append('status', status);
    }
    
    const queryString = queryParams.toString();
    const endpoint = `/campaign${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiService.get<{ campaigns: Campaign[]; count: number }>(endpoint);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch campaigns');
    }
    
    return {
      campaigns: response.data.campaigns,
      count: response.data.count,
    };
  }

  /**
   * Get campaigns by brand ID
   */
  async getCampaignsByBrandId(
    brandId: string,
    status?: 'active' | 'previous' | 'draft' | 'closed' | 'completed'
  ): Promise<CampaignListResponse> {
    const queryParams = new URLSearchParams();
    if (status) {
      queryParams.append('status', status);
    }
    
    const queryString = queryParams.toString();
    const endpoint = `/campaign/brand/${brandId}${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiService.get<{ campaigns: Campaign[]; count: number }>(endpoint);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch campaigns');
    }
    
    return {
      campaigns: response.data.campaigns,
      count: response.data.count,
    };
  }

  /**
   * Get campaign by ID
   */
  async getCampaignById(campaignId: string): Promise<Campaign> {
    const response = await apiService.get<{ campaign: Campaign }>(`/campaign/${campaignId}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch campaign');
    }
    
    return response.data.campaign;
  }

  /**
   * Create a new campaign
   */
  async createCampaign(data: CreateCampaignData): Promise<Campaign> {
    const response = await apiService.post<{ campaign: Campaign }>('/campaign', data);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create campaign');
    }
    
    return response.data.campaign;
  }

  /**
   * Update campaign
   */
  async updateCampaign(campaignId: string, data: UpdateCampaignData): Promise<Campaign> {
    const response = await apiService.put<{ campaign: Campaign }>(`/campaign/${campaignId}`, data);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update campaign');
    }
    
    return response.data.campaign;
  }

  /**
   * Delete campaign
   */
  async deleteCampaign(campaignId: string): Promise<void> {
    const response = await apiService.delete<{ campaign: Campaign }>(`/campaign/${campaignId}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete campaign');
    }
  }
}

export const campaignService = new CampaignService();

