import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeModules, Platform } from "react-native";

type Language = "en" | "hi";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  ready: boolean;
};

/* ================= TRANSLATIONS ================= */
const LANG_KEY = "APP_LANGUAGE";
const LANG_SOURCE = "LANG_SOURCE"; // auto | manual

const translations = {
  en: {
    guest_user: "Guest User",
    user: "User",
language_title: "Language",

walle_morning: "Good morning! Aaj kaisa feel ho raha hai? ☀️",
walle_day: "Hope tumhara din theek ja raha hai 🌤️",
walle_evening: "Thoda sa khud ke liye time nikaalo 💙",
walle_night: "Raat me bhi main yahin hoon 🌙",

home_morning_title: "Good morning. How are you feeling today?",
home_morning_sub: "Start your day by checking in with your body.",

home_day_title: "How is your body feeling right now?",
home_day_sub: "A quick check-in can help you stay aware.",

home_evening_title: "Before you rest, log how you feel.",
home_evening_sub: "A small note now can help you tomorrow.",

home_late_title: "It’s late. Take a moment to check in with yourself.",
home_late_sub: "Even one line can make a difference.",

    daily_task: "AI Daily Health Task",
    daily_task_desc: "A simple personalized task for today",

    add_symptoms: "Add Symptoms",
    add_symptoms_desc: "Log how you feel to get better insights",

    nearby_doctors: "Nearby Doctors",
    nearby_doctors_desc: "Find hospitals & clinics near you",

    ai_assistant: "WALLE AI Assistant",
    ai_assistant_desc: "Ask questions & get safe guidance",
    ai_example: "Try asking: “Why do I feel tired every day?”",

    welcome: "Welcome to WALLE",
    welcome_points:
      "• Start with AI Daily Health Task\n• Add symptoms anytime\n• Ask WALLE AI for guidance",
    got_it: "Got it",
        select_language: "Select Language",
        english: "English",
        hindi: "Hindi",
            settings: "Settings",
            settings_subtitle: "Manage your preferences & privacy",
            general: "General",
            language: "Language",
            privacy_policy: "Privacy Policy",
            terms: "Terms & Conditions",
            contact_us: "Contact Us",
            danger_zone: "Danger Zone",
            delete_account: "Delete Account",
            delete_warning:
              "This will permanently delete your account and all health data. This action cannot be undone.",
              relogin_required_title: "Login required",
              relogin_required_desc:
                "For security reasons, please login again to delete your account.",
              relogin_required_ok: "OK",

            cancel: "Cancel",
            delete: "Delete",
            notifications: "Notifications",
            no_notifications: "No notifications yet",
            offline_message:
              "It seems there is some connectivity issue.\nPlease try again after some time!",
            refresh: "Refresh",
            privacy_policy: "Privacy Policy",
            privacy_subtitle: "Your privacy & data protection",

            privacy_title_1: "Your Privacy Matters",
            privacy_text_1:
              "WALLE respects your privacy. Your health-related information is securely stored and is never shared with third parties without your explicit consent.",

            privacy_title_2: "Data Security",
            privacy_text_2:
              "We follow industry-standard security practices, including encryption and secure authentication, to protect your personal and health information from unauthorized access.",

            privacy_title_3: "Account & Data Deletion",
            privacy_text_3:
              "You can delete your account at any time from the Settings section. Once deleted, all associated data is permanently removed from our systems.",

            privacy_read_more: "Read full Privacy Policy on website",
            last_updated: "Last updated:",
            terms: "Terms & Conditions",
            terms_subtitle: "Please read these terms carefully",

            terms_title_1: "Terms of Use",
            terms_text_1:
              "By using WALLE, you agree to use the application responsibly. The features, insights, and recommendations provided are intended for general wellness and informational purposes only.",

            terms_title_2: "Medical Disclaimer",
            terms_text_2:
              "WALLE does not provide medical advice, diagnosis, or treatment. The app is not a substitute for professional healthcare. Always seek the advice of a qualified healthcare professional before making any medical decisions.",

            terms_title_3: "Account Responsibility",
            terms_text_3:
              "You are responsible for maintaining the confidentiality of your account. Any misuse, abuse, or violation of these terms may result in temporary or permanent suspension or termination of your account.",

            terms_title_4: "Limitation of Liability",
            terms_text_4:
              "WALLE shall not be held liable for any direct or indirect damages, health outcomes, or losses arising from the use or inability to use the application.",
              daily_task_loading: "Preparing today’s health focus…",
              daily_task_title: "AI Daily Task",
              today_health_focus: "Today’s Health Focus",

              daily_task_guest_info:
                "You’re seeing a sample AI task. Create an account for daily personalization.",
              daily_task_user_info:
                "This task is personalized using your recent activity & symptoms.",

              login_to_complete: "Login to complete task",
              completed: "Completed",
              mark_as_done: "Mark as Done",

              daily_task_note:
                "Completing daily tasks helps you build healthier habits over time.",

              login_required: "Login required",
              login_required_desc:
                "Create an account to complete daily AI health tasks",
              login_signup: "Login / Sign up",
              maybe_later: "Maybe later",
              add_symptom: "Add Symptom",
              add_symptom_subtitle: "Describe how you’re feeling today",

              your_symptom: "Your Symptom",
              symptom_placeholder:
                "Example: Fever since last night, headache, body pain…",

              save_symptom: "Save Symptom",

              symptom_disclaimer:
                "🛡️ This information is private and used only to improve your health insights.",

              saved: "Saved",
              symptom_saved_success:
                "Your symptom has been logged successfully",

              missing_information: "Missing information",
              describe_symptom: "Please describe your symptom.",

              login_required_short: "Please sign in to continue.",

              account_required: "Account required",
              account_required_desc:
                "Please create an account to save symptoms and get personalized AI insights.",

              error: "Error",
              save_symptom_error:
                "Unable to save symptom. Please try again.",
                good_morning: "Good morning",
                good_afternoon: "Good afternoon",
                good_evening: "Good evening",

                ai_intro: "I’m WALLE AI, your personal health assistant.",
                ai_guest_limit:
                  "You can try 2 messages as a guest. Create an account for unlimited access 💙",
                ai_how_feeling: "How are you feeling today? 💙",

                ai_thinking: "Let me think about this…",
                ai_unavailable: "WALLE AI is taking a short break. Please try again in a moment.",

                ai_typing: "WALLE AI is typing",

                ai_input_placeholder:
                  "Describe your symptoms or ask a question…",

                ai_disclaimer:
                  "🛡️ Guidance only, not medical diagnosis.",

                ai_login_required_desc:
                  "Create an account to continue chatting with WALLE AI",
                  analytics_title: "Health Analytics",
                  analytics_subtitle:
                    "AI-powered insights based on your symptoms",

                  analytics_loading: "Preparing your health insights…",

                  analytics_login_required:
                    "Login to unlock AI-powered health insights.",

                  analytics_start_logging:
                    "Start logging symptoms daily to unlock personalized AI health insights.",

                  analytics_error:
                    "Unable to generate AI insights right now.",

                  symptom_trends: "Symptom Trends",
                  ai_health_insight: "AI Health Insight",

                  analytics_no_data:
                    "Track symptoms across multiple days to reveal trends 📈",

                  analytics_add_more:
                    "Add more symptoms to improve insight",

                  morning_checkin: "Morning check-in",
                  afternoon_reflection: "Afternoon reflection",
                  evening_reflection: "Evening reflection",

                  day_streak: "day symptom tracking streak",
                  analytics_tip:
                    "Logging symptoms daily helps AI detect deeper patterns.",
                    contact_title: "Contact Us",
                    contact_need_help: "Need Help?",
                    contact_description:
                      "Reach out to us anytime. We usually respond within 24 hours.",
                      nearby_title: "Nearby Doctors",
                      nearby_subtitle: "Showing results within 5 km",

                      nearby_searching: "Searching within 5 km…",

                      nearby_empty_title: "No doctors nearby",
                      nearby_empty_desc:
                        "No hospitals, clinics or doctors found within 5 km.",

                      filter_all: "All",
                      filter_hospital: "Hospital",
                      filter_clinic: "Clinic",
                      filter_doctor: "Doctor",

                      directions: "Directions",
                      profile_title: "My Profile",
                      profile_subtitle: "Your personal information",

                      profile_name: "Full Name",
                      profile_age: "Age",
                      profile_gender: "Gender",

                      gender_male: "Male",
                      gender_female: "Female",
                      gender_other: "Other",

                      profile_finish: "Finish Profile",
                      profile_save: "Save Profile",
                      profile_edit: "Edit Profile",

                      profile_incomplete: "Please complete all fields",
                      role_guest: "Guest Account",
                      role_health: "Health Profile",

                      menu_profile: "Profile",
                      menu_analytics: "Health Analytics",
                      menu_settings: "Settings",
                      menu_logout: "Logout",

                      logout_title: "Logout",
                      logout_message: "Are you sure you want to logout from WALLE?",

                      cancel: "Cancel",
                      logout: "Logout",













  },

  hi: {
    guest_user: "अतिथि उपयोगकर्ता",
    user: "उपयोगकर्ता",
language_title: "भाषा",

walle_morning: "सुप्रभात! आज आप कैसा महसूस कर रहे हैं? ☀️",
walle_day: "उम्मीद है आपका दिन अच्छा जा रहा है 🌤️",
walle_evening: "थोड़ा सा समय अपने लिए निकालें 💙",
walle_night: "रात में भी मैं यहीं हूँ 🌙",

home_morning_title: "सुप्रभात। आज आप कैसा महसूस कर रहे हैं?",
home_morning_sub: "अपने दिन की शुरुआत अपने शरीर से जुड़कर करें।",

home_day_title: "अभी आपका शरीर कैसा महसूस कर रहा है?",
home_day_sub: "एक छोटा सा चेक-इन आपको जागरूक रख सकता है।",

home_evening_title: "सोने से पहले अपनी स्थिति लिखें।",
home_evening_sub: "आज की एक छोटी सी बात कल मदद कर सकती है।",

home_late_title: "काफी देर हो गई है। खुद से जुड़ने का एक पल लें।",
home_late_sub: "एक पंक्ति भी फर्क ला सकती है।",

    daily_task: "AI दैनिक स्वास्थ्य कार्य",
    daily_task_desc: "आज के लिए एक सरल व्यक्तिगत कार्य",

    add_symptoms: "लक्षण जोड़ें",
    add_symptoms_desc: "बेहतर जानकारी के लिए अपनी स्थिति दर्ज करें",

    nearby_doctors: "नज़दीकी डॉक्टर",
    nearby_doctors_desc: "अपने पास के अस्पताल और क्लिनिक खोजें",

    ai_assistant: "WALLE AI सहायक",
    ai_assistant_desc: "प्रश्न पूछें और सुरक्षित मार्गदर्शन पाएं",
    ai_example: "जैसे पूछें: “मुझे रोज़ थकान क्यों रहती है?”",

    welcome: "WALLE में आपका स्वागत है",
    welcome_points:
      "• AI दैनिक स्वास्थ्य कार्य शुरू करें\n• कभी भी लक्षण जोड़ें\n• WALLE AI से मार्गदर्शन पाएं",
    got_it: "समझ गया",
        select_language: "भाषा चुनें",
        english: "अंग्रेज़ी",
        hindi: "हिंदी",
            settings: "सेटिंग्स",
            settings_subtitle: "अपनी प्राथमिकताएँ और गोपनीयता प्रबंधित करें",
            general: "सामान्य",
            language: "भाषा",
            privacy_policy: "गोपनीयता नीति",
            terms: "नियम और शर्तें",
            contact_us: "संपर्क करें",
            danger_zone: "खतरे वाला क्षेत्र",
            delete_account: "खाता हटाएँ",
            delete_warning:
              "यह आपका खाता और सभी स्वास्थ्य डेटा स्थायी रूप से हटा देगा। यह क्रिया वापस नहीं की जा सकती।",
              relogin_required_title: "लॉगिन आवश्यक है",
              relogin_required_desc:
                "सुरक्षा कारणों से खाता हटाने के लिए कृपया दोबारा लॉगिन करें।",
              relogin_required_ok: "ठीक है",

            cancel: "रद्द करें",
            delete: "हटाएँ",
            notifications: "सूचनाएँ",
            no_notifications: "अभी कोई सूचना नहीं है",
            offline_message:
              "लगता है इंटरनेट कनेक्शन में समस्या है।\nकृपया कुछ समय बाद पुनः प्रयास करें।",
            refresh: "रीफ्रेश करें",
            privacy_policy: "गोपनीयता नीति",
            privacy_subtitle: "आपकी गोपनीयता और डेटा सुरक्षा",

            privacy_title_1: "आपकी गोपनीयता महत्वपूर्ण है",
            privacy_text_1:
              "WALLE आपकी गोपनीयता का सम्मान करता है। आपकी स्वास्थ्य संबंधी जानकारी सुरक्षित रूप से संग्रहीत की जाती है और आपकी स्पष्ट अनुमति के बिना किसी तीसरे पक्ष के साथ साझा नहीं की जाती।",

            privacy_title_2: "डेटा सुरक्षा",
            privacy_text_2:
              "हम आपके व्यक्तिगत और स्वास्थ्य संबंधी डेटा को अनधिकृत पहुंच से बचाने के लिए एन्क्रिप्शन और सुरक्षित प्रमाणीकरण सहित उद्योग-मानक सुरक्षा उपायों का पालन करते हैं।",

            privacy_title_3: "खाता और डेटा हटाना",
            privacy_text_3:
              "आप सेटिंग्स अनुभाग से किसी भी समय अपना खाता हटा सकते हैं। हटाने के बाद, सभी संबंधित डेटा हमारे सिस्टम से स्थायी रूप से हटा दिया जाएगा।",

            privacy_read_more: "वेबसाइट पर पूरी गोपनीयता नीति पढ़ें",
            last_updated: "अंतिम अपडेट:",
            terms: "नियम और शर्तें",
            terms_subtitle: "कृपया इन नियमों को ध्यान से पढ़ें",

            terms_title_1: "उपयोग की शर्तें",
            terms_text_1:
              "WALLE का उपयोग करके, आप ऐप का जिम्मेदारी से उपयोग करने के लिए सहमत होते हैं। इसमें दी गई सुविधाएँ, जानकारियाँ और सुझाव केवल सामान्य स्वास्थ्य और जानकारी के उद्देश्य से हैं।",

            terms_title_2: "चिकित्सकीय अस्वीकरण",
            terms_text_2:
              "WALLE कोई चिकित्सकीय सलाह, निदान या उपचार प्रदान नहीं करता। यह ऐप पेशेवर स्वास्थ्य सेवा का विकल्प नहीं है। किसी भी चिकित्सकीय निर्णय से पहले योग्य स्वास्थ्य विशेषज्ञ से सलाह लें।",

            terms_title_3: "खाता जिम्मेदारी",
            terms_text_3:
              "अपने खाते की गोपनीयता बनाए रखना आपकी जिम्मेदारी है। इन शर्तों के किसी भी दुरुपयोग या उल्लंघन पर आपका खाता अस्थायी या स्थायी रूप से निलंबित या समाप्त किया जा सकता है।",

            terms_title_4: "दायित्व की सीमा",
            terms_text_4:
              "WALLE ऐप के उपयोग या उपयोग न कर पाने से होने वाले किसी भी प्रत्यक्ष या अप्रत्यक्ष नुकसान, स्वास्थ्य परिणाम या हानि के लिए जिम्मेदार नहीं होगा।",
              daily_task_loading: "आज का स्वास्थ्य फोकस तैयार किया जा रहा है…",
              daily_task_title: "AI दैनिक कार्य",
              today_health_focus: "आज का स्वास्थ्य फोकस",

              daily_task_guest_info:
                "आप एक सैंपल AI कार्य देख रहे हैं। रोज़ाना व्यक्तिगत सुझावों के लिए खाता बनाएं।",
              daily_task_user_info:
                "यह कार्य आपकी हाल की गतिविधि और लक्षणों के आधार पर व्यक्तिगत किया गया है।",

              login_to_complete: "कार्य पूरा करने के लिए लॉगिन करें",
              completed: "पूर्ण हो गया",
              mark_as_done: "पूरा हुआ",

              daily_task_note:
                "दैनिक कार्य पूरे करने से समय के साथ स्वस्थ आदतें बनती हैं।",

              login_required: "लॉगिन आवश्यक है",
              login_required_desc:
                "दैनिक AI स्वास्थ्य कार्य पूरा करने के लिए खाता बनाएं",
              login_signup: "लॉगिन / साइन अप",
              maybe_later: "बाद में",
              add_symptom: "लक्षण जोड़ें",
              add_symptom_subtitle: "आज आप कैसा महसूस कर रहे हैं, बताएं",

              your_symptom: "आपका लक्षण",
              symptom_placeholder:
                "उदाहरण: कल रात से बुखार, सिरदर्द, शरीर दर्द…",

              save_symptom: "लक्षण सहेजें",

              symptom_disclaimer:
                "🛡️ यह जानकारी निजी है और केवल आपके स्वास्थ्य सुझावों को बेहतर बनाने के लिए उपयोग की जाती है।",

              saved: "सहेजा गया",
              symptom_saved_success:
                "आपका लक्षण सफलतापूर्वक सहेज लिया गया है",

              missing_information: "जानकारी अधूरी है",
              describe_symptom: "कृपया अपना लक्षण बताएं।",

              login_required_short: "जारी रखने के लिए लॉगिन करें।",

              account_required: "खाता आवश्यक है",
              account_required_desc:
                "लक्षण सहेजने और व्यक्तिगत AI सुझाव पाने के लिए खाता बनाएं।",

              error: "त्रुटि",
              save_symptom_error:
                "लक्षण सहेजने में समस्या आई। कृपया पुनः प्रयास करें।",
                good_morning: "सुप्रभात",
                good_afternoon: "नमस्कार",
                good_evening: "शुभ संध्या",

                ai_intro: "मैं WALLE AI हूँ, आपका व्यक्तिगत स्वास्थ्य सहायक।",
                ai_guest_limit:
                  "आप अतिथि के रूप में 2 संदेश भेज सकते हैं। असीमित उपयोग के लिए खाता बनाएं 💙",
                ai_how_feeling: "आज आप कैसा महसूस कर रहे हैं? 💙",

                ai_thinking: "सोच रहा हूँ…",
                ai_unavailable: "WALLE AI थोड़ी देर के लिए उपलब्ध नहीं है। कृपया कुछ समय बाद फिर प्रयास करें।",


                ai_typing: "WALLE AI लिख रहा है",

                ai_input_placeholder:
                  "अपने लक्षण बताएं या कोई सवाल पूछें…",

                ai_disclaimer:
                  "🛡️ यह केवल मार्गदर्शन है, चिकित्सीय निदान नहीं।",

                ai_login_required_desc:
                  "WALLE AI से चैट जारी रखने के लिए खाता बनाएं",
                  analytics_title: "स्वास्थ्य विश्लेषण",
                  analytics_subtitle:
                    "आपके लक्षणों पर आधारित AI विश्लेषण",

                  analytics_loading: "आपकी स्वास्थ्य जानकारी तैयार की जा रही है…",

                  analytics_login_required:
                    "AI स्वास्थ्य जानकारी पाने के लिए लॉगिन करें।",

                  analytics_start_logging:
                    "व्यक्तिगत AI स्वास्थ्य जानकारी पाने के लिए रोज़ लक्षण दर्ज करें।",

                  analytics_error:
                    "इस समय AI जानकारी उपलब्ध नहीं है।",

                  symptom_trends: "लक्षणों का रुझान",
                  ai_health_insight: "AI स्वास्थ्य जानकारी",

                  analytics_no_data:
                    "रुझान देखने के लिए कई दिनों तक लक्षण दर्ज करें 📈",

                  analytics_add_more:
                    "बेहतर जानकारी के लिए और लक्षण जोड़ें",

                  morning_checkin: "सुबह की जाँच",
                  afternoon_reflection: "दोपहर का विश्लेषण",
                  evening_reflection: "शाम का विश्लेषण",

                  day_streak: "दिन की लक्षण ट्रैकिंग स्ट्रीक",
                  analytics_tip:
                    "रोज़ लक्षण दर्ज करने से AI गहरे पैटर्न समझ पाता है।",
                    contact_title: "संपर्क करें",
                    contact_need_help: "मदद चाहिए?",
                    contact_description:
                      "कभी भी हमसे संपर्क करें। हम आमतौर पर 24 घंटों के भीतर जवाब देते हैं।",
                      nearby_title: "नज़दीकी डॉक्टर",
                      nearby_subtitle: "5 किमी के भीतर परिणाम दिखाए जा रहे हैं",

                      nearby_searching: "5 किमी के भीतर खोज रहे हैं…",

                      nearby_empty_title: "पास में कोई डॉक्टर नहीं मिला",
                      nearby_empty_desc:
                        "5 किमी के भीतर कोई अस्पताल, क्लिनिक या डॉक्टर नहीं मिला।",

                      filter_all: "सभी",
                      filter_hospital: "अस्पताल",
                      filter_clinic: "क्लिनिक",
                      filter_doctor: "डॉक्टर",

                      directions: "दिशा दिखाएँ",
                      profile_title: "मेरा प्रोफ़ाइल",
                      profile_subtitle: "आपकी व्यक्तिगत जानकारी",

                      profile_name: "पूरा नाम",
                      profile_age: "उम्र",
                      profile_gender: "लिंग",

                      gender_male: "पुरुष",
                      gender_female: "महिला",
                      gender_other: "अन्य",

                      profile_finish: "प्रोफ़ाइल पूरा करें",
                      profile_save: "प्रोफ़ाइल सहेजें",
                      profile_edit: "प्रोफ़ाइल संपादित करें",

                      profile_incomplete: "कृपया सभी जानकारी भरें",
                      role_guest: "अतिथि खाता",
                      role_health: "स्वास्थ्य प्रोफ़ाइल",

                      menu_profile: "प्रोफ़ाइल",
                      menu_analytics: "स्वास्थ्य विश्लेषण",
                      menu_settings: "सेटिंग्स",
                      menu_logout: "लॉगआउट",

                      logout_title: "लॉगआउट",
                      logout_message: "क्या आप वाकई WALLE से लॉगआउट करना चाहते हैं?",

                      cancel: "रद्द करें",
                      logout: "लॉगआउट",












  },
};


/* ================= CONTEXT ================= */

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (k) => k,
  ready: false,
});

/* ================= HELPERS ================= */

const getDeviceLanguage = (): Language => {
  try {
    const locale =
      Platform.OS === "ios"
        ? NativeModules.SettingsManager.settings.AppleLocale ||
          NativeModules.SettingsManager.settings.AppleLanguages?.[0]
        : NativeModules.I18nManager.localeIdentifier;

    if (locale?.toLowerCase().startsWith("hi")) return "hi";
  } catch {}

  return "en";
};

/* ================= PROVIDER ================= */

export const LanguageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [language, setLang] = useState<Language>("en");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      const savedLang = await AsyncStorage.getItem(LANG_KEY);
      const source = await AsyncStorage.getItem(LANG_SOURCE);

      // 🔒 USER MANUAL SELECTION = FINAL
      if (savedLang && source === "manual") {
        setLang(savedLang as Language);
        setReady(true);
        return;
      }

      // 📱 FIRST INSTALL → PHONE LANGUAGE
      const deviceLang = getDeviceLanguage();
      setLang(deviceLang);
      await AsyncStorage.setItem(LANG_KEY, deviceLang);
      await AsyncStorage.setItem(LANG_SOURCE, "auto");

      setReady(true);
    };

    init();
  }, []);


  const setLanguage = useCallback(async (lang: Language) => {
    setLang(lang);
    await AsyncStorage.setItem(LANG_KEY, lang);
    await AsyncStorage.setItem(LANG_SOURCE, "manual"); // 🔒 LOCK
  }, []);


  const t = useCallback(
    (key: string) => translations[language]?.[key] || key,
    [language]
  );

  if (!ready) return null;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, ready }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
