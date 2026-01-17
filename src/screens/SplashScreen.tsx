import React, { useEffect, useRef } from "react";
import {
  Text,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Animated,
  View,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import auth from "@react-native-firebase/auth";

const SplashScreen = ({ navigation }: any) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    const routeUser = async () => {
      const onboardingDone = await AsyncStorage.getItem("ONBOARDING_DONE");
      const user = auth().currentUser;

      setTimeout(() => {
        if (user) {
          navigation.replace("Home");
          return;
        }

        if (onboardingDone === "true") {
          navigation.replace("AuthWelcome");
        } else {
          navigation.replace("Onboarding");
        }
      }, 2200);
    };

    routeUser();
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <Animated.View
        style={[
          styles.container,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        {/* LOGO */}
        <View style={styles.logoWrap}>
          <Image
            source={require("../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>


        {/* BRAND */}
        <Text style={styles.brand}>WALLE</Text>

        {/* TAGLINE */}
        <Text style={styles.tagline}>
          Wellness intelligence for everyday health
        </Text>

        {/* LOADER */}
        <ActivityIndicator
          size="small"
          color="#6366F1"
          style={{ marginTop: 64 }}
        />
      </Animated.View>
    </View>
  );
};

export default SplashScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },




  logo: {
    width: 110,
    height: 110,
  },

  brand: {
    fontSize: 44,
    fontWeight: "900",
    color: "#1E1B4B",   // auth family se match
    letterSpacing: 4,
  },

  tagline: {
    marginTop: 10,
    fontSize: 13,
    color: "#6B7280",
    letterSpacing: 0.6,
    textAlign: "center",
    maxWidth: 260,
    lineHeight: 18,
  },
});
