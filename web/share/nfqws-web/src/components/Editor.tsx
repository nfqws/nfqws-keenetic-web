import { useEffect, useMemo, useRef } from 'react';
import { useNeedSave } from '@/store/useNeedSave';
import { history } from '@codemirror/commands';
import { Compartment } from '@codemirror/state';
import { keymap, type EditorView } from '@codemirror/view';
import { Box, useTheme } from '@mui/material';
import { vscodeDark, vscodeLight } from '@uiw/codemirror-theme-vscode';
import ReactCodeMirror from '@uiw/react-codemirror';

import { nfqwsConf, nfqwsLog } from '@/utils/nfqwsCodeMirrorLang';

const historyCompartment = new Compartment();

interface EditorProps {
  value: string;
  type: 'conf' | 'log' | 'list';
}

export const Editor = ({ value, type }: EditorProps) => {
  const { palette } = useTheme();

  const extensions = useMemo(() => {
    const result = [
      keymap.of([
        {
          key: 'Ctrl-s',
          mac: 'Cmd-s',
          run: () => {
            console.warn('Save');
            return true;
          },
        },
      ]),
      historyCompartment.of([]),
    ];

    if (type === 'conf') {
      result.push(nfqwsConf());
    } else if (type === 'log') {
      result.push(nfqwsLog());
    }

    return result;
  }, [type]);

  const view = useRef<EditorView>(null);

  useEffect(() => {
    view.current?.dispatch({
      effects: historyCompartment.reconfigure([]),
    });
    view.current?.dispatch({
      effects: historyCompartment.reconfigure([history()]),
    });
  }, [value, view.current]);

  const { setNeedSave } = useNeedSave();

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
        readOnly={type === 'log'}
        lang="shell"
        style={{ height: '100%', fontSize: 13 }}
        onCreateEditor={(editorView) => (view.current = editorView)}
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
