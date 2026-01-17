import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useLanguage } from "../context/LanguageContext";


const OfflineScreen = ({ onRetry }: any) => {
      const { t } = useLanguage();
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {t("offline_message")}
      </Text>


      <TouchableOpacity style={styles.button} onPress={onRetry}>
        <Text style={styles.buttonText}>
          {t("refresh")}
        </Text>

      </TouchableOpacity>
    </View>
  );
};

export default OfflineScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  text: {
    color: "#E5E7EB",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  button: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 36,
    paddingVertical: 12,
    borderRadius: 999,
  },
  buttonText: {
    color: "#020617",
    fontSize: 14,
    fontWeight: "800",
  },
});
