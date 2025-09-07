import { useAsyncState } from './useAsyncState';
import { songsApi } from '../api/songs';

export function useSongs() {
  return useAsyncState(() => songsApi.getAll(), []);
}

export function useSong(id: string | undefined) {
  return useAsyncState(
    () => {
      if (!id) throw new Error('Song ID is required');
      return songsApi.getById(id);
    },
    [id],
    { immediate: !!id }
  );
}

