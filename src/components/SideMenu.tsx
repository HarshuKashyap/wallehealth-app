import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import auth from "@react-native-firebase/auth";
import { useLanguage } from "../context/LanguageContext";

export default function SideMenu({
  onClose,
  navigation,
  userName,
}: any) {
    const { t } = useLanguage();

  const [showLogout, setShowLogout] = useState(false);

  const go = (screen: string) => {
    onClose();
    navigation.navigate(screen);
  };

  const confirmLogout = async () => {
    setShowLogout(false);
    onClose();
    await auth().signOut();
    navigation.reset({
      index: 0,
      routes: [{ name: "AuthWelcome" }],
    });
  };

  const isGuest = !userName || userName === "Guest User";

  return (
    <SafeAreaView style={styles.menu} edges={["top"]}>
      {/* ================= HEADER ================= */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {userName?.charAt(0)?.toUpperCase() || "G"}
          </Text>
        </View>

        <View>
          <Text style={styles.name}>{userName || "Guest User"}</Text>
          <Text style={styles.role}>
            {isGuest ? t("role_guest") : t("role_health")}
          </Text>

        </View>
      </View>

      {/* ================= MENU ITEMS ================= */}
      <MenuItem
        icon="person-outline"
        label={t("menu_profile")}
        onPress={() => go("Profile")}
      />

      <MenuItem
        icon="analytics-outline"
        label={t("menu_analytics")}
        onPress={() => go("Analytics")}
      />

      <MenuItem
        icon="settings-outline"
        label={t("menu_settings")}
        onPress={() => go("Settings")}
      />

      <MenuItem
        icon="log-out-outline"
        label={t("menu_logout")}
        danger
        onPress={() => setShowLogout(true)}
      />


      {/* ================= LOGOUT MODAL ================= */}
      <Modal
        visible={showLogout}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogout(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.logoutCard}>
            <Ionicons
              name="log-out-outline"
              size={36}
              color="#F87171"
              style={{ marginBottom: 10 }}
            />

           <Text style={styles.logoutTitle}>
             {t("logout_title")}
           </Text>


<Text style={styles.logoutText}>
  {t("logout_message")}
</Text>


            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowLogout(false)}
              >
               <Text style={styles.cancelText}>
                 {t("cancel")}
               </Text>

              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={confirmLogout}
              >
                <Text style={styles.confirmText}>
                  {t("logout")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const MenuItem = ({ icon, label, onPress, danger }: any) => (
  <TouchableOpacity
    style={styles.item}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Ionicons
      name={icon}
      size={20}
      color={danger ? "#F87171" : "#A5B4FC"}
    />
    <Text style={[styles.label, danger && { color: "#F87171" }]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const Divider = () => <View style={styles.divider} />;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  menu: {
    flex: 1,
    backgroundColor: "#020617",
    paddingHorizontal: 22,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 34,
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },

  name: {
    fontSize: 17,
    fontWeight: "800",
    color: "#E5E7EB",
  },

  role: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 2,
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },

  label: {
    marginLeft: 14,
    fontSize: 15,
    fontWeight: "600",
    color: "#E5E7EB",
  },

  divider: {
    height: 1,
    backgroundColor: "#1E293B",
    marginVertical: 18,
  },

  /* LOGOUT MODAL */

  overlay: {
    flex: 1,
    backgroundColor: "rgba(2,6,23,0.75)",
    justifyContent: "center",
    alignItems: "center",
  },

  logoutCard: {
    width: "85%",
    backgroundColor: "#020617",
    borderRadius: 20,
    padding: 22,
    alignItems: "center",
  },

  logoutTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#F9FAFB",
    marginBottom: 6,
  },

  logoutText: {
    fontSize: 14,
    color: "#CBD5E1",
    textAlign: "center",
    marginBottom: 20,
  },

  actions: {
    flexDirection: "row",
    width: "100%",
  },

  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "#1E293B",
    alignItems: "center",
    marginRight: 8,
  },

  cancelText: {
    color: "#E5E7EB",
    fontWeight: "700",
  },

  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "#EF4444",
    alignItems: "center",
    marginLeft: 8,
  },

  confirmText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
});
