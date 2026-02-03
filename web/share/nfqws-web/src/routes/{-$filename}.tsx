import { createFileRoute } from '@tanstack/react-router';

import { Editor } from '@/components/Editor';

import { CONF_FILE_NAME, useFileContent } from '@/hooks/useFileContent';

export const Route = createFileRoute('/{-$filename}')({
  component: RouteComponent,
});

function RouteComponent() {
  const { filename } = Route.useParams();
  const file = filename || CONF_FILE_NAME;
  const { content } = useFileContent(file);

  return (
    <Editor
      value={content ?? ''}
      type={
        file.endsWith('.conf') ? 'conf' : file.endsWith('.log') ? 'log' : 'list'
      }
    />
  );
}
