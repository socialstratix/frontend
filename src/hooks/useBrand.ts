import { useState, useEffect, useCallback } from 'react';
import { brandService, type Brand, type CreateBrandData, type UpdateBrandData, type BrandListParams, type BrandListResponse } from '../services/brandService';

interface UseBrandOptions {
  userId?: string;
  autoFetch?: boolean;
}

interface UseBrandReturn {
  brand: Brand | null;
  isLoading: boolean;
  error: string | null;
  fetchBrand: (userId: string) => Promise<void>;
  fetchBrandById: (brandId: string) => Promise<void>;
  createBrand: (data: CreateBrandData) => Promise<Brand>;
  updateBrand: (userId: string, data: UpdateBrandData) => Promise<Brand>;
  deleteBrand: (userId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Hook for managing brand data
 */
export const useBrand = (options: UseBrandOptions = {}): UseBrandReturn => {
  const { userId, autoFetch = false } = options;
  const [brand, setBrand] = useState<Brand | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBrand = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const brandData = await brandService.getBrandByUserId(id);
      setBrand(brandData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch brand');
      setBrand(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchBrandById = useCallback(async (brandId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const brandData = await brandService.getBrandById(brandId);
      setBrand(brandData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch brand');
      setBrand(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createBrand = useCallback(async (data: CreateBrandData): Promise<Brand> => {
    try {
      setIsLoading(true);
      setError(null);
      const newBrand = await brandService.createBrand(data);
      setBrand(newBrand);
      return newBrand;
    } catch (err: any) {
      setError(err.message || 'Failed to create brand');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateBrand = useCallback(async (userId: string, data: UpdateBrandData): Promise<Brand> => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedBrand = await brandService.updateBrand(userId, data);
      setBrand(updatedBrand);
      return updatedBrand;
    } catch (err: any) {
      setError(err.message || 'Failed to update brand');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteBrand = useCallback(async (userId: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await brandService.deleteBrand(userId);
      setBrand(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete brand');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    if (userId) {
      await fetchBrand(userId);
    }
  }, [userId, fetchBrand]);

  useEffect(() => {
    if (autoFetch && userId) {
      fetchBrand(userId);
    }
  }, [autoFetch, userId, fetchBrand]);

  return {
    brand,
    isLoading,
    error,
    fetchBrand,
    fetchBrandById,
    createBrand,
    updateBrand,
    deleteBrand,
    refetch,
  };
};

/**
 * Hook for fetching brand list with pagination
 */
export const useBrandList = (params?: BrandListParams) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [pagination, setPagination] = useState<BrandListResponse['pagination'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBrands = useCallback(async (searchParams?: BrandListParams) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await brandService.getAllBrands(searchParams || params);
      setBrands(response.brands);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch brands');
      setBrands([]);
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    if (params !== undefined) {
      fetchBrands();
    }
  }, [params, fetchBrands]);

  return {
    brands,
    pagination,
    isLoading,
    error,
    refetch: fetchBrands,
  };
};

