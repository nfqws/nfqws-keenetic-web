import type { ReactNode } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

import { Trans } from '@/components/Trans';

export const ConfirmationDialog = ({
  title,
  description,
  open,
  onClose,
  onSubmit,
}: {
  title: string | ReactNode;
  description: string | ReactNode;
  open: boolean;
  onClose: VoidFunction;
  onSubmit: VoidFunction;
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{description}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={onClose}>
          <Trans i18nKey="common.no" />
        </Button>
        <Button
          autoFocus
          onClick={() => {
            onSubmit();
            onClose();
          }}
        >
          <Trans i18nKey="common.yes" />
        </Button>
      </DialogActions>
    </Dialog>
  );
};
