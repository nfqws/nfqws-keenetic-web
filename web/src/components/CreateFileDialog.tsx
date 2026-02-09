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
  existingNames,
}: {
  open: boolean;
  onClose: VoidFunction;
  existingNames: string[];
}) => {
  const [name, setName] = useState('');
  const [saveError, setSaveError] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const { t } = useTranslation();

  const trimmedName = name.trim();
  const filename = `${trimmedName}.list`;
  const exists = trimmedName.length > 0 && existingNames.includes(filename);

  const handleClose = useCallback(() => {
    onClose();
    setName('');
    setSaveError(false);
    setSubmitted(false);
  }, [onClose]);

  const handleSubmit = useCallback(async () => {
    setSubmitted(true);
    if (!trimmedName || exists) {
      return;
    }
    setSaveError(false);
    const { data } = await API.saveFile(filename, '');
    if (data?.status === 0) {
      handleClose();
      await API.invalidateListFiles();
      void navigate({ to: `/lists/${filename}` });
    } else {
      setSaveError(true);
    }
  }, [exists, filename, handleClose, navigate, trimmedName]);

  const showError = (submitted && exists) || saveError;
  const errorMessage = exists
    ? t('create_file.exists')
    : t('create_file.error');

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
          onChange={(e) => {
            setName(e.target.value);
            setSaveError(false);
            setSubmitted(false);
          }}
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

        {showError && (
          <Alert severity="error" variant="outlined" sx={{ mb: 1 }}>
            {errorMessage}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('common.cancel')}</Button>
        <Button onClick={handleSubmit} disabled={!trimmedName.length}>
          {t('common.create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
