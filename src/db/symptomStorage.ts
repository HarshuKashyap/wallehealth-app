import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";

/* ================= SAVE ================= */
export const saveSymptomToFirebase = async (data: {
  symptom: string;
  notes?: string;
  severity: number;
}) => {
  try {
    const user = auth().currentUser;
    if (!user) {
      console.log("❌ No user");
      return false;
    }

    await firestore().collection("symptoms").add({
      symptom: data.symptom,
      notes: data.notes || "",
      severity: data.severity,
      userId: user.uid,            // 🔥 SAME UID
      createdAt: firestore.FieldValue.serverTimestamp(),
    });

    console.log("✅ Symptom saved");
    return true;
  } catch (e) {
    console.log("🔥 Save error", e);
    return false;
  }
};

/* ================= FETCH ================= */
export const fetchSymptomsFromFirebase = async () => {
  try {
    const user = auth().currentUser;
    if (!user) return [];

    const snapshot = await firestore()
      .collection("symptoms")
      .where("userId", "==", user.uid)
      .orderBy("createdAt", "desc")
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (e) {
    console.log("🔥 Fetch error", e);
    return [];
  }
};
