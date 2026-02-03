import { useCallback, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import { API } from '@/api/client';

export const RemoveFileDialog = ({
  name,
  open,
  onClose,
}: {
  name: string;
  open: boolean;
  onClose: VoidFunction;
}) => {
  const [error, setError] = useState(false);
  const { currentFile } = useAppStore();
  const navigate = useNavigate();

  const handleSubmit = useCallback(async () => {
    const { data } = await API.removeFile(name);
    if (data?.status === 0) {
      handleClose();
      void API.invalidateListFiles();
      if (currentFile === name) {
        void navigate({ to: '/' });
      }
    } else {
      setError(true);
    }
  }, [name]);

  const handleClose = useCallback(() => {
    onClose();
    setError(false);
  }, []);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm">
      <DialogTitle>Delete file</DialogTitle>
      <DialogContent>
        <DialogContentText>Really delete this file?</DialogContentText>
        {error && (
          <Alert severity="error" sx={{ mb: 1 }}>
            Failed to delete file
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleClose}>
          No
        </Button>
        <Button autoFocus onClick={handleSubmit}>
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
};
