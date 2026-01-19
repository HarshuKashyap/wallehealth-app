import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, StatusBar, Modal } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import LinearGradient from "react-native-linear-gradient";
import notifee, { TriggerType, RepeatFrequency } from "@notifee/react-native";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import DateTimePicker from "@react-native-community/datetimepicker";

const PRESETS = [
  { label: "Morning (8 AM)", hour: 8, minute: 0 },
  { label: "Afternoon (2 PM)", hour: 14, minute: 0 },
  { label: "Night (9 PM)", hour: 21, minute: 0 },
];

export default function MedicineReminderScreen({ navigation }: any) {
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<number | null>(null);
  const [customTime, setCustomTime] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
 const [pHour, setPHour] = useState("10");
 const [pMinute, setPMinute] = useState("02");
 const [pAmPm, setPAmPm] = useState<"AM" | "PM">("AM");




const [modal, setModal] = useState<{
  title: string;
  msg: string;
} | null>(null);


  const schedule = async () => {
    if (!name.trim()) {
      setModal({
        title: "Missing",
        msg: "Kya yaad dilana hai? Yahan likho ✍️",
      });
      return;
    }

    let hour: number | null = null;
    let minute: number | null = null;
    let label = "";

    if (customTime) {
      hour = customTime.getHours();
      minute = customTime.getMinutes();
      label = `Custom (${hour}:${String(minute).padStart(2, "0")})`;
    } else if (selected !== null) {
      const t = PRESETS[selected];
      hour = t.hour;
      minute = t.minute;
      label = t.label;
    }

    if (hour === null || minute === null) {
      setModal({
        title: "Select time",
        msg: "Reminder ka time choose karo ⏰",
      });
      return;
    }

    try {
      setSaving(true);


      const date = new Date();
      date.setHours(hour, minute, 0, 0);
      if (date <= new Date()) {
        date.setDate(date.getDate() + 1);
      }

      const id = `med_${Date.now()}`;

      await notifee.createTriggerNotification(
        {
          id,
          title: "WALLE Care 💙",
          body: `Hey! ${name} ka time ho gaya ⏰`,
          android: {
            channelId: "walle_default", // 👈 same channel as whole app
            smallIcon: "ic_notification",
            pressAction: { id: "default" },
          },
        },
        {
          type: TriggerType.TIMESTAMP,
          timestamp: date.getTime(),
          repeatFrequency: RepeatFrequency.DAILY,
        }
      );


      const user = auth().currentUser;
      if (user && !user.isAnonymous) {
        await firestore()
          .collection("users")
          .doc(user.uid)
          .collection("reminders")
          .add({
            name,
            timeLabel: label,
            hour,
            minute,
            notifId: id,
            createdAt: firestore.FieldValue.serverTimestamp(),
          });
      }

      setModal({
        title: "Saved",
        msg: "Daily reminder set ho gaya 💙",
      });
      setName("");
      setSelected(null);
      setCustomTime(null);

    } catch (e) {
      setModal({
        title: "Error",
        msg: "Reminder set nahi ho paya 😔",
      });

    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={{ height: 50 }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#E5E7EB" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medicine Reminder</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Reminder title</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Take Vitamin D, Go to Gym, Office Meeting"
          placeholderTextColor="#64748B"
          style={styles.input}
        />

        <Text style={[styles.label, { marginTop: 18 }]}>Select time</Text>

        {PRESETS.map((t, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => {
              setSelected(i);
              setCustomTime(null);
            }}
            style={[
              styles.timeBtn,
              selected === i && styles.timeBtnActive,
            ]}
          >
            <Text
              style={[
                styles.timeText,
                selected === i && styles.timeTextActive,
              ]}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          onPress={() => {
            setSelected(null);
            setPickerOpen(true);
          }}

          style={[
            styles.timeBtn,
            customTime && styles.timeBtnActive,
          ]}
        >
          <Text
            style={[
              styles.timeText,
              customTime && styles.timeTextActive,
            ]}
          >
            {customTime
              ? `Custom (${customTime.getHours()}:${String(
                  customTime.getMinutes()
                ).padStart(2, "0")})`
              : "Choose custom time"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={schedule}
          disabled={saving}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={["#1E2A78", "#5B6CFF", "#9B7BFF"]}
            style={[styles.saveBtn, saving && { opacity: 0.7 }]}
          >
            <Text style={styles.saveText}>
              {saving ? "Saving..." : "Set Reminder"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

      </View>


  {modal && (
    <Modal transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Ionicons
            name={modal.title === "Saved" ? "checkmark-circle" : "alert-circle"}
            size={48}
            color={modal.title === "Saved" ? "#22C55E" : "#F59E0B"}
          />

          <Text style={styles.modalTitle}>{modal.title}</Text>
          <Text style={styles.modalMsg}>{modal.msg}</Text>

          <TouchableOpacity
            style={styles.modalBtn}
            onPress={() => setModal(null)}
          >
            <Text style={styles.modalBtnText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )}

{pickerOpen && (
  <Modal transparent animationType="fade">
    <View style={styles.pickerOverlay}>
      <View style={styles.pickerCard}>
        <Text style={styles.pickerTitle}>Select Time</Text>

        <View style={styles.row}>
          {/* Hour UP */}
          <TouchableOpacity
            onPress={() => {
              let h = parseInt(pHour || "1", 10);
              h = h > 1 ? h - 1 : 12;
              setPHour(String(h));
            }}
          >
            <Ionicons name="chevron-up" size={22} color="#A5B4FC" />
          </TouchableOpacity>

          {/* Hour Input */}
          <TextInput
            value={pHour}
            keyboardType="number-pad"
            maxLength={2}
            onChangeText={(v) => {
              if (/^\d*$/.test(v)) {
                setPHour(v);
              }
            }}
            style={styles.timeInput}
          />

          {/* Hour DOWN */}
          <TouchableOpacity
            onPress={() => {
              let h = parseInt(pHour || "1", 10);
              h = h < 12 ? h + 1 : 1;
              setPHour(String(h));
            }}
          >
            <Ionicons name="chevron-down" size={22} color="#A5B4FC" />
          </TouchableOpacity>

          <Text style={styles.colon}>:</Text>

          {/* Minute UP */}
          <TouchableOpacity
            onPress={() => {
              let m = parseInt(pMinute || "0", 10);
              m = m > 0 ? m - 1 : 59;
              setPMinute(String(m).padStart(2, "0"));
            }}
          >
            <Ionicons name="chevron-up" size={22} color="#A5B4FC" />
          </TouchableOpacity>

          {/* Minute Input */}
          <TextInput
            value={pMinute}
            keyboardType="number-pad"
            maxLength={2}
            onChangeText={(v) => {
              if (/^\d*$/.test(v)) {
                setPMinute(v);
              }
            }}
            style={styles.timeInput}
          />

          {/* Minute DOWN */}
          <TouchableOpacity
            onPress={() => {
              let m = parseInt(pMinute || "0", 10);
              m = m < 59 ? m + 1 : 0;
              setPMinute(String(m).padStart(2, "0"));
            }}
          >
            <Ionicons name="chevron-down" size={22} color="#A5B4FC" />
          </TouchableOpacity>

          {/* AM/PM */}
          <TouchableOpacity
            style={styles.ampm}
            onPress={() => setPAmPm(pAmPm === "AM" ? "PM" : "AM")}
          >
            <Text style={styles.ampmText}>{pAmPm}</Text>
          </TouchableOpacity>
        </View>


        <TouchableOpacity
          style={styles.pickerBtn}
          onPress={() => {
            let h = parseInt(pHour || "0", 10);
            let m = parseInt(pMinute || "0", 10);

            if (isNaN(h)) h = 1;
            if (h < 1) h = 1;
            if (h > 12) h = 12;

            if (isNaN(m)) m = 0;
            if (m < 0) m = 0;
            if (m > 59) m = 59;

            const finalHour =
              pAmPm === "PM" && h !== 12 ? h + 12 : pAmPm === "AM" && h === 12 ? 0 : h;

            const d = new Date();
            d.setHours(finalHour, m, 0, 0);

            setCustomTime(d);
            setPickerOpen(false);
          }}

        >
          <Text style={styles.pickerBtnText}>Set Time</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
)}


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    paddingHorizontal: 20,
    paddingTop: 12,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    marginLeft: 16,
    color: "#E5E7EB",
    fontSize: 16,
    fontWeight: "800",
  },
pickerOverlay: {
  flex: 1,
  backgroundColor: "rgba(2,6,23,0.85)",
  justifyContent: "center",
  alignItems: "center",
},
pickerCard: {
  width: "85%",
  backgroundColor: "#020617",
  borderRadius: 24,
  padding: 24,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.12)",
},
pickerTitle: {
  color: "#E5E7EB",
  fontSize: 18,
  fontWeight: "900",
  textAlign: "center",
  marginBottom: 16,
},
row: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
},
big: {
  color: "#F9FAFB",
  fontSize: 36,
  fontWeight: "900",
  marginHorizontal: 8,
},
colon: {
  color: "#CBD5E1",
  fontSize: 28,
  marginHorizontal: 6,
},
ampm: {
  marginLeft: 12,
  paddingVertical: 6,
  paddingHorizontal: 14,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: "#6366F1",
},
ampmText: {
  color: "#A5B4FC",
  fontWeight: "800",
},
pickerBtn: {
  marginTop: 20,
  backgroundColor: "#4F46E5",
  paddingVertical: 12,
  borderRadius: 999,
  alignItems: "center",
},
pickerBtnText: {
  color: "#FFF",
  fontWeight: "900",
},
timeInput: {
  color: "#F9FAFB",
  fontSize: 36,
  fontWeight: "900",
  marginHorizontal: 8,
  minWidth: 48,
  textAlign: "center",
},

modalOverlay: {
  flex: 1,
  backgroundColor: "rgba(2,6,23,0.85)",
  justifyContent: "center",
  alignItems: "center",
},
modalCard: {
  width: "80%",
  backgroundColor: "#020617",
  borderRadius: 24,
  padding: 24,
  alignItems: "center",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.12)",
},
modalTitle: {
  marginTop: 12,
  fontSize: 18,
  fontWeight: "900",
  color: "#F9FAFB",
},
modalMsg: {
  marginTop: 6,
  color: "#CBD5E1",
  textAlign: "center",
},
modalBtn: {
  marginTop: 20,
  backgroundColor: "#4F46E5",
  paddingVertical: 10,
  paddingHorizontal: 36,
  borderRadius: 999,
},
modalBtnText: {
  color: "#FFF",
  fontWeight: "800",
},

  card: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  label: {
    color: "#94A3B8",
    fontSize: 13,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 14,
    padding: 12,
    color: "#E5E7EB",
  },
  timeBtn: {
    marginTop: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  timeBtnActive: {
    backgroundColor: "rgba(99,102,241,0.15)",
    borderColor: "#6366F1",
  },
  timeText: {
    color: "#E5E7EB",
    fontSize: 14,
  },
  timeTextActive: {
    color: "#A5B4FC",
    fontWeight: "700",
  },
  saveBtn: {
    marginTop: 22,
    backgroundColor: "#4F46E5",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  saveText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
});
