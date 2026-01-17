import React, { useLayoutEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useLanguage } from "../context/LanguageContext";

const LanguageScreen = ({ navigation }: any) => {
  const { language, setLanguage, t } = useLanguage();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t("language_title"),
    });
  }, [language]);

  const onSelect = async (lang: "en" | "hi") => {
    await setLanguage(lang);

    // 🔥 MARKET BEHAVIOUR
    navigation.goBack();

  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("select_language")}</Text>

      <TouchableOpacity
        style={[styles.btn, language === "en" && styles.active]}
        onPress={() => onSelect("en")}
        activeOpacity={0.85}
      >
        <Text
          style={[
            styles.btnText,
            language === "en" && styles.activeText,
          ]}
        >
          {t("english")}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btn, language === "hi" && styles.active]}
        onPress={() => onSelect("hi")}
        activeOpacity={0.85}
      >
        <Text
          style={[
            styles.btnText,
            language === "hi" && styles.activeText,
          ]}
        >
          {t("hindi")}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default LanguageScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#FFFFFF",
  },

  title: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 24,
  },

  btn: {
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#E5E7EB",
    marginBottom: 12,
  },

  active: {
    backgroundColor: "#4F46E5",
  },

  btnText: {
    textAlign: "center",
    fontWeight: "700",
    color: "#111827",
    fontSize: 15,
  },

  activeText: {
    color: "#FFFFFF",
  },
});
