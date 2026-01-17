import notifee, {
  AndroidImportance,
  TriggerType,
  TimestampTrigger,
  AndroidStyle,
} from "@notifee/react-native";
import auth from "@react-native-firebase/auth";


/* ================= INIT ================= */
export const initNotifications = async () => {
  await notifee.requestPermission();
};

/* ================= CHANNEL ================= */
const getDailyChannel = async () => {
  return await notifee.createChannel({
    id: "walle-daily",
    name: "WALLE Daily Health",
    importance: AndroidImportance.HIGH,
    sound: "default",
    vibration: true,
    vibrationPattern: [300, 500, 300, 500],
    lights: true,
    lightColor: "#4CAF50",
  });
};

/* ================= 8 AM ================= */
export const scheduleMorningHealthTask = async () => {
  const user = auth().currentUser;
  if (!user || user.isAnonymous) return;

  await notifee.cancelAllNotifications();

  const channelId = await getDailyChannel();

  const date = new Date();
  date.setHours(8, 0, 0, 0);
  if (date <= new Date()) date.setDate(date.getDate() + 1);

  await notifee.createTriggerNotification(
    {
      title: "🌅 Your Daily Health Task",
      body: "Small steps today lead to better health 💙",
      data: { screen: "DailyTask" },
      android: {
        channelId,
        pressAction: { id: "default" },
        style: {
          type: AndroidStyle.BIGTEXT,
          text: "💧 Stay hydrated!\n\nTap to view your Daily Health Task.",
        },
      },
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
      repeatFrequency: "DAILY",
    }
  );

  // 🔔 SAVE TO HISTORY (NEW)
  await saveNotificationToHistory(
    "Daily Health Task",
    "Your personalized health task is ready",
    "DailyTask"
  );
};

/* ================= 2 PM ================= */
export const scheduleMissedTaskReminder = async () => {
  const channelId = await getDailyChannel();

  const date = new Date();
  date.setHours(14, 0, 0, 0);
  if (date <= new Date()) date.setDate(date.getDate() + 1);

  await notifee.createTriggerNotification(
    {
      title: "⏳ You missed today’s task",
      body: "It’s not too late – take 5 minutes for yourself 💪",
      data: { screen: "AddSymptoms" },
      android: {
        channelId,
        pressAction: { id: "default" },
      },
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
    }
  );

  // 🔔 SAVE TO HISTORY (NEW)
  await saveNotificationToHistory(
    "Symptom Reminder",
    "You haven’t logged today’s symptoms",
    "AddSymptoms"
  );
};

/* ================= 9:30 PM ================= */
export const scheduleNightWellness = async () => {
  const channelId = await getDailyChannel();

  const date = new Date();
  date.setHours(21, 30, 0, 0);
  if (date <= new Date()) date.setDate(date.getDate() + 1);

  await notifee.createTriggerNotification(
    {
      title: "🌙 Wind Down",
      body: "Take a deep breath & prepare for restful sleep 😴",
      data: { screen: "Home" },
      android: {
        channelId,
        pressAction: { id: "default" },
      },
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
      repeatFrequency: "DAILY",
    }
  );

  // 🔔 SAVE TO HISTORY (NEW)
  await saveNotificationToHistory(
    "Night Wellness",
    "Time to relax and prepare for sleep",
    "Home"
  );
};

/* ======================================================
   🔥 NEW: NOTIFICATION HISTORY (REAL DATA SUPPORT)
   ====================================================== */

import firestore from "@react-native-firebase/firestore";

/* SAVE NOTIFICATION (UNREAD BY DEFAULT) */
export const saveNotificationToHistory = async (
  title: string,
  message: string,
  screen: string
) => {
  const user = auth().currentUser;
  if (!user || user.isAnonymous) return;

  await firestore()
    .collection("notifications")
    .add({
      userId: user.uid,
      title,
      message,
      screen,
      read: false, // 🔴 unread
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
};
