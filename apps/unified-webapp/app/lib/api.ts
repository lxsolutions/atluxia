import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

// API client configuration
const API_BASE_URLS = {
  nomad: process.env.NOMAD_API_URL || 'http://localhost:3000/api',
  polyverse: process.env.POLYVERSE_API_URL || 'http://localhost:3001/api',
  everpath: process.env.EVERPATH_API_URL || 'http://localhost:3003/api',
  critters: process.env.CRITTERS_API_URL || 'http://localhost:56456/api',
};

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Generic API client
class ApiClient {
  private baseUrl: string;

  constructor(service: keyof typeof API_BASE_URLS) {
    this.baseUrl = API_BASE_URLS[service];
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const session = await getServerSession(authOptions);
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (session?.user?.id) {
      headers['X-User-Id'] = session.user.id;
    }

    return headers;
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: await this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error(`API GET error for ${endpoint}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error(`API POST error for ${endpoint}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async put<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error(`API PUT error for ${endpoint}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: await this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error(`API DELETE error for ${endpoint}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

// Service-specific API clients
export const nomadApi = new ApiClient('nomad');
export const polyverseApi = new ApiClient('polyverse');
export const everpathApi = new ApiClient('everpath');
export const crittersApi = new ApiClient('critters');

// Unified dashboard data fetcher
export async function getDashboardData() {
  try {
    // Fetch data from all services in parallel
    const [nomadData, polyverseData, everpathData, crittersData] = await Promise.allSettled([
      nomadApi.get('/dashboard/stats'),
      polyverseApi.get('/dashboard/stats'),
      everpathApi.get('/dashboard/stats'),
      crittersApi.get('/dashboard/stats'),
    ]);

    return {
      nomad: nomadData.status === 'fulfilled' ? nomadData.value : { success: false, error: 'Service unavailable' },
      polyverse: polyverseData.status === 'fulfilled' ? polyverseData.value : { success: false, error: 'Service unavailable' },
      everpath: everpathData.status === 'fulfilled' ? everpathData.value : { success: false, error: 'Service unavailable' },
      critters: crittersData.status === 'fulfilled' ? crittersData.value : { success: false, error: 'Service unavailable' },
    };
  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    return {
      nomad: { success: false, error: 'Failed to fetch data' },
      polyverse: { success: false, error: 'Failed to fetch data' },
      everpath: { success: false, error: 'Failed to fetch data' },
      critters: { success: false, error: 'Failed to fetch data' },
    };
  }
}