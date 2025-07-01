// Centralized API client for consistent error handling and request management

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: Response
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ApiRequestOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit & ApiRequestOptions = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const config: RequestInit = {
      ...options,
      headers: defaultHeaders,
      credentials: 'include', // Important for cookie-based auth
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let errorMessage = `Request failed: ${response.status} ${response.statusText}`;

        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // If response isn't JSON, use default message
        }

        throw new ApiError(errorMessage, response.status, response);
      }

      // Handle empty responses (like DELETE operations)
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // Network errors, timeout, etc.
      throw new ApiError(error instanceof Error ? error.message : 'Network error occurred', 0);
    }
  }

  async get<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // File upload helper
  async uploadFile<T>(
    endpoint: string,
    file: File,
    fieldName: string = 'file',
    additionalData?: Record<string, string>,
    options?: Omit<ApiRequestOptions, 'headers'>
  ): Promise<T> {
    const formData = new FormData();
    formData.append(fieldName, file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export types for convenience
export type { ApiRequestOptions };
