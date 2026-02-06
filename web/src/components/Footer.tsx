import DarkModeIcon from '@mui/icons-material/DarkMode';
import GitHubIcon from '@mui/icons-material/GitHub';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { Box, Link, Stack, useColorScheme } from '@mui/material';

import { API } from '@/api/client';

import { useAppStore } from '@/store/useAppStore';

import { useTranslation } from '@/hooks/useTranslation';

export const Footer = () => {
  const { auth } = useAppStore();
  const { t } = useTranslation();

  const { mode, setMode } = useColorScheme();

  return (
    <Box
      sx={{
        px: 'max(15px, 1.6vh)',
        py: 1.5,
        borderTop: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        gap={2}
        alignItems="center"
      >
        <Stack
          direction="row"
          spacing={2}
          alignSelf="center"
          fontSize={14}
          sx={{
            '& > *': {
              display: 'inline-flex',
              gap: 0.85,
              alignItems: 'center',
            },
          }}
        >
          <Link
            href="https://github.com/Anonym-tsk/nfqws-keenetic"
            target="_blank"
            underline="none"
            color="text.secondary"
            sx={{
              display: 'inline-flex',
              gap: 0.85,
              fontSize: 14,
              '&:hover': {
                color: 'primary.main',
              },
            }}
          >
            <GitHubIcon sx={{ fontSize: '1.2em' }} />
            nfqws
          </Link>

          <Link
            href="https://github.com/nfqws/nfqws2-keenetic"
            target="_blank"
            underline="none"
            color="text.secondary"
            sx={{
              display: 'inline-flex',
              gap: 0.85,
              fontSize: 14,
              '&:hover': {
                color: 'primary.main',
              },
            }}
          >
            <GitHubIcon sx={{ fontSize: '1.2em' }} />
            nfqws2
          </Link>

          <Link
            href="https://github.com/nfqws/nfqws-keenetic-web"
            target="_blank"
            underline="none"
            color="text.secondary"
            sx={{
              display: 'inline-flex',
              gap: 0.85,
              fontSize: 14,
              '&:hover': {
                color: 'primary.main',
              },
            }}
          >
            <GitHubIcon sx={{ fontSize: '1.2em' }} />
            web
          </Link>

          <Link
            component="button"
            color="text.secondary"
            title={t('system.change_theme')}
            sx={{
              display: 'inline-flex',
              gap: 0.85,
              fontSize: 15,
              '&:hover': {
                color: 'primary.main',
              },
            }}
            onClick={() => {
              setMode(mode === 'light' ? 'dark' : 'light');
            }}
          >
            {mode === 'light' ? (
              <DarkModeIcon sx={{ fontSize: '1.2em' }} />
            ) : (
              <LightModeIcon sx={{ fontSize: '1.2em' }} />
            )}
          </Link>

          {auth && (
            <Link
              component="button"
              color="text.secondary"
              title={t('auth.logout')}
              sx={{
                display: 'inline-flex',
                gap: 0.85,
                fontSize: 15,
                '&:hover': {
                  color: 'primary.main',
                },
              }}
              onClick={async () => {
                await API.logout();
                void API.invalidateStatus();
              }}
            >
              <LogoutOutlinedIcon sx={{ fontSize: '1.2em' }} />
            </Link>
          )}
        </Stack>
      </Box>
    </Box>
  );
};
