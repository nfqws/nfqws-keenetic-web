import { API } from '@/api/client';
import type { FilenamesResponse } from '@/api/schema';

export const CONF_FILE_NAME = 'nfqws2.conf';

export function useFileContent(filename: FilenamesResponse['files'][0]) {
  const { isPending, data, error } = API.fileContent(filename);

  if (error) {
    throw error;
  }

  return {
    ...data,
    isPending,
  };
}
