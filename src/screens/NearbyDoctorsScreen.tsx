import React, { useEffect, useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Linking,
  StatusBar,
} from "react-native";
import Geolocation from "react-native-geolocation-service";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useLanguage } from "../context/LanguageContext";
import analytics from "@react-native-firebase/analytics"; // 👈 ADD


type Doctor = {
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: "Hospital" | "Clinic" | "Doctor";
  phone?: string;
  distance: number;
};

const FILTERS = [
  { key: "all", value: "All" },
  { key: "hospital", value: "Hospital" },
  { key: "clinic", value: "Clinic" },
  { key: "doctor", value: "Doctor" },
] as const;

const MAX_DISTANCE_KM = 5;

/* ================= DISTANCE ================= */
const toRad = (v: number) => (v * Math.PI) / 180;

const getDistanceKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

/* ================= SCREEN ================= */
const NearbyDoctorsScreen = ({ navigation }: any) => {
      const { t } = useLanguage();

  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filter, setFilter] = useState<
    (typeof FILTERS)[number]["value"]
  >("All");


  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, []);
useEffect(() => {
  analytics().logScreenView({
    screen_name: "Nearby_Doctors",
    screen_class: "NearbyDoctorsScreen",
  });
}, []);


  /* ================= PERMISSION ================= */
  const requestPermission = async () => {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  /* ================= LOCATION ================= */
  const getLocation = async () => {
    const allowed = await requestPermission();
    if (!allowed) {
      setLoading(false);
      return;
    }

    Geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => setLoading(false),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  /* ================= FETCH ================= */
  const fetchDoctors = async (lat: number, lng: number) => {
    setLoading(true);

    const query = `
      [out:json];
      (
        node["amenity"="hospital"](around:5000,${lat},${lng});
        node["amenity"="clinic"](around:5000,${lat},${lng});
        node["amenity"="doctor"](around:5000,${lat},${lng});
        node["healthcare"](around:5000,${lat},${lng});
      );
      out;
    `;

    try {
      const res = await fetch(
        `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
          query
        )}`
      );
      const data = await res.json();

      const list: Doctor[] = (data.elements || [])
        .map((item: any) => {
          const distance = getDistanceKm(
            lat,
            lng,
            item.lat,
            item.lon
          );

          return {
            name: item.tags?.name || "Healthcare Provider",
            address:
              item.tags?.["addr:full"] ||
              item.tags?.["addr:street"] ||
              "Address not available",
            lat: item.lat,
            lng: item.lon,
            phone: item.tags?.phone,
            type:
              item.tags?.amenity === "hospital"
                ? "Hospital"
                : item.tags?.amenity === "clinic"
                ? "Clinic"
                : "Doctor",
            distance,
          };
        })
        .filter((d) => d.distance <= MAX_DISTANCE_KM)
        .sort((a, b) => a.distance - b.distance);

      setDoctors(list);
    } catch {
      setDoctors([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    if (location) fetchDoctors(location.lat, location.lng);
  }, [location]);

  const filteredDoctors =
    filter === "All"
      ? doctors
      : doctors.filter((d) => d.type === filter);

  const openMaps = (lat: number, lng: number) => {
    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    );
  };

  /* ================= LOADER ================= */
  if (loading) {
    return (
      <View style={styles.center}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.centerText}>
          {t("nearby_searching")}
        </Text>

      </View>
    );
  }

  /* ================= EMPTY ================= */
  if (filteredDoctors.length === 0) {
    return (
      <View style={styles.center}>
        <Icon name="map-marker-off" size={48} color="#94A3B8" />
        <Text style={styles.emptyTitle}>
          {t("nearby_empty_title")}
        </Text>

        <Text style={styles.emptyText}>
          {t("nearby_empty_desc")}
        </Text>

      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <LinearGradient
         colors={["#1E2A78", "#5B6CFF", "#9B7BFF"]}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        <Icon name="hospital-marker" size={38} color="#fff" />
        <Text style={styles.headerTitle}>
          {t("nearby_title")}
        </Text>

        <Text style={styles.headerSubtitle}>
          {t("nearby_subtitle")}
        </Text>


        <View style={styles.filterRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.filterChip,
                filter === f.value && styles.filterChipActive,
              ]}
              onPress={() => setFilter(f.value)}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === f.value && { color: "#fff" },
                ]}
              >
                {t(`filter_${f.key}`)}
              </Text>
            </TouchableOpacity>
          ))}

        </View>
      </LinearGradient>

      {/* LIST */}
      <FlatList
        data={filteredDoctors}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Icon name="stethoscope" size={22} color="#6366F1" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.type}>
                  {item.type} • {item.distance.toFixed(1)} km
                </Text>
              </View>
            </View>

            <Text style={styles.address}>{item.address}</Text>

            <TouchableOpacity onPress={() => openMaps(item.lat, item.lng)} activeOpacity={0.9}>
              <LinearGradient
                colors={["#4F46E5", "#7C5CFA", "#9B7BFF"]}
                style={styles.directionBtn}
              >
                <Icon name="navigation" size={18} color="#fff" />
                <Text style={styles.directionText}>{t("directions")}</Text>
              </LinearGradient>
            </TouchableOpacity>

          </View>
        )}
      />
    </View>
  );
};

export default NearbyDoctorsScreen;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020617" },

  header: {
    paddingTop: 64,
    paddingBottom: 40,
    alignItems: "center",
    justifyContent: "flex-end",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },


 backBtn: {
   position: "absolute",
   left: 16,
   top: 52,
   height: 42,
   width: 42,
   borderRadius: 21,
   backgroundColor: "rgba(255,255,255,0.18)", // glass look
   alignItems: "center",
   justifyContent: "center",
 },


  headerTitle: {
    marginTop: 12,
    fontSize: 22,
    fontWeight: "900",
    color: "#fff",
  },


  headerSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
  },


  filterRow: { flexDirection: "row", marginTop: 12 },

  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 4,
  },

  filterChipActive: { backgroundColor: "#4F46E5" },

  filterText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#E0E7FF",
  },

  center: {
    flex: 1,
    backgroundColor: "#020617",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  centerText: { marginTop: 10, color: "#94A3B8" },

  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "800",
    color: "#E5E7EB",
    textAlign: "center",
  },

  emptyText: {
    marginTop: 6,
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
  },

  card: {
    backgroundColor: "#020617",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1E293B",
  },

  cardTop: { flexDirection: "row", alignItems: "center" },

  name: { fontSize: 16, fontWeight: "800", color: "#E5E7EB" },

  type: { fontSize: 12, color: "#94A3B8", fontWeight: "600" },

  address: { marginTop: 10, fontSize: 13, color: "#CBD5E1" },

  directionBtn: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },


  directionText: {
    marginLeft: 6,
    color: "#fff",
    fontWeight: "800",
  },
});
