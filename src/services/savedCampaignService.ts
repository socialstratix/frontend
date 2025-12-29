import { apiService } from './api';
import type { Campaign } from './campaignService';

export interface SavedCampaignResponse {
  campaigns: Campaign[];
  count: number;
}

export interface SavedCampaignIdsResponse {
  campaignIds: string[];
  count: number;
}

export interface CheckSavedResponse {
  isSaved: boolean;
}

class SavedCampaignService {
  /**
   * Save a campaign
   */
  async saveCampaign(campaignId: string): Promise<void> {
    const response = await apiService.post(`/saved-campaigns/${campaignId}`, {});
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to save campaign');
    }
  }

  /**
   * Unsave a campaign
   */
  async unsaveCampaign(campaignId: string): Promise<void> {
    const response = await apiService.delete(`/saved-campaigns/${campaignId}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to unsave campaign');
    }
  }

  /**
   * Get all saved campaigns
   */
  async getSavedCampaigns(
    sortBy?: 'date' | 'budget' | 'name'
  ): Promise<SavedCampaignResponse> {
    const queryParams = new URLSearchParams();
    if (sortBy) {
      queryParams.append('sortBy', sortBy);
    }
    
    const queryString = queryParams.toString();
    const endpoint = `/saved-campaigns${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiService.get<{ campaigns: Campaign[]; count: number }>(endpoint);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch saved campaigns');
    }
    
    return {
      campaigns: response.data.campaigns,
      count: response.data.count,
    };
  }

  /**
   * Check if a campaign is saved
   */
  async checkIfSaved(campaignId: string): Promise<boolean> {
    const response = await apiService.get<{ isSaved: boolean }>(`/saved-campaigns/check/${campaignId}`);
    
    if (!response.success || !response.data) {
      return false;
    }
    
    return response.data.isSaved;
  }

  /**
   * Get all saved campaign IDs
   */
  async getSavedCampaignIds(): Promise<string[]> {
    const response = await apiService.get<{ campaignIds: string[]; count: number }>('/saved-campaigns/ids');
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch saved campaign IDs');
    }
    
    return response.data.campaignIds;
  }
}

export const savedCampaignService = new SavedCampaignService();

