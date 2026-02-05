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
    default:
      return 'conf';
  }
};
