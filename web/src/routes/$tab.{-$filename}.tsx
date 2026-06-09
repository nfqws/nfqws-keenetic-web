import { useCallback, useEffect, useRef, useState } from 'react';
import { createFileRoute, notFound } from '@tanstack/react-router';

import { API } from '@/api/client';

import { mainTabsValues, type MainTabsValues } from '@/types/types';

import { App } from '@/components/App';
import { BlobFilesPanel } from '@/components/BlobFilesPanel';
import { Editor } from '@/components/Editor';
import { Error404 } from '@/components/Error404';

import { useAppStore } from '@/store/useAppStore';

import { useFileNames } from '@/hooks/useFileNames';

import { getFileTypeForTab } from '@/utils/getFileTypeForTab';

export const Route = createFileRoute('/$tab/{-$filename}')({
  component: RouteComponent,
  notFoundComponent: Error404,
  params: {
    parse: (params) => {
      if (!mainTabsValues.includes(params.tab as MainTabsValues)) {
        throw notFound();
      }
      return params;
    },
  },
});

function RouteComponent() {
  const { tab, filename } = Route.useParams();

  if (tab === 'files') {
    return (
      <App>
        <BlobFilesPanel />
      </App>
    );
  }

  return <EditorTabContent tab={tab} filename={filename} />;
}

function EditorTabContent({
  tab,
  filename,
}: {
  tab: Exclude<MainTabsValues, 'files'>;
  filename?: string;
}) {
  const {
    findFile,
    isPending: isPendingNames,
    files,
  } = useFileNames(getFileTypeForTab(tab));

  const currentFile = !filename
    ? files[0]?.name
    : findFile(filename)
      ? filename
      : false;

  const { setNeedSave, setOnSave, needSave, auth } = useAppStore();

  const selectedFile = currentFile || '';

  const { data: originalContent, isPending } = API.fileContent(
    selectedFile,
    auth && Boolean(currentFile),
  );

  const fileInfo = currentFile ? findFile(currentFile) : undefined;

  const [content, setContent] = useState<string | undefined>();
  const contentRef = useRef<string | undefined>(undefined);

  const onSave = useCallback(async () => {
    if (!needSave || !currentFile) {
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

  return (
    <App>
      {fileInfo && (
        <Editor
          value={originalContent?.content ?? ''}
          type={fileInfo.type}
          readonly={
            isPending ||
            isPendingNames ||
            fileInfo?.type === 'log' ||
            fileInfo?.type === 'lua'
          }
          onChange={(value, changed) => {
            setNeedSave(changed);
            setContent(value);
          }}
          onSave={onSave}
          sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />
      )}
    </App>
  );
}
