import { API } from '@/api/client';

export const PROTECTED_FILES = [
  'nfqws2.conf',
  'nfqws.conf',
  'user.list',
  'exclude.list',
  'auto.list',
  'ipset.list',
  'ipset_exclude.list',
  'nfqws.log',
];

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
      const isRemovable =
        !PROTECTED_FILES.includes(filename) && !filename.endsWith('.log');

      return {
        name: filename,
        editable: isConf || isList || isOpkg,
        removable: isRemovable,
        type: isConf ? 'conf' : isList ? 'list' : 'log',
      };
    }) || [];

  return {
    files,
    findFile: (name: string) => files.find((file) => file.name === name),
    isPending,
  };
}
