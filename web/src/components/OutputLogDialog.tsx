import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  LinearProgress,
  Paper,
} from '@mui/material';

import { Editor } from '@/components/Editor';
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth={true}>
      <DialogContent>
        <Paper
          variant="outlined"
          sx={{
            p: 0,
            maxHeight: '70svh',
            display: 'flex',
          }}
        >
          {typeof content === 'string' ? (
            <Editor type="log" value={content} readonly={true} />
          ) : (
            <Box flex={1} sx={{ p: 2, backgroundColor: 'background.default' }}>
              <LinearProgress color="inherit" />
            </Box>
          )}
        </Paper>
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
