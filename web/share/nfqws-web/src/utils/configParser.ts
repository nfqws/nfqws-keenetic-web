export type NfqwsConfig = {
  ISP_INTERFACE: string;
  NFQWS_BASE_ARGS: string;
  NFQWS_ARGS: string;
  NFQWS_ARGS_QUIC: string;
  NFQWS_ARGS_UDP: string;
  NFQWS_EXTRA_ARGS: 'MODE_LIST' | 'MODE_ALL' | 'MODE_AUTO';
  NFQWS_ARGS_IPSET: string;
  NFQWS_ARGS_CUSTOM: string;
  IPV6_ENABLED: boolean;
  TCP_PORTS: string;
  UDP_PORTS: string;
  POLICY_NAME: string;
  POLICY_EXCLUDE: boolean;
  LOG_LEVEL: boolean;
};

const NFQWS_CONFIG_KEYS: (keyof NfqwsConfig)[] = [
  'ISP_INTERFACE',
  'NFQWS_BASE_ARGS',
  'NFQWS_ARGS',
  'NFQWS_ARGS_QUIC',
  'NFQWS_ARGS_UDP',
  'NFQWS_EXTRA_ARGS',
  'NFQWS_ARGS_IPSET',
  'NFQWS_ARGS_CUSTOM',
  'IPV6_ENABLED',
  'TCP_PORTS',
  'UDP_PORTS',
  'POLICY_NAME',
  'POLICY_EXCLUDE',
  'LOG_LEVEL',
] as const;

type LineBlock = {
  start: number;
  end: number;
  indent: string;
  quote: '"' | "'" | '';
  hadMultiline: boolean;
};

export const parseConfig = (config: string) => {
  const defaults: NfqwsConfig = {
    ISP_INTERFACE: '',
    NFQWS_BASE_ARGS: '',
    NFQWS_ARGS: '',
    NFQWS_ARGS_QUIC: '',
    NFQWS_ARGS_UDP: '',
    NFQWS_EXTRA_ARGS: 'MODE_AUTO',
    NFQWS_ARGS_IPSET: '',
    NFQWS_ARGS_CUSTOM: '',
    IPV6_ENABLED: false,
    TCP_PORTS: '',
    UDP_PORTS: '',
    POLICY_NAME: '',
    POLICY_EXCLUDE: false,
    LOG_LEVEL: false,
  };

  const rawValues: Record<string, string> = {};

  const lines = config.split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      i += 1;
      continue;
    }

    const eqIndex = line.indexOf('=');
    if (eqIndex === -1) {
      i += 1;
      continue;
    }

    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();

    if (value.startsWith('"') || value.startsWith("'")) {
      const quote = value[0];
      value = value.slice(1);
      let isMultiline = false;

      while (true) {
        const quoteIndex = value.indexOf(quote);
        if (quoteIndex !== -1) {
          const before = value.slice(0, quoteIndex);
          const after = value.slice(quoteIndex + 1).trim();
          value = before;
          if (after && !after.startsWith('#')) {
            value = `${value}${after}`;
          }
          break;
        }

        i += 1;
        if (i >= lines.length) {
          break;
        }
        isMultiline = true;
        value = `${value}\n${lines[i].trimStart()}`;
      }

      if (isMultiline) {
        value = value.replace(/\n[ \t]+/g, '\n');
      }

      if (quote === '"') {
        value = value.replace(/\\\\/g, '\\').replace(/\\"/g, '"');
      } else {
        value = value.replace(/\\'/g, "'");
      }
    } else {
      value = value.split('#')[0]?.trim() ?? value;
    }

    rawValues[key] = value;
    i += 1;
  }

  const resolveValue = (value: string, depth = 0): string => {
    if (depth > 5) {
      return value;
    }
    return value.replace(/\$(\w+)|\$\{(\w+)}/g, (_match, name1, name2) => {
      const name = name1 ?? name2;
      const resolved = rawValues[name];
      if (resolved === undefined) {
        return '';
      }
      return resolveValue(resolved, depth + 1);
    });
  };

  const toBoolean = (value: string): boolean => {
    const normalized = value.trim().toLowerCase();
    return normalized === '1' || normalized === 'true' || normalized === 'yes';
  };

  const configObj: NfqwsConfig = { ...defaults };

  for (const key of NFQWS_CONFIG_KEYS) {
    const raw = rawValues[key];
    if (raw === undefined) {
      continue;
    }
    const resolved = resolveValue(raw);

    switch (key) {
      case 'IPV6_ENABLED':
      case 'POLICY_EXCLUDE':
      case 'LOG_LEVEL':
        configObj[key] = toBoolean(resolved);
        break;
      case 'NFQWS_EXTRA_ARGS': {
        const rawMode = raw.match(/^\$?\{?(MODE_(?:LIST|ALL|AUTO))}?$/);
        if (rawMode?.[1]) {
          configObj[key] = rawMode[1] as NfqwsConfig['NFQWS_EXTRA_ARGS'];
          break;
        }
        if (resolved === rawValues.MODE_LIST) {
          configObj[key] = 'MODE_LIST';
        } else if (resolved === rawValues.MODE_ALL) {
          configObj[key] = 'MODE_ALL';
        } else if (resolved === rawValues.MODE_AUTO) {
          configObj[key] = 'MODE_AUTO';
        }
        break;
      }
      default:
        configObj[key] = resolved;
    }
  }

  return configObj;
};

const toRawValue = (
  key: keyof NfqwsConfig,
  value: NfqwsConfig[keyof NfqwsConfig],
) => {
  if (key === 'NFQWS_EXTRA_ARGS') {
    return `$${value}`;
  }
  if (
    key === 'IPV6_ENABLED' ||
    key === 'POLICY_EXCLUDE' ||
    key === 'LOG_LEVEL'
  ) {
    return value ? '1' : '0';
  }
  return String(value ?? '');
};

const needsQuotes = (raw: string) =>
  raw.includes(' ') || raw.includes('\n') || raw === '';

const stringifyValue = (
  key: keyof NfqwsConfig,
  value: NfqwsConfig[keyof NfqwsConfig],
  block: LineBlock | null,
): string => {
  const raw = toRawValue(key, value);
  const quote = block?.quote ?? '';
  const shouldQuote = quote !== '' || needsQuotes(raw);
  const quoteChar: '"' | "'" = (quote || '"') as '"' | "'";

  if (!shouldQuote) {
    return raw;
  }

  if (!raw.includes('\n')) {
    return `${quoteChar}${raw}${quoteChar}`;
  }

  const indent = block?.indent ?? '  ';
  const lines = raw.split('\n');
  const rendered = lines
    .map((line, idx) => (idx === 0 ? line : `${indent}${line}`))
    .join('\n');

  return `${quoteChar}${rendered}${quoteChar}`;
};

const readBlock = (lines: string[], startIndex: number): LineBlock => {
  const line = lines[startIndex];
  const eqIndex = line.indexOf('=');
  const valuePart = eqIndex === -1 ? '' : line.slice(eqIndex + 1).trim();
  const quote =
    valuePart.startsWith('"') || valuePart.startsWith("'")
      ? (valuePart[0] as '"' | "'")
      : '';
  let end = startIndex;
  let indent = '';
  let hadMultiline = false;

  if (quote) {
    const first = valuePart.slice(1);
    if (!first.includes(quote)) {
      hadMultiline = true;
      let i = startIndex + 1;
      while (i < lines.length) {
        const nextLine = lines[i];
        if (!indent) {
          indent = nextLine.match(/^[ \t]*/)?.[0] ?? '';
        }
        if (nextLine.includes(quote)) {
          end = i;
          break;
        }
        i += 1;
      }
    }
  }

  return {
    start: startIndex,
    end,
    indent,
    quote,
    hadMultiline,
  };
};

export const formatConfig = (source: string, config: NfqwsConfig): string => {
  const lines = source.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      i += 1;
      continue;
    }

    const eqIndex = line.indexOf('=');
    if (eqIndex === -1) {
      i += 1;
      continue;
    }

    const key = line.slice(0, eqIndex).trim() as keyof NfqwsConfig;
    if (!NFQWS_CONFIG_KEYS.includes(key)) {
      i += 1;
      continue;
    }

    const block = readBlock(lines, i);
    const newValue = stringifyValue(key, config[key], block);
    const prefix = line.slice(0, eqIndex + 1);
    lines[i] = `${prefix}${newValue}`;

    if (block.end > i) {
      lines.splice(i + 1, block.end - i);
    }

    i += 1;
  }

  return lines.join('\n');
};
