import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import en from '../messages/en.json';
import id from '../messages/id.json';
import es from '../messages/es.json';
import zh from '../messages/zh.json';

export type Language = 'en' | 'id' | 'es' | 'zh';

interface I18nStore {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useI18n = create<I18nStore>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'ayla-hr-language',
    }
  )
);

// Import translations from message files
const translations = { en, id, es, zh };

// Translation function
export function getTranslation(lang: Language, key: string): string {
  const keys = key.split('.');
  let value: any = translations[lang];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
}

// Hook for using translations in components
export function useTranslations(lang?: Language) {
  const language = useI18n((state) => state.language);
  const currentLang = lang || language;
  
  return (key: string) => getTranslation(currentLang, key);
}
