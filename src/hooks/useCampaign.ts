import { useState, useEffect, useCallback } from 'react';
import { campaignService, type Campaign, type CreateCampaignData, type UpdateCampaignData } from '../services/campaignService';

interface UseCampaignsOptions {
  brandId?: string;
  status?: 'active' | 'previous' | 'draft' | 'closed' | 'completed';
  autoFetch?: boolean;
}

interface UseCampaignsReturn {
  campaigns: Campaign[];
  isLoading: boolean;
  error: string | null;
  count: number;
  fetchCampaigns: (brandId: string, status?: string) => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Hook for managing campaigns by brand
 */
export const useCampaigns = (options: UseCampaignsOptions = {}): UseCampaignsReturn => {
  const { brandId, status, autoFetch = false } = options;
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(0);

  const fetchCampaigns = useCallback(async (id: string, campaignStatus?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await campaignService.getCampaignsByBrandId(
        id,
        (campaignStatus || status) as any
      );
      setCampaigns(response.campaigns || []);
      setCount(response.count || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch campaigns');
      setCampaigns([]);
      setCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  const refetch = useCallback(async () => {
    if (brandId) {
      await fetchCampaigns(brandId);
    }
  }, [brandId, fetchCampaigns]);

  useEffect(() => {
    if (autoFetch && brandId) {
      fetchCampaigns(brandId);
    }
  }, [autoFetch, brandId, status, fetchCampaigns]);

  return {
    campaigns,
    isLoading,
    error,
    count,
    fetchCampaigns,
    refetch,
  };
};

interface UseCampaignOptions {
  campaignId?: string;
  autoFetch?: boolean;
}

interface UseCampaignReturn {
  campaign: Campaign | null;
  isLoading: boolean;
  error: string | null;
  fetchCampaign: (id: string) => Promise<void>;
  createCampaign: (data: CreateCampaignData) => Promise<Campaign>;
  updateCampaign: (id: string, data: UpdateCampaignData) => Promise<Campaign>;
  deleteCampaign: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Hook for managing a single campaign
 */
export const useCampaign = (options: UseCampaignOptions = {}): UseCampaignReturn => {
  const { campaignId, autoFetch = false } = options;
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaign = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const campaignData = await campaignService.getCampaignById(id);
      setCampaign(campaignData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch campaign');
      setCampaign(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCampaign = useCallback(async (data: CreateCampaignData): Promise<Campaign> => {
    try {
      setIsLoading(true);
      setError(null);
      const newCampaign = await campaignService.createCampaign(data);
      setCampaign(newCampaign);
      return newCampaign;
    } catch (err: any) {
      setError(err.message || 'Failed to create campaign');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCampaign = useCallback(async (id: string, data: UpdateCampaignData): Promise<Campaign> => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedCampaign = await campaignService.updateCampaign(id, data);
      setCampaign(updatedCampaign);
      return updatedCampaign;
    } catch (err: any) {
      setError(err.message || 'Failed to update campaign');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteCampaign = useCallback(async (id: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await campaignService.deleteCampaign(id);
      setCampaign(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete campaign');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    if (campaignId) {
      await fetchCampaign(campaignId);
    }
  }, [campaignId, fetchCampaign]);

  useEffect(() => {
    if (autoFetch && campaignId) {
      fetchCampaign(campaignId);
    }
  }, [autoFetch, campaignId, fetchCampaign]);

  return {
    campaign,
    isLoading,
    error,
    fetchCampaign,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    refetch,
  };
};

