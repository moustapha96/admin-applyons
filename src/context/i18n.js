// // import i18n from 'i18next';
// // import { initReactI18next } from 'react-i18next';

// // i18n
// //   .use(initReactI18next)
// //   .init({
// //     resources: {
// //       fr: {
// //         translation: {
// //           "Accueil": "Accueil",
// //           "Actualités": "Actualités",
// //           // Ajoutez ici les autres traductions en français
// //         }
// //       },
// //       en: {
// //         translation: {
// //           "Accueil": "Home",
// //           "Actualités": "News",
// //           // Ajoutez ici les autres traductions en anglais
// //         }
// //       }
// //     },
// //     lng: 'fr',
// //     fallbackLng: 'fr',
// //     interpolation: {
// //       escapeValue: false
// //     }
// //   });

// // export default i18n;

// import i18n from 'i18next';
// import { initReactI18next } from 'react-i18next';
// import LanguageDetector from 'i18next-browser-languagedetector';

// import translationEN from './../locales/en.json';
// import translationFR from './../locales/fr.json';

// i18n
//   .use(LanguageDetector)
//   .use(initReactI18next)
//   .init({
//     debug: true,
//     fallbackLng: 'fr',
//     interpolation: {
//       escapeValue: false,
//     },
//     resources: {
//       en: {
//         translation: translationEN
//       },
//       fr: {
//         translation: translationFR
//       }
//     }
//   });


// export default i18n;
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './../locales/en.json';
import frTranslations from './../locales/fr.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: frTranslations },
      en: { translation: enTranslations },
    },
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false,
      format: (value, format, lng) => {
        if (format === 'orange') {
          return `<span class="text-[--applyons-orange]">${value}</span>`;
        }
        return value;
      },
    },
    detection: {
      order: ['querystring', 'navigator', 'localStorage'],
      caches: ['localStorage'],
    },
  });

export default i18n;
