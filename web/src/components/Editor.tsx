import { useEffect, useMemo, useState } from 'react';
import { history } from '@codemirror/commands';
import { Compartment } from '@codemirror/state';
import { keymap, type EditorView } from '@codemirror/view';
import { Box, useTheme } from '@mui/material';
import { type SxProps } from '@mui/system/styleFunctionSx';
import { vscodeDark, vscodeLight } from '@uiw/codemirror-theme-vscode';
import ReactCodeMirror from '@uiw/react-codemirror';

import type { FilenamesRequest } from '@/api/schema';

import { nfqwsConf, nfqwsLog } from '@/utils/nfqwsCodeMirrorLang';

const historyCompartment = new Compartment();

interface EditorProps {
  type: FilenamesRequest['type'];
  value: string;
  onChange?: (value: string, changed: boolean) => void;
  onSave?: () => void;
  readonly?: boolean;
  autoFocus?: boolean;
  maxHeight?: number | string;
  sx?: SxProps;
}

export const Editor = ({
  type,
  value,
  onChange,
  onSave,
  readonly = false,
  autoFocus = false,
  maxHeight = 'auto',
  sx,
}: EditorProps) => {
  const { palette } = useTheme();

  const [editorView, setEditorView] = useState<EditorView | null>(null);

  const extensions = useMemo(() => {
    const result = [historyCompartment.of([])];

    if (onSave) {
      result.push(
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
      );
    }
    if (type === 'conf') {
      result.push(nfqwsConf());
    } else if (type === 'log') {
      result.push(nfqwsLog());
    }

    return result;
  }, [type, onSave]);

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
        display: 'flex',
        position: 'relative',
        overflow: 'auto',
        '& .cm-theme': {
          display: 'flex',
          minWidth: '100%',
          fontSize: 13,
          maxHeight,
        },
        '& .cm-editor': {
          display: 'flex !important',
          minWidth: '100%',
          minHeight: '100%',
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
        ...sx,
      }}
    >
      <ReactCodeMirror
        value={value}
        theme={palette.mode === 'light' ? vscodeLight : vscodeDark}
        autoFocus={autoFocus}
        readOnly={readonly}
        editable={!readonly}
        lang="shell"
        onCreateEditor={(view) => setEditorView(view)}
        onChange={(newValue) => {
          onChange?.(newValue, value !== newValue);
        }}
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
