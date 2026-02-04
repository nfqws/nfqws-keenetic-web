import { useCallback, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';

import { API } from '@/api/client';

import { Editor } from '@/components/Editor';

import { useAppStore } from '@/store/useAppStore';

import { CONF_FILE_NAME, useFileContent } from '@/hooks/useFileContent';
import { useFileNames } from '@/hooks/useFileNames';

export const Route = createFileRoute('/$filename')({
  component: RouteComponent,
});

function RouteComponent() {
  const { filename } = Route.useParams();
  const file = filename || CONF_FILE_NAME;
  const { content, isPending } = useFileContent(file);
  const {
    setCurrentFile,
    setNeedSave,
    setOnSave,
    needSave,
    currentFile,
    editorView,
  } = useAppStore();
  const { findFile, isPending: isPendingNames } = useFileNames();
  const fileInfo = findFile(file);

  const onSave = useCallback(async () => {
    if (!needSave) {
      return;
    }

    const text = editorView?.state.doc.toString();
    if (text === undefined) {
      return;
    }

    const { data } = await API.saveFile(currentFile, text);
    if (data?.status === 0) {
      void API.invalidateFileContent(currentFile);
      setNeedSave(false);
    } else {
      // TODO: error
    }
  }, [currentFile, editorView, needSave, setNeedSave]);

  useEffect(() => {
    setCurrentFile(file);
    setNeedSave(false);
  }, [file, setCurrentFile, setNeedSave]);

  useEffect(() => {
    setOnSave(onSave);
  }, [onSave, setOnSave]);

  return fileInfo ? (
    <Editor
      value={content ?? ''}
      file={fileInfo}
      readonly={isPending || isPendingNames || fileInfo?.type === 'log'}
    />
  ) : (
    <></>
  );
}
