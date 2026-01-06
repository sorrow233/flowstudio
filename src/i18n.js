import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en/common.json';
import zhCN from './locales/zh-CN/common.json';
import zhTW from './locales/zh-TW/common.json';
import ja from './locales/ja/common.json';
import ko from './locales/ko/common.json';

const resources = {
    en: {
        common: en,
    },
    'zh-CN': {
        common: zhCN,
    },
    'zh-TW': {
        common: zhTW,
    },
    ja: {
        common: ja,
    },
    ko: {
        common: ko,
    },
};

i18n
    // detect user language
    // learn more: https://github.com/i18next/i18next-browser-languageDetector
    .use(LanguageDetector)
    // pass the i18n instance to react-i18next.
    .use(initReactI18next)
    // init i18next
    // for all options read: https://www.i18next.com/overview/configuration-options
    .init({
        resources,
        fallbackLng: 'en', // Strict fallback to English
        debug: import.meta.env.DEV,

        interpolation: {
            escapeValue: false,
        },

        detection: {
            // Strict order: User Preference (localStorage) > System (navigator)
            order: ['localStorage', 'navigator'],

            // keys or params to lookup language from
            lookupLocalStorage: 'i18nextLng',

            // cache user language on
            caches: ['localStorage'],

            // optional expire and domain for set cookie
            cookieMinutes: 10,
        },

        defaultNS: 'common',
        ns: ['common'],
    });

export default i18n;
