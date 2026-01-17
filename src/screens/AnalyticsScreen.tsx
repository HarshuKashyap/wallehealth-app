import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import analytics from "@react-native-firebase/analytics";
import { LineChart } from "react-native-chart-kit";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { useLanguage } from "../context/LanguageContext";

type ChartData = {
  day: string;
  count: number;
};

const screenWidth = Dimensions.get("window").width;
const AI_CLIENT_KEY = "walle_live_9F3kS2A8dQx7";

const AnalyticsScreen = () => {
  const navigation = useNavigation<any>();
    const { t } = useLanguage(); // 👈 ADD

  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [aiMessage, setAiMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);

useEffect(() => {
  analytics().logScreenView({
    screen_name: "Analytics",
    screen_class: "AnalyticsScreen",
  });
}, []);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    const user = auth().currentUser;
    if (!user || user.isAnonymous) {
      setAiMessage(t("analytics_login_required"));

      setLoading(false);
      return;
    }

    try {
      const snap = await firestore()
        .collection("users")
        .doc(user.uid)
        .collection("symptoms")
        .orderBy("createdAt", "asc")
        .get();


      if (snap.empty) {
        setAiMessage(t("analytics_start_logging"));

        setLoading(false);
        return;
      }

      /* ================= REAL DATA ================= */
      const grouped: Record<string, number> = {};
      const detailedSymptoms: any[] = [];
      const activeDays = new Set<string>();

      snap.docs.forEach((doc) => {
        const d = doc.data();
        if (!d.createdAt) return;

        const dateObj = d.createdAt.toDate();
        const dateKey = dateObj.toISOString().split("T")[0];
        activeDays.add(dateKey);

        grouped[dateKey] = (grouped[dateKey] || 0) + 1;

       detailedSymptoms.push({
         symptom: d.text || "Unknown symptom",
         notes: "",
         date: dateObj.toDateString(),
       });
      });

      /* ================= SORTED CHART DATA (FIX) ================= */
      const formattedChart = Object.keys(grouped)
        .sort()
        .map((day) => ({
          day,
          count: grouped[day],
        }));

      setChartData(formattedChart);

      /* ================= STREAK (SAFE FIX) ================= */
      const sortedDays = Array.from(activeDays).sort();
      let currentStreak = 1;

      for (let i = sortedDays.length - 1; i > 0; i--) {
        const today = new Date(sortedDays[i]);
        const prev = new Date(sortedDays[i - 1]);
        const diff =
          (today.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);

        if (diff === 1) currentStreak++;
        else break;
      }

      setStreak(currentStreak);

      /* ================= TIME CONTEXT ================= */
      const hour = new Date().getHours();
      const timeLine =
        hour < 12
          ? `🌅 ${t("morning_checkin")}`
          : hour < 18
          ? `☀️ ${t("afternoon_reflection")}`
          : `🌙 ${t("evening_reflection")}`;


      /* ================= AI CALL ================= */
      const res = await axios.post(
        "https://wallehealth-server.onrender.com/symptom-summary",
        { symptoms: detailedSymptoms.slice(-15) }, // 🔥 last data only
        {
          headers: {
            Authorization: `Bearer ${AI_CLIENT_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 15000,
        }
      );

     setAiMessage(
       `${timeLine}\n\n${res.data?.summary}\n\n💡 ${t("analytics_tip")}`
     );



      setLoading(false);
    } catch (e) {
     setAiMessage(t("analytics_error"));

      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loaderText}>
          {t("analytics_loading")}
        </Text>

      </View>
    );
  }

  const chartConfigData = {
    labels: chartData.map((i) => i.day.slice(5)),
    datasets: [{ data: chartData.map((i) => i.count) }],
  };

  return (
    <ScrollView style={styles.container}>
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

        <Ionicons name="analytics" size={32} color="#fff" />
        <Text style={styles.headerTitle}>
          {t("analytics_title")}
        </Text>
        <Text style={styles.headerSubtitle}>
          {t("analytics_subtitle")}
        </Text>

      </LinearGradient>
{streak > 0 && (
  <View style={[styles.section, { marginTop: 16 }]}>
    <View style={styles.streakCard}>
      <Text style={styles.streakText}>🔥 {streak} {t("day_streak")}</Text>
      <Text style={styles.streakSub}>Keep showing up for yourself 💙</Text>
    </View>
  </View>
)}

      {/* CHART */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t("symptom_trends")}
        </Text>

        <View style={styles.card}>
          {chartData.length < 2 ? (
            <Text style={styles.noDataText}>
              {t("analytics_no_data")}
            </Text>

          ) : (
            <LineChart
              data={chartConfigData}
              width={screenWidth - 72}
              height={220}
              fromZero
              bezier
              chartConfig={{
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                decimalPlaces: 0,
                color: () => "#4F46E5",
                labelColor: () => "#6B7280",
              }}
              style={{ borderRadius: 16 }}
            />
          )}
        </View>
      </View>

      {/* AI INSIGHT */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t("ai_health_insight")}
        </Text>


        <View style={styles.aiCard}>
          <Ionicons name="sparkles" size={18} color="#4F46E5" />
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#A5B4FC", fontWeight: "700", marginBottom: 6 }}>
              WALLE says:
            </Text>
            <Text style={styles.aiText}>
              {aiMessage.replace(/[#*]/g, "")}
            </Text>
          </View>
        </View>



        <TouchableOpacity
          style={styles.addMore}
          onPress={() => navigation.navigate("AddSymptoms")}
        >
          <Ionicons name="add-circle-outline" size={18} color="#4F46E5" />
          <Text style={styles.addMoreText}>
            {t("analytics_add_more")}
          </Text>

        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

export default AnalyticsScreen;

/* ================= STYLES (UNCHANGED) ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020617" },

  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  loaderText: { marginTop: 12, color: "#94A3B8" },


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

  headerTitle: {
    marginTop: 12,
    fontSize: 24,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    marginTop: 6,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "500",
  },


  section: { paddingHorizontal: 20, marginTop: 28 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 12,
    color: "#E5E7EB",
  },


  card: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 24,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  noDataText: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    paddingVertical: 40,
  },
  aiCard: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 24,
    padding: 18,
    flexDirection: "row",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
streakCard: {
  backgroundColor: "rgba(99,102,241,0.12)",
  borderRadius: 18,
  padding: 14,
  borderWidth: 1,
  borderColor: "rgba(99,102,241,0.3)",
},
streakText: {
  color: "#E5E7EB",
  fontWeight: "900",
  fontSize: 16,
},
streakSub: {
  marginTop: 4,
  color: "#A5B4FC",
  fontSize: 12,
},

  aiText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#E5E7EB",
    lineHeight: 20,
  },

  addMore: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  addMoreText: {
    color: "#4F46E5",
    fontWeight: "700",
  },
});
