import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { AppColors } from '../theme/colors';
import BottomNavigationBar from '@/components/BottomNavigationBar';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColor } from '@/hooks/use-theme-color';
import { api } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../context/UserContext';

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
  const { user } = useUser();
  const gradientStart = useThemeColor({ light: AppColors.background.gradientStartLight, dark: AppColors.background.gradientStartDark }, 'background');
  const gradientEnd = useThemeColor({ light: AppColors.background.gradientEndLight, dark: AppColors.background.gradientEndDark }, 'background');
  const requestCardColor = useThemeColor({ light: AppColors.items.backgroundLight, dark: AppColors.items.backgroundDark }, 'background');
  const textColor = useThemeColor({ light: AppColors.text.light, dark: AppColors.text.dark }, 'text');

  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError(null);
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        if (!userToken) {
          throw new Error('No authentication token found.');
        }

        const response = await api.get<Request[]>('/requests/created', {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });
        setRequests(response.data);
        console.log('Fetched requests:', response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch requests.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const toggleExpand = (requestId: string) => {
    setExpandedRequestId(prevId => (prevId === requestId ? null : requestId));
  };

  if (loading) {
    return (
      <LinearGradient
        colors={[gradientStart, gradientEnd]}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ActivityIndicator size="large" color={AppColors.text.light} />
        <Text style={{ color: AppColors.text.light, marginTop: 10 }}>Cargando solicitudes...</Text>
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
        {requests.length === 0 ? (
          <Text style={{ color: textColor }}>No hay solicitudes creadas.</Text>
        ) : (
          <FlatList
            data={requests}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const isExpanded = item.id === expandedRequestId;
              return (
                <Pressable onPress={() => toggleExpand(item.id)} style={[styles.requestCard, { backgroundColor: requestCardColor }]}>
                  <Text style={[styles.requestTitle, { color: textColor }]}>{item.title}</Text>
                  <Text style={[styles.requestDescription, { color: textColor }]}>{item.description}</Text>
                  {isExpanded && (
                    <View>
                      <Text style={[styles.requestDetail, { color: textColor }]}>Categoría: {item.category}</Text>
                      <Text style={[styles.requestDetail, { color: textColor }]}>Fecha: {item.event_date}</Text>
                      <Text style={[styles.requestDetail, { color: textColor }]}>Hora: {item.start_time} - {item.end_time}</Text>
                      <Text style={[styles.requestDetail, { color: textColor }]}>Precio: ${item.price}</Text>
                      <Text style={[styles.requestDetail, { color: textColor }]}>Estado: {item.status}</Text>
                    </View>
                  )}
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  requestCard: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    width: '100%',
  },
  requestTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  requestDescription: {
    fontSize: 14,
    marginBottom: 5,
  },
  requestDetail: {
    fontSize: 12,
  },
});