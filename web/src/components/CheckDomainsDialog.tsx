import { useCallback, useEffect, useRef, useState } from 'react';
import BlockIcon from '@mui/icons-material/Block';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  Link,
  Paper,
  Typography,
  type DialogProps,
} from '@mui/material';

import { API } from '@/api/client';

import { useAppStore } from '@/store/useAppStore';

import { useTranslation } from '@/hooks/useTranslation';

import { checkDomains, parseListFile } from '@/utils/checkDomain';

export const CheckDomainsDialog = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: VoidFunction;
}) => {
  const { checkDomainsList } = useAppStore();
  const { t } = useTranslation();
  const { data: list } = API.fileContent(checkDomainsList);

  const [domains, setDomains] = useState<string[]>([]);
  const [result, setResult] = useState<Record<string, boolean | null>>({});
  const [available, setAvailable] = useState(0);
  const [blocked, setBlocked] = useState(0);
  const [checking, setChecking] = useState(false);

  const checkDomainsRef = useRef<VoidFunction | null>(null);

  const progress = domains.length
    ? Math.round(((available + blocked) / domains.length) * 100)
    : 0;

  const startCheck = useCallback(() => {
    setAvailable(0);
    setBlocked(0);
    setChecking(true);

    checkDomainsRef.current = checkDomains(domains, ({ url, result, done }) => {
      if (result) {
        setAvailable((v) => v + 1);
      } else {
        setBlocked((v) => v + 1);
      }

      setResult((prev) => ({ ...prev, [url]: result }));

      if (done) {
        setChecking(false);
      }
    });
  }, [domains]);

  const stopCheck = useCallback(() => {
    checkDomainsRef.current?.();
    setChecking(false);
  }, []);

  const closeDialog = useCallback(() => {
    stopCheck();
    onClose();
  }, [onClose, stopCheck]);

  const handleClose: DialogProps['onClose'] = useCallback(
    (_: unknown, reason: string) => {
      if (reason === 'backdropClick') {
        return;
      }
      closeDialog();
    },
    [closeDialog],
  );

  useEffect(() => {
    if (list?.content) {
      const parsed = parseListFile(list.content);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDomains(parsed);
      setResult(Object.fromEntries(parsed.map((domain) => [domain, null])));
    }
  }, [list?.content, setDomains]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      scroll="paper"
      disableEscapeKeyDown
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {t('check_domains.title')}
        <IconButton onClick={closeDialog} sx={{ ml: 'auto' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '70svh',
        }}
      >
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: 'background.default',
            backgroundImage: 'none',
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              rowGap: 0.75,
              columnGap: 2,
              fontFamily: (theme) => theme.typography.mono.fontFamily,
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            <Typography
              component="div"
              sx={{ color: 'text.secondary', fontSize: 13 }}
            >
              {t('check_domains.list')}
            </Typography>
            <Typography
              component="div"
              sx={{ fontWeight: 700, fontSize: 13 }}
              textAlign="right"
            >
              {checkDomainsList}
            </Typography>

            <Typography
              component="div"
              sx={{ color: 'text.secondary', fontSize: 13 }}
            >
              {t('check_domains.total')}
            </Typography>
            <Typography
              component="div"
              sx={{ fontWeight: 700, fontSize: 13 }}
              textAlign="right"
            >
              {domains.length}
            </Typography>

            <Typography
              component="div"
              sx={{ color: 'text.secondary', fontSize: 13 }}
            >
              {t('check_domains.available')}
            </Typography>
            <Typography
              component="div"
              sx={{ fontWeight: 700, fontSize: 13, color: 'success.main' }}
              textAlign="right"
            >
              {available}
            </Typography>

            <Typography
              component="div"
              sx={{ color: 'text.secondary', fontSize: 13 }}
            >
              {t('check_domains.blocked')}
            </Typography>
            <Typography
              component="div"
              sx={{ fontWeight: 700, fontSize: 13, color: 'error.main' }}
              textAlign="right"
            >
              {blocked}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.8 }}>
            <Box sx={{ width: '100%', mr: 1 }}>
              <LinearProgress
                variant="determinate"
                value={progress}
                color="inherit"
              />
            </Box>
            <Box sx={{ minWidth: 35 }}>
              <Typography
                variant="body2"
                sx={{ color: 'text.primary', fontWeight: 700, fontSize: 13 }}
                textAlign="right"
              >
                {progress}%
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Alert severity="warning" variant="outlined" sx={{ mt: 1 }}>
          {t('check_domains.information', {
            cors: (
              <Link href="https://developer.mozilla.org/ru/docs/Web/HTTP/Guides/CORS">
                CORS
              </Link>
            ),
          })}
        </Alert>

        <Box
          sx={{
            mt: 1,
            overflow: 'auto',
          }}
        >
          {Object.entries(result).map(([domain, success]) => (
            <Paper
              key={domain}
              variant="outlined"
              sx={(theme) => ({
                mb: 1,
                borderRadius: 2,
                backgroundColor:
                  success === true
                    ? `color-mix(in srgb, ${theme.palette.success.main} 5%, ${theme.palette.background.default})`
                    : success === false
                      ? `color-mix(in srgb, ${theme.palette.error.main} 5%, ${theme.palette.background.default})`
                      : `color-mix(in srgb, ${theme.palette.background.default} 5%, ${theme.palette.background.default})`,
                borderColor:
                  success === true
                    ? `color-mix(in srgb, ${theme.palette.success.main} 50%, ${theme.palette.background.default})`
                    : success === false
                      ? `color-mix(in srgb, ${theme.palette.error.main} 50%, ${theme.palette.background.default})`
                      : theme.palette.divider,
              })}
            >
              <Box
                sx={{
                  px: 1.5,
                  py: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                }}
              >
                <Link
                  href={`https://${domain}/`}
                  target="_blank"
                  underline="none"
                  color="text.primary"
                  sx={{
                    fontFamily: (theme) => theme.typography.mono.fontFamily,
                    fontSize: 13,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    '&:hover': {
                      color: 'primary.main',
                    },
                  }}
                >
                  {domain}
                </Link>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  {success === true && (
                    <CheckIcon fontSize="small" color="success" />
                  )}
                  {success === false && (
                    <BlockIcon fontSize="small" color="error" />
                  )}
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, pb: 2 }}>
        {!checking ? (
          <Button
            onClick={startCheck}
            variant="contained"
            fullWidth
            disabled={!domains.length}
          >
            {t('common.start')}
          </Button>
        ) : (
          <Button
            onClick={stopCheck}
            color="error"
            variant="contained"
            fullWidth
            disabled={!domains.length}
          >
            {t('common.stop')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
