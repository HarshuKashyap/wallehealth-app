import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Image,
  Modal,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showError, setShowError] = useState(false);
  const [errorTitle, setErrorTitle] = useState("");
  const [errorText, setErrorText] = useState("");

  const handleEmailLogin = async () => {
    if (!email || !password) {
      setErrorTitle("Missing Fields");
      setErrorText("Email & password are required");
      setShowError(true);
      return;
    }

    try {
      setLoading(true);
      const res = await auth().signInWithEmailAndPassword(
        email.trim(),
        password
      );

      const uid = res.user.uid;
      const snap = await firestore().collection("users").doc(uid).get();

      const isProfileComplete =
        snap.exists && snap.data()?.isProfileComplete === true;

      navigation.reset({
        index: 0,
        routes: [
          {
            name: isProfileComplete ? "Home" : "Profile",
            params: isProfileComplete ? undefined : { setup: true },
          },
        ],
      });
    } catch (e) {
      setErrorTitle("Login Error");
      setErrorText("Email or password is incorrect.");
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    await auth().signInAnonymously();
    navigation.reset({ index: 0, routes: [{ name: "Home" }] });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <LinearGradient colors={["#1E2A78", "#5B6CFF", "#9B7BFF"]} style={styles.hero}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.logoWrap}>
          <Image source={require("../assets/logo.png")} style={styles.logo} />
        </View>

        <Text style={styles.brand}>WALLE</Text>
        <Text style={styles.tagline}>
          Smart health starts with one login
        </Text>
      </LinearGradient>

      {/* CARD */}
      <View style={styles.card}>
        <Text style={styles.title}>Sign in to continue</Text>

        <View style={styles.inputBox}>
          <Ionicons name="mail-outline" size={20} color="#7C5CFA" />
          <TextInput
            placeholder="Email address"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />
        </View>

        <View style={styles.inputBox}>
          <Ionicons name="lock-closed-outline" size={20} color="#7C5CFA" />
          <TextInput
            placeholder="Password (minimum 6 characters)"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={styles.input}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleEmailLogin} activeOpacity={0.9}>
          <LinearGradient
            colors={["#4F46E5", "#7C5CFA", "#9B7BFF"]}
            style={styles.loginBtn}
          >
            <Text style={styles.loginText}>
              {loading ? "Please wait..." : "Continue"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.or}>OR</Text>
          <View style={styles.line} />
        </View>

        <TouchableOpacity style={styles.guestBtn} onPress={handleGuestLogin}>
          <Ionicons name="person-outline" size={20} color="#7C5CFA" />
          <Text style={styles.guestText}>Continue as Guest</Text>
        </TouchableOpacity>
      </View>

      <Modal transparent visible={showError} animationType="fade">
        <View style={styles.errorOverlay}>
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>{errorTitle}</Text>
            <Text style={styles.errorMessage}>{errorText}</Text>
            <TouchableOpacity
              style={styles.errorBtn}
              onPress={() => setShowError(false)}
            >
              <Text style={styles.errorBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default LoginScreen;

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

  backBtn: {
    position: "absolute",
    top: 48,
    left: 16,
    height: 42,
    width: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.18)", // thoda softer
    alignItems: "center",
    justifyContent: "center",
  },

  logoWrap: {
    marginBottom: 8,
  },

  logo: {
    height: 96,
    width: 96,
    resizeMode: "contain",
  },

  brand: {
    fontSize: 34,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 2,
  },

  tagline: {
    marginTop: 6,
    fontSize: 14,
    color: "rgba(241,245,249,0.85)", // thodi kam intensity
  },

  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: -50,
    borderRadius: 26,
    padding: 24,
    elevation: 14,
  },

  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
    marginBottom: 18,
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
    color: "#111827",
  },

  loginBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 6,
  },

  loginText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
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
    backgroundColor: "#7C5CFA",
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
