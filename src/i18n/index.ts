import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import commonEn from './locales/en/common.json';
import sidebarEn from './locales/en/sidebar.json';
import authEn from './locales/en/auth.json';

import commonZh from './locales/zh-CN/common.json';
import sidebarZh from './locales/zh-CN/sidebar.json';
import authZh from './locales/zh-CN/auth.json';

const resources = {
  en: {
    common: commonEn,
    sidebar: sidebarEn,
    auth: authEn,
  },
  'zh-CN': {
    common: commonZh,
    sidebar: sidebarZh,
    auth: authZh,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'home', 'sidebar', 'auth'],

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'language',
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: true,
    },
  });

export default i18n;
