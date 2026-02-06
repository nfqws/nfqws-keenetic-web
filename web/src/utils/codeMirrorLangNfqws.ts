// CodeMirror 6 language support for nfqws.conf

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

  // Double-quote parsing state (shell-ish)
  dqAtCmdStart: boolean; // after whitespace/newline
  dqLastFlag: string; // last seen --flag (without leading --)
  dqInFlagValue: boolean; // after the flag's '='
  dqInParamValue: boolean; // after a param's '=' (inside lua-desync)
  dqAfterColon: boolean; // right after ':' inside lua-desync
};

const ops = wordRegexp(['iptables', 'ip', 'tc', 'route', 'sysctl', 'echo']);
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

function tokenDQuote(stream: StringStream, state: ConfState): string | null {
  // End of double-quoted string
  if (stream.eat('"')) {
    state.tokenize = tokenBase;
    return 'string';
  }

  // Escapes inside quotes
  if (stream.eat('\\')) {
    stream.next();
    return 'string';
  }

  // Whitespace inside quotes: ends the current "command token".
  if (stream.eatSpace()) {
    stream.eatWhile(/\s/);
    state.dqAtCmdStart = true;
    state.dqLastFlag = '';
    state.dqInFlagValue = false;
    state.dqInParamValue = false;
    state.dqAfterColon = false;
    return 'string';
  }

  // ${VAR} or $VAR inside quotes
  if (stream.eat('$')) {
    if (stream.eat('{')) {
      stream.eatWhile(/[\w_]/);
      stream.eat('}');
      return 'variable-2';
    }
    stream.eatWhile(/[\w_]/);
    return 'variable-2';
  }

  // Top-level flags: --foo-bar
  if (stream.peek() === '-' && stream.string.charAt(stream.pos + 1) === '-') {
    stream.next();
    stream.next();
    stream.eatWhile(/[\w-]/);
    state.dqLastFlag = stream.current().slice(2);
    state.dqAtCmdStart = false;
    state.dqInFlagValue = false;
    state.dqInParamValue = false;
    state.dqAfterColon = false;
    return 'keyword';
  }

  // Delimiters
  const p = stream.peek();
  if (p === ':') {
    stream.next();
    // In lua-desync, ':' starts a new segment where a key/atom may appear.
    state.dqAfterColon = true;
    state.dqInParamValue = false;
    return 'operator';
  }
  if (p === ',') {
    stream.next();
    // Comma is a value separator; it should NOT switch into key mode.
    return 'operator';
  }
  if (p === '=') {
    stream.next();
    // First '=' after a flag starts the flag value.
    if (state.dqLastFlag && !state.dqInFlagValue) {
      state.dqInFlagValue = true;
      state.dqInParamValue = false;
      state.dqAfterColon = false;
    } else if (state.dqInFlagValue) {
      // '=' inside lua-desync params: switches into "param value" mode.
      state.dqInParamValue = true;
      state.dqAfterColon = false;
    }
    return 'operator';
  }

  // Paths: /foo/bar or @/foo/bar
  if (stream.eat('@')) {
    if (stream.peek() === '/') {
      stream.eatWhile(/[\w\-./]/);
      return 'string-2';
    }
    // Not a path, treat as part of string
    stream.eatWhile(/[^$"\\\s]/);
    return 'string';
  }
  if (stream.peek() === '/') {
    stream.next();
    stream.eatWhile(/[\w\-./]/);
    return 'string-2';
  }

  // Negative numbers (e.g. -1000)
  if (
    stream.peek() === '-' &&
    /\d/.test(stream.string.charAt(stream.pos + 1))
  ) {
    stream.next();
    // NOTE: do NOT include ':' here, ':' is a segment delimiter in lua-desync
    stream.eatWhile(/[0-9,._\-+]/);
    return 'number';
  }

  // Numbers / ports / ranges
  if (stream.peek() && /\d/.test(stream.peek() as string)) {
    stream.next();
    // NOTE: do NOT include ':' here, ':' is a segment delimiter in lua-desync
    stream.eatWhile(/[A-Za-z0-9,._\-+]/);
    return 'number';
  }

  // Identifiers / atoms
  if (stream.peek() && /[A-Za-z_]/.test(stream.peek() as string)) {
    stream.eatWhile(/[\w.-]/);

    // Inside lua-desync: after ':' an identifier followed by '=' is a param key.
    // We want param keys to look like level-2 items, and values as 'string'.
    if (state.dqAfterColon && stream.peek() === '=') {
      state.dqAfterColon = false;
      return 'typeName';
    }

    // After ':' without '=', it's a bare mode/atom like `badsum`.
    if (state.dqAfterColon) {
      state.dqAfterColon = false;
      return 'typeName';
    }

    // If we are in param value mode, everything is a value (so sni=www.google.com stays value-colored)
    if (state.dqInParamValue) {
      return 'string';
    }

    // Otherwise treat as level-2 atom (modes, payload names, l7 names, etc.)
    return 'typeName';
  }

  // Single-dash flags inside quotes (rare): -x
  if (stream.peek() === '-') {
    stream.next();
    stream.eatWhile(/[A-Za-z0-9]/);
    return 'keyword';
  }

  // Fallback: consume a short run. MUST always advance at least 1 char.
  const start = stream.pos;
  stream.eatWhile(/[^$"\\\s]/);
  if (stream.pos === start) stream.next();
  return 'string';
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
  const ch = stream.next();
  if (ch == null) return null;

  // Line comments
  if (ch === '#') {
    stream.skipToEnd();
    return 'comment';
  }

  // Line continuation
  if (ch === '\\' && stream.eol()) {
    return 'operator';
  }

  // Strings
  if (ch === "'") {
    return chain(stream, state, tokenString(ch));
  }

  // Double-quoted strings: parse like shell fragments + highlight $VAR/${VAR}
  if (ch === '"') {
    state.dqAtCmdStart = true;
    state.dqLastFlag = '';
    state.dqInFlagValue = false;
    state.dqInParamValue = false;
    state.dqAfterColon = false;
    return chain(stream, state, tokenDQuote);
  }

  if (ch === '=') {
    return 'operator';
  }

  // ${VAR}
  if (ch === '$' && stream.eat('{')) {
    return chain(stream, state, tokenVariable);
  }

  // $VAR
  if (ch === '$') {
    stream.eatWhile(/[\w_]/);
    return 'variable-2';
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

  // @/path (common in this config)
  if (ch === '@' && stream.peek() === '/') {
    stream.eatWhile(/[\w\-./]/);
    return 'string-2';
  }

  // Flags --foo / -x
  if (ch === '-' && stream.peek() === '--') {
    stream.eatWhile(/[\w\-:]+/);
    return 'keyword';
  }

  // Operators
  if (isOperatorChar.test(ch)) {
    stream.eatWhile(isOperatorChar);
    return 'operator';
  }

  // Keys / identifiers
  if (/[A-Za-z_]/.test(ch)) {
    stream.eatWhile(/[\w_]/);
    if (stream.peek() === '=') {
      // Any VAR= is a definition (shell-style), not only a fixed allowlist
      return 'def';
    }
    if (stream.peek() === ':') {
      // first segment before ':' is key even without '='
      return 'def';
    }
  }

  stream.eatWhile(/[\w$_]/);
  const cur = stream.current();

  if (ops.test(cur)) return 'builtin';
  if (builtin.test(cur)) return 'variable-2';

  return 'variable';
}

export const nfqwsConfStream = StreamLanguage.define<ConfState>({
  name: 'nfqws-conf',
  startState() {
    const state: ConfState = {
      tokenize: tokenBase,
      dqAtCmdStart: true,
      dqLastFlag: '',
      dqInFlagValue: false,
      dqInParamValue: false,
      dqAfterColon: false,
    };
    return state;
  },
  token(stream, state) {
    if (stream.eatSpace()) return null;
    return state.tokenize(stream, state);
  },
  languageData: {
    commentTokens: { line: '#' },
  },
});

export function codeMirrorLangNfqws() {
  return new LanguageSupport(nfqwsConfStream);
}
