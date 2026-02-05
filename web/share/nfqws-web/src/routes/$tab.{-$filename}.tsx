import { useCallback, useEffect, useRef, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';

import { API } from '@/api/client';

import { Editor } from '@/components/Editor';

import { useAppStore } from '@/store/useAppStore';

import { useFileContent } from '@/hooks/useFileContent';
import { useFileNames } from '@/hooks/useFileNames';

import { getFileTypeForTab } from '@/utils/getFileTypeForTab';

export const Route = createFileRoute('/$tab/{-$filename}')({
  component: RouteComponent,
});

function RouteComponent() {
  const { tab, filename } = Route.useParams();

  const {
    findFile,
    isPending: isPendingNames,
    files,
  } = useFileNames(getFileTypeForTab(tab));

  const currentFile =
    tab === 'settings' && !filename ? 'config' : filename || files[0]?.name;

  const { content: originalContent, isPending } = useFileContent(currentFile);
  const { setNeedSave, setOnSave, needSave } = useAppStore();

  const fileInfo = findFile(currentFile);

  const [content, setContent] = useState<string | undefined>();
  const contentRef = useRef<string | undefined>(undefined);

  const onSave = useCallback(async () => {
    if (!needSave) {
      return;
    }

    const text = contentRef.current;
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
  }, [currentFile, needSave, setNeedSave]);

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  useEffect(() => {
    setNeedSave(false);
  }, [currentFile, setNeedSave, tab]);

  useEffect(() => {
    setOnSave(onSave);
  }, [onSave, setOnSave]);

  return fileInfo ? (
    <Editor
      value={originalContent ?? ''}
      type={fileInfo.type}
      readonly={isPending || isPendingNames || fileInfo?.type === 'log'}
      onChange={(value, changed) => {
        setNeedSave(changed);
        setContent(value);
      }}
      onSave={onSave}
      sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
    />
  ) : (
    <></>
  );
}
