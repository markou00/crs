import { create } from 'zustand';

interface NavbarState {
  opened: boolean;
  toggle: () => void;
}

const useNavbarStore = create<NavbarState>((set) => ({
  opened: false,
  toggle: () => set((state) => ({ opened: !state.opened })),
}));

export default useNavbarStore;
