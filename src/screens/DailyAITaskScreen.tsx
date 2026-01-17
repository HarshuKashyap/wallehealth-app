import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Platform,
  Alert,
  Modal,
  ScrollView,
   Image,
   Animated,
    } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation } from "@react-navigation/native";

import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import analytics from "@react-native-firebase/analytics"; // 👈 ADD
import notifee from "@notifee/react-native"; // ✅ ADDED (ONLY)
import { TriggerType } from "@notifee/react-native";
import { useLanguage } from "../context/LanguageContext";

import axios from "axios";

const AI_CLIENT_KEY = "walle_live_9F3kS2A8dQx7";

const markAction = async (action: string) => {
  const user = auth().currentUser;
  if (!user) return;

  const today = new Date().toISOString().split("T")[0];

  const update: any = {
    lastActionAt: firestore.FieldValue.serverTimestamp(),
    lastActionName: action,
  };

  if (action === "symptom_added") {
    update.lastSymptomAt = today;
  }

  if (action === "daily_task_completed") {
    update.lastTaskDoneAt = today;
  }

  await firestore().collection("users").doc(user.uid).set(update, {
    merge: true,
  });
};


/* ================= HELPERS ================= */

// ✅ FIXED LOCAL DATE (NO UTC BUG)
const today = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const TASKS: any = {
  water: {
    task: "Drink 8–10 glasses of water",
    reason: "Hydration supports focus and helps reduce headaches",
  },
  walk: {
    task: "Take a 10 minute walk",
    reason: "Light movement improves circulation and energy levels",
  },
  sleep: {
    task: "Sleep before 11 PM",
    reason: "Consistent sleep supports recovery and mental clarity",
  },
  breathe: {
    task: "Practice deep breathing for 5 minutes",
    reason: "Breathing exercises help calm the nervous system",
  },
  generic: {
    task: "Stretch your body for 5 minutes",
    reason: "Stretching keeps muscles active and flexible",
  },
};

const decideTaskFromSymptoms = (symptoms: any[]) => {
  const text = symptoms
    .map((s) => s.text?.toLowerCase() || "")
    .join(" ");

  if (text.includes("headache")) return TASKS.water;
  if (text.includes("fatigue") || text.includes("weak")) return TASKS.walk;
  if (text.includes("stress") || text.includes("anxiety"))
    return TASKS.breathe;
  if (text.includes("sleep")) return TASKS.sleep;

  return TASKS.generic;
};

/* ✅ DATE BASED ROTATION */
const rotateTaskByDate = (task: any, date: string) => {
  const allTasks = Object.values(TASKS);
  const index =
    date
      .split("-")
      .join("")
      .split("")
      .reduce((a, b) => a + Number(b), 0) % allTasks.length;

  return allTasks[index] || task;
};

/* ======================================================
   🔔 DAILY TASK REMINDER (MISSING PART)
   ====================================================== */

const getDailyTaskChannel = async () => {
  return await notifee.createChannel({
    id: "daily-task",
    name: "Daily Task Reminder",
    importance: 4, // HIGH
  });
};

const scheduleDailyTaskReminder = async (taskText: string) => {
  const channelId = await getDailyTaskChannel();


  const reminders = [
    { hour: 9, title: "🌅 Morning Reminder" },
    { hour: 14, title: "☀️ Afternoon Reminder" },
    { hour: 20, title: "🌙 Evening Reminder" },
  ];

  for (const r of reminders) {
    const date = new Date();
    date.setHours(r.hour, 0, 0, 0);

    if (date <= new Date()) continue;

    await notifee.createTriggerNotification(
      {
        title: r.title,
        body: `You haven’t completed today’s task:\n${taskText}`,
        android: {
          channelId,
          pressAction: { id: "default" },
        },
      },
      {
        type: notifee.TriggerType.TIMESTAMP,
        timestamp: date.getTime(),
      }
    );
  }
};

const REMINDER_ID = "DAILY_TASK_REMINDER";

const schedulePendingTaskReminder = async (taskText: string) => {
  const date = new Date();
  date.setHours(20, 0, 0, 0); // ⏰ 8 PM

  if (date.getTime() <= Date.now()) {
    date.setDate(date.getDate() + 1);
  }

  await notifee.createTriggerNotification(
    {
      id: REMINDER_ID,
      title: "🩺 Daily Health Task Pending",
      body: `You haven’t completed today’s task:\n${taskText}`,
      android: {
        channelId: "daily-task",
        importance: 4,
      },
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
    }
  );
};

const cancelPendingTaskReminder = async () => {
  await notifee.cancelNotification(REMINDER_ID);
};

/* ================= SCREEN ================= */

const DailyAITaskScreen = () => {
  const navigation = useNavigation<any>();
    const { t } = useLanguage(); // 👈 ADD

  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);


  /* 🔥 ONLY NEW STATE (POPUP) */
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

const walleAnim = useRef(new Animated.Value(0)).current;


  const user = auth().currentUser;
  const isGuest = user?.isAnonymous === true;

  useEffect(() => {
    loadDailyTask();
  }, []);



useEffect(() => {
  notifee.requestPermission();
}, []);

useEffect(() => {
  Animated.loop(
    Animated.sequence([
      Animated.timing(walleAnim, {
        toValue: -4,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.timing(walleAnim, {
        toValue: 0,
        duration: 900,
        useNativeDriver: true,
      }),
    ])
  ).start();
}, []);
useEffect(() => {
  analytics().logScreenView({
    screen_name: "Daily_Task",
    screen_class: "DailyTaskScreen",
  });

  markAction("daily_task_opened"); // 👈 ADD THIS
}, []);


  const loadDailyTask = async () => {
    try {
      const userId = user?.uid;
      const todayDate = today();

      // 👇 AGAR GUEST HAI TO FIRESTORE BILKUL USE NA KARO
      if (!userId || isGuest) {
        const aiTask = rotateTaskByDate(TASKS.generic, todayDate);

       setTasks([
         {
           id: "guest",
           task: aiTask.task,
           reason: aiTask.reason,
           completed: false,
         },
       ]);


        setLoading(false);
        return;
      }


     const dayRef = firestore()
       .collection("users")
       .doc(userId)
       .collection("daily_tasks")
       .doc(todayDate);

     // 🔥 Ye line parent date document ko create karegi
     await dayRef.set(
       { createdAt: firestore.FieldValue.serverTimestamp() },
       { merge: true }
     );

     const baseRef = dayRef.collection("tasks");


    const existingSnap = await baseRef.get();

    if (!existingSnap.empty) {
      const list = existingSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const hasReal = list.some(t => t.type !== "fallback");
      const hasFallback = list.some(t => t.type === "fallback");

      // Agar sirf real tasks hain → reuse
      if (hasReal && !hasFallback) {
        setTasks(list);
        setLoading(false);
        return;
      }

      // Agar fallback + real mix ho gaye hain,
      // to AI regenerate karenge aur fallback delete karenge
    }












      const symptomSnap = await firestore()
        .collection("users")
        .doc(userId)
        .collection("symptoms")
        .orderBy("createdAt", "desc")
        .limit(5)
        .get();


      const symptoms = symptomSnap.docs.map((d) => d.data());

      let res;

      try {
        res = await axios.post(
          "https://wallehealth-server.onrender.com/daily-tasks",
          { symptoms },
          {
            headers: {
              Authorization: `Bearer ${AI_CLIENT_KEY}`,
              "Content-Type": "application/json",
            },
            timeout: 30000, // 🔥 30s timeout (Render slow hota hai)
          }
        );
      } catch (err: any) {
        console.log("AI NETWORK ERROR:", err?.message);
        throw err; // yahin se neeche wale catch me jayega
      }

      if (!res.data?.body || !res.data?.mind || !res.data?.awareness) {
        console.log("AI BAD RESPONSE:", res.data);
        throw new Error("Invalid AI response");
      }


      const { body, mind, awareness } = res.data;







      const batch = firestore().batch();
      // 🔥 Agar pehle fallback pade ho to unko hata do
      const oldSnap = await baseRef.get();
      oldSnap.docs.forEach(d => {
        if (d.data().type === "fallback") {
          batch.delete(d.ref);
        }
      });

      const bodyRef = baseRef.doc("body");
      batch.set(bodyRef, {
        type: "body",
        task: body.task,
        reason: body.reason,
        completed: false,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      const mindRef = baseRef.doc("mind");
      batch.set(mindRef, {
        type: "mind",
        task: mind.task,
        reason: mind.reason,
        completed: false,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      const awareRef = baseRef.doc("awareness");
      batch.set(awareRef, {
        type: "awareness",
        task: awareness.task,
        reason: awareness.reason,
        completed: false,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      await batch.commit();

      setTasks([
        { id: bodyRef.id, ...body, completed: false },
        { id: mindRef.id, ...mind, completed: false },
        { id: awareRef.id, ...awareness, completed: false },
      ]);
  analytics().logEvent("daily_task_generated");
  await markAction("daily_task_generated");




await scheduleDailyTaskReminder(body.task);
await schedulePendingTaskReminder(body.task);



      setLoading(false);
    } catch (e) {
        console.log("AI TASK ERROR:", e);

        const userId = user?.uid;
        const todayDate = today();

        if (userId) {
          const dayRef = firestore()
            .collection("users")
            .doc(userId)
            .collection("daily_tasks")
            .doc(todayDate);

          const baseRef = dayRef.collection("tasks");
          const snap = await baseRef.get();

          // 🔒 Agar real AI tasks pehle se maujood hain,
          // to fallback dubara mat likho
          const hasReal = snap.docs.some(d => d.data().type !== "fallback");
          if (hasReal) {
            setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
            return;
          }

          // ⬇️ Sirf tab fallback likho jab kuch bhi real nahi hai
          const fallback = [
            TASKS.water,
            TASKS.walk,
            TASKS.breathe,
          ];

          await dayRef.set(
            { createdAt: firestore.FieldValue.serverTimestamp() },
            { merge: true }
          );

          const batch = firestore().batch();

          fallback.forEach((t, i) => {
            const ref = baseRef.doc(`fallback_${i}`);
            batch.set(ref, {
              type: "fallback",
              task: t.task,
              reason: t.reason,
              completed: false,
              createdAt: firestore.FieldValue.serverTimestamp(),
            });
          });

          await batch.commit();

          setTasks(
            fallback.map((t, i) => ({
              id: `fallback_${i}`,
              ...t,
              completed: false,
            }))
          );
        }

        setLoading(false);
      }
};
  const markAsDone = async (task: any) => {
    if (isGuest) {
      setShowLoginPopup(true);
      return;
    }

    try {
      const userId = user?.uid;
      const todayDate = today();

      const baseRef = firestore()
        .collection("users")
        .doc(userId!)
        .collection("daily_tasks")
        .doc(todayDate)
        .collection("tasks");

      await baseRef.doc(task.id).update({
        completed: true,
        completedAt: firestore.FieldValue.serverTimestamp(),
      });
  analytics().logEvent("daily_task_completed", {
    task_type: task.type || "unknown",
  });
await markAction("daily_task_completed");
  await cancelPendingTaskReminder();


      setTasks(prev =>
        prev.map(t =>
          t.id === task.id ? { ...t, completed: true } : t
        )
      );
  setShowSuccess(true);
  setTimeout(() => setShowSuccess(false), 2000);

    } catch (e) {
      console.log("MARK DONE ERROR:", e);
    }
  };


  if (loading) {
    return (
      <View style={styles.loader}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loaderText}>
          {t("daily_task_loading")}
        </Text>

      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#E5E7EB" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {t("daily_task_title")}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
      {showSuccess && (
        <View
          style={{
            backgroundColor: "rgba(34,197,94,0.15)",
            borderRadius: 18,
            padding: 14,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: "rgba(34,197,94,0.3)",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#BBF7D0", fontSize: 14, fontWeight: "700" }}>
            Great job! Aaj tumne apna khayal rakha 💙
          </Text>
        </View>
      )}

     <View style={styles.walleTopCard}>
       <Animated.View style={{ transform: [{ translateY: walleAnim }] }}>
         <Image
           source={require("../assets/walle.png")}
           style={{ width: 54, height: 54, resizeMode: "contain" }}
         />
       </Animated.View>

       <View style={{ flex: 1, marginLeft: 12 }}>
         <Text style={styles.walleTopTitle}>
           Hey, I’m WALLE 👋
         </Text>
         <Text style={styles.walleTopSub}>
           Aaj ka chhota step tumhari health ke liye 💙
         </Text>
       </View>
     </View>

{tasks.filter(t => !t.completed && t.type !== "fallback").length === 0 && (
  <View
    style={{
      marginTop: 40,
      alignItems: "center",
      padding: 24,
      borderRadius: 24,
      backgroundColor: "rgba(255,255,255,0.06)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.12)",
    }}
  >
    <Animated.View style={{ transform: [{ translateY: walleAnim }] }}>
      <Image
        source={require("../assets/walle.png")}
        style={{ width: 72, height: 72, marginBottom: 12 }}
      />
    </Animated.View>

    <Text style={{ color: "#E5E7EB", fontSize: 16, fontWeight: "800" }}>
      Aaj ke sab tasks complete ho gaye 🌙
    </Text>
    <Text
      style={{
        marginTop: 6,
        color: "#94A3B8",
        fontSize: 13,
        textAlign: "center",
      }}
    >
      Kal WALLE tumhare liye naya step lekar aayega 💙
    </Text>
  </View>
)}

        {tasks
          .filter(t => !t.completed && t.type !== "fallback")
          .map(task => (
          <LinearGradient
            key={task.id}
            colors={["#4F46E5", "#7C3AED"]}
            style={styles.card}
          >




            <Text style={styles.title}>
              {t("today_health_focus")}
            </Text>

            <Text style={styles.aiInfo}>
              {isGuest
                ? t("daily_task_guest_info")
                : t("daily_task_user_info")}
            </Text>

            <Text style={styles.task}>{task.task}</Text>

            <View style={styles.reasonBox}>
              <Ionicons
                name="information-circle-outline"
                size={18}
                color="#E0E7FF"
              />
              <Text style={styles.reason}>{task.reason}</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.doneBtn,
                task.completed && styles.doneBtnCompleted,
              ]}
              onPress={() => markAsDone(task)}
              disabled={task.completed}
            >
              <Text style={styles.doneText}>
                {isGuest
                  ? t("login_to_complete")
                  : task.completed
                  ? t("completed")
                  : t("mark_as_done")}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        ))}

        <View style={styles.bottomHint}>
          <Text style={styles.bottomHintText}>
            {t("daily_task_note")}
          </Text>
        </View>

      </ScrollView>

      <TouchableOpacity
        onPress={() => navigation.navigate("WeeklyReflection")}
        style={{ marginTop: 16, alignItems: "center" }}
      >
        <Text style={{ color: "#A5B4FC", fontWeight: "700" }}>
          View Weekly Reflection →
        </Text>
      </TouchableOpacity>






      <Modal transparent visible={showLoginPopup} animationType="fade">
        <View style={styles.popupOverlay}>
          <View style={styles.popupCard}>
            <Ionicons
              name="lock-closed-outline"
              size={44}
              color="#6366F1"
            />

            <Text style={styles.popupTitle}>
              {t("login_required")}
            </Text>

            <Text style={styles.popupText}>
              {t("login_required_desc")}
            </Text>

            <TouchableOpacity
              style={styles.popupBtn}
              onPress={() => {
                setShowLoginPopup(false);
                navigation.navigate("AuthWelcome");
              }}
            >
              <Text style={styles.popupBtnText}>
                {t("login_signup")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowLoginPopup(false)}
              style={{ marginTop: 14 }}
            >
              <Text style={styles.popupSkip}>
                {t("maybe_later")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DailyAITaskScreen;

/* ================= STYLES ================= */

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
    fontSize: 13,
    color: "#94A3B8",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop:
      Platform.OS === "android" ? StatusBar.currentHeight : 12,
    paddingBottom: 14,
  },



  headerTitle: {
    marginLeft: 16,
    fontSize: 16,
    fontWeight: "800",
    color: "#E5E7EB",
  },

  card: {
    marginTop: 20,
    borderRadius: 26,
    padding: 28,
    alignItems: "center",
    elevation: 18,
  },

  title: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
  },

walleTopCard: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "rgba(255,255,255,0.06)",
  borderRadius: 20,
  padding: 14,
  marginTop: 10,
  marginBottom: 6,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.12)",
},
walleTopTitle: {
  color: "#E5E7EB",
  fontSize: 15,
  fontWeight: "800",
},
walleTopSub: {
  marginTop: 4,
  color: "#94A3B8",
  fontSize: 12,
},

  aiInfo: {
    marginTop: 8,
    fontSize: 12,
    color: "#E0E7FF",
    textAlign: "center",
  },

  task: {
    marginTop: 14,
    fontSize: 16,
    color: "#E5E7EB",
    textAlign: "center",
    fontWeight: "600",
  },

  reasonBox: {
    marginTop: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 12,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  reason: {
    marginLeft: 8,
    fontSize: 13,
    color: "#E0E7FF",
    flex: 1,
  },

  doneBtn: {
    marginTop: 24,
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 999,
  },

  doneBtnCompleted: {
    backgroundColor: "#DCFCE7",
  },

  doneText: {
    color: "#4F46E5",
    fontSize: 14,
    fontWeight: "700",
  },

  doneTextCompleted: {
    color: "#166534",
  },

  note: {
    marginTop: 18,
    fontSize: 12,
    color: "#94A3B8",
    textAlign: "center",
  },
bottomHint: {
  marginTop: 30,
  alignSelf: "center",
  paddingHorizontal: 20,
  paddingVertical: 12,
  borderRadius: 16,
  backgroundColor: "rgba(255,255,255,0.04)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.08)",
},
bottomHintText: {
  color: "#94A3B8",
  fontSize: 12,
  textAlign: "center",
  lineHeight: 18,
},
bottomHint: {
  marginTop: 24,
  opacity: 0.85,
},

  /* 🔥 POPUP STYLES */
  popupOverlay: {
    flex: 1,
    backgroundColor: "rgba(2,6,23,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },

  popupCard: {
    width: "82%",
    backgroundColor: "#020617",
    borderRadius: 26,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  popupTitle: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: "800",
    color: "#F9FAFB",
  },

  popupText: {
    marginTop: 8,
    fontSize: 14,
    color: "#CBD5E1",
    textAlign: "center",
  },

  popupBtn: {
    marginTop: 22,
    backgroundColor: "#4F46E5",
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: 999,
  },

  popupBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  popupSkip: {
    fontSize: 13,
    color: "#94A3B8",
  },
});
