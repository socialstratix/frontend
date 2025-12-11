import { useState, useEffect, useCallback, useRef } from 'react';
import { influencerService, type Influencer, type InfluencerListParams, type InfluencerListResponse } from '../services/influencerService';

interface UseInfluencerOptions {
  userId?: string;
  influencerId?: string;
  autoFetch?: boolean;
}

interface UseInfluencerReturn {
  influencer: Influencer | null;
  isLoading: boolean;
  error: string | null;
  fetchInfluencer: (userId: string) => Promise<void>;
  fetchInfluencerById: (influencerId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Hook for managing influencer data
 */
export const useInfluencer = (options: UseInfluencerOptions = {}): UseInfluencerReturn => {
  const { userId, influencerId, autoFetch = false } = options;
  const [influencer, setInfluencer] = useState<Influencer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInfluencer = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const influencerData = await influencerService.getInfluencerByUserId(id);
      setInfluencer(influencerData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch influencer');
      setInfluencer(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchInfluencerById = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const influencerData = await influencerService.getInfluencerById(id);
      setInfluencer(influencerData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch influencer');
      setInfluencer(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    if (influencerId) {
      await fetchInfluencerById(influencerId);
    } else if (userId) {
      await fetchInfluencer(userId);
    }
  }, [userId, influencerId, fetchInfluencer, fetchInfluencerById]);

  useEffect(() => {
    if (autoFetch) {
      if (influencerId) {
        fetchInfluencerById(influencerId);
      } else if (userId) {
        fetchInfluencer(userId);
      }
    }
  }, [autoFetch, userId, influencerId, fetchInfluencer, fetchInfluencerById]);

  return {
    influencer,
    isLoading,
    error,
    fetchInfluencer,
    fetchInfluencerById,
    refetch,
  };
};

/**
 * Hook for fetching influencer list with pagination
 */
export const useInfluencerList = (params?: InfluencerListParams) => {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [pagination, setPagination] = useState<InfluencerListResponse['pagination'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const paramsRef = useRef<string>('');

  const fetchInfluencers = useCallback(async (searchParams?: InfluencerListParams) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await influencerService.getAllInfluencers(searchParams || params);
      setInfluencers(response.influencers);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch influencers');
      setInfluencers([]);
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    // Serialize params to compare if they actually changed
    const paramsKey = JSON.stringify(params || {});
    
    // Only fetch if params actually changed
    if (paramsKey !== paramsRef.current) {
      paramsRef.current = paramsKey;
      fetchInfluencers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  return {
    influencers,
    pagination,
    isLoading,
    error,
    refetch: fetchInfluencers,
  };
};

