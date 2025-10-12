import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { AppColors } from "../theme/colors";
import BottomNavigationBar from "@/components/BottomNavigationBar";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeColor } from "@/hooks/use-theme-color";
import { api } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "../context/UserContext";
import { FontAwesome } from "@expo/vector-icons";

interface Request {
  id: string;
  client_id: string;
  title: string;
  description: string;
  category: string;
  event_date: string;
  start_time: string;
  end_time: string;
  price: number;
  status: string;
}

export default function SolicitudesScreen() {
  // const { user } = useUser();
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
  const requestCardColor = useThemeColor(
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
  const itemBackgroundColor = useThemeColor(
    {
      light: AppColors.items.backgroundLight,
      dark: AppColors.items.backgroundDark,
    },
    "background"
  );
  const primaryCardsRequestBackgroundColor = useThemeColor(
    {
      light: AppColors.cardsRequest.primaryBackgroundLight,
      dark: AppColors.cardsRequest.primaryBackgroundDark,
    },
    "background"
  );
  const secondaryCardsRequestBackgroundColor = useThemeColor(
    {
      light: AppColors.cardsRequest.secondaryBackgroundLight,
      dark: AppColors.cardsRequest.secondaryBackgroundDark,
    },
    "background"
  );
  const borderColor = useThemeColor(
    {
      light: AppColors.cardsRequest.borderLight,
      dark: AppColors.cardsRequest.borderDark,
    },
    "text"
  );

  const bgGradientStart = useThemeColor(
    {
      light: AppColors.cardsRequest.gradientStartLight,
      dark: AppColors.cardsRequest.gradientStartDark,
    },
    "background"
  );
  const bgGradientEnd = useThemeColor(
    {
      light: AppColors.cardsRequest.gradientEndLight,
      dark: AppColors.cardsRequest.gradientEndDark,
    },
    "background"
  );



  const [request, setRequest] = useState<Request[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(
    null
  );


  useEffect(() => {
    const fetchRequest = async () => {
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
        setRequest(response.data);
        console.log(response.data[0]);
      } catch (err: any) {
        setError(err.message || "Failed to fetch request.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, []);

  const toggleExpand = (requestId: string) => {
    setExpandedRequestId((prevId) => (prevId === requestId ? null : requestId));
  };

  if (loading) {
  // if (loading) {
    return (
    <LinearGradient
      colors={[gradientStart, gradientEnd]}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >


          <View style={[styles.container,{borderRadius: 10}]}>
                <Text style={{ color: textColor, fontSize: 26, fontWeight: 'bold' }}>Cargando solicitudes...</Text>
                <ActivityIndicator size="large" color={textColor} />
              </View>
            <BottomNavigationBar/>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient
        colors={[gradientStart, gradientEnd]}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={{ color: AppColors.text.light }}>Error: {error}</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[gradientStart, gradientEnd]}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.container}>
        <Text style={[styles.title, { color: textColor }]}>Solicitudes Creadas</Text>
        {request.length === 0 ? (
          <View style={[styles.container]}>
            <View>
              <Text style={{ color: textColor, fontSize: 26, fontWeight: 'bold' }}>No hay solicitudes creadas.</Text>
            </View>
          </View>
        ) : (
          <FlatList
          data={request}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isExpanded = item.id === expandedRequestId;
            <Text style={[styles.title, { color: textColor }]}>Solicitudes Creadas</Text>
            return (
              <Pressable onPress={() => toggleExpand(item.id)} style={[styles.requestCard,]}>
                  <LinearGradient
                   colors={[bgGradientStart, bgGradientEnd, itemBackgroundColor]}
                   style={[styles.container,{borderRadius: 10}]}
                   start={{ x: 1, y: -1 }}
                   end={{ x: 0, y: 0 }}
                 >
                  <View style={[styles.cardHeader]}>
                    <View style={[styles.statusBadge, { backgroundColor: item.status === 'pending' ? AppColors.status.pending : (item.status === 'completed' ? AppColors.status.completed : AppColors.status.default) }]}>
                      <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                    </View>
                    <View style={[styles.detailCard, { backgroundColor: secondaryCardsRequestBackgroundColor , borderColor: borderColor}]}>
                      <Text style={[styles.requestTitle, { color: textColor }]}>{item.title}.</Text>
                    </View>
                  </View>
                  <View style={[styles.detailCard, { backgroundColor: secondaryCardsRequestBackgroundColor , borderColor: borderColor}]}>
                   <FontAwesome name="money" size={20} color={AppColors.status.completed} style={styles.detailIcon} />
                  <Text style={[styles.requestPrice, { color: AppColors.status.completed }]}>RD$ {item.price}</Text>
                  </View>
                  {isExpanded && (
                    <View style={styles.detailsContainer}>
                      <View style={[styles.detailCard, { backgroundColor: secondaryCardsRequestBackgroundColor , borderColor: borderColor}]}>
                        <FontAwesome name="calendar" size={20} color={textColor} style={styles.detailIcon} />
                        <View>
                          <Text style={[styles.requestDetailLabel, { color: textColor }]}>Fecha y Hora del Evento</Text>
                          <Text style={[styles.requestDetail, { color: textColor }]}>
                            {new Date(item.event_date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </Text>
                          <Text style={[styles.requestDetail, { color: textColor,}]}>
                            De {new Date(`2000-01-01T${item.start_time}`).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            {' '}
                            a {new Date(`2000-01-01T${item.end_time}`).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true })}
                          </Text>
                        </View>
                      </View>
                      <View style={[styles.detailCard, { backgroundColor: secondaryCardsRequestBackgroundColor , borderColor: borderColor}]}>
                        <FontAwesome name="tag" size={20} color={textColor} style={styles.detailIcon} />
                        <View>
                          <Text style={[styles.requestDetailLabel, { color: textColor }]}>Categoría</Text>
                          <Text style={[styles.requestDetail, { color: textColor }]}>{item.category}</Text>
                        </View>
                      </View>
                      <View style={[styles.detailCard, { backgroundColor: secondaryCardsRequestBackgroundColor , borderColor: borderColor}]}>
                        <FontAwesome name="info-circle" size={20} color={textColor} style={styles.detailIcon} />
                        <View style={{flex: 1}}>
                          <Text style={[styles.requestDetailLabel, { color: textColor }]}>Descripción</Text>
                          <Text style={[styles.requestDetail, { color: textColor }]}>{item.description}</Text>
                        </View>
                      </View>
                    </View>
                  )}
                  </LinearGradient>
                </Pressable>
              );
            }}
          />
        )}
        <BottomNavigationBar />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: 80, // Espacio para la barra de navegación inferior
    marginTop: 20,
  },
  Container: {
    flex: 1,
  },
  title: {
    flex:1,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  requestCard: {
    // flex:1,
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardHeader: {
    // flex:1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginBottom: 5,
  },
  statusBadge: {
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 8,
  },
  requestTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  requestRefClient: {
    fontSize: 13,
    opacity: 0.6,
    marginTop: 4,
  },
  requestPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  detailRow: {
    marginBottom: 10,
  },
  requestDetailLabel: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  requestDetail: {
    fontSize: 15,
  },
  detailsContainer: {
    // marginTop: 4,
  },
  detailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    padding: 15,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderBottomWidth: 1,
  },
  detailIcon: {
    marginRight: 10,
  },
});