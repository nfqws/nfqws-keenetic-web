import { Box, Link, Stack, Tooltip } from '@mui/material';

import { compareVersions, useStatus } from '@/hooks/useStatus';

export const FooterVersion = () => {
  const { version, latest, url, webVersion, webLatest, webUrl, nfqws2 } =
    useStatus();

  const updateAvailable = version && latest && compareVersions(version, latest);

  const webUpdateAvailable =
    webVersion && webLatest && compareVersions(webVersion, webLatest);

  return (
    <Stack
      direction="row"
      spacing={0.7}
      alignItems="baseline"
      sx={{
        fontSize: 14,
        lineHeight: 1,
        cursor: 'default',
      }}
    >
      {version && (
        <Tooltip title={nfqws2 ? 'NFQWS2 version' : 'NFQWS version'}>
          <Stack
            direction="row"
            alignItems="center"
            color="text.secondary"
            sx={{ gap: 0.5, display: 'inline-flex' }}
          >
            <Box component="span">v{version.join('.')}</Box>
            {updateAvailable && (
              <Box component="span">
                (
                <Link
                  href={url}
                  target="_blank"
                  underline="none"
                  color="text.secondary"
                  sx={{
                    '&:hover': {
                      color: 'primary.main',
                    },
                  }}
                >
                  {latest.join('.')}
                </Link>
                )
              </Box>
            )}
          </Stack>
        </Tooltip>
      )}

      <Stack direction="row" alignItems="center" color="text.secondary">
        /
      </Stack>

      {webVersion && (
        <Tooltip title="Web version">
          <Stack
            direction="row"
            alignItems="center"
            color="text.secondary"
            sx={{ gap: 0.5, display: 'inline-flex' }}
          >
            <Box component="span">v{webVersion.join('.')}</Box>
            {webUpdateAvailable && (
              <Box component="span">
                (
                <Link
                  href={webUrl}
                  target="_blank"
                  underline="none"
                  color="text.secondary"
                  sx={{
                    '&:hover': {
                      color: 'primary.main',
                    },
                  }}
                >
                  {webLatest.join('.')}
                </Link>
                )
              </Box>
            )}
          </Stack>
        </Tooltip>
      )}
    </Stack>
  );
};
