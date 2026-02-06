import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  LinearProgress,
  Paper,
} from '@mui/material';

import { Trans } from '@/components/Trans';

export const OutputLogDialog = ({
  content,
  open,
  onClose,
}: {
  content: string | boolean;
  open: boolean;
  onClose: VoidFunction;
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth={true}
      scroll="paper"
      sx={{ maxHeight: '80svh' }}
    >
      <DialogContent>
        <DialogContentText component="div">
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              fontFamily: (theme) => theme.typography.mono.fontFamily,
              fontSize: 13,
              lineHeight: 1.5,
              backgroundColor: 'background.default',
              maxHeight: 300,
              overflow: 'auto',
            }}
          >
            <Box component="pre" sx={{ m: 0, whiteSpace: 'pre-wrap' }}>
              {typeof content === 'string' ? (
                content
              ) : (
                <LinearProgress color="inherit" />
              )}
            </Box>
          </Paper>
        </DialogContentText>
      </DialogContent>
      <DialogActions
        sx={{
          justifyContent: 'center',
        }}
      >
        <Button autoFocus onClick={onClose}>
          <Trans i18nKey="common.close" />
        </Button>
      </DialogActions>
    </Dialog>
  );
};
