import { apiClient } from './client';

export interface Harmony {
  instrument: string;
  effect: string;
}
export interface Song {
  _id: string;
  id?: number;
  name: string;
  type: 'song' | 'ballad';
  magical: boolean;
  difficulty: number;
  description?: string;
  effect?: string;
  harmony_1?: Harmony | null;
  harmony_2?: Harmony | null;
}

export interface SongFilters {
  search?: string;
  type?: 'song' | 'ballad';
  magical?: 'yes' | 'no';
}

export const songsApi = {
  getAll: () => apiClient.get<Song[]>('/songs'),
  getById: (id: string) => apiClient.get<Song>(`/songs/${id}`),
  addToCharacter: (characterId: string, songId: string, notes?: string) =>
    apiClient.post(`/characters/${characterId}/songs/${songId}`, { notes }),
  removeFromCharacter: (characterId: string, songId: string) =>
    apiClient.delete(`/characters/${characterId}/songs/${songId}`),
};
