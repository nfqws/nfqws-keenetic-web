import { createContext, useContext, type RefObject } from 'react';
import type { EditorView } from '@codemirror/view';

export type AppContextData = {
  onSave: VoidFunction;
  currentFile: string;
  setCurrentFile: (value: string) => void;
  needSave: boolean;
  setNeedSave: (value: boolean) => void;
  editorView: RefObject<EditorView | null>;
};

export const AppContext = createContext<AppContextData | null>(null);

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('AppContext is not set');
  }
  return ctx;
};
