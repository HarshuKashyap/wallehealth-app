import React, { useEffect, useState } from "react";
import { Buffer } from "buffer";
(global as any).Buffer = Buffer;

import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";

import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import axios from "axios";
import RNFS from "react-native-fs";
import Share from "react-native-share";


const AI_CLIENT_KEY = "walle_live_9F3kS2A8dQx7";
const isSunday = () => new Date().getDay() === 0;

const getLast7Days = () => {
  const days: string[] = [];
  const d = new Date();
  for (let i = 0; i < 7; i++) {
    const x = new Date(d);
    x.setDate(d.getDate() - i);
    const y = x.getFullYear();
    const m = String(x.getMonth() + 1).padStart(2, "0");
    const day = String(x.getDate()).padStart(2, "0");
    days.push(`${y}-${m}-${day}`);
  }
  return days;
};

export default function WeeklyReflectionScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [weekData, setWeekData] = useState<any[]>([]);


  useEffect(() => {
    loadReflection();
  }, []);

  const loadReflection = async () => {
    try {
      // 🔒 Sirf Sunday ko generate karo
      if (!isSunday()) {
        setText("Your weekly reflection will be ready on Sunday.");
        setLoading(false);
        return;
      }

      const user = auth().currentUser;
      if (!user) return;


      const dates = getLast7Days();
      const days: any[] = [];

      for (const d of dates) {
        const dayRef = firestore()
          .collection("users")
          .doc(user.uid)
          .collection("daily_tasks")
          .doc(d);

        const tasksSnap = await dayRef.collection("tasks").get();

        const total = tasksSnap.size;
        const done = tasksSnap.docs.filter(t => t.data().completed).length;

        const symSnap = await firestore()
          .collection("users")
          .doc(user.uid)
          .collection("symptoms")
          .where("date", "==", d)
          .get();

        const symptoms = symSnap.docs.map(s => s.data().text);

      if (total === 0 && symptoms.length === 0) {
        continue; // is din ko skip karo
      }

   days.push({
       symptoms: symptoms.length ? symptoms : ["None"],
       done,
       total,
     });


      }
  setWeekData(days);

      const res = await axios.post(
        "https://wallehealth-server.onrender.com/weekly-summary",
        { days },
        {
          headers: {
            Authorization: `Bearer ${AI_CLIENT_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      setText(res.data.message);
      setLoading(false);
    } catch (e) {
      console.log(e);
      setText("We couldn’t generate your reflection right now.");
      setLoading(false);
    }
  };

  const downloadAndSharePDF = async () => {
    try {
      if (!weekData.length) {
        alert("Not enough data to generate report yet.");
        return;
      }

      const user = auth().currentUser;
      if (!user) return;

      // 🔥 YAHAN USER KA REAL NAME FIRESTORE SE LO
      const userDoc = await firestore()
        .collection("users")
        .doc(user.uid)
        .get();

      const profileName = userDoc.exists
        ? userDoc.data()?.name
        : null;

      const finalName =
        profileName && profileName.trim().length > 0
          ? profileName
          : "User";

      const filePath = `${RNFS.DownloadDirectoryPath}/WALLE_Weekly_Report.pdf`;

      const body = {
        userName: finalName,   // 👈 ab yahan email nahi, profile ka name jayega
        message: text,
        days: weekData,
      };

      const response = await fetch(
        "https://wallehealth-server.onrender.com/weekly-report-pdf",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${AI_CLIENT_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        throw new Error("Server did not return PDF");
      }

      const arrayBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");

      await RNFS.writeFile(filePath, base64, "base64");

      await Share.open({
        url: `file://${filePath}`,
        type: "application/pdf",
        title: "Share with Doctor",
      });
    } catch (e) {
      console.log("PDF ERROR:", e);
      alert("Could not generate report right now.");
    }
  };







  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loaderText}>Analyzing your week…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#E5E7EB" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Weekly Reflection</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>


        <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={styles.card}>
          <Ionicons name="heart-outline" size={36} color="#fff" />
          <Text style={styles.title}>Your Weekly Reflection</Text>
          <Text style={styles.text}>{text}</Text>
        </LinearGradient>
        {!text.includes("Sunday") && (
          <TouchableOpacity
            style={styles.shareBtn}
            onPress={downloadAndSharePDF}
          >
            <Text style={styles.shareText}>Share with Doctor</Text>
          </TouchableOpacity>
        )}


      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    padding: 20,
  },
  loader: {
    flex: 1,
    backgroundColor: "#020617",
    justifyContent: "center",
    alignItems: "center",
  },
  loaderText: {
    marginTop: 12,
    color: "#94A3B8",
  },
  card: {
    marginTop: 20,
    borderRadius: 26,
    padding: 26,
  },
  title: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  text: {
    marginTop: 14,
    fontSize: 15,
    color: "#E5E7EB",
    lineHeight: 22,
  },
header: {
  flexDirection: "row",
  alignItems: "center",
  paddingTop: Platform.OS === "android" ? 32 : 12,
  paddingBottom: 14,
},
headerTitle: {
  marginLeft: 16,
  fontSize: 16,
  fontWeight: "800",
  color: "#E5E7EB",
},

shareBtn: {
  marginTop: 20,
  backgroundColor: "#FFFFFF",
  paddingVertical: 10,
  paddingHorizontal: 24,
  borderRadius: 999,
  alignSelf: "center",
},
shareText: {
  color: "#4F46E5",
  fontWeight: "800",
  fontSize: 13,
},

});

