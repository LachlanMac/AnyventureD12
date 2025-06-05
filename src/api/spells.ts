import { apiClient } from './client';

export interface Spell {
  _id: string;
  name: string;
  description: string;
  school: string;
  subschool: string;
  checkToCast: number;
  energy: number;
  damage: number;
  damageType?: string;
  range: number;
  duration: string;
  concentration: boolean;
  reaction: boolean;
  components: string[];
  charge?: string;
  ritualDuration?: string;
  tags?: string[];
}

export interface SpellFilters {
  search?: string;
  school?: string;
  subschool?: string;
  energy_min?: number;
  energy_max?: number;
  concentration?: boolean;
  reaction?: boolean;
  sortBy?: 'name' | 'school' | 'energy' | 'checkToCast';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateSpellData {
  name: string;
  description: string;
  school: string;
  subschool: string;
  checkToCast: number;
  energy: number;
  damage: number;
  damageType?: string;
  range: number;
  duration: string;
  concentration: boolean;
  reaction: boolean;
  components: string[];
  charge?: string;
  ritualDuration?: string;
  tags?: string[];
}

export const spellsApi = {
  // Get all spells
  getAll: (filters?: SpellFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    const queryString = params.toString();
    return apiClient.get<Spell[]>(`/spells${queryString ? `?${queryString}` : ''}`);
  },

  // Get spell by ID
  getById: (id: string) =>
    apiClient.get<Spell>(`/spells/${id}`),

  // Get spells by school
  getBySchool: (school: string, subschool?: string) => {
    const params = new URLSearchParams({ school });
    if (subschool) params.append('subschool', subschool);
    return apiClient.get<Spell[]>(`/spells?${params.toString()}`);
  },

  // Character spell management
  learnSpell: (characterId: string, spellId: string, notes?: string) =>
    apiClient.post(`/characters/${characterId}/spells/${spellId}`, { notes }),

  forgetSpell: (characterId: string, spellId: string) =>
    apiClient.delete(`/characters/${characterId}/spells/${spellId}`),

  // Homebrew spells
  homebrew: {
    // Get all homebrew spells
    getAll: (filters?: SpellFilters) => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, value.toString());
          }
        });
      }
      const queryString = params.toString();
      return apiClient.get<Spell[]>(`/homebrew/spells${queryString ? `?${queryString}` : ''}`);
    },

    // Get homebrew spell by ID
    getById: (id: string) =>
      apiClient.get<Spell>(`/homebrew/spells/${id}`),

    // Create homebrew spell
    create: (data: CreateSpellData) =>
      apiClient.post<Spell>('/homebrew/spells', data),

    // Update homebrew spell
    update: (id: string, data: Partial<CreateSpellData>) =>
      apiClient.put<Spell>(`/homebrew/spells/${id}`, data),

    // Delete homebrew spell
    delete: (id: string) =>
      apiClient.delete(`/homebrew/spells/${id}`),

    // Publish homebrew spell
    publish: (id: string) =>
      apiClient.patch<Spell>(`/homebrew/spells/${id}/publish`, {}),
  }
};

// Export as spellApi for backward compatibility
export const spellApi = spellsApi;