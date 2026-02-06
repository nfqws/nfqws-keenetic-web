import { Alert, Box } from '@mui/material';

import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { MainTabs } from '@/components/MainTabs';
import { Trans } from '@/components/Trans';

export function Error404() {
  return (
    <>
      <Header />

      <MainTabs />

      <Box flex={1} sx={{ position: 'relative', p: 3 }}>
        <Alert severity="error" variant="outlined">
          <Trans i18nKey="system.not_found" />
        </Alert>
      </Box>

      <Footer />
    </>
  );
}
