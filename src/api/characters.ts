import { apiClient } from './client';
import type { Character } from '../types/character';

export interface CreateCharacterData {
  name: string;
  race: string;
  culture: string;
  attributes: Record<string, number>;
  skills: Record<string, number>;
  talents: Record<string, number>;
  personality: string;
  traits: string[];
}

export interface UpdateCharacterData {
  name?: string;
  attributes?: Record<string, number>;
  skills?: Record<string, number>;
  talents?: Record<string, number>;
  equipment?: any;
  resources?: {
    health?: { current: number; max: number };
    energy?: { current: number; max: number };
    resolve?: { current: number; max: number };
    morale?: { current: number; max: number };
  };
}

export interface CharacterFilters {
  search?: string;
  race?: string;
  culture?: string;
  sortBy?: 'name' | 'level' | 'created' | 'updated';
  sortOrder?: 'asc' | 'desc';
}

export const charactersApi = {
  // Get all characters
  getAll: (filters?: CharacterFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    const queryString = params.toString();
    return apiClient.get<Character[]>(`/characters${queryString ? `?${queryString}` : ''}`);
  },

  // Get character by ID
  getById: (id: string) => apiClient.get<Character>(`/characters/${id}`),

  // Create new character
  create: (data: CreateCharacterData) => apiClient.post<Character>('/characters', data),

  // Update character
  update: (id: string, data: UpdateCharacterData) =>
    apiClient.put<Character>(`/characters/${id}`, data),

  // Update character resources only
  updateResources: (id: string, resources: UpdateCharacterData['resources']) =>
    apiClient.patch<Character>(`/characters/${id}/resources`, { resources }),

  // Delete character
  delete: (id: string) => apiClient.delete(`/characters/${id}`),

  // Character modules
  getModules: (characterId: string) => apiClient.get<any[]>(`/characters/${characterId}/modules`),

  addModule: (characterId: string, moduleId: string, selections: Record<string, string>) =>
    apiClient.post(`/characters/${characterId}/modules`, { moduleId, selections }),

  updateModule: (characterId: string, moduleId: string, selections: Record<string, string>) =>
    apiClient.put(`/characters/${characterId}/modules/${moduleId}`, { selections }),

  removeModule: (characterId: string, moduleId: string) =>
    apiClient.delete(`/characters/${characterId}/modules/${moduleId}`),

  // Character spells
  getSpells: (characterId: string) => apiClient.get<any[]>(`/characters/${characterId}/spells`),

  addSpell: (characterId: string, spellId: string) =>
    apiClient.post(`/characters/${characterId}/spells`, { spellId }),

  removeSpell: (characterId: string, spellId: string) =>
    apiClient.delete(`/characters/${characterId}/spells/${spellId}`),

  // Upload character portrait
  uploadPortrait: (characterId: string, file: File) =>
    apiClient.uploadFile<{ portraitUrl: string }>(
      `/characters/${characterId}/portrait`,
      file,
      'portrait'
    ),
};
