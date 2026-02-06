import { Box, FormControl, FormHelperText, InputLabel } from '@mui/material';

import { Editor } from '@/components/Editor';

export const FormEditor = ({
  label,
  value,
  description,
  onChange,
}: {
  label: string;
  value: string;
  description?: string;
  onChange: (value: string, changed: boolean) => void;
}) => {
  return (
    <FormControl
      fullWidth
      variant="outlined"
      sx={(theme) => ({
        '&:focus-within .MuiFormLabel-root, &:focus-within .MuiFormHelperText-root':
          {
            color: theme.palette.primary.main,
          },
      })}
    >
      <InputLabel shrink sx={{ top: '-0.4em' }}>
        {label}
      </InputLabel>

      <Box
        sx={(theme) => ({
          mt: 1,
          borderRadius: 1,
          border: '1px solid',
          borderColor: theme.palette.text.disabled,
          padding: 1,
          boxSizing: 'border-box',
          '&:hover': {
            borderColor: theme.palette.text.primary,
          },
          '&:focus-within': {
            borderColor: theme.palette.primary.main,
            boxShadow: `0 0 0 1px ${theme.palette.primary.main} inset`,
          },
        })}
      >
        <Editor
          value={value}
          type="conf"
          maxHeight="14em"
          onChange={onChange}
        />
      </Box>

      {description && <FormHelperText>{description}</FormHelperText>}
    </FormControl>
  );
};
