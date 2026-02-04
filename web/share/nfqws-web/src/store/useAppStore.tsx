import type { EditorView } from '@codemirror/view';
import { create } from 'zustand';

import { API } from '@/api/client';

type AppStore = {
  auth: boolean;
  setAuth: (v: boolean) => void;

  currentFile: string;
  setCurrentFile: (v: string) => void;

  needSave: boolean;
  setNeedSave: (v: boolean) => void;

  editorView: EditorView | null;
  setEditorView: (v: EditorView | null) => void;

  onSave: () => Promise<void>;
};

export const useAppStore = create<AppStore>((set, get) => ({
  auth: false,
  setAuth: (auth) => set({ auth }),

  currentFile: 'main',
  setCurrentFile: (currentFile) => set({ currentFile }),

  needSave: false,
  setNeedSave: (needSave) => set({ needSave }),

  editorView: null,
  setEditorView: (editorView) => set({ editorView }),

  onSave: async () => {
    const { needSave, currentFile, editorView, setNeedSave } = get();
    if (!needSave) {
      return;
    }

    const text = editorView?.state.doc.toString();
    if (text === undefined) {
      return;
    }

    const { data } = await API.saveFile(currentFile, text);
    if (data?.status === 0) {
      setNeedSave(false);
    } else {
      // TODO: error
    }
  },
}));
