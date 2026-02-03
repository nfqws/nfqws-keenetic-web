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

export const LoginDialog = () => {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  const handleLogin = async () => {
    if (!user || !password) {
      return;
    }

    setLoginError(false);
    const { data } = await API.login(user, password);
    const success = data?.status === 0;
    setLoginError(!success);
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
            label="Username"
            fullWidth
            variant="outlined"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            sx={{ mb: 2, mt: 0 }}
          />

          <TextField
            autoFocus
            autoComplete="off"
            type="password"
            margin="dense"
            label="Password"
            fullWidth
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2, mt: 0 }}
          />

          {loginError && (
            <Alert severity="error" sx={{ mb: 1 }}>
              Incorrect username or password
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
            Login
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
