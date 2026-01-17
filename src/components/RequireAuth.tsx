import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { isGuestUser } from "../utils/authUtils";

const RequireAuth = ({ children }: any) => {
  const navigation = useNavigation<any>();

  if (isGuestUser()) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
          backgroundColor: "#020617",
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: "800",
            color: "#F9FAFB",
            marginBottom: 10,
          }}
        >
          Create an account to continue
        </Text>

        <Text
          style={{
            textAlign: "center",
            color: "#94A3B8",
            marginBottom: 24,
            lineHeight: 20,
          }}
        >
          Sign up to unlock AI features, save your progress, and get personalized
          health insights.
        </Text>

        <TouchableOpacity
          style={{
            backgroundColor: "#4F46E5",
            paddingVertical: 14,
            paddingHorizontal: 30,
            borderRadius: 16,
          }}
          onPress={() => navigation.navigate("AuthWelcome")}
        >
          <Text style={{ color: "#fff", fontWeight: "800" }}>
            Sign up / Login
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return children;
};

export default RequireAuth;
