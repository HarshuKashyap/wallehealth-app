import analytics from "@react-native-firebase/analytics";
import React, { useEffect, useRef } from "react";
import {
  NavigationContainer,
  createNavigationContainerRef,
} from "@react-navigation/native";
import { StatusBar, Platform } from "react-native";

import { LanguageProvider } from "./src/context/LanguageContext";
import { NetworkProvider } from "./src/context/NetworkContext";
import RootNavigator from "./src/navigation/RootNavigator";

import auth from "@react-native-firebase/auth";
import messaging from "@react-native-firebase/messaging";

import notifee, {
  AndroidImportance,
  EventType,
  AndroidStyle,
  AndroidCategory,
} from "@notifee/react-native";

import {
  initNotifications,
  scheduleMorningHealthTask,
  scheduleMissedTaskReminder,
  scheduleNightWellness,
} from "./src/notifications/notificationService";

import { initFCM } from "./src/notifications/fcmService";

/* ================= NAV REF ================= */
export const navigationRef = createNavigationContainerRef();

/* ================= TAP HANDLING ================= */
const handlePress = (notification: any) => {
  const screen = notification?.data?.screen;
  if (screen && navigationRef.isReady()) {
    navigationRef.navigate(screen as never);
  }
};

notifee.onForegroundEvent(({ type, detail }) => {
  if (type === EventType.PRESS) {
    handlePress(detail.notification);
  }
});

notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS) {
    handlePress(detail.notification);
  }
});

/* ================= BACKGROUND / KILLED ================= */
/* 🔥 ONLY SHOW NOTIFICATION — NO FIRESTORE SAVE */
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  const channelId = await notifee.createChannel({
    id: "walle-push",
    name: "WALLE Push Notifications",
    importance: AndroidImportance.HIGH,
  });

  await notifee.displayNotification({
    title:
      remoteMessage.notification?.title ??
      remoteMessage.data?.title ??
      "WALLE Health",

    body:
      remoteMessage.notification?.body ??
      remoteMessage.data?.body ??
      "",

    data: remoteMessage.data,

    android: {
      channelId,
      smallIcon: "ic_notification",
      showTimestamp: true,
      when: Date.now(),
      importance: AndroidImportance.HIGH,
      category: AndroidCategory.SOCIAL,
      pressAction: { id: "default" },
      style: {
        type: AndroidStyle.BIGTEXT,
        text:
          remoteMessage.notification?.body ??
          remoteMessage.data?.body ??
          "Tap to open WALLE Health",
      },
    },
  });
});

export default function App() {
      const routeNameRef = useRef<string | undefined>();
  /* ================= FOREGROUND ================= */
  /* 🔥 ONLY SHOW NOTIFICATION — NO FIRESTORE SAVE */
  useEffect(() => {
    const unsub = messaging().onMessage(async (remoteMessage) => {
      const channelId = await notifee.createChannel({
        id: "walle-push",
        name: "WALLE Push Notifications",
        importance: AndroidImportance.HIGH,
      });

      await notifee.displayNotification({
        title:
          remoteMessage.notification?.title ??
          remoteMessage.data?.title ??
          "WALLE Health",

        body:
          remoteMessage.notification?.body ??
          remoteMessage.data?.body ??
          "",

        data: remoteMessage.data,

        android: {
          channelId,
          smallIcon: "ic_notification",
          largeIcon: "ic_notification_large",
          showTimestamp: true,
          when: Date.now(),
          importance: AndroidImportance.HIGH,
          category: AndroidCategory.SOCIAL,
          pressAction: { id: "default" },
          style: {
            type: AndroidStyle.BIGTEXT,
            text:
              remoteMessage.notification?.body ??
              remoteMessage.data?.body ??
              "Tap to open WALLE Health",
          },
        },
      });
    });

    return unsub;
  }, []);

  /* ================= AUTH + LOCAL SCHEDULES ================= */
  useEffect(() => {
    initNotifications();

    const unsubAuth = auth().onAuthStateChanged(async (user) => {
      if (user && !user.isAnonymous) {
        await initFCM();

        // 🔔 LOCAL REMINDERS (AS YOU WANT)
        await scheduleMorningHealthTask();
        await scheduleMissedTaskReminder();
        await scheduleNightWellness();
      }
    });

    return unsubAuth;
  }, []);

  return (
    <NetworkProvider>
      <LanguageProvider>
       <NavigationContainer
         ref={navigationRef}
         onReady={() => {
           routeNameRef.current = navigationRef.getCurrentRoute()?.name;
         }}
         onStateChange={async () => {
           const currentRoute = navigationRef.getCurrentRoute()?.name;

           if (currentRoute && routeNameRef.current !== currentRoute) {
             await analytics().logEvent("screen_open", {
               screen_name: currentRoute,
             });

             routeNameRef.current = currentRoute;
           }
         }}
       >
         <StatusBar
           barStyle="light-content"
           backgroundColor={
             Platform.OS === "android" ? "#000000" : undefined
           }
         />
         <RootNavigator />
       </NavigationContainer>

      </LanguageProvider>
    </NetworkProvider>
  );
}
