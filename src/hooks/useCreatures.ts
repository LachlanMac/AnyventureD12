import { useAsyncState } from './useAsyncState';
import { creaturesApi, type CreatureFilters } from '../api/creatures';

export function useCreatures(filters?: CreatureFilters) {
  return useAsyncState(
    () => creaturesApi.getAll(filters),
    [JSON.stringify(filters)]
  );
}

export function useCreature(id: string | undefined) {
  return useAsyncState(
    () => {
      if (!id) throw new Error('Creature ID is required');
      return creaturesApi.getById(id);
    },
    [id],
    { immediate: !!id }
  );
}

export function useCreatureStats() {
  return useAsyncState(
    () => creaturesApi.getStats(),
    []
  );
}

export function useHomebrewCreatures(filters?: CreatureFilters) {
  return useAsyncState(
    () => creaturesApi.homebrew.getAll(filters),
    [JSON.stringify(filters)]
  );
}

export function useHomebrewCreature(id: string | undefined) {
  return useAsyncState(
    () => {
      if (!id) throw new Error('Creature ID is required');
      return creaturesApi.homebrew.getById(id);
    },
    [id],
    { immediate: !!id }
  );
}