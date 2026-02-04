import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface TypographyVariants {
    mono: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    mono?: React.CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    mono: true;
  }
}
