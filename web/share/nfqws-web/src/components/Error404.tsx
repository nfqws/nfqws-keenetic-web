import { Alert, Box } from '@mui/material';

import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { MainTabs } from '@/components/MainTabs';

export function Error404() {
  return (
    <>
      <Header />

      <MainTabs />

      <Box flex={1} sx={{ position: 'relative', p: 3 }}>
        <Alert severity="error">404: Page not found.</Alert>
      </Box>

      <Footer />
    </>
  );
}
