import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useLanguage } from "../context/LanguageContext";

const TermsScreen = () => {
  const navigation = useNavigation<any>();
   const { t } = useLanguage(); // 👈 ADD


  return (
    <View style={styles.container}>
      {/* 🔵 PREMIUM HEADER */}
      <LinearGradient
        colors={["#1E2A78", "#5B6CFF", "#9B7BFF"]}
        style={styles.header}
      >
        {/* 🔙 BACK BUTTON */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.iconWrap}>
          <Ionicons name="document-text-outline" size={34} color="#fff" />
        </View>

        <Text style={styles.headerTitle}>
          {t("terms")}
        </Text>
        <Text style={styles.headerSubtitle}>
          {t("terms_subtitle")}
        </Text>

      </LinearGradient>

      {/* 📄 CONTENT */}
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          {/* TERMS OF USE */}
          <Text style={styles.sectionTitle}>
            {t("terms_title_1")}
          </Text>
          <Text style={styles.text}>
            {t("terms_text_1")}
          </Text>


          {/* MEDICAL DISCLAIMER */}
          <Text style={styles.sectionTitle}>
            {t("terms_title_2")}
          </Text>
          <Text style={styles.text}>
            {t("terms_text_2")}
          </Text>


          {/* ACCOUNT RESPONSIBILITY */}
          <Text style={styles.sectionTitle}>
            {t("terms_title_3")}
          </Text>
          <Text style={styles.text}>
            {t("terms_text_3")}
          </Text>


          {/* LIMITATION OF LIABILITY */}
          <Text style={styles.sectionTitle}>
            {t("terms_title_4")}
          </Text>
          <Text style={styles.text}>
            {t("terms_text_4")}
          </Text>

          {/* EXTERNAL TERMS LINK */}
          <TouchableOpacity
            style={styles.linkBtn}
            onPress={() =>
              Linking.openURL(
                "https://harshukashyap.github.io/walle-terms/"
              )
            }
          >

          </TouchableOpacity>

          <Text style={styles.footer}>
            {t("last_updated")} 2025
          </Text>

        </View>
      </ScrollView>
    </View>
  );
};

export default TermsScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },

  header: {
    paddingTop: 56,
    paddingBottom: 34,
    alignItems: "center",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  backBtn: {
    position: "absolute",
    left: 16,
    top: 56,
    height: 42,
    width: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  iconWrap: {
    backgroundColor: "rgba(255,255,255,0.18)",
    padding: 16,
    borderRadius: 40,
    marginBottom: 10,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#fff",
  },

  headerSubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: "#E0E7FF",
  },

  content: {
    padding: 20,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 22,
    elevation: 6,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
    marginTop: 16,
  },

  text: {
    fontSize: 14,
    lineHeight: 22,
    color: "#374151",
  },

  email: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "800",
    color: "#4F46E5",
  },

  linkBtn: {
    marginTop: 22,
    alignItems: "center",
  },

  linkText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#4F46E5",
  },

  footer: {
    marginTop: 28,
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
});
