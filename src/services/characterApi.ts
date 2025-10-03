// Character API Service - Centralized character-related API calls
import { Character } from '../types/character';

// Base configuration
const API_BASE = '/api/characters';

// Helper for handling API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

// Helper for making authenticated requests
async function authenticatedFetch(url: string, options: RequestInit = {}) {
  return fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}

// ============================================================================
// CHARACTER CRUD
// ============================================================================

export async function fetchCharacters(): Promise<Character[]> {
  const response = await authenticatedFetch(API_BASE);
  return handleResponse<Character[]>(response);
}

export async function fetchCharacter(characterId: string): Promise<Character> {
  const response = await authenticatedFetch(`${API_BASE}/${characterId}`);
  return handleResponse<Character>(response);
}

export async function createCharacter(characterData: Partial<Character>): Promise<Character> {
  const response = await authenticatedFetch(API_BASE, {
    method: 'POST',
    body: JSON.stringify(characterData),
  });
  return handleResponse<Character>(response);
}

export async function updateCharacter(characterId: string, updates: Partial<Character>): Promise<Character> {
  const response = await authenticatedFetch(`${API_BASE}/${characterId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return handleResponse<Character>(response);
}

export async function deleteCharacter(characterId: string): Promise<void> {
  const response = await authenticatedFetch(`${API_BASE}/${characterId}`, {
    method: 'DELETE',
  });
  await handleResponse<void>(response);
}

// ============================================================================
// CHARACTER RESOURCES
// ============================================================================

export async function updateResources(
  characterId: string,
  resources: Character['resources']
): Promise<Character> {
  const response = await authenticatedFetch(`${API_BASE}/${characterId}/resources`, {
    method: 'PATCH',
    body: JSON.stringify({ resources }),
  });
  return handleResponse<Character>(response);
}

// ============================================================================
// INVENTORY & EQUIPMENT
// ============================================================================

export async function addItemToInventory(
  characterId: string,
  itemData: { itemId: string; quantity?: number; customName?: string; customIcon?: string }
): Promise<Character> {
  const response = await authenticatedFetch(`${API_BASE}/${characterId}/inventory`, {
    method: 'POST',
    body: JSON.stringify(itemData),
  });
  return handleResponse<Character>(response);
}

export async function updateItemQuantity(
  characterId: string,
  itemIndex: number,
  quantity: number
): Promise<Character> {
  const response = await authenticatedFetch(`${API_BASE}/${characterId}/inventory/${itemIndex}/quantity`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  });
  return handleResponse<Character>(response);
}

export async function equipItem(
  characterId: string,
  slotName: string,
  itemId: string
): Promise<Character> {
  const response = await authenticatedFetch(`${API_BASE}/${characterId}/equipment/${slotName}`, {
    method: 'PUT',
    body: JSON.stringify({ itemId }),
  });
  return handleResponse<Character>(response);
}

export async function unequipItem(
  characterId: string,
  slotName: string
): Promise<Character> {
  const response = await authenticatedFetch(`${API_BASE}/${characterId}/equipment/${slotName}`, {
    method: 'DELETE',
  });
  return handleResponse<Character>(response);
}

// ============================================================================
// MODULES & SPELLS
// ============================================================================

export async function addModuleToCharacter(
  characterId: string,
  moduleId: string
): Promise<Character> {
  const response = await authenticatedFetch(`${API_BASE}/${characterId}/modules/${moduleId}`, {
    method: 'POST',
  });
  return handleResponse<Character>(response);
}

export async function removeModuleFromCharacter(
  characterId: string,
  moduleId: string
): Promise<Character> {
  const response = await authenticatedFetch(`${API_BASE}/${characterId}/modules/${moduleId}`, {
    method: 'DELETE',
  });
  return handleResponse<Character>(response);
}

export async function updateModuleOptions(
  characterId: string,
  moduleId: string,
  selectedOptions: Array<{ location: string; choice?: string }>
): Promise<Character> {
  const response = await authenticatedFetch(`${API_BASE}/${characterId}/modules/${moduleId}/options`, {
    method: 'PUT',
    body: JSON.stringify({ selectedOptions }),
  });
  return handleResponse<Character>(response);
}

// ============================================================================
// SKILLS
// ============================================================================

export async function updateMusicSkills(
  characterId: string,
  musicSkills: Record<string, number>
): Promise<Character> {
  const response = await authenticatedFetch(`${API_BASE}/${characterId}/music-skills`, {
    method: 'PATCH',
    body: JSON.stringify({ musicSkills }),
  });
  return handleResponse<Character>(response);
}

export async function updateLanguageSkills(
  characterId: string,
  languageSkills: Record<string, number>
): Promise<Character> {
  const response = await authenticatedFetch(`${API_BASE}/${characterId}/language-skills`, {
    method: 'PATCH',
    body: JSON.stringify({ languageSkills }),
  });
  return handleResponse<Character>(response);
}

// ============================================================================
// SONGS
// ============================================================================

export async function addSongToCharacter(
  characterId: string,
  songId: string
): Promise<Character> {
  const response = await authenticatedFetch(`${API_BASE}/${characterId}/songs`, {
    method: 'POST',
    body: JSON.stringify({ songId }),
  });
  return handleResponse<Character>(response);
}

export async function removeSongFromCharacter(
  characterId: string,
  songId: string
): Promise<Character> {
  const response = await authenticatedFetch(`${API_BASE}/${characterId}/songs`, {
    method: 'DELETE',
    body: JSON.stringify({ songId }),
  });
  return handleResponse<Character>(response);
}

// ============================================================================
// VISIBILITY
// ============================================================================

export async function toggleCharacterVisibility(
  characterId: string,
  isPublic: boolean
): Promise<{ message: string; public: boolean }> {
  const response = await authenticatedFetch(`${API_BASE}/${characterId}/public`, {
    method: 'PATCH',
    body: JSON.stringify({ public: isPublic }),
  });
  return handleResponse<{ message: string; public: boolean }>(response);
}

// ============================================================================
// EXPORT
// ============================================================================

export async function exportToFoundry(characterId: string): Promise<Blob> {
  const response = await authenticatedFetch(`${API_BASE}/${characterId}/export-foundry`);
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `Export failed: ${response.statusText}`);
  }
  return response.blob();
}

// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================

export class CharacterApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'CharacterApiError';
  }
}

export function isCharacterApiError(error: unknown): error is CharacterApiError {
  return error instanceof CharacterApiError;
}
