import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiError } from '../api/client';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface UseAsyncStateOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useAsyncState<T>(
  asyncFunction: () => Promise<T>,
  deps: React.DependencyList = [],
  options: UseAsyncStateOptions = {}
) {
  const { immediate = true, onSuccess, onError } = options;
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(async () => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout - check if backend server is running')), 10000);
      });

      const data = await Promise.race([asyncFunction(), timeoutPromise]);
      
      if (mountedRef.current) {
        setState({ data: data as T, loading: false, error: null });
        onSuccess?.(data);
      }
    } catch (error) {
      if (mountedRef.current && (error as any)?.name !== 'AbortError') {
        let errorMessage = 'An unknown error occurred';
        
        if (error instanceof ApiError) {
          errorMessage = error.message;
        } else if (error instanceof Error) {
          if (error.message.includes('timeout') || error.message.includes('fetch')) {
            errorMessage = 'Connection failed - is the backend server running? Try: npm run dev:full';
          } else {
            errorMessage = error.message;
          }
        }
        
        setState(prev => ({ ...prev, loading: false, error: errorMessage }));
        onError?.(errorMessage);
      }
    }
  }, deps);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  const refetch = useCallback(() => {
    execute();
  }, [execute]);

  useEffect(() => {
    mountedRef.current = true; // Reset mounted state on each effect run
    
    if (immediate) {
      execute();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, deps);

  // Only set unmounted when component actually unmounts
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    ...state,
    execute,
    refetch,
    reset,
  };
}