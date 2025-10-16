import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Pressable,
  ScrollView,
} from "react-native";
import { Colors } from "../constants/theme";
import BottomNavigationBar from "@/components/BottomNavigationBar";
import { AppColors } from "../theme/colors";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeColor } from "@/hooks/use-theme-color";
import { api } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import FloatingCreateButton from "@/components/FloatingCreateButton";

interface Request {
  id: string;
  title: string;
  distance_km: string;
  price: string;
  event_date: string;
  start_time: string;
  end_time: string;
  description: string;
  category: string;
  // Add any other fields you need for the details screen
}

export default function SolicitudesScreen() {
  const router = useRouter();
  const gradientStart = useThemeColor(
    {
      light: AppColors.background.gradientStartLight,
      dark: AppColors.background.gradientStartDark,
    },
    "background"
  );
  const gradientEnd = useThemeColor(
    {
      light: AppColors.background.gradientEndLight,
      dark: AppColors.background.gradientEndDark,
    },
    "background"
  );
  const cardBackgroundColor = useThemeColor(
    {
      light: AppColors.items.backgroundLight,
      dark: AppColors.items.backgroundDark,
    },
    "background"
  );
  const textColor = useThemeColor(
    { light: AppColors.text.light, dark: AppColors.text.dark },
    "text"
  );
  const secondaryTextColor = useThemeColor(
    { light: AppColors.text.secondary, dark: AppColors.text.secondary },
    "text"
  );
  const buttonBackgroundColor = useThemeColor(
    { light: AppColors.button.backgroundLight, dark: AppColors.button.backgroundDark },
    "background"
  );
  const buttonBackgroundColorDetalle = useThemeColor(
    { light: AppColors.items.backgroundLight, dark: AppColors.items.backgroundDark },
    "background"
  );
  const buttonTextColor = useThemeColor(
    { light: AppColors.button.textLight, dark: AppColors.button.textDark },
    "text"
  );

  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError(null);
      try {
        const userToken = await AsyncStorage.getItem("userToken");
        if (!userToken) {
          throw new Error("No authentication token found.");
        }

        const response = await api.get<Request[]>("/request/created", {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });
        setRequests(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch requests.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const renderRequestCard = ({ item }: { item: Request }) => (
    <View style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: textColor }]}>{item.title}</Text>
        <Text style={[styles.cardPrice, { color: textColor }]}>RD$ {parseFloat(item.price).toLocaleString()}</Text>
      </View>
      <View style={styles.cardBody}>
        <FontAwesome name="map-marker" size={16} color={secondaryTextColor} style={styles.icon} />
        <Text style={[styles.cardDistance, { color: secondaryTextColor }]}>{parseFloat(item.distance_km).toFixed(1)} km away</Text>
      </View>
      <View style={styles.cardActions}>
        <Pressable
          style={[styles.button, { backgroundColor: buttonBackgroundColorDetalle }]}
          onPress={() => router.push({ pathname: "/request-details", params: { id: item.id } })} // Navigate to details screen
        >
          <Text style={[styles.buttonText, { color: buttonTextColor }]}>Ver Detalles</Text>
        </Pressable>
        <Pressable
          style={[styles.button, { backgroundColor: buttonBackgroundColor }]}
          onPress={() => router.push({ pathname: "/modal", params: { requestId: item.id, flow: "makeOffer" } })} // Assuming a modal for making offers
        >
          <Text style={[styles.buttonText, { color: buttonTextColor }]}>Hacer Ofertas</Text>
        </Pressable>
      </View>
    </View>
  );

  if (loading) {
    return (
      <LinearGradient
        colors={[gradientStart, gradientEnd]}
        style={styles.fullScreenContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.loadingContainer}>
          <Text style={{ color: textColor, fontSize: 20, marginBottom: 10 }}>Cargando solicitudes...</Text>
          <ActivityIndicator size="large" color={textColor} />
        </View>
        <BottomNavigationBar />
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient
        colors={[gradientStart, gradientEnd]}
        style={styles.fullScreenContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.errorContainer}>
          <Text style={{ color: textColor, fontSize: 18 }}>Error: {error}</Text>
        </View>
        <BottomNavigationBar />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[gradientStart, gradientEnd]}
      style={styles.fullScreenContainer}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.headerContainer}>
        <Text style={[styles.screenTitle, { color: textColor }]}>Solicitudes Disponibles</Text>
        <Pressable
          style={[styles.createButton, { backgroundColor: buttonBackgroundColor }]}
          onPress={() => router.push("/create-request-optimized")}
        >
          <FontAwesome name="plus" size={16} color={buttonTextColor} />
          <Text style={[styles.createButtonText, { color: buttonTextColor }]}>
            Crear Nueva Solicitud ⭐
          </Text>
        </Pressable>
      </View>
      {requests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome name="music" size={64} color={secondaryTextColor} style={styles.emptyIcon} />
          <Text style={[styles.emptyTitle, { color: textColor }]}>No hay solicitudes disponibles</Text>
          <Text style={[styles.emptySubtitle, { color: secondaryTextColor }]}>
            Sé el primero en crear una solicitud musical
          </Text>
          <Pressable
            style={[styles.createButton, { backgroundColor: buttonBackgroundColor }]}
            onPress={() => router.push("/create-request-optimized")}
          >
            <FontAwesome name="plus" size={16} color={buttonTextColor} />
            <Text style={[styles.createButtonText, { color: buttonTextColor }]}>
              Crear Primera Solicitud ⭐
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          renderItem={renderRequestCard}
          contentContainerStyle={styles.listContentContainer}
        />
      )}
      <FloatingCreateButton />
      <BottomNavigationBar />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: "center",
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 15,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  listContentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100, // Space for bottom navigation
  },
  card: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8, // For Android shadow
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flexShrink: 1, // Allow text to wrap
    marginRight: 10,
  },
  cardPrice: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cardBody: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  icon: {
    marginRight: 5,
  },
  cardDistance: {
    fontSize: 14,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    minWidth: 120,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 80, // Adjust for bottom nav bar
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 80, // Adjust for bottom nav bar
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 80, // Adjust for bottom nav bar
    paddingHorizontal: 40,
  },
  emptyIcon: {
    marginBottom: 20,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: "center",
    lineHeight: 22,
  },
});