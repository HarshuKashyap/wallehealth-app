import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ScrollView,
  Modal,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import auth from "@react-native-firebase/auth";
import { useNavigation } from "@react-navigation/native";
import DeviceInfo from "react-native-device-info";
import { useLanguage } from "../context/LanguageContext";
import { isGuestUser } from "../utils/authUtils";

const SettingsScreen = () => {
  const navigation = useNavigation<any>();
  const { t } = useLanguage();

  const [showDelete, setShowDelete] = useState(false);
  const [showReLogin, setShowReLogin] = useState(false);

  const isGuest = isGuestUser();
  const appVersion = DeviceInfo.getVersion();

  /* ================= DELETE ACCOUNT ================= */
  const confirmDeleteAccount = async () => {
    try {
      const user = auth().currentUser;
      if (!user) return;

      await user.delete();

      navigation.reset({
        index: 0,
        routes: [{ name: "AuthWelcome" }],
      });
    } catch (e) {
      setShowDelete(false);
      setShowReLogin(true); // ✅ PREMIUM ALERT
    }
  };

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* 🔵 HEADER */}
        <LinearGradient
           colors={["#1E2A78", "#5B6CFF", "#9B7BFF"]}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerIcon}>
            <Ionicons name="settings-outline" size={28} color="#fff" />
          </View>

          <Text style={styles.headerTitle}>{t("settings")}</Text>
          <Text style={styles.headerSubtitle}>
            {t("settings_subtitle")}
          </Text>
        </LinearGradient>

        {/* ⚙️ GENERAL */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("general")}</Text>

          <SettingItem
            icon="language-outline"
            label={t("language")}
            onPress={() => navigation.navigate("Language")}
          />

          <SettingItem
            icon="shield-checkmark-outline"
            label={t("privacy_policy")}
            onPress={() => navigation.navigate("Privacy")}
          />

          <SettingItem
            icon="document-text-outline"
            label={t("terms")}
            onPress={() => navigation.navigate("Terms")}
          />

          <SettingItem
            icon="call-outline"
            label={t("contact_us")}
            onPress={() =>
              Linking.openURL("mailto:walleapp.care@gmail.com")
            }
          />
        </View>

        {/* ⚠️ DANGER ZONE */}
        {!isGuest && (
          <View style={styles.section}>
            <Text style={styles.sectionTitleDanger}>
              {t("danger_zone")}
            </Text>

            <TouchableOpacity
              style={styles.deleteCard}
              onPress={() => setShowDelete(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
              <Text style={styles.deleteText}>
                {t("delete_account")}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ✅ VERSION */}
        <View style={styles.versionBox}>
          <Text style={styles.versionText}>
            Version {appVersion}
          </Text>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* 🗑️ DELETE ACCOUNT MODAL */}
      <Modal transparent visible={showDelete} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Ionicons name="warning-outline" size={44} color="#EF4444" />

            <Text style={styles.modalTitle}>
              {t("delete_account")}
            </Text>

            <Text style={styles.modalMessage}>
              {t("delete_warning")}
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setShowDelete(false)}
              >
                <Text style={styles.modalCancelText}>
                  {t("cancel")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalDelete}
                onPress={confirmDeleteAccount}
              >
                <Text style={styles.modalDeleteText}>
                  {t("delete")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 🔐 RE-LOGIN REQUIRED PREMIUM MODAL */}
      <Modal transparent visible={showReLogin} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Ionicons
              name="lock-closed-outline"
              size={44}
              color="#F59E0B"
            />

            <Text style={styles.modalTitle}>
              {t("login_required")}
            </Text>

            <Text style={styles.modalMessage}>
              {t("login_required_desc")}
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setShowReLogin(false)}
              >
                <Text style={styles.modalCancelText}>
                  {t("cancel")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalDelete}
                onPress={async () => {
                  setShowReLogin(false);
                  await auth().signOut();
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "AuthWelcome" }],
                  });
                }}
              >
                <Text style={styles.modalDeleteText}>
                  {t("login_signup")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default SettingsScreen;

/* ================= COMPONENT ================= */

const SettingItem = ({ icon, label, onPress }: any) => (
  <TouchableOpacity style={styles.item} onPress={onPress}>
    <View style={styles.itemLeft}>
      <Ionicons name={icon} size={20} color="#4F46E5" />
      <Text style={styles.itemText}>{label}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
  </TouchableOpacity>
);

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FB" },

  header: {
    alignItems: "center",
    paddingTop: 56,
    paddingBottom: 36,
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
    padding: 14,
    borderRadius: 30,
  },

  headerTitle: {
    marginTop: 14,
    fontSize: 24,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  headerSubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: "#E0E7FF",
  },

  section: { marginTop: 28, paddingHorizontal: 20 },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#6B7280",
    marginBottom: 12,
    textTransform: "uppercase",
  },

  sectionTitleDanger: {
    fontSize: 14,
    fontWeight: "800",
    color: "#EF4444",
    marginBottom: 12,
    textTransform: "uppercase",
  },

  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 18,
    marginBottom: 14,
    elevation: 4,
  },

  itemLeft: { flexDirection: "row", alignItems: "center" },

  itemText: {
    marginLeft: 14,
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },

  deleteCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },

  deleteText: {
    marginLeft: 14,
    fontSize: 15,
    fontWeight: "800",
    color: "#EF4444",
  },

  versionBox: { alignItems: "center", marginTop: 24 },

  versionText: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "600",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(2,6,23,0.75)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalCard: {
    width: "85%",
    backgroundColor: "#020617",
    borderRadius: 22,
    padding: 24,
    alignItems: "center",
  },

  modalTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "800",
    color: "#F9FAFB",
  },

  modalMessage: {
    marginTop: 6,
    fontSize: 14,
    color: "#CBD5E1",
    textAlign: "center",
    marginBottom: 22,
  },

  modalActions: { flexDirection: "row", width: "100%" },

  modalCancel: {
    flex: 1,
    backgroundColor: "#1E293B",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    marginRight: 8,
  },

  modalCancelText: {
    color: "#E5E7EB",
    fontWeight: "700",
  },

  modalDelete: {
    flex: 1,
    backgroundColor: "#4F46E5",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    marginLeft: 8,
  },

  modalDeleteText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
});
