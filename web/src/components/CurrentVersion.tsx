import { Chip, Stack, Tooltip } from '@mui/material';
import type { SxProps } from '@mui/system/styleFunctionSx';

import { compareVersions, useStatus } from '@/hooks/useStatus';
import { useTranslation } from '@/hooks/useTranslation';

export const CurrentVersion = ({ sx }: { sx?: SxProps }) => {
  const { version, latest, url, webVersion, webLatest, webUrl, nfqws2 } =
    useStatus();

  const { t } = useTranslation();

  const updateAvailable = version && latest && compareVersions(version, latest);

  const webUpdateAvailable =
    webVersion && webLatest && compareVersions(webVersion, webLatest);

  const appName = nfqws2 ? 'nfqws2' : 'nfqws';

  return (
    <Stack
      direction="row"
      spacing={0.7}
      sx={{
        fontSize: 14,
        lineHeight: 1,
        cursor: 'default',
        ...sx,
      }}
    >
      {version && (
        <Tooltip
          title={
            updateAvailable
              ? t('update.update_available', {
                  app: appName,
                  version: latest.join('.'),
                })
              : t('update.version_title', { app: appName })
          }
          enterTouchDelay={0}
        >
          <Chip
            label={version.join('.')}
            size="small"
            variant="outlined"
            color={updateAvailable ? 'warning' : 'primary'}
            sx={{
              cursor: url ? 'pointer' : 'help',
              mr: 1,
            }}
            onClick={() => {
              if (url) {
                window.open(url, '_blank');
              }
            }}
          ></Chip>
        </Tooltip>
      )}

      {webVersion && (
        <Tooltip
          title={
            webUpdateAvailable
              ? t('update.update_available', {
                  app: 'web',
                  version: webVersion.join('.'),
                })
              : t('update.version_title', { app: 'web' })
          }
          enterTouchDelay={0}
        >
          <Chip
            label={webVersion.join('.')}
            size="small"
            variant="outlined"
            color={webUpdateAvailable ? 'warning' : 'primary'}
            sx={{
              cursor: webUrl ? 'pointer' : 'help',
              mr: 1,
            }}
            onClick={() => {
              if (url) {
                window.open(webUrl, '_blank');
              }
            }}
          ></Chip>
        </Tooltip>
      )}
    </Stack>
  );
};
