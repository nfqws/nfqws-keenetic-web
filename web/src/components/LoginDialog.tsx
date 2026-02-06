import { useState, type FormEvent } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  TextField,
} from '@mui/material';

import { API } from '@/api/client';

import { useTranslation } from '@/hooks/useTranslation';

export const LoginDialog = () => {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  const { t } = useTranslation();

  const handleLogin = async () => {
    if (!user || !password) {
      return;
    }

    setLoginError(false);
    const { data } = await API.login(user, password);
    const success = data?.status === 0;
    setLoginError(!success);
    void API.invalidateStatus();
  };

  return (
    <>
      <Dialog
        open={true}
        maxWidth="xs"
        disableEscapeKeyDown
        slotProps={{
          paper: {
            component: 'form',
            autoComplete: 'off',
            // @ts-expect-error - MUI Dialog does not support types for the `onSubmit` prop directly
            onSubmit: (event: FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              void handleLogin();
            },
          },
        }}
      >
        <DialogContent sx={{ pt: 4, pb: 0 }}>
          <TextField
            autoFocus
            autoComplete="off"
            margin="dense"
            label={t('auth.username')}
            fullWidth
            variant="outlined"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            sx={{ mb: 2, mt: 0 }}
          />

          <TextField
            autoComplete="off"
            type="password"
            margin="dense"
            label={t('auth.password')}
            fullWidth
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2, mt: 0 }}
          />

          {loginError && (
            <Alert severity="error" variant="outlined" sx={{ mb: 1 }}>
              {t('auth.error')}
            </Alert>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: 'center',
            pb: 3,
          }}
        >
          <Button type="submit" variant="contained" sx={{ px: 7 }}>
            {t('auth.login')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
