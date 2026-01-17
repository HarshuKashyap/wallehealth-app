import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";

const AuthWelcomeScreen = ({ navigation }: any) => {
  return (
    <LinearGradient
      colors={["#1E2A78", "#4F5DFF", "#9B7BFF"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.hero}
    >
      <StatusBar barStyle="light-content" backgroundColor="#1E2A78" />

      {/* LOGO ZONE */}
      <View style={styles.logoZone}>
        <Image
          source={require("../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* TEXT */}
      <View style={styles.textZone}>
        <Text style={styles.title}>Welcome to WALLE</Text>
        <Text style={styles.subtitle}>
          Your daily companion for mindful health.
        </Text>
      </View>

      {/* ACTIONS */}
      <View style={styles.actionZone}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate("Login")}
        >
          <LinearGradient
            colors={["#FFFFFF", "#EDEBFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryBtn}
          >
            <Text style={styles.primaryText}>Sign In</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("Signup")}
          activeOpacity={0.7}
          style={styles.secondaryBtn}
        >
          <Text style={styles.secondaryText}>
            Get started — Create your account
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default AuthWelcomeScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  hero: {
    flex: 1,
  },

  logoZone: {
    flex: 1.3,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 18,
  },

  logo: {
    height: 96,
    width: 96,
  },

  textZone: {
    flex: 0.8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: 0.3,
  },

  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: "rgba(255,255,255,0.78)",
    lineHeight: 20,
    textAlign: "center",
  },

  actionZone: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "flex-end",
    paddingBottom: 36,
  },

  primaryBtn: {
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 9,
  },

  primaryText: {
    color: "#3F3D9E",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  secondaryBtn: {
    marginTop: 16,
    alignItems: "center",
  },

  secondaryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    opacity: 0.9,
  },
});
