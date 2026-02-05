import type { MainTabsValues } from '@/components/MainTabs';

import type { FileInfo } from '@/hooks/useFileNames';

export const getFileTypeForTab = (tab?: MainTabsValues): FileInfo['type'] => {
  switch (tab) {
    case 'lists':
      return 'list';
    case 'logs':
      return 'log';
    default:
      return 'conf';
  }
};
