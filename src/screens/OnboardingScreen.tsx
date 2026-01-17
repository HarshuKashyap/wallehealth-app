import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LinearGradient from "react-native-linear-gradient";

const { width } = Dimensions.get("window");

const ONBOARDING_KEY = "ONBOARDING_DONE";

const slides = [
  {
    id: "1",
    icon: "heart-outline",
    title: "Your Health, Under Control",
    description:
      "Understand your symptoms and daily health patterns — safely and simply.",
  },
  {
    id: "2",
    icon: "sparkles-outline",
    title: "AI That Understands You",
    description:
      "Get daily AI health tasks and guidance based on how you feel.",
  },
  {
    id: "3",
    icon: "shield-checkmark-outline",
    title: "Privacy First. Always.",
    description:
      "Your health data stays private. No diagnosis. No pressure.",
  },
];

const OnboardingScreen = ({ navigation }: any) => {
  const [index, setIndex] = useState(0);
  const ref = useRef<FlatList>(null);

  const finishOnboarding = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");

    // ✅ FIX: direct signup hata ke AuthWelcome
    navigation.replace("AuthWelcome");
  };

  const nextSlide = async () => {
    if (index < slides.length - 1) {
      ref.current?.scrollToIndex({ index: index + 1 });
    } else {
      await finishOnboarding();
    }
  };

  return (
    <LinearGradient colors={["#EEF2FF", "#FFFFFF"]} style={styles.container}>
      {/* SKIP */}
      <TouchableOpacity style={styles.skip} onPress={finishOnboarding}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* SLIDES */}
      <FlatList
        ref={ref}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(
            e.nativeEvent.contentOffset.x / width
          );
          setIndex(i);
        }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Ionicons name={item.icon} size={120} color="#4F46E5" />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc}>{item.description}</Text>
          </View>
        )}
      />

      {/* DOTS */}
      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              index === i && styles.dotActive,
            ]}
          />
        ))}
      </View>

      {/* CTA */}
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.button}
        onPress={nextSlide}
      >
        <Text style={styles.buttonText}>
          {index === slides.length - 1
            ? "Start My Health Journey"
            : "Next"}
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

export default OnboardingScreen;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 40,
  },
  skip: {
    alignSelf: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  skipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  slide: {
    width,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111827",
    marginTop: 20,
    textAlign: "center",
  },
  desc: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 10,
    textAlign: "center",
    lineHeight: 22,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  dot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: "#D1D5DB",
    marginHorizontal: 4,
  },
  dotActive: {
    width: 22,
    backgroundColor: "#4F46E5",
  },
  button: {
    backgroundColor: "#4F46E5",
    marginHorizontal: 30,
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    elevation: 4,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
});
