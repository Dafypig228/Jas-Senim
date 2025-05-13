import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ruTranslation from "@/locales/ru.json";
import kkTranslation from "@/locales/kk.json";
import uzTranslation from "@/locales/uz.json";

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources: {
      ru: {
        translation: ruTranslation
      },
      kk: {
        translation: kkTranslation
      },
      uz: {
        translation: uzTranslation
      }
    },
    lng: "ru", // Default language
    fallbackLng: "ru",
    interpolation: {
      escapeValue: false // React already escapes by default
    },
    react: {
      useSuspense: false
    }
  });

export default i18n;
