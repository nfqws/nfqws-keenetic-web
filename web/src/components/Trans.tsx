import {
  useTranslation,
  type TranslationKey,
  type TranslationParams,
} from '@/hooks/useTranslation';

export const Trans = ({
  i18nKey,
  ...props
}: TranslationParams & { i18nKey: TranslationKey }) => {
  const { t } = useTranslation();
  return <>{t(i18nKey, props)}</>;
};
