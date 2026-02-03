import { useAuth } from '@/store/useAuth';
import { Backdrop, CircularProgress } from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';

import { Editor } from '@/components/Editor';
import { FilesTabs } from '@/components/FilesTabs';

import { CONF_FILE_NAME, useFileContent } from '@/hooks/useFileContent';

export const Route = createFileRoute('/{-$filename}')({
  component: RouteComponent,
});

function RouteComponent() {
  const { filename } = Route.useParams();
  const file = filename || CONF_FILE_NAME;
  const { content, isPending } = useFileContent(file);
  const { auth } = useAuth();

  return isPending ? (
    <Backdrop open={true}>
      <CircularProgress color="inherit" />
    </Backdrop>
  ) : (
    <>
      {auth && <FilesTabs />}

      <Editor
        value={content ?? ''}
        type={
          file.endsWith('.conf')
            ? 'conf'
            : file.endsWith('.log')
              ? 'log'
              : 'list'
        }
      />
    </>
  );
}
