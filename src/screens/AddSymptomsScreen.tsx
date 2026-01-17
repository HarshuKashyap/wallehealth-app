import React, { useState, useEffect } from "react"; // 👈 useEffect add

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal, // ✅ ONLY ADD
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import analytics from "@react-native-firebase/analytics"; // 👈 ADD
import Ionicons from "react-native-vector-icons/Ionicons";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { useLanguage } from "../context/LanguageContext";

const markAction = async (action: string) => {
  const user = auth().currentUser;
  if (!user) return;

  const today = new Date().toISOString().split("T")[0];

  const update: any = {
    lastActionAt: firestore.FieldValue.serverTimestamp(),
    lastActionName: action,
  };

  // 🔥 Agar symptom add hua hai, to date save karo
  if (action === "symptom_added") {
    update.lastSymptomAt = today;
  }

  await firestore().collection("users").doc(user.uid).set(update, {
    merge: true,
  });
};


const AddSymptomsScreen = () => {
  const navigation = useNavigation<any>();
  const { t } = useLanguage(); // 👈 ADD
  const [symptom, setSymptom] = useState("");
  const [loading, setLoading] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false); // ✅ ONLY ADD

  const handleSave = async () => {
    if (!symptom.trim()) {
      Alert.alert(
        t("missing_information"),
        t("describe_symptom")
      );

      return;
    }

    const user = auth().currentUser;
    if (!user) {
      Alert.alert(
        t("login_required"),
        t("login_required_short")
      );

      return;
    }

    if (user.isAnonymous) {
      Alert.alert(
        t("account_required"),
        t("account_required_desc")
      );

      return;
    }

    try {
      setLoading(true);

      const today = new Date().toISOString().split("T")[0];

      await firestore()
        .collection("users")
        .doc(user.uid)
        .collection("symptoms")
        .add({
          text: symptom.trim(),
          createdAt: firestore.FieldValue.serverTimestamp(),
          date: today,   // 🔥 ye hi missing tha
        });

    analytics().logEvent("symptom_added");
    await markAction("symptom_added");


      setSymptom("");

      // ❌ Alert.alert REMOVED
      // ✅ PREMIUM SUCCESS
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigation.goBack();
      }, 1500);
    } catch {
      Alert.alert(
        t("error"),
        t("save_symptom_error")
      );

    } finally {
      setLoading(false);
    }
  };
useEffect(() => {
  analytics().logScreenView({
    screen_name: "Add_Symptoms",
    screen_class: "AddSymptomsScreen",
  });
}, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView style={styles.screen}>
        <LinearGradient
           colors={["#1E2A78", "#5B6CFF", "#9B7BFF"]}
          style={styles.header}
        >

          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>


          <View style={styles.iconWrap}>
            <Ionicons name="medkit" size={34} color="#fff" />
          </View>

          <Text style={styles.title}>
            {t("add_symptom")}
          </Text>
          <Text style={styles.subtitle}>
            {t("add_symptom_subtitle")}
          </Text>

        </LinearGradient>

        <View style={styles.card}>
          <Text style={styles.label}>
            {t("your_symptom")}
          </Text>


          <View style={styles.inputBox}>
            <Ionicons name="pencil-outline" size={18} color="#6B7280" />
            <TextInput
              placeholder={t("symptom_placeholder")}
              placeholderTextColor="#9CA3AF"
              value={symptom}
              onChangeText={setSymptom}
              style={styles.input}
              multiline
            />
          </View>

        </View>

        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.9}
          style={{ marginTop: 28, marginHorizontal: 20 }}
        >
          <LinearGradient
            colors={["#1E2A78", "#5B6CFF", "#9B7BFF"]}   // 👈 header jaisa gradient
            style={[styles.btn, loading && { opacity: 0.7 }]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="save-outline" size={18} color="#fff" />
                <Text style={styles.btnText}>
                  {t("save_symptom")}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          {t("symptom_disclaimer")}
        </Text>

      </ScrollView>

      {/* ✅ PREMIUM SUCCESS POPUP (ONLY ADDITION) */}
      <Modal transparent visible={showSuccess} animationType="fade">
        <View style={styles.successOverlay}>
          <View style={styles.successCard}>
            <Ionicons
              name="checkmark-circle"
              size={56}
              color="#22C55E"
            />
            <Text style={styles.successTitle}>
              {t("saved")}
            </Text>
            <Text style={styles.successText}>
              {t("symptom_saved_success")}
            </Text>

          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default AddSymptomsScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#020617",
  },

  header: {
    height: 260,              // 👈 add this
    paddingTop: 70,
    paddingBottom: 40,        // thoda zyada space
    alignItems: "center",
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
  backgroundColor: "rgba(255,255,255,0.18)", // glass look
  alignItems: "center",
  justifyContent: "center",
},


  iconWrap: {
    backgroundColor: "rgba(255,255,255,0.18)",
    padding: 16,
    borderRadius: 40,
  },

  title: {
    marginTop: 16,
    fontSize: 24,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: "#E0E7FF",
  },

 card: {
   backgroundColor: "#FFFFFF",
   marginHorizontal: 20,
   marginTop: -32,   // 👈 header ke andar aayega (Analytics jaisa)
   padding: 22,
   borderRadius: 26,
   elevation: 14,
 },

  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
  },

  input: {
    minHeight: 120,
    fontSize: 15,
    color: "#111827",
    textAlignVertical: "top",
    lineHeight: 22,
  },
inputBox: {
  flexDirection: "row",
  alignItems: "flex-start",
  backgroundColor: "#F3F4F6",
  borderRadius: 14,
  paddingHorizontal: 14,
  paddingVertical: 12,
},

  btn: {
    paddingVertical: 18,
    borderRadius: 24,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    elevation: 8,
  },


  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },

  disclaimer: {
    marginTop: 18,
    marginBottom: 40,
    fontSize: 11,
    color: "#94A3B8",
    textAlign: "center",
    paddingHorizontal: 30,
  },

  /* ✅ ONLY NEW STYLES */
  successOverlay: {
    flex: 1,
    backgroundColor: "rgba(2,6,23,0.65)",
    justifyContent: "center",
    alignItems: "center",
  },

  successCard: {
    width: "80%",
    backgroundColor: "#020617",
    borderRadius: 24,
    padding: 26,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  successTitle: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: "900",
    color: "#F9FAFB",
  },

  successText: {
    marginTop: 6,
    fontSize: 14,
    color: "#CBD5E1",
    textAlign: "center",
  },
});
