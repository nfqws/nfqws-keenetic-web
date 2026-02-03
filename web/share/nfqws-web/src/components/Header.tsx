import { useState } from 'react';
import { useNeedSave } from '@/store/useNeedSave';
import BrowserUpdatedIcon from '@mui/icons-material/BrowserUpdated';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import MenuIcon from '@mui/icons-material/Menu';
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

import { useStatus } from '@/hooks/useStatus';

export const Header = ({ onSave }: { onSave: VoidFunction }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const { data } = useStatus();

  const { needSave } = useNeedSave();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
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

          {data?.service ? (
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
              <MenuItem onClick={handleMenuClose} sx={{ fontSize: 14 }}>
                <ListItemIcon>
                  <ReplayIcon />
                </ListItemIcon>
                Restart
              </MenuItem>
              <MenuItem onClick={handleMenuClose} sx={{ fontSize: 14 }}>
                <ListItemIcon>
                  <RestartAltIcon />
                </ListItemIcon>
                Reload
              </MenuItem>
              <MenuItem onClick={handleMenuClose} sx={{ fontSize: 14 }}>
                <ListItemIcon>
                  <StopCircleIcon />
                </ListItemIcon>
                Stop
              </MenuItem>
              <MenuItem onClick={handleMenuClose} sx={{ fontSize: 14 }}>
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
  );
};
