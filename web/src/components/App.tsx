import { type ReactNode } from 'react';
import { Backdrop, Box, CircularProgress, Typography } from '@mui/material';
import { useBlocker, type AnyRouter } from '@tanstack/react-router';

import { CheckDomainsDialog } from '@/components/CheckDomainsDialog';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { FilesTabs } from '@/components/FilesTabs';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { LoginDialog } from '@/components/LoginDialog';
import { MainTabs } from '@/components/MainTabs';

import { useAppStore } from '@/store/useAppStore';

import { useStatus } from '@/hooks/useStatus';
import { useTranslation } from '@/hooks/useTranslation';

export function App({ children }: { children?: ReactNode }) {
  const { auth, checkDomainsList, setCheckDomainsList, needSave } =
    useAppStore();

  const { t } = useTranslation();

  const { isPending, status } = useStatus();
  const nfqwsInstalled = isPending || status;

  const {
    proceed,
    reset,
    status: blockStatus,
  } = useBlocker<AnyRouter, true>({
    shouldBlockFn: () => needSave,
    enableBeforeUnload: () => needSave,
    withResolver: true,
  });

  return (
    <>
      <Header />

      <MainTabs />

      {nfqwsInstalled && auth && <FilesTabs />}

      <Box flex={1} sx={{ display: 'flex', position: 'relative' }}>
        {auth === undefined || isPending || !nfqwsInstalled ? (
          <Backdrop open={true}>
            {nfqwsInstalled ? (
              <CircularProgress color="inherit" />
            ) : (
              <Typography variant="subtitle1" color="text.primary">
                {t('system.not_installed')}
              </Typography>
            )}
          </Backdrop>
        ) : auth ? (
          children
        ) : (
          <LoginDialog />
        )}
      </Box>

      {checkDomainsList && (
        <CheckDomainsDialog
          open={true}
          onClose={() => setCheckDomainsList('')}
        />
      )}

      <ConfirmationDialog
        title={t('confirmation.file_not_saved.title')}
        description={t('confirmation.file_not_saved.description')}
        open={blockStatus === 'blocked'}
        onClose={() => reset?.()}
        onSubmit={() => proceed?.()}
      />

      <Footer />
    </>
  );
}
