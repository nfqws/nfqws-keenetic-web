// CodeMirror 6 language support for logs

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

export function codeMirrorLangLog() {
  return new LanguageSupport(nfqwsLogStream);
}
