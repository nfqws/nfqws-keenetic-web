import { useCallback, useMemo } from 'react';
import en from '@/translations/en.json';
import ru from '@/translations/ru.json';

const SUPPORTED_LANGUAGES = ['en', 'ru'];
const DEFAULT_LANGUAGE = 'en';

interface JsonObject {
  [key: string]: JsonValue;
}

type JsonValue = string | JsonObject;

type DotPrefix<T extends string> = T extends '' ? '' : `.${T}`;

type LeafStringPaths<T> = T extends string
  ? ''
  : T extends Record<string, JsonValue>
    ? {
        [K in Extract<keyof T, string>]: T[K] extends string
          ? `${K}`
          : T[K] extends Record<string, JsonValue>
            ? `${K}${DotPrefix<LeafStringPaths<T[K]>>}`
            : never;
      }[Extract<keyof T, string>]
    : never;

export type TranslationSchema = typeof en;
export type TranslationKey = LeafStringPaths<TranslationSchema>;

export type TranslationParams = Record<string, string | number>;

type TFunction = {
  (key: TranslationKey, params?: TranslationParams, fallback?: string): string;
  (key: string, params?: TranslationParams, fallback?: string): string;
};

const resolve = (keys: string[], pack: JsonValue): string | undefined => {
  let current: JsonValue = pack;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as JsonObject)[key];
    } else {
      return undefined;
    }
  }

  return typeof current === 'string' ? current : undefined;
};

const interpolate = (template: string, params?: TranslationParams): string => {
  if (!params) return template;

  return template.replace(/\{\{(\w+)}}/g, (_, key) =>
    key in params ? String(params[key]) : `{{${key}}}`,
  );
};

export const useTranslation = () => {
  // TODO: storage
  const language = useMemo(() => {
    const detected = window.navigator.language.split('-')[0];
    return SUPPORTED_LANGUAGES.includes(detected) ? detected : DEFAULT_LANGUAGE;
  }, []);

  const langpack = language === 'ru' ? ru : en;
  const defaultLangpack = en;

  const t = useCallback(
    (path, params, fallback = '__MISSING__') => {
      const keys = path.split('.');

      const primary = resolve(keys, langpack);
      if (primary !== undefined) {
        return interpolate(primary, params);
      }

      if (langpack !== defaultLangpack) {
        const secondary = resolve(keys, defaultLangpack);
        if (secondary !== undefined) {
          return interpolate(secondary, params);
        }
      }

      return fallback;
    },
    [defaultLangpack, langpack],
  ) as TFunction;

  return { t };
};
