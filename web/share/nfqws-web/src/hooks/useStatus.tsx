import { useMemo } from 'react';
import { useConfig } from '@/config/useConfig';
import { useQuery } from '@tanstack/react-query';

import { API } from '@/api/client';

type Version = [number, number, number];

function compareVersions(current: Version, latest: Version) {
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

export const useVersionCheck = (nfqws2 = false, enabled = true) => {
  const config = useConfig(nfqws2);

  return useQuery({
    queryKey: ['version', nfqws2],
    enabled,
    queryFn: async () => {
      const res = await fetch(config.updateUrl);
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
  version?: string;
  latest?: string;
  url?: string;
  updateAvailable: boolean;
  isPending: boolean;
};

export const useStatus = (): UseStatusResult => {
  const { data: status, isPending, isError } = API.status();
  const { data: latest } = useVersionCheck(
    status?.nfqws2 ?? false,
    status?.status === 0 && !isPending && !isError,
  );

  return useMemo(() => {
    if (!isError && !isPending && status?.status === 0) {
      const current = parseVersion(status.version);

      let updateAvailable = false;
      if (latest) {
        updateAvailable = compareVersions(current, latest.version);
      }

      return {
        status: true,
        nfqws2: status.nfqws2,
        service: status.service,
        version: current.join('.'),
        latest: latest?.version.join('.'),
        url: latest?.url,
        updateAvailable,
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
  }, [latest, status, isPending, isError]);
};
