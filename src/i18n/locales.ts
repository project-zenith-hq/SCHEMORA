export const SUPPORTED_LOCALES = [
  { code: 'en', name: 'English', nativeName: 'English', isStatic: true },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', isStatic: true },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', isStatic: true },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', isStatic: true },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', isStatic: true },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', isStatic: true },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', isStatic: true },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', isStatic: true },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', isStatic: true },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', isStatic: true },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', isStatic: true },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', isStatic: true },
] as const;

export type LocaleCode = typeof SUPPORTED_LOCALES[number]['code'];

export const DEFAULT_LOCALE: LocaleCode = 'en';

export interface Translations {
  [key: string]: string | Translations;
}

// Helper to resolve nested object keys (e.g., "nav.home")
export function resolveTranslation(translations: Translations, key: string, fallback: string): string {
  const keys = key.split('.');
  let current: any = translations;
  
  for (const k of keys) {
    if (current === undefined || current === null) return fallback;
    current = current[k];
  }
  
  if (typeof current === 'string') return current;
  return fallback;
}
