import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,          // ✅ ADD
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useLanguage } from "../context/LanguageContext";


const PRIVACY_URL =
  "https://harshukashyap.github.io/walle-privacy-policy/";

const PrivacyScreen = () => {
  const navigation = useNavigation<any>();
  const { t } = useLanguage(); // 👈 ADD

  const openPrivacyUrl = () => {
    Linking.openURL(PRIVACY_URL);
  };

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
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.headerIcon}>
          <Ionicons name="shield-checkmark-outline" size={32} color="#fff" />
        </View>

        <Text style={styles.headerTitle}>
          {t("privacy_policy")}
        </Text>
        <Text style={styles.headerSubtitle}>
          {t("privacy_subtitle")}
        </Text>

      </LinearGradient>

      {/* 📄 CONTENT */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Section
            title={t("privacy_title_1")}
            text={t("privacy_text_1")}
          />


          <Section
            title={t("privacy_title_2")}
            text={t("privacy_text_2")}
          />


          <Section
            title={t("privacy_title_3")}
            text={t("privacy_text_3")}
          />


          {/* 🌐 OPEN WEBSITE BUTTON */}
          <TouchableOpacity onPress={openPrivacyUrl} activeOpacity={0.9}>
            <LinearGradient
              colors={["#4F46E5", "#7C5CFA", "#9B7BFF"]}
              style={styles.linkBtn}
            >
              <Ionicons name="open-outline" size={18} color="#fff" />
              <Text style={[styles.linkText, { color: "#fff" }]}>
                {t("privacy_read_more")}
              </Text>
            </LinearGradient>
          </TouchableOpacity>


          <Text style={styles.footer}>
            {t("last_updated")} 2025
          </Text>

        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

export default PrivacyScreen;

/* ================= SECTION COMPONENT ================= */

const Section = ({ title, text }: any) => (
  <View style={{ marginBottom: 18 }}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <Text style={styles.text}>{text}</Text>
  </View>
);

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },

  header: {
    paddingTop: 56,
    paddingBottom: 36,
    alignItems: "center",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
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


  headerIcon: {
    backgroundColor: "rgba(255,255,255,0.18)",
    padding: 16,
    borderRadius: 40,
    marginBottom: 10,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  headerSubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: "#E0E7FF",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    elevation: 6,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 6,
  },

  text: {
    fontSize: 14,
    lineHeight: 22,
    color: "#374151",
  },

  linkBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    paddingVertical: 14,
    borderRadius: 16,
  },


  linkText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "700",
    color: "#4F46E5",
  },

  footer: {
    marginTop: 22,
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
});
