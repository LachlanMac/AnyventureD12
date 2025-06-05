import { useAsyncState } from './useAsyncState';
import { authApi } from '../api/auth';

export function useAuth() {
  return useAsyncState(() => authApi.me(), []);
}