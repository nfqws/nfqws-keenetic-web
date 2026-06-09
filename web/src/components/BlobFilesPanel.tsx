import { useCallback, useState, type ChangeEvent } from 'react';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';

import { API } from '@/api/client';

import { useStatus } from '@/hooks/useStatus';
import { useTranslation } from '@/hooks/useTranslation';

export const BlobFilesPanel = () => {
  const { t } = useTranslation();
  const { nfqws2 } = useStatus();
  const { data, isPending, error } = API.listBlobFiles();
  const [actionError, setActionError] = useState(false);

  const hasLoadError = Boolean(error);
  const files = hasLoadError ? [] : data?.files ?? [];
  const blobsPath = nfqws2 ? '/opt/etc/nfqws2/blobs/' : '/opt/etc/nfqws/';

  const handleUpload = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file) {
        return;
      }

      setActionError(false);

      if (!file.name.toLowerCase().endsWith('.bin')) {
        setActionError(true);
        return;
      }

      const { data: response } = await API.uploadBlobFile(file);
      if (response?.status === 0) {
        await API.invalidateBlobFiles();
      } else {
        setActionError(true);
      }
    },
    [],
  );

  const handleRemove = useCallback(async (filename: string) => {
    setActionError(false);
    const { data: response } = await API.removeBlobFile(filename);
    if (response?.status === 0) {
      await API.invalidateBlobFiles();
    } else {
      setActionError(true);
    }
  }, []);

  const handleDownload = useCallback(async (filename: string) => {
    setActionError(false);

    try {
      const blob = await API.downloadBlobFile(filename);
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      setActionError(true);
    }
  }, []);

  return (
    <Box
      flex={1}
      sx={{
        position: 'relative',
        display: 'flex',
        overflowY: 'auto',
      }}
    >
      <Box
        sx={{
          px: 'max(15px, 1.6vh)',
          pt: 3,
          pb: 2,
          width: '100%',
          position: 'absolute',
        }}
      >
        <Box display="flex" flexDirection="column" gap={2}>
          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
            <Button
              component="label"
              variant="contained"
              size="small"
              startIcon={<UploadFileOutlinedIcon />}
            >
              {t('blobs.upload')}
              <input
                hidden
                type="file"
                accept=".bin"
                onChange={(event) => {
                  void handleUpload(event);
                }}
              />
            </Button>

            <Typography variant="body2" color="text.secondary">
              {t('blobs.path', { path: blobsPath })}
            </Typography>
          </Box>

          {(actionError || hasLoadError) && (
            <Alert severity="error" variant="outlined">
              {t('blobs.error')}
            </Alert>
          )}

          {isPending ? (
            <Box py={6} display="flex" justifyContent="center">
              <CircularProgress size={28} />
            </Box>
          ) : files.length ? (
            <List
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                py: 0,
              }}
            >
              {files.map((file, index) => (
                <ListItem
                  key={file}
                  divider={index < files.length - 1}
                  secondaryAction={
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <IconButton
                        edge="end"
                        color="primary"
                        onClick={() => {
                          void handleDownload(file);
                        }}
                        title={t('blobs.download')}
                      >
                        <DownloadOutlinedIcon />
                      </IconButton>

                      <IconButton
                        edge="end"
                        color="error"
                        onClick={() => {
                          void handleRemove(file);
                        }}
                        title={t('blobs.delete')}
                      >
                        <DeleteOutlineOutlinedIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemText primary={file} />
                </ListItem>
              ))}
            </List>
          ) : (
            <Alert severity="info" variant="outlined">
              {t('blobs.empty')}
            </Alert>
          )}
        </Box>
      </Box>
    </Box>
  );
};
