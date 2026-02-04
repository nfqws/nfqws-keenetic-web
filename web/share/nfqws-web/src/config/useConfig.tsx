import { useMemo } from 'react';

type AppConfig = {
  title: string;
  updateUrl: string;
};

const nfqws1Config: AppConfig = {
  title: 'NFQWS',
  updateUrl:
    'https://api.github.com/repos/Anonym-tsk/nfqws-keenetic/releases/latest',
} as const;

const nfqws2Config: AppConfig = {
  title: 'NFQWS 2',
  updateUrl:
    'https://api.github.com/repos/nfqws/nfqws2-keenetic/releases/latest',
} as const;

export const useConfig = (nfqws2 = false): AppConfig => {
  return useMemo(() => {
    return nfqws2 ? nfqws2Config : nfqws1Config;
  }, [nfqws2]);
};
