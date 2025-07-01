import { useAsyncState } from './useAsyncState';
import { itemsApi, type ItemFilters } from '../api/items';

export function useItems(filters?: ItemFilters) {
  return useAsyncState(() => itemsApi.getAll(filters), [JSON.stringify(filters)]);
}

export function useItem(id: string | undefined) {
  return useAsyncState(
    () => {
      if (!id) throw new Error('Item ID is required');
      return itemsApi.getById(id);
    },
    [id],
    { immediate: !!id }
  );
}

export function useHomebrewItems(filters?: ItemFilters) {
  return useAsyncState(() => itemsApi.homebrew.getAll(filters), [JSON.stringify(filters)]);
}

export function useHomebrewItem(id: string | undefined) {
  return useAsyncState(
    () => {
      if (!id) throw new Error('Item ID is required');
      return itemsApi.homebrew.getById(id);
    },
    [id],
    { immediate: !!id }
  );
}
