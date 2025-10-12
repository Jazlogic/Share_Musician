// Importaciones necesarias para el componente.
// `Stack` se utiliza para la configuración de la pantalla de navegación.
// `useLocalSearchParams` es un hook de Expo Router para obtener parámetros de la URL local.
import { Stack, useLocalSearchParams } from "expo-router";
// `Text`, `View`, `ActivityIndicator`, `StyleSheet`, `ImageBackground`, `TouchableOpacity` son componentes de React Native para construir la interfaz de usuario.
import {
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
  // ImageBackground,
  TouchableOpacity,
} from "react-native";
// `useEffect` y `useState` son hooks de React para manejar el ciclo de vida y el estado del componente.
import { useEffect, useState } from "react";
// `api` es una instancia del servicio de API para realizar llamadas a la API.
import { api } from "../services/api";
// `Ionicons` son iconos vectoriales de Expo, utilizados para mejorar la interfaz visual.
import { Ionicons } from "@expo/vector-icons"; // Assuming @expo-vector-icons is installed
import { AppColors } from "../theme/colors";
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColor } from "@/hooks/use-theme-color";
import { ScrollView } from "react-native-gesture-handler";
import BottomNavigationBar from "../components/BottomNavigationBar";

interface Request {
  id: string;
  client_id: string;
  musician_id: string | null;
  title: string;
  description: string;
  category: string;
  location: string;
  distance_km: number | null;
  event_date: string;
  start_time: string;
  end_time: string;
  price: number | null;
  status: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  cancelled_by: string | null;
  cancellation_reason: string | null;
  reopened_from_id: string | null;
  instruments: string[];
}

// Componente principal que muestra los detalles de una solicitud.
export default function RequestDetailsScreen() {
  // Obtiene el parámetro `id` de la URL local, que representa el ID de la solicitud.
  const { id } = useLocalSearchParams();
  // Estado para almacenar los detalles de la solicitud, inicializado como nulo.
  const [request, setRequest] = useState<Request | null>(null);
  // Estado para controlar el indicador de carga, inicializado en `true`.
  const [loading, setLoading] = useState(true);
  // Estado para almacenar cualquier mensaje de error, inicializado como nulo.
  const [error, setError] = useState<string | null>(null);

  // const gradientStart = AppColors.background.gradientStartDark;
  // const gradientEnd = AppColors.background.gradientEndDark;
    const gradientStart = useThemeColor({ light: AppColors.background.gradientStartLight, dark: AppColors.background.gradientStartDark }, 'background');
  const gradientEnd = useThemeColor({ light: AppColors.background.gradientEndLight, dark: AppColors.background.gradientEndDark }, 'background');
  const color = useThemeColor({ light: AppColors.text.light, dark: AppColors.text.dark }, 'text');
  const buttonColor = useThemeColor({ light: AppColors.button.backgroundLight, dark: AppColors.button.backgroundDark }, 'text');
  const backgrounIitemColor = useThemeColor({ light: AppColors.items.backgroundLight, dark: AppColors.items.backgroundDark}, 'background');
  const itemTextColor = useThemeColor({ light: AppColors.items.textLight, dark: AppColors.items.textDark }, 'text');

  // `useEffect` para cargar los detalles de la solicitud cuando el `id` cambia.
  useEffect(() => {
    // Verifica si el `id` existe antes de intentar cargar los detalles.
    if (id) {
      // Función asíncrona para obtener los detalles de la solicitud desde la API.
      const fetchRequestDetails = async () => {
        try {
          // Realiza una llamada a la API para obtener la solicitud por su ID.
          const response = await api.getRequestById<Request>(`${id}`);
          console.log('Request Details:',response.data);
          // Actualiza el estado `request` con los datos recibidos.
          setRequest(response.data);
        } catch (err) {
          // Si ocurre un error, establece el mensaje de error.
          setError("Error al cargar los detalles de la solicitud.");
          // Registra el error en la consola para depuración.
          console.error(err);
        } finally {
          // Independientemente del resultado, desactiva el indicador de carga.
          setLoading(false);
        }
      };
      // Ejecuta la función para obtener los detalles de la solicitud.
      fetchRequestDetails();
    }
  }, [id]); // El efecto se ejecuta cada vez que `id` cambia.

  // Muestra un indicador de carga mientras se obtienen los datos.
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>
          Cargando detalles de la solicitud...
        </Text>
      </View>
    );
  }

  // Muestra un mensaje de error si algo salió mal durante la carga.
  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Muestra un mensaje si no se encontraron detalles para la solicitud.
  if (!request) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          No se encontraron detalles para esta solicitud.
        </Text>
      </View>
    );
  }

  // Renderiza la interfaz de usuario una vez que los datos de la solicitud están disponibles.
  return (
    // Componente LinearGradient para el fondo de la pantalla, proporcionando un degradado de color.
    <LinearGradient
      colors={[gradientStart, gradientEnd]}
      style={{ flex: 1 }}
    >
      {/* Configuración de la pantalla de navegación, ocultando el encabezado por defecto. */}
      <Stack.Screen
        options={{ title: "Request Details", headerShown: false }}
      />
      {/* Contenedor principal con ScrollView para permitir el desplazamiento del contenido. */}
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        
        {/* Contenedor para el título de la sección, centrado. */}
        <View style={styles.titleContainer}>
          {/* <Text style={[styles.sectionTitle, { color }]}>Detalles de la Solicitud</Text> */}
        </View>
       {/* Tarjeta de balance con un degradado lineal, mostrando el título de la solicitud y el precio. */}
       <LinearGradient
          colors={[gradientStart, gradientEnd]}
          style={styles.balanceCard}
          >
          {/* Sección para el título de la solicitud. */}
          <View style={[styles.section]}>
          <Text style={[styles.sectionTitle, { color }]}>{request.title}</Text>
        </View>
          {/* Título para la tarifa. */}
          <Text style={[styles.balanceTitle, { color, marginTop: 10}]}>Tarifa</Text>
          {/* Precio de la solicitud. */}
          <Text style={[styles.price, { color:'rgb(31, 203, 91)' }]}>RD$ {request.price}</Text>
        </LinearGradient>
           {/* Sección de la Informacion Musical */}
          <View style={[styles.addMethodButton,{borderBottomColor:AppColors.text.white,borderBottomWidth:1,marginBottom:10,borderRadius:10}]}>
            <Text style={[styles.addMethodButtonText, { color: AppColors.text.white }]}>Informacion Musical</Text>
          </View>
            {/* Muestra los instrumentos musicales requeridos. */}
            <View style={[styles.itemsCard, { backgroundColor: backgrounIitemColor }]}>
               <Ionicons name="musical-notes" size={24} color={AppColors.text.white} />
              <Text style={[styles.itemsText, { color: itemTextColor }]}>{request.instruments.join(', ')}</Text>
            </View>
            {/* Muestra la categoría de la solicitud. */}
            <View style={[styles.itemsCard, { backgroundColor: backgrounIitemColor }]}>
               <Ionicons name="folder" size={24} color={AppColors.text.white} />
              <Text style={[styles.itemsText, { color: itemTextColor }]}> {request.category}</Text>
            </View>

            {/* Sección de la Informacion de ubicación */}
          <View style={[styles.addMethodButton,{borderBottomColor:AppColors.text.white,borderBottomWidth:1,marginBottom:10,borderRadius:10}]}>
            <Text style={[styles.addMethodButtonText, { color: AppColors.text.white }]}>Informacion de ubicación</Text>
          </View>
            {/* Muestra la ubicación del evento. */}
            <View style={[styles.itemsCard, { backgroundColor: backgrounIitemColor }]}>
               <Ionicons name="location" size={24} color={AppColors.text.white} />
              <Text style={[styles.itemsText, { color: itemTextColor }]}>{request.location}</Text>
            </View>
            {/* Muestra la distancia en kilómetros. */}
            <View style={[styles.itemsCard, { backgroundColor: backgrounIitemColor }]}>
               <Ionicons name="car" size={24} color={AppColors.text.white} />
              <Text style={[styles.itemsText, { color: itemTextColor }]}>{request.distance_km ? `${request.distance_km} km` : 'N/A'}</Text>
            </View>

            {/* Sección de la Informacion del tiempo */}
          <View style={[styles.addMethodButton,{borderBottomColor:AppColors.text.white,borderBottomWidth:1,marginBottom:10,borderRadius:10}]}>
            <Text style={[styles.addMethodButtonText, { color: AppColors.text.white }]}>Informacion del tiempo</Text>
          </View>
            {/* Muestra la fecha del evento. */}
            <View style={[styles.itemsCard, { backgroundColor: backgrounIitemColor }]}>
               <Ionicons name="calendar" size={24} color={AppColors.text.white} />
              <Text style={[styles.itemsText, { color: itemTextColor }]}>Fecha del evento ► {new Date(request.event_date).toLocaleDateString()}</Text>
            </View>
            {/* Muestra la hora de inicio del evento en formato AM/PM. */}
            <View style={[styles.itemsCard, { backgroundColor: backgrounIitemColor }]}>
               <Ionicons name="time" size={24} color={AppColors.text.white} />
              <Text style={[styles.itemsText, { color: itemTextColor }]}>Hora de inicio ► {new Date(`2000-01-01T${request.start_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</Text>
            </View>
            {/* Muestra la hora de finalización del evento en formato AM/PM. */}
            <View style={[styles.itemsCard, { backgroundColor: backgrounIitemColor }]}>
               <Ionicons name="time" size={24} color={AppColors.text.white} />
              <Text style={[styles.itemsText, { color: itemTextColor }]}>Hora de fin ► {new Date(`2000-01-01T${request.end_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</Text>
            </View>
            {/* Muestra el estado actual de la solicitud. */}
            <View style={[styles.itemsCard, { backgroundColor: backgrounIitemColor }]}>
               <Ionicons name="checkmark-circle" size={24} color={AppColors.text.white} />
              <Text style={[styles.itemsText, { color: itemTextColor }]}>{request.status}</Text>
            </View>
            {/* Muestra la fecha de creación de la solicitud. */}
            <View style={[styles.itemsCard, { backgroundColor: backgrounIitemColor }]}>
               <Ionicons name="create" size={24} color={AppColors.text.white} />
              <Text style={[styles.itemsText, { color: itemTextColor }]}>Fecha de creación ► {new Date(request.created_at).toLocaleDateString()}</Text>
            </View>

      </ScrollView>
     {/* Barra de navegación inferior. */}
     <BottomNavigationBar/>
    </LinearGradient>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 30,
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: AppColors.background.dark,
  },
    errorText: {
    marginTop: 10,
    fontSize: 16,
    color: AppColors.secondary.red,
  },
    loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: AppColors.text.light,
  },
    scrollViewContent: {
    padding: 16,
    paddingBottom: 80, // Espacio para la barra de navegación inferior
  },
  // scrollViewContent: {
  //   padding: 16,
  //   paddingBottom: 80, // Espacio para la barra de navegación inferior
  // },
  balanceCard: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    // elevation: 8,
  },
  balanceTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  price: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  addButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  itemsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    // elevation: 3,
  },
  itemsText: {
    fontSize: 16,
    marginLeft: 15,
  },
  addMethodButton: {
    marginTop: 10,
    padding: 10,
    alignItems: 'center',
  },
  addMethodButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    // elevation: 3,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
  },
  transactionDate: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
