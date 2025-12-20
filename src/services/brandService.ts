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
    
    // Construct full URL for logo if it's a relative path
    const brand = response.data.brand;
    if (brand.logo) {
      brand.logo = constructImageUrl(brand.logo) || brand.logo;
    }
    
    return brand;
  }

  /**
   * Get brand profile by user ID
   */
  async getBrandByUserId(userId: string): Promise<Brand> {
    const response = await apiService.get<{ brand: Brand }>(`/brand/${userId}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch brand');
    }
    
    // Construct full URL for logo if it's a relative path
    const brand = response.data.brand;
    if (brand.logo) {
      brand.logo = constructImageUrl(brand.logo) || brand.logo;
    }
    
    return brand;
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
   * @param userId - User ID of the brand owner
   * @param data - Brand data to update
   * @param logoFile - Optional logo file to upload
   */
  async updateBrand(userId: string, data: UpdateBrandData, logoFile?: File): Promise<Brand> {
    let requestData: UpdateBrandData | FormData;
    
    // If logo file is provided, use FormData
    if (logoFile) {
      const formData = new FormData();
      formData.append('logo', logoFile);
      
      // Append other fields to FormData
      if (data.description !== undefined) {
        formData.append('description', data.description);
      }
      if (data.website !== undefined) {
        formData.append('website', data.website);
      }
      if (data.location !== undefined) {
        // Location might be an object, so stringify it
        formData.append('location', typeof data.location === 'string' 
          ? data.location 
          : JSON.stringify(data.location));
      }
      if (data.tags !== undefined) {
        // Send tags as JSON string - backend will need to parse it
        // Alternatively, send each tag individually for multer to parse as array
        if (Array.isArray(data.tags)) {
          // Send tags as JSON string since multer doesn't automatically parse arrays from FormData
          formData.append('tags', JSON.stringify(data.tags));
        }
      }
      
      requestData = formData;
    } else {
      // No file, use regular JSON
      requestData = data;
    }
    
    const response = await apiService.put<{ brand: Brand }>(`/brand/${userId}`, requestData);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update brand');
    }
    
    // Construct full URL for logo if it's a relative path
    const brand = response.data.brand;
    if (brand.logo) {
      brand.logo = constructImageUrl(brand.logo) || brand.logo;
    }
    
    return brand;
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

