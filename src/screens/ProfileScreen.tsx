import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import LinearGradient from "react-native-linear-gradient";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useLanguage } from "../context/LanguageContext";

const ProfileScreen = () => {
  const { t } = useLanguage();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const setupMode = route.params?.setup === true;

  const user = auth().currentUser;

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] =
    useState<"Male" | "Female" | "Other" | "">("");
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      const snap = await firestore()
        .collection("users")
        .doc(user.uid)
        .get();

      if (snap.exists) {
        const d = snap.data();
        setName(d?.name ?? "");
        setAge(d?.age ? String(d.age) : "");
        setGender(d?.gender ?? "");
        setEditMode(setupMode ? true : !d?.isProfileComplete);
      } else {
        setEditMode(true);
      }
      setLoadingProfile(false);
    };

    loadProfile();
  }, []);

  const saveProfile = async () => {
    if (!name || !age || !gender) {
      Alert.alert(t("profile_incomplete"));
      return;
    }

    setSaving(true);

    await firestore()
      .collection("users")
      .doc(user?.uid)
      .set(
        {
          name,
          age: Number(age),
          gender,
          isProfileComplete: true,
        },
        { merge: true }
      );

    setSaving(false);
    setEditMode(false);

    if (setupMode) {
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
    }
  };

  if (loadingProfile) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#7C5CFA" />
      </View>
    );
  }

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
          {!setupMode && (
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
          )}

          <Image
            source={require("../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />


          <Text style={styles.title}>{t("profile_title")}</Text>
          <Text style={styles.subtitle}>{t("profile_subtitle")}</Text>
        </LinearGradient>

        <View style={styles.card}>
          <Input
            label={t("profile_name")}
            value={name}
            onChangeText={setName}
            editable={editMode}
            icon="person-outline"
          />

          <Input
            label={t("profile_age")}
            value={age}
            onChangeText={setAge}
            editable={editMode}
            icon="calendar-outline"
            keyboardType="number-pad"
          />

          <Text style={styles.label}>{t("profile_gender")}</Text>
          <View style={styles.genderRow}>
            {[
              { key: "male", value: "Male" },
              { key: "female", value: "Female" },
              { key: "other", value: "Other" },
            ].map((g) => (
              <TouchableOpacity
                key={g.key}
                style={[
                  styles.genderChip,
                  gender === g.value && styles.genderActive,
                ]}
                disabled={!editMode}
                onPress={() => setGender(g.value as any)}
              >
                <Text
                  style={[
                    styles.genderText,
                    gender === g.value && { color: "#fff" },
                  ]}
                >
                  {t(`gender_${g.key}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          onPress={editMode ? saveProfile : () => setEditMode(true)}
          disabled={saving}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={["#4F46E5", "#7C5CFA", "#9B7BFF"]}
            style={styles.button}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {setupMode
                  ? t("profile_finish")
                  : editMode
                  ? t("profile_save")
                  : t("profile_edit")}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ProfileScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#020617",
  },

  header: {
    height: 260,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
logo: {
  height: 90,
  width: 90,
  marginBottom: 8,
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

  iconWrap: {
    backgroundColor: "rgba(255,255,255,0.18)",
    padding: 16,
    borderRadius: 40,
    marginBottom: 8,
  },

  title: {
    marginTop: 6,
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
  },

  subtitle: {
    marginTop: 6,
    marginBottom: 12,
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
  },


  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: -40,
    padding: 24,
    borderRadius: 26,
    elevation: 12,
  },

  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 6,
  },

  genderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },

  genderChip: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#7C5CFA",
    alignItems: "center",
  },

  genderActive: {
    backgroundColor: "#7C5CFA",
  },

  genderText: {
    fontWeight: "700",
    color: "#7C5CFA",
  },

  button: {
    marginTop: 28,
    marginHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 40,
  },


  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

/* ================= INPUT ================= */

const Input = ({
  label,
  value,
  onChangeText,
  editable,
  icon,
  keyboardType,
}: any) => (
  <View style={{ marginBottom: 18 }}>
    <Text style={styles.label}>{label}</Text>
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F3F4F6",
        borderRadius: 14,
        paddingHorizontal: 14,
      }}
    >
      <Ionicons name={icon} size={20} color="#6B7280" />
      <TextInput
        style={{
          flex: 1,
          paddingVertical: 14,
          paddingLeft: 10,
          fontSize: 15,
          color: "#111827",
        }}
        value={value}
        editable={editable}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
      />
    </View>
  </View>
);
