import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import AppHeader from "../components/AppHeader";
import { useLanguage } from "../context/LanguageContext";

const ContactScreen = () => {
    const { t } = useLanguage();
  return (
    <View style={styles.container}>
      {/* ✅ HEADER */}
      <AppHeader title={t("contact_title")} />


      <View style={styles.card}>
        <Ionicons name="mail-outline" size={26} color="#4F46E5" />
        <Text style={styles.title}>
          {t("contact_need_help")}
        </Text>


        <Text style={styles.text}>
          {t("contact_description")}
        </Text>


        <Text style={styles.email}>support@walle.app</Text>
      </View>
    </View>
  );
};

export default ContactScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    elevation: 4,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  card: {
    backgroundColor: "#FFFFFF",
    margin: 20,
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
    elevation: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    marginTop: 10,
    color: "#111827",
  },
  text: {
    marginTop: 8,
    fontSize: 14,
    textAlign: "center",
    color: "#6B7280",
  },
  email: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: "800",
    color: "#4F46E5",
  },
});
