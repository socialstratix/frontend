import { API_BASE_URL } from '../constants';
import type { ApiResponse } from '../types';

class ApiService {
  private baseURL: string;
  private onUnauthorized?: () => void;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setUnauthorizedHandler(handler: () => void): void {
    this.onUnauthorized = handler;
  }

  private getToken(): string | null {
    return sessionStorage.getItem('stratix_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Log API calls for debugging
    if (import.meta.env.DEV) {
      console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
    }
    
    const token = this.getToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    // Add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };
//test
    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      // Handle 401 Unauthorized
      if (response.status === 401) {
        if (this.onUnauthorized) {
          this.onUnauthorized();
        }
        throw new Error(data.message || 'Unauthorized. Please login again.');
      }
      
      if (!response.ok) {
        // Log error details in production for debugging
        if (import.meta.env.PROD) {
          console.error(`❌ API Error: ${response.status} ${response.statusText}`, {
            url,
            method: options.method || 'GET',
            error: data.message || 'Unknown error',
          });
        }
        throw new Error(data.message || 'An error occurred');
      }
      
      return data;
    } catch (error) {
      // Enhanced error logging for network/CORS issues
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error(`🌐 Network Error - Could not reach API:`, {
          url,
          baseURL: this.baseURL,
          error: error.message,
        });
        throw new Error(`Cannot connect to API at ${this.baseURL}. Please check your network connection and API configuration.`);
      }
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiService = new ApiService(API_BASE_URL);

