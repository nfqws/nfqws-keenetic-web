import { useCallback, useState, type FormEvent } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  TextField,
} from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import { API } from '@/api/client';

import { useTranslation } from '@/hooks/useTranslation';

export const CreateFileDialog = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: VoidFunction;
}) => {
  const [name, setName] = useState('');
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const { t } = useTranslation();

  const handleClose = useCallback(() => {
    onClose();
    setName('');
    setError(false);
  }, [onClose]);

  const handleSubmit = useCallback(async () => {
    const { data } = await API.saveFile(`${name}.list`, '');
    if (data?.status === 0) {
      handleClose();
      await API.invalidateListFiles();
      void navigate({ to: `/lists/${name}.list` });
    } else {
      setError(true);
    }
  }, [handleClose, name, navigate]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      slotProps={{
        paper: {
          component: 'form',
          autoComplete: 'off',
          // @ts-expect-error - MUI Dialog does not support types for the `onSubmit` prop directly
          onSubmit: (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            void handleSubmit();
          },
        },
      }}
    >
      <DialogTitle>{t('create_file.title')}</DialogTitle>
      <DialogContent sx={{ pt: 4, pb: 0 }}>
        <TextField
          autoFocus
          margin="dense"
          label={t('create_file.name_title')}
          fullWidth
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end" sx={{ mr: 0 }}>
                  .list
                </InputAdornment>
              ),
            },
          }}
          sx={{ mb: 2, mt: 1 }}
        />

        {error && (
          <Alert severity="error" variant="outlined" sx={{ mb: 1 }}>
            {t('create_file.error')}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('common.cancel')}</Button>
        <Button onClick={handleSubmit}>{t('common.create')}</Button>
      </DialogActions>
    </Dialog>
  );
};
