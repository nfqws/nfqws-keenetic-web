import { create } from 'zustand';

type AuthStore = {
  auth: boolean;
  setAuth: (v: boolean) => void;
};

// TODO: remove this store, use context instead

export const useAuth = create<AuthStore>((set) => ({
  auth: false,
  setAuth: (auth) => set({ auth }),
}));
