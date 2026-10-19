import { create } from 'zustand';
import { translations } from '../utils/translations';

export const useLangStore = create((set, get) => {
  const savedLang = localStorage.getItem('sami_cafe_lang') || 'en';

  return {
    lang: savedLang,
    t: (key) => {
      const current = get().lang;
      return translations[current]?.[key] || translations.en[key] || key;
    },
    setLang: (lang) => {
      localStorage.setItem('sami_cafe_lang', lang);
      set({ lang });
    },
    toggleLang: () => {
      const next = get().lang === 'en' ? 'am' : 'en';
      localStorage.setItem('sami_cafe_lang', next);
      set({ lang: next });
    }
  };
});
