import { useEffect, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { history } from '@codemirror/commands';
import { Compartment } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { Box, useTheme } from '@mui/material';
import { vscodeDark, vscodeLight } from '@uiw/codemirror-theme-vscode';
import ReactCodeMirror from '@uiw/react-codemirror';

import type { FileInfo } from '@/hooks/useFileNames';

import { nfqwsConf, nfqwsLog } from '@/utils/nfqwsCodeMirrorLang';

const historyCompartment = new Compartment();

interface EditorProps {
  file: FileInfo;
  value: string;
  readonly?: boolean;
}

export const Editor = ({ file, value, readonly = false }: EditorProps) => {
  const { palette } = useTheme();

  const { setNeedSave, editorView, setEditorView, onSave } = useAppStore();

  const extensions = useMemo(() => {
    const result = [
      keymap.of([
        {
          key: 'Ctrl-s',
          mac: 'Cmd-s',
          run: () => {
            onSave();
            return true;
          },
        },
      ]),
      historyCompartment.of([]),
    ];

    if (file.type === 'conf') {
      result.push(nfqwsConf());
    } else if (file.type === 'log') {
      result.push(nfqwsLog());
    }

    return result;
  }, [file.name, file.type, onSave]);

  useEffect(() => {
    editorView?.dispatch({
      effects: historyCompartment.reconfigure([]),
    });
    editorView?.dispatch({
      effects: historyCompartment.reconfigure([history()]),
    });
  }, [value, editorView]);

  return (
    <Box
      flex={1}
      sx={{
        position: 'relative',
        '& .cm-theme': {
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
        },
        '& .cm-editor': {
          height: '100%',
          background: (theme) => theme.palette.background.default,
          outline: 'none',
        },
        '& .cm-gutters': {
          background: (theme) => theme.palette.background.paper,
        },
        '& .cm-scroller': { overflow: 'auto' },
        '& .cm-lineNumbers .cm-gutterElement': {
          paddingLeft: '13px !important',
        },
      }}
    >
      <ReactCodeMirror
        value={value}
        theme={palette.mode === 'light' ? vscodeLight : vscodeDark}
        autoFocus={true}
        readOnly={readonly}
        lang="shell"
        style={{ height: '100%', fontSize: 13 }}
        onCreateEditor={(view) => setEditorView(view)}
        onChange={(newValue) => setNeedSave(value !== newValue)}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          history: false, // enabled in extensions
          historyKeymap: true,
        }}
        extensions={extensions}
      />
    </Box>
  );
};
