'use client';

import { create } from 'zustand';

interface UiState {
  cartOpen: boolean;
  mobileNavOpen: boolean;
  searchOpen: boolean;
  announcementDismissed: boolean;
  setCartOpen: (open: boolean) => void;
  setMobileNavOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  dismissAnnouncement: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  cartOpen: false,
  mobileNavOpen: false,
  searchOpen: false,
  announcementDismissed: false,
  setCartOpen: (cartOpen) => set({ cartOpen }),
  setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  dismissAnnouncement: () => set({ announcementDismissed: true }),
}));
