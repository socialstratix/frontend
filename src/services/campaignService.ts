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
    status?: 'active' | 'previous' | 'draft' | 'closed' | 'completed',
    sortBy?: 'date' | 'budget' | 'name',
    sortOrder?: 'asc' | 'desc'
  ): Promise<CampaignListResponse> {
    const queryParams = new URLSearchParams();
    if (status) {
      queryParams.append('status', status);
    }
    if (sortBy) {
      queryParams.append('sortBy', sortBy);
    }
    if (sortOrder) {
      queryParams.append('sortOrder', sortOrder);
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
    status?: 'active' | 'previous' | 'draft' | 'closed' | 'completed',
    sortBy?: 'date' | 'budget' | 'name',
    sortOrder?: 'asc' | 'desc'
  ): Promise<CampaignListResponse> {
    const queryParams = new URLSearchParams();
    if (status) {
      queryParams.append('status', status);
    }
    if (sortBy) {
      queryParams.append('sortBy', sortBy);
    }
    if (sortOrder) {
      queryParams.append('sortOrder', sortOrder);
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
   * Get similar campaigns by matching tags
   */
  async getSimilarCampaigns(
    campaignId: string,
    limit: number = 3
  ): Promise<CampaignListResponse> {
    const queryParams = new URLSearchParams();
    if (limit) {
      queryParams.append('limit', limit.toString());
    }
    
    const queryString = queryParams.toString();
    const endpoint = `/campaign/similar/${campaignId}${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiService.get<{ campaigns: Campaign[]; count: number }>(endpoint);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch similar campaigns');
    }
    
    return {
      campaigns: response.data.campaigns,
      count: response.data.count,
    };
  }

  /**
   * Create a new campaign
   */
  async createCampaign(data: CreateCampaignData, files?: File[]): Promise<Campaign> {
    const formData = new FormData();
    
    // Add all campaign data fields to FormData
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('budget', data.budget.toString());
    formData.append('platforms', JSON.stringify(data.platforms));
    
    if (data.tags && data.tags.length > 0) {
      formData.append('tags', JSON.stringify(data.tags));
    }
    if (data.location) {
      formData.append('location', data.location);
    }
    if (data.publishDate) {
      formData.append('publishDate', data.publishDate);
    }
    if (data.publishTime) {
      formData.append('publishTime', data.publishTime);
    }
    if (data.deadline) {
      formData.append('deadline', data.deadline);
    }
    if (data.requirements) {
      formData.append('requirements', data.requirements);
    }
    
    // Add files if provided
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('attachments', file);
      });
    }
    
    const response = await apiService.post<{ campaign: Campaign }>('/campaign', formData);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create campaign');
    }
    
    return response.data.campaign;
  }

  /**
   * Update campaign
   */
  async updateCampaign(campaignId: string, data: UpdateCampaignData, files?: File[]): Promise<Campaign> {
    const formData = new FormData();
    
    // Add all campaign data fields to FormData
    if (data.name !== undefined) {
      formData.append('name', data.name);
    }
    if (data.description !== undefined) {
      formData.append('description', data.description);
    }
    if (data.budget !== undefined) {
      formData.append('budget', data.budget.toString());
    }
    if (data.platforms !== undefined) {
      formData.append('platforms', JSON.stringify(data.platforms));
    }
    if (data.tags !== undefined) {
      formData.append('tags', JSON.stringify(data.tags));
    }
    if (data.location !== undefined) {
      formData.append('location', data.location || '');
    }
    if (data.publishDate !== undefined) {
      formData.append('publishDate', data.publishDate || '');
    }
    if (data.publishTime !== undefined) {
      formData.append('publishTime', data.publishTime || '');
    }
    if (data.deadline !== undefined) {
      formData.append('deadline', data.deadline || '');
    }
    if (data.requirements !== undefined) {
      formData.append('requirements', data.requirements || '');
    }
    if (data.status !== undefined) {
      formData.append('status', data.status);
    }
    if (data.isClosed !== undefined) {
      formData.append('isClosed', data.isClosed.toString());
    }
    
    // Add existing attachment URLs if provided (for keeping/removing attachments)
    if (data.attachments !== undefined) {
      formData.append('attachments', JSON.stringify(data.attachments));
    }
    
    // Add new files if provided
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('attachments', file);
      });
    }
    
    const response = await apiService.put<{ campaign: Campaign }>(`/campaign/${campaignId}`, formData);
    
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

  /**
   * Apply to a campaign (Influencer only)
   */
  async applyToCampaign(campaignId: string): Promise<{ conversationId: string; messageId: string }> {
    const response = await apiService.post<{ 
      application: any; 
      conversation: { _id: string }; 
      message: { _id: string } 
    }>(`/campaign/${campaignId}/apply`, {});
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to apply to campaign');
    }
    
    return {
      conversationId: response.data.conversation._id,
      messageId: response.data.message._id,
    };
  }
}

export const campaignService = new CampaignService();

