import { apiService } from './api';

export interface Brand {
  _id: string;
  userId: string;
  description?: string;
  website?: string;
  location?: string;
  logo?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface CreateBrandData {
  description?: string;
  website?: string;
  location?: string;
  logo?: string;
  tags?: string[];
}

export interface UpdateBrandData {
  description?: string;
  website?: string;
  location?: string;
  logo?: string;
  tags?: string[];
}

export interface BrandListParams {
  page?: number;
  limit?: number;
  search?: string;
  tags?: string | string[];
  location?: string;
}

export interface BrandListResponse {
  brands: Brand[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class BrandService {
  /**
   * Get brand profile by brand ID (MongoDB _id)
   */
  async getBrandById(brandId: string): Promise<Brand> {
    const response = await apiService.get<{ brand: Brand }>(`/brand/id/${brandId}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch brand');
    }
    
    return response.data.brand;
  }

  /**
   * Get brand profile by user ID
   */
  async getBrandByUserId(userId: string): Promise<Brand> {
    const response = await apiService.get<{ brand: Brand }>(`/brand/${userId}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch brand');
    }
    
    return response.data.brand;
  }

  /**
   * Get all brands with pagination and filtering
   */
  async getAllBrands(params?: BrandListParams): Promise<BrandListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.location) queryParams.append('location', params.location);
    
    if (params?.tags) {
      const tags = Array.isArray(params.tags) ? params.tags.join(',') : params.tags;
      queryParams.append('tags', tags);
    }
    
    const queryString = queryParams.toString();
    const endpoint = `/brand${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiService.get<{ brands: Brand[]; pagination: BrandListResponse['pagination'] }>(endpoint);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch brands');
    }
    
    return {
      brands: response.data.brands,
      pagination: response.data.pagination,
    };
  }

  /**
   * Create a new brand profile
   */
  async createBrand(data: CreateBrandData): Promise<Brand> {
    const response = await apiService.post<{ brand: Brand }>('/brand', data);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create brand');
    }
    
    return response.data.brand;
  }

  /**
   * Update brand profile
   */
  async updateBrand(userId: string, data: UpdateBrandData): Promise<Brand> {
    const response = await apiService.put<{ brand: Brand }>(`/brand/${userId}`, data);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update brand');
    }
    
    return response.data.brand;
  }

  /**
   * Delete brand profile
   */
  async deleteBrand(userId: string): Promise<void> {
    const response = await apiService.delete<{ brand: Brand }>(`/brand/${userId}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete brand');
    }
  }

  /**
   * Upload brand logo
   */
  async uploadLogo(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('logo', file);
    
    // Note: This requires special handling for file uploads
    // You may need to adjust the apiService to handle FormData
    const response = await apiService.post<{ logoUrl: string }>('/brand/upload-logo', formData);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to upload logo');
    }
    
    return response.data.logoUrl;
  }
}

export const brandService = new BrandService();

