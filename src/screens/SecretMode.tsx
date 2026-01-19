import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";

export default function SecretMode() {
  const [text, setText] = useState("");

  useEffect(() => {
    const lines = [
      "Is waqt duniya so rahi hai…",
      "Tum aur main bas.",
      "Yahan koi task nahi.",
      "Koi pressure nahi.",
      "Bas jo dil me hai, bol do.",
    ];

    let i = 0;
    const t = setInterval(() => {
      if (i < lines.length) {
        setText((p) => (p ? p + "\n\n" + lines[i] : lines[i]));
        i++;
      }
    }, 1200);

    return () => clearInterval(t);
  }, []);


  return (
    <View style={styles.wrap}>
      <Text style={styles.txt}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: "#000",
    padding: 24,
    justifyContent: "center",
  },
  txt: {
    color: "#94A3B8",
    fontSize: 16,
    lineHeight: 26,
  },
});
