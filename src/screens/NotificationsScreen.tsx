import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import LinearGradient from "react-native-linear-gradient";

import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { useLanguage } from "../context/LanguageContext";


type NotificationItem = {
  id: string;
  title: string;
  message: string;
  screen: string;
  read: boolean;
  createdAt?: any;
  expiresAt?: any;
};

const NotificationsScreen = ({ navigation }: any) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();


  /* ================= LOAD NOTIFICATIONS ================= */
  useEffect(() => {
    const user = auth().currentUser;

    if (!user || user.isAnonymous) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const unsubscribe = firestore()
      .collection("users")
      .doc(user.uid)
      .collection("notifications")
      .orderBy("createdAt", "desc")

      .onSnapshot(
        (snap) => {
          if (!snap || snap.empty) {
            setNotifications([]);
            setLoading(false);
            return;
          }

          const list = snap.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as any),
          }));

          setNotifications(list);
          setLoading(false);
        },
        () => setLoading(false)
      );

    return unsubscribe;
  }, []);

  /* ================= 30 DAYS AUTO CLEAR ================= */
  useEffect(() => {
    const user = auth().currentUser;
    if (!user) return;

    const cleanup = async () => {
      const now = new Date();

      const snap = await firestore()
        .collection("users")
        .doc(user.uid)
        .collection("notifications")
        .where("expiresAt", "<=", now)
        .get();

      snap.forEach((doc) => doc.ref.delete());
    };

    cleanup();
  }, []);




  /* ================= READ = DELETE ================= */
  const markAsReadAndOpen = async (item: NotificationItem) => {
    try {
      const ref = firestore()
        .collection("users")
        .doc(auth().currentUser!.uid)
        .collection("notifications")
        .doc(item.id);

      // 1️⃣ Pehle read=true karo (red dot hat jaayega)
      await ref.update({ read: true });

      // 2️⃣ Thoda delay, phir delete (list se gayab ho jaaye)
      setTimeout(async () => {
        await ref.delete();
      }, 300);
    } catch (e) {}

    if (item.screen) {
      navigation.navigate(item.screen);
    }
  };


  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />

      <LinearGradient colors={["#020617", "#020617"]} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {t("notifications")}
        </Text>

        <View style={{ width: 22 }} />
      </LinearGradient>

      {!loading && notifications.length === 0 && (
        <View style={styles.emptyWrap}>
          <Ionicons name="notifications-off-outline" size={42} color="#64748B" />
          <Text style={styles.emptyText}>
            {t("no_notifications")}
          </Text>

        </View>
      )}

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, !item.read && styles.unreadCard]}
            onPress={() => markAsReadAndOpen(item)}
            activeOpacity={0.8}
          >
            <View style={styles.iconWrap}>
              <Ionicons name="notifications" size={18} color="#6366F1" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.message}>{item.message}</Text>
            </View>

            {!item.read && <View style={styles.redDot} />}
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default NotificationsScreen;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#020617" },
  header: {
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#fff" },
  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { marginTop: 8, color: "#64748B" },
  card: {
    backgroundColor: "#020617",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  unreadCard: {
    borderColor: "#6366F1",
    backgroundColor: "rgba(99,102,241,0.08)",
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    backgroundColor: "rgba(99,102,241,0.15)",
  },
  title: { color: "#E5E7EB", fontSize: 14, fontWeight: "700" },
  message: { color: "#94A3B8", fontSize: 12, marginTop: 2 },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    marginLeft: 6,
  },
});
