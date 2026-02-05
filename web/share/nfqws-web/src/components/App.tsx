import type { ReactNode } from 'react';
import { Backdrop, Box, CircularProgress } from '@mui/material';

import { CheckDomainsDialog } from '@/components/CheckDomainsDialog';
import { FilesTabs } from '@/components/FilesTabs';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { LoginDialog } from '@/components/LoginDialog';
import { MainTabs } from '@/components/MainTabs';

import { useAppStore } from '@/store/useAppStore';

import { useStatus } from '@/hooks/useStatus';

export function App({ children }: { children?: ReactNode }) {
  const { auth, checkDomainsList, setCheckDomainsList } = useAppStore();

  // prefetch
  const { isPending } = useStatus();

  return (
    <>
      <Header />

      <MainTabs />

      <FilesTabs />

      <Box flex={1} sx={{ display: 'flex', position: 'relative' }}>
        {auth === undefined || isPending ? (
          <Backdrop open={true}>
            <CircularProgress color="inherit" />
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

      <Footer />
    </>
  );
}
