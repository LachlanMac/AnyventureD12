import { apiClient } from './client';
import type { Creature } from '../types/creature';

export interface CreatureFilters {
  search?: string;
  type?: string;
  tier?: string;
  size?: string;
  minCR?: string;
  maxCR?: string;
  isHomebrew?: string;
  challenge_rating_min?: number;
  challenge_rating_max?: number;
  sortBy?: 'name' | 'tier' | 'challenge_rating' | 'type';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CreateCreatureData {
  name: string;
  description: string;
  tactics: string;
  tier: string;
  type: string;
  size: string;
  health: { max: number; current: number };
  energy: { max: number; current: number; recovery: number };
  resolve: { max: number; current: number; recovery: number };
  movement: number;
  attributes: Record<string, { talent: number }>;
  skills: Record<string, number>;
  mitigation: Record<string, number>;
  immunities: Record<string, boolean>;
  detections: Record<string, number>;
  actions: any[];
  reactions: any[];
  traits: any[];
  loot: string[];
  languages: string[];
  challenge_rating: number;
  isHomebrew: boolean;
  source: string;
}

export interface CreatureStats {
  totalCreatures: number;
  homebrewCreatures: number;
  officialCreatures: number;
  typeStats: Array<{
    _id: string;
    count: number;
    avgCR: number;
  }>;
  tierStats: Array<{
    _id: string;
    count: number;
  }>;
}

export const creaturesApi = {
  // Get all creatures (official bestiary)
  getAll: (filters?: CreatureFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    const queryString = params.toString();
    return apiClient.get<{ creatures: Creature[]; pagination: any }>(`/creatures${queryString ? `?${queryString}` : ''}`);
  },

  // Get creature by ID
  getById: (id: string) =>
    apiClient.get<Creature>(`/creatures/${id}`),

  // Get creature statistics
  getStats: () =>
    apiClient.get<CreatureStats>(`/creatures/stats`),

  // Homebrew creatures
  homebrew: {
    // Get all homebrew creatures
    getAll: (filters?: CreatureFilters) => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, value.toString());
          }
        });
      }
      const queryString = params.toString();
      return apiClient.get<Creature[]>(`/homebrew/creatures${queryString ? `?${queryString}` : ''}`);
    },

    // Get homebrew creature by ID
    getById: (id: string) =>
      apiClient.get<Creature>(`/homebrew/creatures/${id}`),

    // Create homebrew creature
    create: (data: CreateCreatureData) =>
      apiClient.post<Creature>('/homebrew/creatures', data),

    // Update homebrew creature
    update: (id: string, data: Partial<CreateCreatureData>) =>
      apiClient.put<Creature>(`/homebrew/creatures/${id}`, data),

    // Delete homebrew creature
    delete: (id: string) =>
      apiClient.delete(`/homebrew/creatures/${id}`),

    // Publish homebrew creature
    publish: (id: string) =>
      apiClient.patch<Creature>(`/homebrew/creatures/${id}/publish`, {}),
  }
};