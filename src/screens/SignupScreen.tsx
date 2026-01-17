import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  TextInput,
  Modal,
  Image,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

/* ================= SAVE USER ================= */
const saveUserToFirestore = async (
  loginType: "email" | "guest",
  email?: string
) => {
  const user = auth().currentUser;
  if (!user) return;

  await firestore()
    .collection("users")
    .doc(user.uid)
    .set(
      {
        uid: user.uid,
        email: email ?? "guest@walle.app",
        name: "",
        loginType,
        isProfileComplete: false,
        createdAt: firestore.FieldValue.serverTimestamp(),
        lastLoginAt: firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
};

const SignupScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showError, setShowError] = useState(false);
  const [showPasswordError, setShowPasswordError] = useState(false);
  const [showWeakPassword, setShowWeakPassword] = useState(false);
  const [showAccountExists, setShowAccountExists] = useState(false); // ✅ ADDED

  /* ================= EMAIL SIGNUP ================= */
  const handleSignup = async () => {
    if (!email || !password || !confirm) {
      setShowError(true);
      return;
    }

    if (password.length < 6) {
      setShowWeakPassword(true);
      return;
    }

    if (password !== confirm) {
      setShowPasswordError(true);
      return;
    }

    try {
      setLoading(true);

      const res = await auth().createUserWithEmailAndPassword(
        email.trim(),
        password
      );

      await saveUserToFirestore("email", res.user.email ?? email.trim());

      navigation.reset({
        index: 0,
        routes: [{ name: "Profile", params: { setup: true } }],
      });
    } catch (e: any) {
      if (e.code === "auth/email-already-in-use") {
        setShowAccountExists(true); // ✅ ONLY CHANGE
      } else if (e.code === "auth/invalid-email") {
        Alert.alert("Invalid Email", "Enter a valid email address");
      } else {
        Alert.alert("Signup Error", e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  /* ================= GUEST ================= */
  const handleGuestSignup = async () => {
    try {
      await auth().signInAnonymously();
      await saveUserToFirestore("guest");

      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
    } catch (e: any) {
      Alert.alert("Guest Error", e.message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />

      <LinearGradient
        colors={["#1E2A78", "#5B6CFF", "#9B7BFF"]}
        style={styles.hero}
      >

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>

       <Image
         source={require("../assets/logo.png")}
         style={styles.logo}
         resizeMode="contain"
       />

        <Text style={styles.brand}>Create Account</Text>
        <Text style={styles.tagline}>
          Sign up to unlock full health tracking
        </Text>
      </LinearGradient>

      <View style={styles.card}>
        <View style={styles.inputBox}>
          <Ionicons name="mail-outline" size={20} color="#4F46E5" />
          <TextInput
            placeholder="Email address"
            placeholderTextColor="#6B7280"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
        </View>

        <View style={styles.inputBox}>
          <Ionicons name="lock-closed-outline" size={20} color="#4F46E5" />
          <TextInput
            placeholder="Password (min 6 chars)"
            placeholderTextColor="#6B7280"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={styles.input}
          />

          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>

        </View>

        <View style={styles.inputBox}>
          <Ionicons
            name="shield-checkmark-outline"
            size={20}
            color="#4F46E5"
          />

          <TextInput
            placeholder="Confirm password"
            placeholderTextColor="#6B7280"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry={!showConfirmPassword}
            style={styles.input}
          />

          <TouchableOpacity
            onPress={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
          >
            <Ionicons
              name={
                showConfirmPassword
                  ? "eye-off-outline"
                  : "eye-outline"
              }
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>
        </View>


        <TouchableOpacity
          onPress={handleSignup}
          disabled={loading}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={["#4F46E5", "#7C5CFA", "#9B7BFF"]}
            style={styles.signupBtn}
          >
            <Text style={styles.signupText}>
              {loading ? "Creating account..." : "Create Account"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>


        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.or}>OR</Text>
          <View style={styles.line} />
        </View>

        <TouchableOpacity
          style={styles.guestBtn}
          onPress={handleGuestSignup}
          activeOpacity={0.85}
        >
          <Ionicons name="person-outline" size={20} color="#4F46E5" />
          <Text style={styles.guestText}>Continue as Guest</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.link}>
            Already have an account? Login
          </Text>
        </TouchableOpacity>
      </View>

      {/* 🔥 WEAK PASSWORD */}
      <Modal transparent visible={showWeakPassword} animationType="fade">
        <View style={styles.errorOverlay}>
          <View style={styles.errorCard}>
            <Ionicons name="lock-closed-outline" size={48} color="#EF4444" />
            <Text style={styles.errorTitle}>Weak Password</Text>
            <Text style={styles.errorMessage}>
              Minimum 6 characters required
            </Text>
            <TouchableOpacity
              style={styles.errorBtn}
              onPress={() => setShowWeakPassword(false)}
            >
              <Text style={styles.errorBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 🔥 MISSING FIELDS */}
      <Modal transparent visible={showError} animationType="fade">
        <View style={styles.errorOverlay}>
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
            <Text style={styles.errorTitle}>Missing Fields</Text>
            <Text style={styles.errorMessage}>All fields are required</Text>
            <TouchableOpacity
              style={styles.errorBtn}
              onPress={() => setShowError(false)}
            >
              <Text style={styles.errorBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 🔥 PASSWORD MISMATCH */}
      <Modal transparent visible={showPasswordError} animationType="fade">
        <View style={styles.errorOverlay}>
          <View style={styles.errorCard}>
            <Ionicons name="close-circle-outline" size={48} color="#EF4444" />
            <Text style={styles.errorTitle}>Password Mismatch</Text>
            <Text style={styles.errorMessage}>
              Passwords do not match
            </Text>
            <TouchableOpacity
              style={styles.errorBtn}
              onPress={() => setShowPasswordError(false)}
            >
              <Text style={styles.errorBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 🔥 ACCOUNT EXISTS (NEW – PREMIUM) */}
      <Modal transparent visible={showAccountExists} animationType="fade">
        <View style={styles.errorOverlay}>
          <View style={styles.errorCard}>
            <Ionicons
              name="alert-circle-outline"
              size={48}
              color="#F59E0B"
            />
            <Text style={styles.errorTitle}>Account Exists</Text>
            <Text style={styles.errorMessage}>
              Email already registered. Please login.
            </Text>
            <TouchableOpacity
              style={styles.errorBtn}
              onPress={() => {
                setShowAccountExists(false);
                navigation.navigate("Login");
              }}
            >
              <Text style={styles.errorBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SignupScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },

  hero: {
    height: 300,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 60,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },

logo: {
  height: 96,
  width: 96,
  marginBottom: 8,
},


  backBtn: {
    position: "absolute",
    top: 48,
    left: 16,
    height: 42,
    width: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  brand: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FFFFFF",
    marginTop: 6,
  },

  tagline: {
    marginTop: 8,
    marginBottom: 12,   // 👈 yeh add karo
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
  },


  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: -50,   // pehle -60 tha
    borderRadius: 26,
    padding: 24,
    elevation: 14,
  },


  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 14,
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "600",   // thoda light, login jaisa
    color: "#111827",
  },


  signupBtn: {
    backgroundColor: "#4F46E5",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
  },

  signupText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 18,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },

  or: {
    marginHorizontal: 12,
    fontSize: 12,
    color: "#9CA3AF",
  },

line: {
  flex: 1,
  height: 1,
  backgroundColor: "#E5E7EB",
},



  guestBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#7C5CFA",
    borderRadius: 16,
    paddingVertical: 14,
  },

  guestText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: "800",
    color: "#7C5CFA",
  },


 link: {
   marginTop: 14,
   textAlign: "center",
   color: "#7C5CFA",
   fontWeight: "700",
 },


  errorOverlay: {
    flex: 1,
    backgroundColor: "rgba(2,6,23,0.75)",
    justifyContent: "center",
    alignItems: "center",
  },

  errorCard: {
    width: "82%",
    backgroundColor: "#020617",
    borderRadius: 22,
    padding: 26,
    alignItems: "center",
  },

  errorTitle: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "900",
    color: "#F9FAFB",
  },

  errorMessage: {
    marginTop: 6,
    fontSize: 14,
    color: "#CBD5E1",
    textAlign: "center",
    marginBottom: 22,
  },

  errorBtn: {
    backgroundColor: "#4F46E5",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 14,
  },

  errorBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});
