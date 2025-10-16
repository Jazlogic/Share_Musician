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
  client_id: string;
  musician_id?: string;
  title: string;
  description: string;
  category: string;
  location: string | object; // JSON string or object with address, latitude, longitude
  event_date: string;
  start_time: string;
  end_time: string;
  event_duration?: string;
  price: number; // Campo original de la tabla
  total_price?: number; // Campo agregado en migraciones
  tip?: number;
  status: 'CREATED' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  created_at: string;
  updated_at: string;
  updated_by?: string;
  expiration_date?: string;
  cancellation_reason?: string;
  client_rating?: number;
  musician_rating?: number;
  client_comment?: string;
  musician_comment?: string;
  is_public: boolean;
  reopened_from_id?: string;
  
  // Campos adicionales de migraciones
  event_type_id?: string;
  duration?: string;
  base_rate?: number;
  duration_hours?: number;
  distance_km?: number;
  experience_factor?: number;
  instrument_factor?: number;
  system_fee?: number;
  extra_amount?: number;
  
  // Campos calculados para la UI
  instruments?: string[]; // Array of instrument names
  offers_count?: number; // Number of offers received
  client_name?: string; // Name of the client who created the request
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
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
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
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const onRefresh = () => {
    fetchRequests(true);
  };

  const renderRequestCard = ({ item }: { item: Request }) => {
    // Manejar location de forma segura
    let locationData;
    try {
      if (typeof item.location === 'string') {
        locationData = JSON.parse(item.location);
      } else if (typeof item.location === 'object' && item.location !== null) {
        locationData = item.location;
      } else {
        locationData = { address: 'Ubicación no especificada' };
      }
    } catch (error) {
      // Si no es JSON válido, usar como string directo
      locationData = { address: (item.location as string) || 'Ubicación no especificada' };
    }
    const eventDate = item.event_date ? new Date(item.event_date) : new Date();
    const formattedDate = eventDate.toLocaleDateString('es-ES', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    const formattedTime = item.start_time && item.end_time 
      ? `${item.start_time.substring(0, 5)} - ${item.end_time.substring(0, 5)}`
      : 'Horario no especificado';
    
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'CREATED': return '#4CAF50'; // Verde
        case 'ACCEPTED': return '#2196F3'; // Azul
        case 'IN_PROGRESS': return '#FF9800'; // Naranja
        case 'COMPLETED': return '#9C27B0'; // Morado
        case 'CANCELLED': return '#F44336'; // Rojo
        default: return '#757575'; // Gris
      }
    };

    const getStatusText = (status: string) => {
      switch (status) {
        case 'CREATED': return 'Disponible';
        case 'ACCEPTED': return 'Aceptada';
        case 'IN_PROGRESS': return 'En Progreso';
        case 'COMPLETED': return 'Completada';
        case 'CANCELLED': return 'Cancelada';
        default: return status;
      }
    };

    return (
      <View style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
        {/* Header con título, precio y estado */}
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={[styles.cardTitle, { color: textColor }]} numberOfLines={2}>
              {item.title || 'Sin título'}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status || 'CREATED') }]}>
              <Text style={styles.statusText}>{getStatusText(item.status || 'CREATED')}</Text>
            </View>
          </View>
          <Text style={[styles.cardPrice, { color: textColor }]}>
            RD$ {(item.total_price || item.price || 0).toLocaleString()}
          </Text>
        </View>

        {/* Información del evento */}
        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <FontAwesome name="calendar" size={14} color={secondaryTextColor} style={styles.icon} />
            <Text style={[styles.infoText, { color: secondaryTextColor }]}>{formattedDate}</Text>
          </View>
          <View style={styles.infoRow}>
            <FontAwesome name="clock-o" size={14} color={secondaryTextColor} style={styles.icon} />
            <Text style={[styles.infoText, { color: secondaryTextColor }]}>{formattedTime}</Text>
          </View>
          <View style={styles.infoRow}>
            <FontAwesome name="map-marker" size={14} color={secondaryTextColor} style={styles.icon} />
            <Text style={[styles.infoText, { color: secondaryTextColor }]} numberOfLines={1}>
              {locationData?.address || 'Ubicación no especificada'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <FontAwesome name="music" size={14} color={secondaryTextColor} style={styles.icon} />
            <Text style={[styles.infoText, { color: secondaryTextColor }]} numberOfLines={1}>
              {item.category || 'Categoría no especificada'}
            </Text>
          </View>
        </View>

        {/* Instrumentos */}
        {item.instruments && item.instruments.length > 0 && (
          <View style={styles.instrumentsContainer}>
            <Text style={[styles.instrumentsLabel, { color: textColor }]}>Instrumentos:</Text>
            <View style={styles.instrumentsTags}>
              {item.instruments.slice(0, 3).map((instrument, index) => (
                <View key={index} style={[styles.instrumentTag, { backgroundColor: buttonBackgroundColor }]}>
                  <Text style={[styles.instrumentText, { color: buttonTextColor }]}>{instrument}</Text>
                </View>
              ))}
              {item.instruments.length > 3 && (
                <View style={[styles.instrumentTag, { backgroundColor: buttonBackgroundColor }]}>
                  <Text style={[styles.instrumentText, { color: buttonTextColor }]}>
                    +{item.instruments.length - 3}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Contador de ofertas */}
        {item.offers_count !== undefined && item.offers_count > 0 && (
          <View style={styles.offersContainer}>
            <FontAwesome name="handshake-o" size={14} color="#4CAF50" />
            <Text style={[styles.offersText, { color: '#4CAF50' }]}>
              {item.offers_count} oferta{item.offers_count !== 1 ? 's' : ''}
            </Text>
          </View>
        )}

        {/* Acciones */}
        <View style={styles.cardActions}>
          <Pressable
            style={[styles.button, { backgroundColor: buttonBackgroundColorDetalle }]}
            onPress={() => router.push({ pathname: "/request-details", params: { id: item.id } })}
          >
            <FontAwesome name="eye" size={14} color={buttonTextColor} />
            <Text style={[styles.buttonText, { color: buttonTextColor }]}>Ver Detalles</Text>
          </Pressable>
          
          {item.status === 'CREATED' && (
            <Pressable
              style={[styles.button, { backgroundColor: buttonBackgroundColor }]}
              onPress={() => router.push({ pathname: "/modal", params: { requestId: item.id, flow: "makeOffer" } })}
            >
              <FontAwesome name="handshake-o" size={14} color={buttonTextColor} />
              <Text style={[styles.buttonText, { color: buttonTextColor }]}>Hacer Oferta</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  };

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
          refreshing={refreshing}
          onRefresh={onRefresh}
          showsVerticalScrollIndicator={false}
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
    alignItems: "flex-start",
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
    lineHeight: 22,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: '#4CAF50',
  },
  cardBody: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  icon: {
    marginRight: 8,
    width: 16,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
  },
  instrumentsContainer: {
    marginBottom: 12,
  },
  instrumentsLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  instrumentsTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  instrumentTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  instrumentText: {
    fontSize: 12,
    fontWeight: '500',
  },
  offersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  offersText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
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