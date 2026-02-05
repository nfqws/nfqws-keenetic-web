import DarkModeIcon from '@mui/icons-material/DarkMode';
import GitHubIcon from '@mui/icons-material/GitHub';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { Box, Link, Stack, useColorScheme } from '@mui/material';

import { API } from '@/api/client';

import { FooterVersion } from '@/components/FooterVersion';

import { useAppStore } from '@/store/useAppStore';

export const Footer = () => {
  const { auth } = useAppStore();

  const { mode, setMode } = useColorScheme();

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

          <Link
            component="button"
            color="text.secondary"
            title="Change theme"
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
            onClick={() => {
              setMode(mode === 'light' ? 'dark' : 'light');
            }}
          >
            {mode === 'light' ? (
              <DarkModeIcon sx={{ fontSize: '1.2em', alignSelf: 'center' }} />
            ) : (
              <LightModeIcon sx={{ fontSize: '1.2em', alignSelf: 'center' }} />
            )}
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
              <LogoutOutlinedIcon
                sx={{ fontSize: '1.2em', alignSelf: 'center' }}
              />
            </Link>
          )}
        </Stack>

        <FooterVersion />
      </Box>
    </Box>
  );
};
