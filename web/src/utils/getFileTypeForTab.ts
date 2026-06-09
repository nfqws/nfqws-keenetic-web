import type { FilenamesRequest } from '@/api/schema';

import type { MainTabsValues } from '@/types/types';

export const getFileTypeForTab = (
  tab?: MainTabsValues,
): FilenamesRequest['type'] => {
  switch (tab) {
    case 'lists':
      return 'list';
    case 'logs':
      return 'log';
    case 'scripts':
      return 'lua';
    case 'files':
      return undefined;
    default:
      return 'conf';
  }
};
