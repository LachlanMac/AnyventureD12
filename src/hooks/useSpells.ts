import { useAsyncState } from './useAsyncState';
import { spellsApi, type SpellFilters } from '../api/spells';

export function useSpells(filters?: SpellFilters) {
  return useAsyncState(
    () => spellsApi.getAll(filters),
    [JSON.stringify(filters)]
  );
}

export function useSpell(id: string | undefined) {
  return useAsyncState(
    () => {
      if (!id) throw new Error('Spell ID is required');
      return spellsApi.getById(id);
    },
    [id],
    { immediate: !!id }
  );
}

export function useSpellsBySchool(school: string | undefined, subschool?: string) {
  return useAsyncState(
    () => {
      if (!school) throw new Error('School is required');
      return spellsApi.getBySchool(school, subschool);
    },
    [school, subschool],
    { immediate: !!school }
  );
}

export function useHomebrewSpells(filters?: SpellFilters) {
  return useAsyncState(
    () => spellsApi.homebrew.getAll(filters),
    [JSON.stringify(filters)]
  );
}

export function useHomebrewSpell(id: string | undefined) {
  return useAsyncState(
    () => {
      if (!id) throw new Error('Spell ID is required');
      return spellsApi.homebrew.getById(id);
    },
    [id],
    { immediate: !!id }
  );
}