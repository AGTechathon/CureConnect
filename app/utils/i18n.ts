import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './translations/en.json';
import hi from './translations/hi.json';

const resources = {
  en: {
    translation: en,
  },
  hi: {
    translation: hi,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export const changeLanguage = async (language: 'en' | 'hi') => {
  await AsyncStorage.setItem('userLanguage', language);
  await i18n.changeLanguage(language);
};

export const getStoredLanguage = async () => {
  const language = await AsyncStorage.getItem('userLanguage');
  return language || 'en';
};

export default i18n; 