export const SUPPORTED_LANGS = ['fr', 'en'] as const;
export const DEFAULT_LANG = 'fr';

export type SupportedLang = (typeof SUPPORTED_LANGS)[number];

export function getSupportedLang(lang: string | null | undefined): SupportedLang {
  return SUPPORTED_LANGS.includes(lang as SupportedLang) ? lang as SupportedLang : DEFAULT_LANG;
}
