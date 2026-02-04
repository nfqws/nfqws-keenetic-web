// CodeMirror 6 language support for nfqws.conf and nfqws logs

import {
  LanguageSupport,
  StreamLanguage,
  type StringStream,
} from '@codemirror/language';

/**
 * Helpers
 */
function wordRegexp(words: string[]) {
  return new RegExp('^(?:' + words.join('|') + ')$', 'i');
}

type ConfState = {
  tokenize: (stream: StringStream, state: ConfState) => string | null;
  pendingCore: boolean;
  afterClosingQuote: boolean;
  unquotedBlock: boolean;
  lineIsUnquoted: boolean;
  coreBlockOpen: boolean;
  coreBlockClosed: boolean;
};

const ops = wordRegexp(['iptables', 'ip', 'tc', 'route', 'sysctl', 'echo']);
const coreKeys = wordRegexp([
  'NFQWS_BASE_ARGS',
  'ISP_INTERFACE',
  'NFQWS_ARGS',
  'NFQWS_ARGS_CUSTOM',
  'NFQWS_ARGS_QUIC',
  'NFQWS_ARGS_UDP',
  'MODE_LIST',
  'MODE_ALL',
  'MODE_AUTO',
  'NFQWS_EXTRA_ARGS',
  'NFQWS_ARGS_IPSET',
  'IPV6_ENABLED',
  'TCP_PORTS',
  'UDP_PORTS',
  'POLICY_NAME',
  'POLICY_EXCLUDE',
  'LOG_LEVEL',
  'NFQUEUE_NUM',
  'USER',
  'CONFIG_VERSION',
]);
const builtin = wordRegexp([
  'ROOT',
  'BIN',
  'SBIN',
  'ETC',
  'VAR',
  'LOG',
  'TMP',
  'PID',
  'LOCK',
  'RUN',
  'SYS',
  'PROC',
  'DEV',
  'OPT',
]);

const isOperatorChar = /[+\-*&%=<>!?|]/;

function chain(
  stream: StringStream,
  state: ConfState,
  f: (stream: StringStream, state: ConfState) => string | null,
) {
  state.tokenize = f;
  return f(stream, state);
}

function tokenString(quote: string) {
  return function tokenStringImpl(stream: StringStream, state: ConfState) {
    let escaped = false;
    let next: string | void;
    let end = false;
    while ((next = stream.next())) {
      if (next === quote && !escaped) {
        end = true;
        break;
      }
      escaped = !escaped && next === '\\';
    }
    if (end || !escaped) state.tokenize = tokenBase;
    return 'string';
  };
}

function tokenComment(stream: StringStream, state: ConfState) {
  let maybeEnd = false;
  let ch: string | void;
  while ((ch = stream.next())) {
    if (ch === '/' && maybeEnd) {
      state.tokenize = tokenBase;
      break;
    }
    maybeEnd = ch === '*';
  }
  return 'comment';
}

function tokenVariable(stream: StringStream, state: ConfState) {
  stream.eatWhile(/[\w_]/);
  if (stream.eat('}')) {
    state.tokenize = tokenBase;
  }
  return 'variable-2';
}

function tokenBase(stream: StringStream, state: ConfState): string | null {
  // Legacy "unquoted block" error handling
  if (state.lineIsUnquoted) {
    stream.skipToEnd();
    return 'error';
  }

  if (state.afterClosingQuote) {
    stream.skipToEnd();
    return 'error';
  }

  const ch = stream.next();
  if (ch == null) return null;

  if (state.pendingCore && ch !== '"' && ch !== '=') {
    state.pendingCore = false;
  }

  // Line comments
  if (ch === '#') {
    stream.skipToEnd();
    return 'comment';
  }

  // Line continuation
  if (ch === '\\' && stream.eol()) {
    return 'operator';
  }

  // Strings + special core block quotes
  if (ch === '"' || ch === "'") {
    if (state.pendingCore && ch === '"') {
      state.pendingCore = false;
      state.coreBlockOpen = true;
      state.coreBlockClosed = false;

      // Handle empty "" on same line
      if (stream.peek() === '"') {
        stream.next();
        state.coreBlockOpen = false;
        state.coreBlockClosed = true;
        const rest = stream.string.slice(stream.pos);
        if (/\S/.test(rest)) state.afterClosingQuote = true;
      }
      return 'string';
    }

    // Closing quote of a core block line with only "
    if (state.coreBlockOpen && ch === '"') {
      state.coreBlockOpen = false;
      state.coreBlockClosed = true;
      const restAfter = stream.string.slice(stream.pos);
      if (/\S/.test(restAfter)) state.afterClosingQuote = true;
      return 'string';
    }

    return chain(stream, state, tokenString(ch));
  }

  if (ch === '=') {
    return 'operator';
  }

  // ${VAR}
  if (ch === '$' && stream.eat('{')) {
    return chain(stream, state, tokenVariable);
  }

  // Numbers / ports / ranges
  if (/\d/.test(ch)) {
    stream.eatWhile(/[A-Za-z0-9,:._-]/);
    const num = stream.current();
    if (/^0x[0-9a-fA-F]+$/.test(num)) return 'number';
    if (/^\d+(?:[,:-]\d+)*$/.test(num)) return 'number';
    return 'variable';
  }

  if (ch === '.' && stream.eat('.')) {
    return 'operator';
  }

  // /* ... */
  if (ch === '/' && stream.eat('*')) {
    return chain(stream, state, tokenComment);
  }

  // Paths
  if (ch === '/' && stream.peek() && /[\w\-./]/.test(stream.peek() as string)) {
    stream.eatWhile(/[\w\-./]/);
    return 'string-2';
  }

  // Flags --foo / -x
  if (ch === '-' && stream.peek() === '-') {
    stream.eatWhile(/[\w\-:]+/);
    // const flag = stream.current();
    // if (flag === '--new') return 'nfqws-new';
    // if (flag === '--filter-udp' || flag === '--filter-tcp')
    //   return 'nfqws-filter';
    return 'keyword';
  }

  // Operators
  if (isOperatorChar.test(ch)) {
    stream.eatWhile(isOperatorChar);
    return 'operator';
  }

  // Keys
  if (/[A-Za-z_]/.test(ch)) {
    stream.eatWhile(/[\w_]/);
    const name = stream.current();
    if (stream.peek() === '=') {
      if (coreKeys.test(name)) {
        state.pendingCore = true;
        state.coreBlockClosed = false;
        state.unquotedBlock = false;
        return 'def';
      }
      return 'variable-2';
    }
  }

  stream.eatWhile(/[\w$_]/);
  const cur = stream.current();

  if (ops.test(cur)) return 'builtin';
  if (coreKeys.test(cur)) return 'def';
  if (builtin.test(cur)) return 'variable-2';

  return 'variable';
}

export const nfqwsConfStream = StreamLanguage.define<ConfState>({
  name: 'nfqws-conf',
  startState() {
    const state: ConfState = {
      tokenize: tokenBase,
      pendingCore: false,
      afterClosingQuote: false,
      unquotedBlock: false,
      lineIsUnquoted: false,
      coreBlockOpen: false,
      coreBlockClosed: false,
    };
    return state;
  },
  token(stream, state) {
    if (stream.sol()) {
      state.afterClosingQuote = false;
      state.lineIsUnquoted = false;

      const trimmed = stream.string.trim();

      // if we are inside a core block and line is exactly `"`, close it
      if (state.coreBlockOpen && trimmed === '"') {
        state.coreBlockOpen = false;
        state.coreBlockClosed = true;
      }

      const match = trimmed.match(/^([A-Za-z_][\w_]*)=/);
      if (match && coreKeys.test(match[1])) {
        state.coreBlockClosed = false;
      }

      // If we previously decided to treat following lines as "unquoted block",
      // then any line starting with flags is an error (legacy behavior).
      if (state.unquotedBlock && trimmed.startsWith('--')) {
        state.lineIsUnquoted = true;
      }

      // After closing a core block, any non-empty non-comment line (except `"` itself)
      // is treated as error in the legacy mode.
      if (
        state.coreBlockClosed &&
        trimmed &&
        trimmed !== '"' &&
        !trimmed.startsWith('#')
      ) {
        state.lineIsUnquoted = true;
      }

      // reset on blank/comment line
      if (trimmed === '' || trimmed.startsWith('#')) {
        state.unquotedBlock = false;
      }
    }

    if (stream.eatSpace()) return null;
    return state.tokenize(stream, state);
  },
  languageData: {
    commentTokens: { line: '#' },
  },
});

export function nfqwsConf() {
  return new LanguageSupport(nfqwsConfStream);
}

/**
 * nfqws logs
 */
type LogState = {
  tokenize: (stream: StringStream, state: LogState) => string | null;
};

const logLevels = wordRegexp([
  'ERROR',
  'WARN',
  'WARNING',
  'INFO',
  'DEBUG',
  'TRACE',
  'FATAL',
  'CRITICAL',
  'SEVERE',
  'NOTICE',
]);

const logKeywords = wordRegexp([
  'started',
  'stopped',
  'restarted',
  'failed',
  'success',
  'connection',
  'packet',
  'rule',
  'match',
  'drop',
  'accept',
  'forward',
  'queue',
  'process',
  'thread',
  'memory',
  'cpu',
  'timeout',
  'retry',
  'attempt',
  'session',
  'client',
  'server',
]);

function logTokenBase(stream: StringStream, _state: LogState): string | null {
  const ch = stream.next();
  if (ch == null) return null;

  // timestamps
  if (/[\d:]/.test(ch)) {
    stream.eatWhile(/[\d\-:.TZ]/);
    const current = stream.current();
    if (
      /^\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}/.test(current) ||
      /^\d{2}:\d{2}:\d{2}/.test(current)
    ) {
      return 'atom';
    }
  }

  // IPs
  if (/[\d.]/.test(ch)) {
    stream.eatWhile(/[\d.:]/);
    const ip = stream.current();
    if (/^\d+\.\d+\.\d+\.\d+(:\d+)?$/.test(ip)) {
      return 'number';
    }
  }

  // words
  stream.eatWhile(/[\w\-_]/);
  const cur = stream.current();

  if (logLevels.test(cur)) {
    if (cur === 'ERROR' || cur === 'FATAL' || cur === 'CRITICAL')
      return 'error';
    if (cur === 'WARN' || cur === 'WARNING') return 'warning';
    if (cur === 'INFO' || cur === 'NOTICE') return 'info';
    if (cur === 'DEBUG' || cur === 'TRACE') return 'comment';
    return 'tag';
  }

  if (logKeywords.test(cur)) return 'keyword';

  // [module]
  if (ch === '[') {
    stream.skipTo(']');
    stream.next();
    return 'bracket';
  }

  // digits
  if (/\d/.test(ch)) {
    stream.eatWhile(/\d/);
    return 'number';
  }

  return null;
}

export const nfqwsLogStream = StreamLanguage.define<LogState>({
  name: 'nfqws-log',
  startState() {
    return { tokenize: logTokenBase };
  },
  token(stream, state) {
    if (stream.eatSpace()) return null;
    return state.tokenize(stream, state);
  },
});

export function nfqwsLog() {
  return new LanguageSupport(nfqwsLogStream);
}
