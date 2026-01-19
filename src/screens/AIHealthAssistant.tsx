import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  ActivityIndicator,
  Animated,
  Easing,
  Alert,
  Modal,
  Image,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import LinearGradient from "react-native-linear-gradient";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { useLanguage } from "../context/LanguageContext";
import analytics from "@react-native-firebase/analytics";

/* ================= TYPES ================= */
type Message = {
  id: string;
  text: string;
  sender: "user" | "ai";
};

const generateId = () =>
  Date.now().toString() + Math.random().toString(36).slice(2);

const cleanText = (text: string) =>
  text.replace(/\*\*(.*?)\*\*/g, "$1").replace(/#+/g, "");



/* ================= GREETING ================= */
const getTimeGreeting = (t: any) => {
  const hour = new Date().getHours();
  if (hour < 12) return { text: t("good_morning"), icon: "🌅" };
  if (hour < 18) return { text: t("good_afternoon"), icon: "☀️" };
  return { text: t("good_evening"), icon: "🌙" };
};

/* ================= TYPING DOTS ================= */
const TypingDots = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  const animate = (dot: Animated.Value, delay: number) =>
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(dot, {
          toValue: -6,
          duration: 300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(dot, {
          toValue: 0,
          duration: 300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

  useEffect(() => {
    const a1 = animate(dot1, 0);
    const a2 = animate(dot2, 150);
    const a3 = animate(dot3, 300);

    a1.start();
    a2.start();
    a3.start();

    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, []);

  return (
    <View style={{ flexDirection: "row" }}>
      <Animated.Text style={[styles.dot, { transform: [{ translateY: dot1 }] }]}>
        •
      </Animated.Text>
      <Animated.Text style={[styles.dot, { transform: [{ translateY: dot2 }] }]}>
        •
      </Animated.Text>
      <Animated.Text style={[styles.dot, { transform: [{ translateY: dot3 }] }]}>
        •
      </Animated.Text>
    </View>
  );
};

/* ================= CONFIG ================= */
const BACKEND_URL = "https://wallehealth-server.onrender.com";
const BASIC_API_KEY = "walle_live_9F3kS2A8dQx7";


/* ================= SCREEN ================= */
const AIHealthAssistant = () => {
  const navigation = useNavigation<any>();
  const { t } = useLanguage(); // 👈 ADD
  const user = auth().currentUser;
  const isGuest = user?.isAnonymous === true;

  const [userName, setUserName] = useState("there");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const flatRef = useRef<FlatList>(null);


  /* 🔥 ONLY NEW STATE */
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const walleAnim = useRef(new Animated.Value(0)).current;

  /* FETCH USER NAME */
  useEffect(() => {
    const loadName = async () => {
      if (!user?.uid || isGuest) return;
      const doc = await firestore().collection("users").doc(user.uid).get();
      if (doc.exists && doc.data()?.name) {
        setUserName(doc.data()!.name);
      }
    };
    loadName();
  }, [user, isGuest]);

  /* GREETING */
  useEffect(() => {
    const g = getTimeGreeting(t);

    setMessages([
      {
        id: generateId(),
        sender: "ai",
        text:
          `${g.icon} ${g.text}, ${userName}!\n\n` +
          `${t("ai_intro")}\n\n` +
          (isGuest
            ? t("ai_guest_limit")
            : t("ai_how_feeling")),

      },
    ]);
  }, [userName, isGuest]);


useEffect(() => {
  Animated.loop(
    Animated.sequence([
      Animated.timing(walleAnim, {
        toValue: -6,
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
  if (loading) {
    Animated.timing(walleAnim, {
      toValue: -10,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }
}, [loading]);

useEffect(() => {
  analytics().logScreenView({
    screen_name: "AI_Assistant",
    screen_class: "AIHealthAssistant",
  });
}, []);
  /* AUTO SCROLL */
  useEffect(() => {
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 120);
  }, [messages]);

  /* ================= SEND MESSAGE ================= */
 const sendMessage = async (text?: string) => {
   const finalText = (text ?? input).trim();
   if (!finalText || loading) return;

   analytics().logEvent("ai_message_sent", {
     is_guest: isGuest,
   });

    const userMessageCount = messages.filter(
      (m) => m.sender === "user"
    ).length;

   if (isGuest && userMessageCount >= 2) {
     analytics().logEvent("ai_guest_limit_reached");
     setShowLoginPopup(true);
     return;
   }


    const userMessage: Message = {
      id: generateId(),
      text: finalText,
      sender: "user",
    };

    const thinkingMessage: Message = {
      id: generateId(),
      sender: "ai",
      text: `🤔 ${t("ai_thinking")}`,

    };

    setMessages((p) => [...p, userMessage, thinkingMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${BACKEND_URL}/chat`,
        {
          message: userMessage.text,
          userId: user?.uid || null,
        },
        { headers: { Authorization: `Bearer ${BASIC_API_KEY}` } }
      );


      setMessages((p) => {
        const updated = [...p];
        updated[updated.length - 1] = {
          id: generateId(),
          sender: "ai",
          text: cleanText(res.data?.answer || ""),

        };
        return updated;
      });
    } catch {
      setMessages((p) => {
        const updated = [...p];
        updated[updated.length - 1] = {
          id: generateId(),
          sender: "ai",
          text: `⚠️ ${t("ai_unavailable")}`,

        };
        return updated;
      });
    }

    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#020617" }}
      behavior="padding"
    >
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
        <Animated.View
          style={{
            transform: [{ translateY: walleAnim }],
            marginBottom: 6,
          }}
        >
          <Image
            source={require("../assets/walle.png")}
            style={{ width: 84, height: 84, resizeMode: "contain" }}
          />
        </Animated.View>



                <Text style={styles.headerTitle}>
                  {t("ai_assistant")}
                </Text>
                <Text style={styles.headerSubtitle}>
                  {t("ai_assistant_desc")}
                </Text>

      </LinearGradient>
      {messages.length === 1 && !isGuest && (
        <View style={styles.moodWrap}>
          <View style={styles.moodCard}>
            {[
               "😊 Feeling Good",
               "😌 Just Okay",
               "😔 Not Feeling Great"
             ].map((m) => (
               <TouchableOpacity
                  key={m}
                  onPress={() => sendMessage(m)}
                  style={styles.moodChip}
                >
                  <Text style={styles.moodText}>{m}</Text>
                </TouchableOpacity>
              ))}
          </View>
        </View>
      )}



      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.sender === "user"
                ? styles.userBubble
                : styles.aiBubble,
            ]}
          >
            <Text
              style={[
                styles.msgText,
                item.sender === "user" && { color: "#fff" },
              ]}
            >
              {cleanText(item.text)}
            </Text>
          </View>
        )}
        contentContainerStyle={styles.chatContainer}
      />

      {loading && (
        <View style={styles.typing}>
          <TypingDots />
          <Text style={styles.typingText}>
            {t("ai_typing")}
          </Text>

        </View>
      )}

      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder={t("ai_input_placeholder")}
          placeholderTextColor="#9CA3AF"
          style={styles.input}
          multiline
        />
        <TouchableOpacity onPress={sendMessage} activeOpacity={0.9}>
          <LinearGradient
            colors={["#4F46E5", "#7C5CFA", "#9B7BFF"]}
            style={styles.sendBtn}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

      </View>

      <Text style={styles.disclaimer}>
        {t("ai_disclaimer")}
      </Text>


      {/* ================= PREMIUM LOGIN POPUP ================= */}
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
             {t("ai_login_required_desc")}
           </Text>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {
                setShowLoginPopup(false);
                navigation.navigate("AuthWelcome");
              }}
            >
              <LinearGradient
                colors={["#4F46E5", "#7C5CFA", "#9B7BFF"]}
                style={styles.popupBtn}
              >
                <Text style={styles.popupBtnText}>{t("login_signup")}</Text>
              </LinearGradient>
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
    </KeyboardAvoidingView>
  );
};

export default AIHealthAssistant;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  header: {
    paddingTop: 64,
    paddingBottom: 40,
    alignItems: "center",
    justifyContent: "flex-end",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
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
    marginTop: 10,
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
  },

  headerSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
  },

  chatContainer: { padding: 16, paddingTop: 24 },
  bubble: { maxWidth: "80%", padding: 14, borderRadius: 16, marginBottom: 10 },
  userBubble: { backgroundColor: "#4F46E5", alignSelf: "flex-end" },
  aiBubble: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  msgText: { fontSize: 15, lineHeight: 22, color: "#E5E7EB" },
  typing: { flexDirection: "row", alignItems: "center", paddingLeft: 16 },
  typingText: { marginLeft: 8, fontSize: 13, color: "#9CA3AF" },
  dot: { fontSize: 22, color: "#A5B4FC", marginHorizontal: 2 },
  inputRow: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#1E293B",
  },
  input: {
    flex: 1,
    backgroundColor: "#020617",
    borderRadius: 14,
    padding: 12,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  sendBtn: {
    marginLeft: 10,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  disclaimer: {
    textAlign: "center",
    fontSize: 11,
    color: "#9CA3AF",
    paddingVertical: 6,
  },

  /* 🔥 POPUP */
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
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: 999,
    alignItems: "center",
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
moodWrap: {
  paddingHorizontal: 10,
  marginTop: 10,   // header se thoda neeche float karega
  marginBottom: 10,
},

moodCard: {
  flexDirection: "row",
  justifyContent: "space-between",
  backgroundColor: "rgba(255,255,255,0.08)",
  borderRadius: 20,
  padding: 10,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.15)",
},

moodChip: {
  paddingVertical: 8,
  paddingHorizontal: 14,
  borderRadius: 999,
  backgroundColor: "rgba(255,255,255,0.12)",
},

moodText: {
  color: "#E5E7EB",
  fontSize: 13,
  fontWeight: "600",
},

});
