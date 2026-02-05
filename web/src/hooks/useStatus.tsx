import { useMemo } from 'react';
import { useConfig } from '@/config/useConfig';
import { useQuery } from '@tanstack/react-query';

import { API } from '@/api/client';

type Version = [number, number, number];

export function compareVersions(current: Version, latest: Version) {
  const v1 = latest[0] - current[0];
  const v2 = latest[1] - current[1];
  const v3 = latest[2] - current[2];
  if (v1) return v1 > 0;
  if (v2) return v2 > 0;
  if (v3) return v3 > 0;
  return false;
}

const parseVersion = (version: string | undefined | null): Version => {
  const match = version && version.match(/^v?([0-9]+)\.([0-9]+)\.([0-9]+)$/);
  return match
    ? [Number(match[1]), Number(match[2]), Number(match[3])]
    : [0, 0, 0];
};

export const useVersionCheck = (url: string, enabled = true) => {
  return useQuery({
    queryKey: ['version', url],
    enabled,
    queryFn: async () => {
      const res = await fetch(url);
      if (!res.ok) {
        return { tag_name: 'v0.0.0', html_url: '' };
      }
      return res.json();
    },
    select: (data: { tag_name?: string; html_url?: string }) => {
      return {
        url: data.html_url,
        version: parseVersion(data.tag_name),
      };
    },
  });
};

type UseStatusResult = {
  status: boolean;
  nfqws2: boolean;
  service: boolean;
  version?: Version;
  webVersion?: Version;
  latest?: Version;
  webLatest?: Version;
  url?: string;
  webUrl?: string;
  isPending: boolean;
};

export const useStatus = (): UseStatusResult => {
  const { data: status, isPending, isError } = API.status();

  const { updateUrl, webUpdateUrl } = useConfig(status?.nfqws2 ?? false);

  const { data: latest } = useVersionCheck(
    updateUrl,
    status?.status === 0 && !isPending && !isError,
  );

  const { data: latestWeb } = useVersionCheck(
    webUpdateUrl,
    status?.status === 0 && !isPending && !isError,
  );

  return useMemo(() => {
    if (!isError && !isPending && status?.status === 0) {
      const current = parseVersion(status.version);
      const currentWeb = parseVersion(process.env.APP_VERSION);

      return {
        status: true,
        nfqws2: status.nfqws2,
        service: status.service,
        version: current,
        webVersion: currentWeb,
        latest: latest?.version,
        webLatest: latestWeb?.version,
        url: latest?.url,
        webUrl: latestWeb?.url,
        isPending,
      };
    }

    return {
      status: isError || isPending,
      nfqws2: false,
      service: false,
      updateAvailable: false,
      isPending,
    };
  }, [isError, isPending, latest, latestWeb, status]);
};
