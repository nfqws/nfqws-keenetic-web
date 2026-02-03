import { useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';

import { Editor } from '@/components/Editor';

import { useAppContext } from '@/hooks/useAppContext';
import { CONF_FILE_NAME, useFileContent } from '@/hooks/useFileContent';
import { useFileNames } from '@/hooks/useFileNames';

export const Route = createFileRoute('/{-$filename}')({
  component: RouteComponent,
});

function RouteComponent() {
  const { filename } = Route.useParams();
  const file = filename || CONF_FILE_NAME;
  const { content, isPending } = useFileContent(file);
  const { setCurrentFile, setNeedSave } = useAppContext();
  const { findFile, isPending: isPendingNames } = useFileNames();
  const fileInfo = findFile(file);

  useEffect(() => {
    setCurrentFile(file);
    setNeedSave(false);
  }, [file, setCurrentFile]);

  return (
    fileInfo && (
      <Editor
        value={content ?? ''}
        file={fileInfo}
        readonly={isPending || isPendingNames || fileInfo?.type === 'log'}
      />
    )
  );
}
