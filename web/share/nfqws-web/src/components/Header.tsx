import { useState } from 'react';
import BrowserUpdatedIcon from '@mui/icons-material/BrowserUpdated';
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
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';

import { API } from '@/api/client';
import { type ServiceActionRequest } from '@/api/schema';

import { OutputLogDialog } from '@/components/OutputLogDialog';

import { useAppStore } from '@/store/useAppStore';

import { useStatus } from '@/hooks/useStatus';

export const Header = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const { service } = useStatus();

  const { needSave, onSave } = useAppStore();

  const [output, setOutput] = useState<boolean | string>(false);

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
    setOutput(`> nfqws2-keenetic ${command}\n${data?.output || ''}`);
    void API.invalidateStatus();
  };

  return (
    <>
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          whiteSpace: 'nowrap',
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1.5} alignItems="baseline">
            <Typography
              component="h2"
              fontFamily={'Vendor Logo, Roboto, sans-serif'}
              textTransform="uppercase"
              color="primary.main"
              fontSize={20}
              lineHeight={1}
            >
              Keenetic
            </Typography>
            <Typography
              component="h2"
              fontFamily={'Device Model, Roboto, sans-serif'}
              textTransform="uppercase"
              color="textPrimary"
              fontSize={18}
              lineHeight={1}
            >
              NFQWS 2
            </Typography>

            {service ? (
              <CloudDoneIcon
                sx={{
                  fontSize: 20,
                  color: 'success.main',
                  alignSelf: 'center',
                  opacity: 0.9,
                }}
              />
            ) : (
              <CloudOffIcon
                sx={{
                  fontSize: 20,
                  color: 'error.main',
                  alignSelf: 'center',
                  opacity: 0.9,
                }}
              />
            )}
          </Stack>

          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              size="small"
              startIcon={<SaveIcon />}
              disabled={!needSave}
              color="error"
              onClick={onSave}
            >
              Save
            </Button>

            <Stack direction="row" alignItems="center">
              <IconButton
                size="small"
                onClick={handleMenuOpen}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': { bgcolor: 'primary.dark' },
                }}
              >
                <MenuIcon />
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                {service && (
                  <MenuItem
                    onClick={() => handleMenuClick('restart')}
                    sx={{ fontSize: 14 }}
                  >
                    <ListItemIcon>
                      <ReplayIcon />
                    </ListItemIcon>
                    Restart
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
                    Reload
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
                    Stop
                  </MenuItem>
                ) : (
                  <MenuItem
                    onClick={() => handleMenuClick('start')}
                    sx={{ fontSize: 14 }}
                  >
                    <ListItemIcon>
                      <PlayArrowIcon />
                    </ListItemIcon>
                    Start
                  </MenuItem>
                )}

                <MenuItem
                  onClick={() => handleMenuClick('upgrade')}
                  sx={{ fontSize: 14 }}
                >
                  <ListItemIcon>
                    <BrowserUpdatedIcon />
                  </ListItemIcon>
                  Update
                </MenuItem>
              </Menu>
            </Stack>
          </Stack>
        </Box>
      </Box>

      <OutputLogDialog
        content={output}
        open={Boolean(output)}
        onClose={() => setOutput('')}
      />
    </>
  );
};
