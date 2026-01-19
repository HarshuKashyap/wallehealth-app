import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
  Modal,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLanguage } from "../context/LanguageContext";
import Ionicons from "react-native-vector-icons/Ionicons";
import SideMenu from "../components/SideMenu";
import { useNavigation } from "@react-navigation/native";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import analytics from "@react-native-firebase/analytics";

const { width } = Dimensions.get("window");
const MENU_WIDTH = width * 0.78;
const markAction = async (action: string) => {
  const user = auth().currentUser;
  if (!user) return;

  await firestore().collection("users").doc(user.uid).set(
    {
      lastActionAt: firestore.FieldValue.serverTimestamp(),
      lastActionName: action,
    },
    { merge: true }
  );
};

export default function HomeScreen() {
    useEffect(() => {
      analytics().logScreenView({
        screen_name: "Home",
        screen_class: "HomeScreen",
      });

      markAction("home_opened");
    }, []);


  const navigation = useNavigation<any>();
  const { t, language } = useLanguage();

  const [greeting, setGreeting] = useState("");
  const [subGreeting, setSubGreeting] = useState("");
  const [walleLine, setWalleLine] = useState("");
  const walleAnim = useRef(new Animated.Value(0)).current;
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [energy, setEnergy] = useState(50);
  const [mood, setMood] = useState<"happy" | "normal" | "sad">("normal");
  const [streak, setStreak] = useState(0);


  const [open, setOpen] = useState(false);
  const translateX = useRef(new Animated.Value(-MENU_WIDTH)).current;

  const [userName, setUserName] = useState("Guest User");
  const [showGuide, setShowGuide] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const markUserActive = async () => {
    const user = auth().currentUser;
    if (!user) return;

    const today = new Date().toISOString().split("T")[0];
    const ref = firestore().collection("users").doc(user.uid);
    const snap = await ref.get();

    let streak = 1;

    if (snap.exists) {
      const lastDate = snap.data()?.lastOpenDate;

      if (lastDate) {
        const prev = new Date(lastDate);
        const curr = new Date(today);

        const diff = Math.floor(
          (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diff === 0) {
          return;
        }

        if (diff === 1) {
          streak = (snap.data()?.streak || 0) + 1;
        } else {
          streak = 1;

          const shownKey = `CHAIN_BREAK_${today}`;
          const alreadyShown = await AsyncStorage.getItem(shownKey);

          if (!alreadyShown) {
            setAiMessage(
              "Kal tum nahi aaye the, koi baat nahi – aaj se naya streak shuru karte hain 💙"
            );
            await AsyncStorage.setItem(shownKey, "true");
          }
        }
      }
    }

    await ref.set(
      {
        lastActive: firestore.FieldValue.serverTimestamp(),
        lastOpenDate: today,
        streak: streak,
      },
      { merge: true }
    );
  };

  useEffect(() => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      setGreeting(t("home_morning_title"));
      setSubGreeting(t("home_morning_sub"));
      setWalleLine(t("walle_morning"));
    } else if (hour >= 12 && hour < 18) {
      setGreeting(t("home_day_title"));
      setSubGreeting(t("home_day_sub"));
      setWalleLine(t("walle_day"));
    } else if (hour >= 18 && hour < 24) {
      setGreeting(t("home_evening_title"));
      setSubGreeting(t("home_evening_sub"));
      setWalleLine(t("walle_evening"));
    } else {
      setGreeting(t("home_late_title"));
      setSubGreeting(t("home_late_sub"));
      setWalleLine(t("walle_night"));

    }
  }, [language]);

  useEffect(() => {
    const user = auth().currentUser;
    if (!user) return;

    if (user.isAnonymous) {
      setUserName("Guest User");
      return;
    }

    const unsubscribe = firestore()
      .collection("users")
      .doc(user.uid)
      .onSnapshot((snap) => {
        if (snap.exists) {
          const s = snap.data()?.streak || 0;
          setUserName(snap.data()?.name || "User");
          setStreak(s);

          let e = Math.min(100, 20 + s * 15);
          setEnergy(e);

          if (e >= 70) setMood("happy");
          else if (e >= 40) setMood("normal");
          else setMood("sad");
        }
      });

    return unsubscribe;
  }, []);

useEffect(() => {
  Animated.loop(
    Animated.sequence([
      Animated.timing(walleAnim, {
        toValue: -6,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(walleAnim, {
        toValue: 0,
        duration: 1200,
        useNativeDriver: true,
      }),
    ])
  ).start();
}, []);


  useEffect(() => {
    const checkFirstTime = async () => {
      const seen = await AsyncStorage.getItem("HOME_GUIDE_SEEN");
      if (!seen) {
        setShowGuide(true);
        await AsyncStorage.setItem("HOME_GUIDE_SEEN", "true");
      }
    };
    checkFirstTime();
  }, []);

  useEffect(() => {
    const user = auth().currentUser;
    if (!user || user.isAnonymous) {
      setHasUnread(false);
      return;
    }

    const unsubscribe = firestore()
      .collection("users")
      .doc(user.uid)
      .collection("notifications")
      .where("read", "==", false)
      .onSnapshot((snap) => {
        setHasUnread(!snap.empty);
      });

    return unsubscribe;
  }, []);

  useEffect(() => {
    markUserActive();
  }, []);

  const openMenu = () => {
    setOpen(true);
    Animated.timing(translateX, {
      toValue: 0,
      duration: 280,
      useNativeDriver: true,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(translateX, {
      toValue: -MENU_WIDTH,
      duration: 280,
      useNativeDriver: true,
    }).start(() => setOpen(false));
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#020617" }}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />

      <View style={styles.header}>
        <TouchableOpacity onPress={openMenu}>
          <Ionicons name="menu" size={26} color="#E5E7EB" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>WALLE</Text>

        <TouchableOpacity
          onPress={() => {
            setHasUnread(false);
            navigation.navigate("Notifications");
          }}
          style={{ marginLeft: "auto", padding: 6 }}
        >
          <Ionicons name="notifications-outline" size={22} color="#E5E7EB" />
          {hasUnread && <View style={styles.dot} />}
        </TouchableOpacity>
      </View>

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            padding: 20,
            paddingBottom: 120,
          }}
          showsVerticalScrollIndicator={false}
        >
          {aiMessage && (
            <View style={styles.aiMessageCard}>
              <Ionicons name="sparkles" size={22} color="#6366F1" />
              <Text style={styles.aiMessageText}>{aiMessage}</Text>
              <TouchableOpacity onPress={() => setAiMessage(null)}>
                <Text style={styles.aiDismiss}>Got it</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 🔥 WALLE FIRST IMPRESSION CARD */}
          {/* 🌟 HERO WALLE ZONE */}
          <View style={styles.heroWalle}>
            <TouchableOpacity
              activeOpacity={0.9}
              onLongPress={() => {
                const hour = new Date().getHours();
                if (hour >= 0 && hour <= 4) {
                  navigation.navigate("SecretMode");
                } else {
                  setAiMessage("Ye raasta raat ke liye hai… 12 baje ke baad try karo 🌙");
                }
              }}
            >
              <Animated.Image
                source={
                  mood === "happy"
                    ? require("../assets/walle_happy.png")
                    : mood === "sad"
                    ? require("../assets/walle_sad.png")
                    : require("../assets/walle.png")
                }
                style={[
                  styles.heroImg,
                  { transform: [{ translateY: walleAnim }] },
                ]}
              />
            </TouchableOpacity>

            <Text style={styles.heroLine}>
              {mood === "happy"
                ? "Tum aaye, mujhe energy mil gayi 💙"
                : mood === "sad"
                ? "Aaj tum nahi aaye the… main thoda dull ho gaya hoon."
                : "Main yahin hoon, tumhara saath dene ke liye."}
            </Text>

            <Text style={styles.heroMeta}>
              Energy: {energy}%  •  Streak: {streak} days 🔥
            </Text>
          </View>


          <Text style={styles.heading}>{greeting}</Text>
          <Text style={styles.subHeading}>{subGreeting}</Text>

          <TouchableOpacity
            style={styles.walleTaskCard}
            onPress={() => {
              analytics().logEvent("daily_task_opened");
              markAction("daily_task_opened");
              navigation.navigate("DailyTask");
            }}

            activeOpacity={0.85}
          >
            <Image
              source={require("../assets/walle.png")}
              style={{ width: 42, height: 42, resizeMode: "contain" }}
            />

            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.walleTaskTitle}>{t("daily_task")}</Text>
              <Text style={styles.walleTaskSub}>{t("daily_task_desc")}</Text>

            </View>

            <Ionicons name="chevron-forward" size={22} color="#A5B4FC" />
          </TouchableOpacity>


         <TouchableOpacity
           style={styles.walleTaskCard}
           onPress={() => {
             analytics().logEvent("add_symptom_opened");
             markAction("add_symptom_opened");
             navigation.navigate("AddSymptoms");
           }}

           activeOpacity={0.85}
         >
           <Ionicons name="add-circle" size={32} color="#22C55E" />

           <View style={{ flex: 1, marginLeft: 12 }}>
             <Text style={styles.walleTaskTitle}>{t("add_symptoms")}</Text>
             <Text style={styles.walleTaskSub}>{t("add_symptoms_desc")}</Text>


           </View>

           <Ionicons name="chevron-forward" size={22} color="#A5B4FC" />
         </TouchableOpacity>

         <TouchableOpacity
           style={styles.walleTaskCard}
           onPress={() => navigation.navigate("MedicineReminder")}
           activeOpacity={0.85}
         >
           <Ionicons name="alarm" size={30} color="#F59E0B" />

           <View style={{ flex: 1, marginLeft: 12 }}>
             <Text style={styles.walleTaskTitle}>Smart Reminder</Text>
             <Text style={styles.walleTaskSub}>
               Set reminders for medicine, gym, meetings, water & more
             </Text>
           </View>

           <Ionicons name="chevron-forward" size={22} color="#A5B4FC" />
         </TouchableOpacity>





          <TouchableOpacity
            style={styles.walleTaskCard}
            onPress={() => {
              analytics().logEvent("nearby_doctors_opened");
              markAction("nearby_doctors_opened");
              navigation.navigate("NearbyDoctors");
            }}

            activeOpacity={0.85}
          >
            <Ionicons name="medkit" size={30} color="#DC2626" />

            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.walleTaskTitle}>{t("nearby_doctors")}</Text>
              <Text style={styles.walleTaskSub}>{t("nearby_doctors_desc")}</Text>

            </View>

            <Ionicons name="chevron-forward" size={22} color="#A5B4FC" />
          </TouchableOpacity>


          <TouchableOpacity
            style={styles.walleTaskCard}
            onPress={() => {
              analytics().logEvent("ai_opened");
              markAction("ai_opened");
              navigation.navigate("AI");
            }}
            activeOpacity={0.85}
          >
            <Ionicons name="sparkles" size={30} color="#6366F1" />

            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.walleTaskTitle}>WALLE Companion</Text>
              <Text style={styles.walleTaskSub}>Talk about how you feel</Text>
            </View>

            <Ionicons name="chevron-forward" size={22} color="#A5B4FC" />
          </TouchableOpacity>


        </ScrollView>
      </SafeAreaView>

      {open && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={closeMenu}
        />
      )}

      <Animated.View
        style={[styles.menuContainer, { transform: [{ translateX }] }]}
      >
        <SideMenu navigation={navigation} onClose={closeMenu} userName={userName} />
      </Animated.View>

      <Modal transparent visible={showGuide} animationType="fade">
        <View style={styles.guideOverlay}>
          <View style={styles.guideCard}>
            <Animated.Image
              source={require("../assets/walle.png")}
              style={{
                width: 72,
                height: 72,
                resizeMode: "contain",
                marginBottom: 8,
                transform: [{ translateY: walleAnim }],
              }}
            />

            <Text style={styles.guideTitle}>{t("welcome")}</Text>
            <Text style={styles.guideText}>
              • Start with AI Daily Health Task{"\n"}
              • Add symptoms anytime{"\n"}
              • Ask WALLE AI for guidance
            </Text>
            <TouchableOpacity
              style={styles.guideBtn}
              onPress={() => setShowGuide(false)}
            >
              <Text style={styles.guideBtnText}>{t("got_it")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({

    heroWalle: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(99,102,241,0.12)",
      borderRadius: 28,
      paddingVertical: 26,
      paddingHorizontal: 16,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: "rgba(99,102,241,0.3)",
    },
    heroImg: {
      width: 140,
      height: 140,
      resizeMode: "contain",
    },
    heroLine: {
      marginTop: 12,
      fontSize: 16,
      fontWeight: "800",
      color: "#E5E7EB",
      textAlign: "center",
    },
    heroMeta: {
      marginTop: 6,
      fontSize: 13,
      color: "#A5B4FC",
    },

  header: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    height: 56 + (Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0),
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  headerTitle: {
    marginLeft: 16,
    fontSize: 18,
    fontWeight: "800",
    color: "#E5E7EB",
  },
  heading: {
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 6,
    color: "#E5E7EB",
  },
  subHeading: {
    fontSize: 14,
    color: "#94A3B8",
    marginBottom: 28,
  },
  primaryCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 24,
    padding: 26,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    marginBottom: 20,
  },
  cardTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "800",
    color: "#E5E7EB",
  },
  cardSubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
  },
walleTaskCard: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "rgba(255,255,255,0.08)",
  borderRadius: 22,
  padding: 18,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.12)",
  marginBottom: 20,
},
walleTaskTitle: {
  color: "#E5E7EB",
  fontSize: 16,
  fontWeight: "800",
},
walleTaskSub: {
  marginTop: 4,
  color: "#94A3B8",
  fontSize: 13,
},

walleCard: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "rgba(255,255,255,0.06)",
  borderRadius: 20,
  padding: 14,
  marginBottom: 16,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.12)",
},
walleImg: {
  width: 64,
  height: 64,
  resizeMode: "contain",
},
walleTitle: {
  color: "#E5E7EB",
  fontSize: 16,
  fontWeight: "800",
},
walleSub: {
  marginTop: 4,
  color: "#94A3B8",
  fontSize: 13,
},

  aiMessageCard: {
    backgroundColor: "rgba(99,102,241,0.12)",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.3)",
  },
  aiMessageText: {
    marginTop: 6,
    color: "#E5E7EB",
    fontSize: 14,
    lineHeight: 20,
  },
  aiDismiss: {
    marginTop: 10,
    color: "#A5B4FC",
    fontWeight: "700",
    alignSelf: "flex-end",
  },
  aiCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 24,
    padding: 26,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  aiTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "800",
    color: "#E5E7EB",
  },
  aiSubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
  },
  aiExample: {
    marginTop: 8,
    fontSize: 13,
    color: "#A5B4FC",
    fontStyle: "italic",
    textAlign: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  menuContainer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: MENU_WIDTH,
    backgroundColor: "#020617",
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.1)",
    zIndex: 30,
  },
  guideOverlay: {
    flex: 1,
    backgroundColor: "rgba(2,6,23,0.75)",
    justifyContent: "center",
    alignItems: "center",
  },
  guideCard: {
    width: "85%",
    backgroundColor: "#020617",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  guideTitle: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: "900",
    color: "#F9FAFB",
  },
  guideText: {
    marginTop: 10,
    fontSize: 14,
    color: "#CBD5E1",
    textAlign: "center",
    lineHeight: 22,
  },
  guideBtn: {
    marginTop: 22,
    backgroundColor: "#4F46E5",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 16,
  },
  guideBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  dot: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },
});
