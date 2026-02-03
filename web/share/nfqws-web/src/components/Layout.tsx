import { type ReactNode } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Box, Container, CssBaseline, ThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';

import { FilesTabs } from '@/components/FilesTabs';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { LoginDialog } from '@/components/LoginDialog';

const theme = createTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: { main: '#0097dc' },
        secondary: { main: '#5cc8ff' },

        background: {
          default: '#f4f7fb',
          paper: '#ffffff',
        },

        text: {
          primary: '#0f172a',
          secondary: '#6e6e6e',
        },

        divider: 'rgba(15,23,42,0.08)',

        success: { main: '#16a34a' },
        error: { main: '#dc2626' },
        warning: { main: '#d97706' },
        info: { main: '#0284c7' },
      },
    },
    dark: {
      palette: {
        primary: { main: '#0097dc' },
        secondary: { main: '#5cc8ff' },

        background: {
          default: '#161c27',
          paper: '#1b2434',
        },

        text: {
          primary: '#e6edf3',
          secondary: '#949b9f',
        },

        divider: 'rgba(255,255,255,0.08)',

        success: { main: '#22c55e' },
        error: { main: '#ef4444' },
        warning: { main: '#f59e0b' },
        info: { main: '#38bdf8' },
      },
    },
  },

  typography: {
    fontSize: 14,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', 'SF Pro Display', system-ui, sans-serif",
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },

  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

export function Layout({ children }: { children: ReactNode }) {
  const { auth } = useAppStore();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Container disableGutters sx={{ m: 0, px: 0 }} maxWidth={false}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            width: '100%',
            maxWidth: 1620,
            mx: 'auto',
            '@media (min-width: 1621px)': {
              borderRight: '1px solid',
              borderLeft: '1px solid',
              borderColor: 'divider',
            },
          }}
        >
          <Header />

          {auth && <FilesTabs />}

          <Box flex={1} sx={{ display: 'flex' }}>
            {auth ? children : <LoginDialog />}
          </Box>

          <Footer />
        </Box>
      </Container>
    </ThemeProvider>
  );
}
