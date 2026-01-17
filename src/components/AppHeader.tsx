import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";

type Props = {
  title?: string;
  showBack?: boolean;
};

export default function AppHeader({
  title,
  showBack = true,
}: Props) {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.header}>
      {showBack ? (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 24 }} />
      )}

      <Text style={styles.title}>{title}</Text>

      {/* Right spacer */}
      <View style={{ width: 24 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
  },
});
