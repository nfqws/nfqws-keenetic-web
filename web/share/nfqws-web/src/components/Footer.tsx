import { LogoutOutlined } from '@mui/icons-material';
import GitHubIcon from '@mui/icons-material/GitHub';
import { Box, Link, Stack, Typography } from '@mui/material';

import { API } from '@/api/client';

import { useAppStore } from '@/store/useAppStore';

import { useStatus } from '@/hooks/useStatus';

export const Footer = () => {
  const { version, latest, updateAvailable, url } = useStatus();

  const { auth } = useAppStore();

  return (
    <Box
      sx={{
        px: 3,
        py: 2,
        borderTop: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Stack direction="row" spacing={2} alignItems="baseline">
          <Link
            href="https://github.com/Anonym-tsk/nfqws-keenetic"
            target="_blank"
            underline="none"
            color="text.secondary"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.85,
              fontSize: 15,
              lineHeight: 1,
              '&:hover': {
                color: 'primary.main',
              },
            }}
          >
            <GitHubIcon sx={{ fontSize: '1.2em', alignSelf: 'center' }} />
            nfqws
          </Link>

          <Link
            href="https://github.com/nfqws/nfqws2-keenetic"
            target="_blank"
            underline="none"
            color="text.secondary"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.85,
              fontSize: 15,
              lineHeight: 1,
              '&:hover': {
                color: 'primary.main',
              },
            }}
          >
            <GitHubIcon sx={{ fontSize: '1.2em', alignSelf: 'center' }} />
            nfqws2
          </Link>

          <Link
            href="https://github.com/nfqws/nfqws-keenetic-web"
            target="_blank"
            underline="none"
            color="text.secondary"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.85,
              fontSize: 15,
              lineHeight: 1,
              '&:hover': {
                color: 'primary.main',
              },
            }}
          >
            <GitHubIcon sx={{ fontSize: '1.2em', alignSelf: 'center' }} />
            web
          </Link>

          {auth && (
            <Link
              component="button"
              color="text.secondary"
              title="Logout"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.85,
                fontSize: 15,
                lineHeight: 1,
                '&:hover': {
                  color: 'primary.main',
                },
              }}
              onClick={async () => {
                await API.logout();
                void API.invalidateStatus();
              }}
            >
              <LogoutOutlined sx={{ fontSize: '1.2em', alignSelf: 'center' }} />
            </Link>
          )}
        </Stack>

        {auth && version && (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ ml: 1, fontSize: 15 }}
            >
              {version}
              {updateAvailable && latest && (
                <>
                  {' '}
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
                    {latest}
                  </Link>
                  )
                </>
              )}
            </Typography>
          </Stack>
        )}
      </Box>
    </Box>
  );
};
