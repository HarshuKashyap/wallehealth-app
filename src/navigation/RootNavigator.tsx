import React, { useContext } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

/* CONTEXT */
import { NetworkContext } from "../context/NetworkContext";
import OfflineScreen from "../screens/OfflineScreen";

/* SCREENS */
import SplashScreen from "../screens/SplashScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import AuthWelcomeScreen from "../screens/AuthWelcomeScreen";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import HomeScreen from "../screens/HomeScreen";
import DailyAITaskScreen from "../screens/DailyAITaskScreen";
import AddSymptomsScreen from "../screens/AddSymptomsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import AnalyticsScreen from "../screens/AnalyticsScreen";
import SettingsScreen from "../screens/SettingsScreen";
import LanguageScreen from "../screens/LanguageScreen";
import PrivacyScreen from "../screens/PrivacyScreen";
import TermsScreen from "../screens/TermsScreen";
import ContactScreen from "../screens/ContactScreen";
import AIHealthAssistant from "../screens/AIHealthAssistant";
import NearbyDoctorsScreen from "../screens/NearbyDoctorsScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import WeeklyReflectionScreen from "../screens/WeeklyReflectionScreen";
import MedicineReminderScreen from "../screens/MedicineReminderScreen";
import SecretMode from "../screens/SecretMode";



const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { isConnected } = useContext(NetworkContext);

  if (!isConnected) {
    return <OfflineScreen />;
  }

  return (
    <Stack.Navigator>
      {/* START */}
      <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />

      {/* AUTH */}
      <Stack.Screen name="AuthWelcome" component={AuthWelcomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />

      {/* MAIN */}
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SecretMode" component={SecretMode} options={{ headerShown: false }} />
      <Stack.Screen name="DailyTask" component={DailyAITaskScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AddSymptoms" component={AddSymptomsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MedicineReminder" component={MedicineReminderScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="NearbyDoctors" component={NearbyDoctorsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Analytics" component={AnalyticsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AI" component={AIHealthAssistant} options={{ headerShown: false }} />

      {/* SETTINGS */}
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Language" component={LanguageScreen} options={{ title: "Language" }} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Terms" component={TermsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Contact" component={ContactScreen} options={{ title: "Contact Us" }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="WeeklyReflection" component={WeeklyReflectionScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
