import messaging from "@react-native-firebase/messaging";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";

export const initFCM = async () => {
  try {
    // 1️⃣ Permission
    await messaging().requestPermission();

    const user = auth().currentUser;
    if (!user || user.isAnonymous) {
      console.log("❌ User not logged in / anonymous");
      return;
    }

    // 2️⃣ Get token
    const fcmToken = await messaging().getToken();
    console.log("🔥 FCM TOKEN:", fcmToken);

    // 3️⃣ Save token to Firestore
    await firestore()
      .collection("users")
      .doc(user.uid)
      .set(
        {
          fcmToken,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

    console.log("✅ FCM token saved");

    // 4️⃣ Handle token refresh (VERY IMPORTANT)
    messaging().onTokenRefresh(async (newToken) => {
      await firestore()
        .collection("users")
        .doc(user.uid)
        .update({
          fcmToken: newToken,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

      console.log("🔁 FCM token refreshed");
    });

  } catch (err) {
    console.log("❌ initFCM error:", err);
  }
};
