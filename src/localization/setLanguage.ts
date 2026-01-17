import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "./i18n";

export const setLanguage = async (lang: "en" | "hi") => {
  i18n.locale = lang;
  await AsyncStorage.setItem("APP_LANGUAGE", lang);
};

export const loadLanguage = async () => {
  const lang = await AsyncStorage.getItem("APP_LANGUAGE");
  if (lang) i18n.locale = lang;
};
