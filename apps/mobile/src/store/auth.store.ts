import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { api } from '../api/client';
import type { IUserPublic, ApiSuccess } from '@mudanza/types';

interface AuthState {
  token: string | null;
  user: IUserPublic | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    const response = await api<{ data: { token: string; user: IUserPublic } }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });

    const { token, user } = response.data;
    await SecureStore.setItemAsync('auth_token', token);
    set({ token, user, isAuthenticated: true });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('auth_token');
    set({ token: null, user: null, isAuthenticated: false });
  },

  loadToken: async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        // Verify token is still valid
        const response = await api<{ data: IUserPublic }>('/auth/me');
        set({ token, user: response.data, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      await SecureStore.deleteItemAsync('auth_token');
      set({ token: null, user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
