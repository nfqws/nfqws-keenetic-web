import { type ReactNode } from 'react';
import { Box, Container, CssBaseline, ThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';

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
          disabled: 'rgba(0, 0, 0, 0.23)',
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
          disabled: 'rgba(255, 255, 255, 0.23)',
        },

        divider: 'rgba(255, 255, 255, 0.08)',

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
    mono: {
      fontFamily:
        'Menlo, Monaco, Consolas, "Andale Mono", "Ubuntu Mono", "Courier New", monospace',
      fontSize: '0.8125rem',
      lineHeight: '1.5em',
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
          {children}
        </Box>
      </Container>
    </ThemeProvider>
  );
}
