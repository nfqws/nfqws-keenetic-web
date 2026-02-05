import { create } from 'zustand';

type AppStore = {
  auth: boolean;
  setAuth: (v: boolean) => void;

  needSave: boolean;
  setNeedSave: (v: boolean) => void;

  onSave: () => Promise<void>;
  setOnSave: (v: () => Promise<void>) => void;

  checkDomainsList: string;
  setCheckDomainsList: (v: string) => void;
};

export const useAppStore = create<AppStore>((set) => ({
  auth: false,
  setAuth: (auth) => set({ auth }),

  needSave: false,
  setNeedSave: (needSave) => set({ needSave }),

  onSave: async () => {},
  setOnSave: (onSave: () => Promise<void>) => set({ onSave }),

  checkDomainsList: '',
  setCheckDomainsList: (checkDomainsList) => set({ checkDomainsList }),
}));
