import { apiClient } from './client';

export interface User {
  id: string;
  discordId: string;
  username: string;
  usernameCustomized: boolean;
}

export interface AuthResponse {
  authenticated: boolean;
  user?: User;
}

export interface UpdateProfileData {
  username: string;
}

export const authApi = {
  // Check authentication status
  me: () =>
    apiClient.get<AuthResponse>('/auth/me'),

  // Update user profile
  updateProfile: (data: UpdateProfileData) =>
    apiClient.put<User>('/auth/profile', data),

  // Logout
  logout: () =>
    apiClient.get('/auth/logout'),

  // Discord OAuth login (redirect)
  loginUrl: '/api/auth/discord',
};