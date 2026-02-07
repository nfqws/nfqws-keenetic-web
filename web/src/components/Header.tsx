import { useState } from 'react';
import { useConfig } from '@/config/useConfig';
import BrowserUpdatedIcon from '@mui/icons-material/BrowserUpdated';
import ChecklistIcon from '@mui/icons-material/Checklist';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import MenuIcon from '@mui/icons-material/Menu';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ReplayIcon from '@mui/icons-material/Replay';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SaveIcon from '@mui/icons-material/Save';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import {
  Box,
  Button,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import { useParams } from '@tanstack/react-router';

import { API } from '@/api/client';
import { type ServiceActionRequest } from '@/api/schema';

import { CurrentVersion } from '@/components/CurrentVersion';
import { OutputLogDialog } from '@/components/OutputLogDialog';
import { Trans } from '@/components/Trans';

import { useAppStore } from '@/store/useAppStore';

import { useStatus } from '@/hooks/useStatus';

export const Header = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const { service, nfqws2 } = useStatus();

  const config = useConfig(nfqws2);

  const {
    auth,
    needSave,
    onSave,
    setCheckDomainsList,
    needReload,
    setNeedReload,
  } = useAppStore();

  const [output, setOutput] = useState<boolean | string>(false);

  const { filename } = useParams({ strict: false }) as {
    filename?: string;
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuClick = async (command: ServiceActionRequest['cmd']) => {
    handleMenuClose();
    setOutput(true);
    const { data } = await API.action(command);
    setOutput(
      `> nfqws2-keenetic ${command}\n${data?.output?.join('\n') || ''}`,
    );
    void API.invalidateStatus();

    if (command === 'upgrade') {
      setNeedReload(true);
    }
  };

  return (
    <>
      <Box
        sx={{
          px: 'max(15px, 1.6vh)',
          py: 'max(15px, 1.6vh)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          whiteSpace: 'nowrap',
        }}
      >
        <Box
          display="flex"
          alignItems="baseline"
          justifyContent="space-between"
          flexWrap="wrap"
          rowGap={2}
          columnGap={1.7}
        >
          <Stack
            direction="row"
            spacing={1.3}
            alignItems="center"
            flexGrow={1000}
          >
            {' '}
            <Stack direction="row" spacing={1.3} alignItems="center">
              <Typography
                component="h2"
                fontFamily={'Vendor Logo, Roboto, sans-serif'}
                textTransform="uppercase"
                color="primary.main"
                fontSize="1.25em"
                lineHeight={1}
                sx={{
                  '@media (max-width: 475px)': {
                    fontSize: '0.85em',
                  },
                }}
              >
                Keenetic
              </Typography>
              <Typography
                component="h2"
                fontFamily={'Device Model, Roboto, sans-serif'}
                textTransform="uppercase"
                color="textPrimary"
                fontSize="1.131em"
                lineHeight={1}
                pt="3px"
                ml="-0.2em"
                sx={{
                  '@media (max-width: 475px)': {
                    fontSize: '0.8em',
                  },
                }}
              >
                {config.title}
              </Typography>

              {auth && service && (
                <CloudDoneIcon
                  sx={{
                    fontSize: '1.25em',
                    color: 'success.main',
                    alignSelf: 'center',
                    opacity: 0.9,
                    '@media (max-width: 475px)': {
                      fontSize: '1em',
                    },
                  }}
                />
              )}
              {auth && !service && (
                <CloudOffIcon
                  sx={{
                    fontSize: '1.25em',
                    color: 'error.main',
                    alignSelf: 'center',
                    opacity: 0.9,
                    '@media (max-width: 475px)': {
                      fontSize: '1em',
                    },
                  }}
                />
              )}
            </Stack>
            <CurrentVersion
              sx={{
                justifyContent: 'flex-end',
                flexGrow: 500,
              }}
            />
          </Stack>

          <Stack
            direction="row"
            spacing={2}
            flexGrow={1}
            justifyContent="flex-end"
          >
            <Button
              variant="outlined"
              size="small"
              startIcon={<ChecklistIcon />}
              color="success"
              onClick={() =>
                setCheckDomainsList(
                  filename?.endsWith('.list') ? filename : 'user.list',
                )
              }
            >
              <Trans i18nKey="check_domains.button" />
            </Button>

            <Button
              variant="contained"
              size="small"
              startIcon={<SaveIcon />}
              disabled={!needSave}
              color="error"
              onClick={onSave}
            >
              <Trans i18nKey="common.save" />
            </Button>

            <Stack
              direction="row"
              alignItems="center"
              flexGrow={1}
              justifyContent="flex-end"
            >
              <Button
                variant="text"
                size="small"
                onClick={handleMenuOpen}
                sx={{
                  color: 'text.secondary',
                  transition: 'color 0.1s ease-in-out',
                  minWidth: 0,
                  '&:hover': {
                    color: 'primary.main',
                  },
                }}
              >
                <MenuIcon />
              </Button>

              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{
                  paper: {
                    sx: {
                      bgcolor: 'background.default',
                      backgroundImage: 'none',
                      border: '1px solid',
                      borderColor: 'divider',
                    },
                  },
                }}
              >
                {service && (
                  <MenuItem
                    onClick={() => handleMenuClick('restart')}
                    sx={{ fontSize: 14 }}
                  >
                    <ListItemIcon>
                      <ReplayIcon />
                    </ListItemIcon>
                    <Trans i18nKey="common.restart" />
                  </MenuItem>
                )}

                {service && (
                  <MenuItem
                    onClick={() => handleMenuClick('reload')}
                    sx={{ fontSize: 14 }}
                  >
                    <ListItemIcon>
                      <RestartAltIcon />
                    </ListItemIcon>
                    <Trans i18nKey="common.reload" />
                  </MenuItem>
                )}

                {service ? (
                  <MenuItem
                    onClick={() => handleMenuClick('stop')}
                    sx={{ fontSize: 14 }}
                  >
                    <ListItemIcon>
                      <StopCircleIcon />
                    </ListItemIcon>
                    <Trans i18nKey="common.stop" />
                  </MenuItem>
                ) : (
                  <MenuItem
                    onClick={() => handleMenuClick('start')}
                    sx={{ fontSize: 14 }}
                  >
                    <ListItemIcon>
                      <PlayArrowIcon />
                    </ListItemIcon>
                    <Trans i18nKey="common.start" />
                  </MenuItem>
                )}

                <MenuItem
                  onClick={() => handleMenuClick('upgrade')}
                  sx={{ fontSize: 14 }}
                >
                  <ListItemIcon>
                    <BrowserUpdatedIcon />
                  </ListItemIcon>
                  <Trans i18nKey="common.update" />
                </MenuItem>
              </Menu>
            </Stack>
          </Stack>
        </Box>
      </Box>

      <OutputLogDialog
        content={output}
        open={Boolean(output)}
        onClose={() => {
          setOutput('');
          if (needReload) {
            window.location.reload();
          }
        }}
      />
    </>
  );
};
