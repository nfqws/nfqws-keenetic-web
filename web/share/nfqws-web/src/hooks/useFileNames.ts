import { API } from '@/api/client';

export type FileInfo = {
  name: string;
  editable: boolean;
  removable: boolean;
  type: 'conf' | 'list' | 'log';
};

export function useFileNames() {
  const { isPending, data, error } = API.listFiles();

  if (error) {
    throw error;
  }

  const files: FileInfo[] =
    data?.files.map((filename) => {
      const isConf =
        filename.endsWith('.conf') ||
        filename.endsWith('.conf-opkg') ||
        filename.endsWith('.conf-old') ||
        filename.endsWith('.apk-new');
      const isList =
        filename.endsWith('.list') ||
        filename.endsWith('.list-opkg') ||
        filename.endsWith('.list-old');
      const isOpkg = filename.endsWith('-opkg') || filename.endsWith('-old');

      return {
        name: filename,
        editable: isConf || isList || isOpkg,
        removable: isOpkg,
        type: isConf ? 'conf' : isList ? 'list' : 'log',
      };
    }) || [];

  return {
    files,
    findFile: (name: string) => files.find((file) => file.name === name),
    isPending,
  };
}
