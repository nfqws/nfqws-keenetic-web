import { useMemo } from 'react';

type AppConfig = {
  confFile: string;
  title: string;
  updateUrl: string;
  webUpdateUrl: string;
};

const nfqws1Config: AppConfig = {
  confFile: 'nfqws.conf',
  title: 'NFQWS',
  updateUrl:
    'https://api.github.com/repos/Anonym-tsk/nfqws-keenetic/releases/latest',
  webUpdateUrl:
    'https://api.github.com/repos/nfqws/nfqws-keenetic-web/releases/latest',
} as const;

const nfqws2Config: AppConfig = {
  confFile: 'nfqws2.conf',
  title: 'NFQWS 2',
  updateUrl:
    'https://api.github.com/repos/nfqws/nfqws2-keenetic/releases/latest',
  webUpdateUrl:
    'https://api.github.com/repos/nfqws/nfqws-keenetic-web/releases/latest',
} as const;

export const useConfig = (nfqws2: boolean): AppConfig => {
  return useMemo(() => {
    return nfqws2 ? nfqws2Config : nfqws1Config;
  }, [nfqws2]);
};
