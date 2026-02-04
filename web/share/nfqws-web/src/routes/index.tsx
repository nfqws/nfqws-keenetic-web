import { useEffect, useState, type ChangeEvent } from 'react';
import {
  Backdrop,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  type SelectChangeEvent,
} from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';

import { useAppStore } from '@/store/useAppStore';

import { CONF_FILE_NAME, useFileContent } from '@/hooks/useFileContent';

import {
  formatConfig,
  parseConfig,
  type NfqwsConfig,
} from '@/utils/configParser';

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { content: originalConfig, isPending } = useFileContent(CONF_FILE_NAME);
  const { setCurrentFile, setNeedSave } = useAppStore();

  const [form, setForm] = useState<NfqwsConfig | null>(null);

  useEffect(() => {
    if (originalConfig) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(parseConfig(originalConfig));
    }
  }, [originalConfig]);

  useEffect(() => {
    setCurrentFile('main');
    setNeedSave(false);
  }, [setCurrentFile, setNeedSave]);

  const changeHandler =
    (key: keyof NfqwsConfig, isCheckbox = false) =>
    (
      e:
        | ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
        | SelectChangeEvent,
    ) => {
      const target = e.target as Omit<HTMLInputElement, 'checked'> & {
        checked?: boolean;
      };
      const value = isCheckbox ? target.checked : target.value;
      setForm((prev) => {
        const newForm = prev ? { ...prev, [key]: value } : prev;

        if (originalConfig && newForm) {
          console.warn(
            'setNeedSave',
            originalConfig !== formatConfig(originalConfig, newForm),
          );
          setNeedSave(originalConfig !== formatConfig(originalConfig, newForm));
        }

        return newForm;
      });
    };

  if (isPending || !originalConfig)
    return (
      <Backdrop open={true}>
        <CircularProgress color="inherit" />
      </Backdrop>
    );

  return (
    <Box
      flex={1}
      sx={{
        position: 'relative',
        display: 'flex',
        overflowY: 'auto',
      }}
    >
      {form && (
        <FormGroup
          sx={{
            padding: 3,
            gap: 4,
            width: '100%',
            flex: 1,
            position: 'absolute',
            '& .MuiInputBase-root': {
              fontFamily: (theme) => theme.typography.mono.fontFamily,
              fontSize: 14,
            },
            '& .MuiInputBase-input': {
              fontFamily: (theme) => theme.typography.mono.fontFamily,
              fontSize: 14,
            },
            '& .MuiFormLabel-root': {
              fontSize: 14,
            },
            '& legend': {
              fontSize: 9,
            },
          }}
        >
          <TextField
            id="ISP_INTERFACE"
            label="Network interface"
            fullWidth
            value={form.ISP_INTERFACE}
            onChange={changeHandler('ISP_INTERFACE')}
            spellCheck={false}
          />
          <TextField
            id="NFQWS_BASE_ARGS"
            label="Startup arguments"
            multiline
            minRows={2}
            fullWidth
            value={form.NFQWS_BASE_ARGS}
            onChange={changeHandler('NFQWS_BASE_ARGS')}
            spellCheck={false}
          />
          <TextField
            id="NFQWS_ARGS"
            label="Base strategy"
            multiline
            minRows={2}
            fullWidth
            value={form.NFQWS_ARGS}
            onChange={changeHandler('NFQWS_ARGS')}
            spellCheck={false}
          />
          <TextField
            id="NFQWS_ARGS_QUIC"
            label="Quic strategy"
            multiline
            minRows={2}
            fullWidth
            value={form.NFQWS_ARGS_QUIC}
            onChange={changeHandler('NFQWS_ARGS_QUIC')}
            spellCheck={false}
          />
          <TextField
            id="NFQWS_ARGS_UDP"
            label="UDP strategy"
            multiline
            minRows={2}
            fullWidth
            value={form.NFQWS_ARGS_UDP}
            onChange={changeHandler('NFQWS_ARGS_UDP')}
            spellCheck={false}
          />
          <TextField
            id="NFQWS_ARGS_CUSTOM"
            label="Custom strategy"
            multiline
            minRows={2}
            fullWidth
            value={form.NFQWS_ARGS_CUSTOM}
            onChange={changeHandler('NFQWS_ARGS_CUSTOM')}
            spellCheck={false}
          />
          <TextField
            id="NFQWS_ARGS_IPSET"
            label="IPSET arguments"
            multiline
            minRows={2}
            fullWidth
            value={form.NFQWS_ARGS_IPSET}
            onChange={changeHandler('NFQWS_ARGS_IPSET')}
            spellCheck={false}
          />
          <FormControl fullWidth>
            <InputLabel>Mode</InputLabel>
            <Select
              id="NFQWS_EXTRA_ARGS"
              label="Mode"
              value={form.NFQWS_EXTRA_ARGS}
              fullWidth
              sx={{ minWidth: 120 }}
              onChange={changeHandler('NFQWS_EXTRA_ARGS')}
            >
              <MenuItem value="MODE_AUTO">Auto</MenuItem>
              <MenuItem value="MODE_LIST">List</MenuItem>
              <MenuItem value="MODE_ALL">All</MenuItem>
            </Select>
          </FormControl>
          <TextField
            id="TCP_PORTS"
            label="TCP ports"
            multiline
            minRows={2}
            fullWidth
            value={form.TCP_PORTS}
            onChange={changeHandler('TCP_PORTS')}
            spellCheck={false}
          />
          <TextField
            id="UDP_PORTS"
            label="UDP ports"
            multiline
            minRows={2}
            fullWidth
            value={form.UDP_PORTS}
            onChange={changeHandler('UDP_PORTS')}
            spellCheck={false}
          />
          <TextField
            id="POLICY_NAME"
            label="Policy name"
            fullWidth
            value={form.POLICY_NAME}
            onChange={changeHandler('POLICY_NAME')}
            spellCheck={false}
          />
          <FormControlLabel
            label="Policy exclude mode"
            control={
              <Checkbox
                id="POLICY_EXCLUDE"
                checked={form.POLICY_EXCLUDE}
                onChange={changeHandler('POLICY_EXCLUDE', true)}
              />
            }
          />
          <FormControlLabel
            label="IPv6 enabled"
            control={
              <Checkbox
                id="IPV6_ENABLED"
                checked={form.IPV6_ENABLED}
                onChange={changeHandler('IPV6_ENABLED', true)}
              />
            }
          />
          <FormControlLabel
            label="Debug logging"
            control={
              <Checkbox
                id="LOG_LEVEL"
                checked={form.LOG_LEVEL}
                onChange={changeHandler('LOG_LEVEL', true)}
              />
            }
          />
          <Button
            onClick={() => {
              if (originalConfig) {
                const newConfig = formatConfig(originalConfig, form);
                console.warn(originalConfig, newConfig);
                console.warn(originalConfig === newConfig);
              }
            }}
          >
            Reload
          </Button>
        </FormGroup>
      )}
    </Box>
  );
}
