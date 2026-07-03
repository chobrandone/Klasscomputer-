'use client';

import { create } from 'zustand';
import { api } from '@/lib/api';
import type { User } from '@/lib/types';
import { useCartStore } from './cart-store';
import { useWishlistStore } from './wishlist-store';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<User>;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<User>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

function markAuthed(authed: boolean) {
  useCartStore.getState().setAuthed(authed);
  useWishlistStore.getState().setAuthed(authed);
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  initialized: false,

  init: async () => {
    try {
      const user = await api<User>('/auth/me');
      set({ user, initialized: true });
      markAuthed(true);
    } catch {
      set({ user: null, initialized: true });
      markAuthed(false);
    }
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      const { user } = await api<{ user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      set({ user });
      markAuthed(true);
      useCartStore.getState().syncToServer().catch(() => undefined);
      return user;
    } finally {
      set({ loading: false });
    }
  },

  register: async (data) => {
    set({ loading: true });
    try {
      const { user } = await api<{ user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      set({ user });
      markAuthed(true);
      return user;
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    await api('/auth/logout', { method: 'POST' }).catch(() => undefined);
    set({ user: null });
    markAuthed(false);
  },

  setUser: (user) => set({ user }),
}));
