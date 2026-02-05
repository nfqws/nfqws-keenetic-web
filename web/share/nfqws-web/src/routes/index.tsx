import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from 'react';
import { useConfig } from '@/config/useConfig';
import {
  Box,
  Checkbox,
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

import { API } from '@/api/client';

import { App } from '@/components/App';
import { Error404 } from '@/components/Error404';
import { FormEditor } from '@/components/FormEditor';

import { useAppStore } from '@/store/useAppStore';

import { useStatus } from '@/hooks/useStatus';

import {
  formatConfig,
  parseConfig,
  type NfqwsConfig,
} from '@/utils/configParser';

export const Route = createFileRoute('/')({
  component: RouteComponent,
  notFoundComponent: Error404,
});

function RouteComponent() {
  const { nfqws2 } = useStatus();
  const { confFile } = useConfig(nfqws2);
  const { data: originalConfig, isPending } = API.fileContent(confFile);
  const { setNeedSave, needSave, setOnSave } = useAppStore();

  const [originalConfigParsed, setOriginalConfigParsed] =
    useState<NfqwsConfig | null>(null);
  const [form, setForm] = useState<NfqwsConfig | null>(null);

  const originalConfigRef = useRef<string | null>(null);
  const formRef = useRef<NfqwsConfig | null>(null);
  const needSaveRef = useRef<boolean>(false);

  useEffect(() => {
    originalConfigRef.current = originalConfig?.content ?? null;
    formRef.current = form;
    needSaveRef.current = needSave;
  }, [originalConfig?.content, form, needSave]);

  const onSave = useCallback(async () => {
    if (!needSaveRef.current) {
      return;
    }

    const oc = originalConfigRef.current;
    const f = formRef.current;
    if (!oc || !f) {
      return;
    }

    const newConfig = formatConfig(oc, f);
    if (oc !== newConfig) {
      const { data } = await API.saveFile(confFile, newConfig);
      if (data?.status === 0) {
        void API.invalidateFileContent(confFile);
        setNeedSave(false);
      } else {
        // TODO: error
      }
    }
  }, [confFile, setNeedSave]);

  useEffect(() => {
    if (originalConfig?.content) {
      const parsed = parseConfig(originalConfig.content);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOriginalConfigParsed(parsed);
      setForm(parsed);
    }
  }, [originalConfig?.content]);

  useEffect(() => {
    setNeedSave(false);
  }, [setNeedSave]);

  useEffect(() => {
    setOnSave(onSave);
  }, [onSave, setOnSave]);

  const changeHandler =
    (key: keyof NfqwsConfig, isCheckbox = false) =>
    (
      e:
        | ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
        | SelectChangeEvent
        | string,
    ) => {
      let value: string | boolean;
      if (typeof e === 'string') {
        value = e;
      } else {
        const target = e.target as Omit<HTMLInputElement, 'checked'> & {
          checked?: boolean;
        };
        value = isCheckbox ? Boolean(target.checked) : target.value;
      }

      setNeedSave(value !== originalConfigParsed?.[key]);
      setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    };

  if (isPending || !originalConfigParsed || !form) {
    return <App />;
  }

  return (
    <App>
      <Box
        flex={1}
        sx={{
          position: 'relative',
          display: 'flex',
          overflowY: 'auto',
        }}
      >
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
              fontSize: 13,
            },
            '& .MuiFormLabel-root': {
              fontSize: 13,
            },
            '& .MuiFormControlLabel-label': {
              fontSize: 14,
            },
            '& .MuiInputLabel-shrink': {
              transform: 'translate(14px, -9px) scale(0.95)',
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

          {nfqws2 && (
            <FormEditor
              label="Startup arguments"
              value={originalConfigParsed.NFQWS_BASE_ARGS}
              onChange={changeHandler('NFQWS_BASE_ARGS')}
            />
          )}

          <FormEditor
            label="Base strategy"
            value={originalConfigParsed.NFQWS_ARGS}
            onChange={changeHandler('NFQWS_ARGS')}
          />

          <FormEditor
            label="Quic strategy"
            value={originalConfigParsed.NFQWS_ARGS_QUIC}
            onChange={changeHandler('NFQWS_ARGS_QUIC')}
          />

          <FormEditor
            label="UDP strategy"
            value={originalConfigParsed.NFQWS_ARGS_UDP}
            onChange={changeHandler('NFQWS_ARGS_UDP')}
          />

          <FormEditor
            label="Custom strategy"
            value={originalConfigParsed.NFQWS_ARGS_CUSTOM}
            onChange={changeHandler('NFQWS_ARGS_CUSTOM')}
          />

          <FormEditor
            label="IPSET arguments"
            value={originalConfigParsed.NFQWS_ARGS_IPSET}
            onChange={changeHandler('NFQWS_ARGS_IPSET')}
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
            minRows={2}
            fullWidth
            value={form.TCP_PORTS}
            onChange={changeHandler('TCP_PORTS')}
            spellCheck={false}
          />
          <TextField
            id="UDP_PORTS"
            label="UDP ports"
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
            sx={{ mt: '-1em' }}
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
            sx={{ mt: '-1em' }}
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
            sx={{ mt: '-1em' }}
          />
        </FormGroup>
      </Box>
    </App>
  );
}
