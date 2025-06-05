import { useAsyncState } from './useAsyncState';
import { charactersApi, type CharacterFilters } from '../api/characters';

export function useCharacters(filters?: CharacterFilters) {
  return useAsyncState(
    () => charactersApi.getAll(filters),
    [JSON.stringify(filters)]
  );
}

export function useCharacter(id: string | undefined) {
  return useAsyncState(
    () => {
      if (!id) throw new Error('Character ID is required');
      return charactersApi.getById(id);
    },
    [id],
    { immediate: !!id }
  );
}

export function useCharacterModules(characterId: string | undefined) {
  return useAsyncState(
    () => {
      if (!characterId) throw new Error('Character ID is required');
      return charactersApi.getModules(characterId);
    },
    [characterId],
    { immediate: !!characterId }
  );
}

export function useCharacterSpells(characterId: string | undefined) {
  return useAsyncState(
    () => {
      if (!characterId) throw new Error('Character ID is required');
      return charactersApi.getSpells(characterId);
    },
    [characterId],
    { immediate: !!characterId }
  );
}