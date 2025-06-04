import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { AxiosRequestConfig, AxiosError } from 'axios';
import { BaseApi } from '@/api/baseApi';

type RetryConfig = {
  maxRetries?: number;
  initialDelay?: number;
  backoffFactor?: number;
}

interface FetchOptions extends AxiosRequestConfig {
  retryConfig?: RetryConfig;
}

interface UseFetchWithRetryOptions<T> extends Omit<UseQueryOptions<T, AxiosError>, 'queryFn'> {
  fetchOptions?: FetchOptions;
}

class ApiWithRetry extends BaseApi {
  async fetchWithRetry<T>(
    url: string, 
    options: FetchOptions = {}
  ): Promise<T> {
    const { 
      retryConfig = {}, 
      ...axiosConfig 
    } = options;
    
    const {
      maxRetries = 3,
      initialDelay = 1000,
      backoffFactor = 2
    } = retryConfig;

    let lastError: AxiosError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.axios.request<T>({
          url,
          ...axiosConfig
        });
        return response.data;
      } catch (error) {
        lastError = error as AxiosError;
        
        // Don't retry on client errors (4xx) except 408, 429
        if (lastError.response?.status) {
          const status = lastError.response.status;
          if (status >= 400 && status < 500 && status !== 408 && status !== 429) {
            throw lastError;
          }
        }
        
        // Don't retry on last attempt
        if (attempt === maxRetries) {
          throw lastError;
        }
        
        // Calculate delay with exponential backoff
        const delay = initialDelay * Math.pow(backoffFactor, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }
}

// Singleton instance
const apiWithRetry = new ApiWithRetry();

export function useFetchWithRetry<T = unknown>(
  queryKey: string | (string | number)[],
  url: string,
  options: UseFetchWithRetryOptions<T> = {
    queryKey: []
  }
) {
  const { fetchOptions, ...queryOptions } = options;

  return useQuery<T, AxiosError>({
    ...queryOptions,
    queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
    queryFn: ({ signal }) => {
      // Integrate AbortController for cleanup
      return apiWithRetry.fetchWithRetry<T>(url, {
        ...fetchOptions,
        signal
      });
    },
    retry: false
  });
}

// Convenience hooks for common HTTP methods
export function useGetWithRetry<T = unknown>(
  queryKey: string | (string | number)[],
  url: string,
  options: UseFetchWithRetryOptions<T> = {
    queryKey: []
  }
) {
  return useFetchWithRetry<T>(queryKey, url, {
    ...options,
    fetchOptions: {
      method: 'GET',
      ...options.fetchOptions
    }
  });
}

export function usePostWithRetry<T = unknown>(
  queryKey: string | (string | number)[],
  url: string,
  data?: any,
  options: UseFetchWithRetryOptions<T> = {
    queryKey: []
  }
) {
  return useFetchWithRetry<T>(queryKey, url, {
    ...options,
    fetchOptions: {
      method: 'POST',
      data,
      ...options.fetchOptions
    }
  });
}
