import { create } from 'zustand';

interface GlobalState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useGlobalStore = create<GlobalState>(set => ({
  sidebarOpen: true,
  toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
}));
