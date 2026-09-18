export type LocaleGroup = 'Indian Languages' | 'Other Languages';

export const SUPPORTED_LOCALES = [
  // Indian Scheduled Languages (22)
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', isStatic: true, group: 'Indian Languages' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', isStatic: true, group: 'Indian Languages' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', isStatic: true, group: 'Indian Languages' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', isStatic: true, group: 'Indian Languages' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', isStatic: true, group: 'Indian Languages' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', isStatic: true, group: 'Indian Languages' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', isStatic: true, group: 'Indian Languages' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', isStatic: true, group: 'Indian Languages' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', isStatic: true, group: 'Indian Languages' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', isStatic: true, group: 'Indian Languages' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', isStatic: true, group: 'Indian Languages' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', isStatic: false, group: 'Indian Languages' },
  { code: 'mai', name: 'Maithili', nativeName: 'मैथिली', isStatic: false, group: 'Indian Languages' },
  { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', isStatic: false, group: 'Indian Languages' },
  { code: 'ks', name: 'Kashmiri', nativeName: 'कॉशुर', isStatic: false, group: 'Indian Languages' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', isStatic: false, group: 'Indian Languages' },
  { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी', isStatic: false, group: 'Indian Languages' },
  { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي', isStatic: false, group: 'Indian Languages' },
  { code: 'doi', name: 'Dogri', nativeName: 'डोगरी', isStatic: false, group: 'Indian Languages' },
  { code: 'mni', name: 'Manipuri', nativeName: 'মৈতৈলোন্', isStatic: false, group: 'Indian Languages' },
  { code: 'brx', name: 'Bodo', nativeName: 'बर’', isStatic: false, group: 'Indian Languages' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', isStatic: false, group: 'Indian Languages' },
  // Regional
  { code: 'bho', name: 'Bhojpuri', nativeName: 'भोजपुरी', isStatic: false, group: 'Indian Languages' },
  { code: 'raj', name: 'Rajasthani', nativeName: 'राजस्थानी', isStatic: false, group: 'Indian Languages' },
  { code: 'hne', name: 'Chhattisgarhi', nativeName: 'छत्तीसगढ़ी', isStatic: false, group: 'Indian Languages' },
  
  // Other World Languages
  { code: 'en', name: 'English', nativeName: 'English', isStatic: true, group: 'Other Languages' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', isStatic: false, group: 'Other Languages' },
  { code: 'fr', name: 'French', nativeName: 'Français', isStatic: false, group: 'Other Languages' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', isStatic: false, group: 'Other Languages' },
  { code: 'zh', name: 'Mandarin', nativeName: '中文', isStatic: false, group: 'Other Languages' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', isStatic: false, group: 'Other Languages' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', isStatic: false, group: 'Other Languages' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', isStatic: false, group: 'Other Languages' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', isStatic: false, group: 'Other Languages' },
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
