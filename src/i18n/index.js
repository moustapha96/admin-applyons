// src/i18n/index.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import des bundles (cf. section 3)
import fr from "./locales/fr.json";
import en from "./locales/en.json";
import es from "./locales/es.json";
import it from "./locales/it.json";
import de from "./locales/de.json";
import zh from "./locales/zh.json";

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: "fr",
        supportedLngs: ["fr", "en", "es", "it", "de", "zh"],
        resources: {
            fr: { translation: fr },
            en: { translation: en },
            es: { translation: es },
            it: { translation: it },
            de: { translation: de },
            zh: { translation: zh },
        },
        detection: {
            // priorité: localStorage -> html lang -> navigator
            order: ["localStorage", "htmlTag", "navigator"],
            caches: ["localStorage"],
        },
        interpolation: { escapeValue: false },
        returnEmptyString: false,
    });

export default i18n;