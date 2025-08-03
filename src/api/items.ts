import { apiClient } from './client';

export interface Item {
  _id: string;
  name: string;
  description: string;
  type: string;
  weapon_category?: string;
  shield_category?: string;
  consumable_category?: string;
  weight: number;
  value: number;
  bonus_attack: number;
  rarity: string;
  primary?: any;
  health?: any;
  energy?: any;
  resolve?: any;
  movement?: number;
  attributes?: any;
  basic?: any;
  weapon?: any;
  magic?: any;
  craft?: any;
  mitigation?: any;
  armor_penalties?: any;
  detections?: any;
  immunities?: any;
}

export interface ItemFilters {
  search?: string;
  type?: string;
  weapon_category?: string;
  shield_category?: string;
  consumable_category?: string;
  rarity?: string;
  sortBy?: 'name' | 'type' | 'value' | 'weight';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateItemData {
  name: string;
  description: string;
  type: string;
  weapon_category?: string;
  shield_category?: string;
  consumable_category?: string;
  weight: number;
  value: number;
  bonus_attack: number;
  rarity: string;
  [key: string]: any;
}

export const itemsApi = {
  // Get all items
  getAll: (filters?: ItemFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    const queryString = params.toString();
    return apiClient.get<Item[]>(`/items${queryString ? `?${queryString}` : ''}`);
  },

  // Get item by ID
  getById: (id: string) => apiClient.get<Item>(`/items/${id}`),

  // Homebrew items
  homebrew: {
    // Get all homebrew items
    getAll: (filters?: ItemFilters) => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, value.toString());
          }
        });
      }
      const queryString = params.toString();
      return apiClient.get<Item[]>(`/homebrew/items${queryString ? `?${queryString}` : ''}`);
    },

    // Get homebrew item by ID
    getById: (id: string) => apiClient.get<Item>(`/homebrew/items/${id}`),

    // Create homebrew item
    create: (data: CreateItemData) => apiClient.post<Item>('/homebrew/items', data),

    // Update homebrew item
    update: (id: string, data: Partial<CreateItemData>) =>
      apiClient.put<Item>(`/homebrew/items/${id}`, data),

    // Delete homebrew item
    delete: (id: string) => apiClient.delete(`/homebrew/items/${id}`),

    // Publish homebrew item
    publish: (id: string) => apiClient.patch<Item>(`/homebrew/items/${id}/publish`, {}),
  },
};
