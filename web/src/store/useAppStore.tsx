import { create } from 'zustand';

type AppStore = {
  auth: boolean | undefined;
  setAuth: (v: boolean) => void;

  needSave: boolean;
  setNeedSave: (v: boolean) => void;

  needReload: boolean;
  setNeedReload: (v: boolean) => void;

  onSave: () => Promise<void>;
  setOnSave: (v: () => Promise<void>) => void;

  checkDomainsList: string;
  setCheckDomainsList: (v: string) => void;
};

export const useAppStore = create<AppStore>((set) => ({
  auth: undefined,
  setAuth: (auth) => set({ auth }),

  needSave: false,
  setNeedSave: (needSave) => set({ needSave }),

  needReload: false,
  setNeedReload: (needReload: boolean) => set({ needReload }),

  onSave: async () => {},
  setOnSave: (onSave: () => Promise<void>) => set({ onSave }),

  checkDomainsList: '',
  setCheckDomainsList: (checkDomainsList) => set({ checkDomainsList }),
}));
