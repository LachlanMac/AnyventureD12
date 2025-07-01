import { apiClient } from './client';

export interface Module {
  _id: string;
  name: string;
  mtype: 'core' | 'secondary' | 'alteration' | 'cultural' | 'planar' | 'personality';
  ruleset: number;
  description?: string;
  options: ModuleOption[];
}

export interface ModuleOption {
  name: string;
  description: string;
  location: string;
  data: string;
}

export interface ModuleFilters {
  search?: string;
  mtype?: string;
  sortBy?: 'name' | 'mtype';
  sortOrder?: 'asc' | 'desc';
}

export const modulesApi = {
  // Get all modules
  getAll: (filters?: ModuleFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    const queryString = params.toString();
    return apiClient.get<Module[]>(`/modules${queryString ? `?${queryString}` : ''}`);
  },

  // Get module by ID
  getById: (id: string) => apiClient.get<Module>(`/modules/${id}`),

  // Get modules by type
  getByType: (mtype: string) => apiClient.get<Module[]>(`/modules?mtype=${mtype}`),
};
