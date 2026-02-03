import { create } from 'zustand';

type NeedSaveStore = {
  needSave: boolean;
  setNeedSave: (v: boolean) => void;
};

export const useNeedSave = create<NeedSaveStore>((set) => ({
  needSave: false,
  setNeedSave: (needSave) => set({ needSave }),
}));
