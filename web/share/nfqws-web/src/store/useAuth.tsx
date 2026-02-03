import { create } from 'zustand';

type AuthStore = {
  auth: boolean;
  setAuth: (v: boolean) => void;
};

export const useAuth = create<AuthStore>((set) => ({
  auth: false,
  setAuth: (auth) => set({ auth }),
}));
