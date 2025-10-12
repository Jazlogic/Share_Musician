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
  ImageBackground,
  TouchableOpacity,
} from "react-native";
// `useEffect` y `useState` son hooks de React para manejar el ciclo de vida y el estado del componente.
import { useEffect, useState } from "react";
// `api` es una instancia del servicio de API para realizar llamadas a la API.
import { api } from "../services/api";
// `Ionicons` son iconos vectoriales de Expo, utilizados para mejorar la interfaz visual.
import { Ionicons } from "@expo/vector-icons"; // Assuming @expo-vector-icons is installed

interface Request {
  id: string;
  client_id: string;
  musician_id: string | null;
  title: string;
  description: string;
  category: string;
  location: {
    address?: string;
    lat?: number;
    lng?: number;
    distance_km?: number;
  } | null;
  event_date: string;
  start_time: string;
  end_time: string;
  price: number;
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

  // `useEffect` para cargar los detalles de la solicitud cuando el `id` cambia.
  useEffect(() => {
    // Verifica si el `id` existe antes de intentar cargar los detalles.
    if (id) {
      // Función asíncrona para obtener los detalles de la solicitud desde la API.
      const fetchRequestDetails = async () => {
        try {
          // Realiza una llamada a la API para obtener la solicitud por su ID.
          const response = await api.getRequestById<Request>(`/request/${id}`);
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
    // `ImageBackground` para establecer una imagen de fondo para toda la pantalla.
    <ImageBackground
      source={require("../assets/images/background.png")} // Ruta de la imagen de fondo.
      style={styles.background}
    >
      {/* Configuración de la pantalla de navegación, ocultando el encabezado predeterminado. */}
      <Stack.Screen
        options={{ title: "Request Details", headerShown: false }}
      />
      {/* Una capa superpuesta oscura para mejorar la legibilidad del texto sobre la imagen de fondo. */}
      <View style={styles.overlay} />
      {/* Título principal de la pantalla. */}
      <Text style={styles.headerTitle}>Detalles de la Solicitud</Text>

      {/* Contenedor principal de la tarjeta de detalles de la solicitud. */}
      <View style={styles.card}>
        {/* Encabezado de la tarjeta con el título de la solicitud y el precio. */}
        <View style={styles.cardHeader}>
          {/* Icono de documento para el título de la solicitud. */}
          <Ionicons
            name="document-text-outline"
            size={24}
            color="#333"
            style={styles.icon}
          />
          {/* Contenedor para el texto del encabezado de la tarjeta. */}
          <View style={styles.headerTextContainer}>
            {/* Título de la solicitud. */}
            <Text style={styles.cardTitle}>{request.title}</Text>
            {/* Muestra la distancia si está disponible en los datos de la solicitud. */}
            {request.location?.distance_km && (
              <Text style={styles.distance}>
                {request.location.distance_km} km away
              </Text>
            )}
          </View>
          {/* Precio de la solicitud. */}
          <Text style={styles.price}>RD$ {request.price.toFixed(2)}</Text>
        </View>

        {/* Fila de detalles para el ID de la solicitud. */}
        <View style={styles.detailRow}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#666"
            style={styles.detailIcon}
          />
          <Text style={styles.detailText}>ID: {request.id}</Text>
        </View>
        {/* Fila de detalles para el cliente y la fecha del evento. */}
        <View style={styles.detailRow}>
          <Ionicons
            name="person-circle-outline"
            size={20}
            color="#666"
            style={styles.detailIcon}
          />
          <Text style={styles.detailText}>
            Client: Alex S. {new Date(request.event_date).toLocaleDateString()}{" "}
            at {request.start_time}
          </Text>
        </View>
        {/* Fila de detalles para la categoría de la solicitud. */}
        <View style={styles.detailRow}>
          <Ionicons
            name="pricetag-outline"
            size={20}
            color="#666"
            style={styles.detailIcon}
          />
          <Text style={styles.detailText}>Category: {request.category}</Text>
        </View>
        {/* Fila de detalles para la fecha del evento (actualmente muestra la descripción). */}
        <View style={styles.detailRow}>
          <Ionicons
            name="calendar-outline"
            size={20}
            color="#666"
            style={styles.detailIcon}
          />
          <Text style={styles.detailText}>
            Event Date: {request.description}
          </Text>
        </View>
        {/* Fila de detalles para el presupuesto de la solicitud. */}
        <View style={styles.detailRow}>
          <Ionicons
            name="cash-outline"
            size={20}
            color="#666"
            style={styles.detailIcon}
          />
          <Text style={styles.detailText}>
            Budget: RD$ {request.price.toFixed(2)}
          </Text>
        </View>

        {/* Contenedor para los botones de acción. */}
        <View style={styles.buttonContainer}>
          {/* Botón para contactar al cliente. */}
          <TouchableOpacity style={styles.contactButton}>
            <Text style={styles.contactButtonText}>Contact Client</Text>
          </TouchableOpacity>
          {/* Botón para hacer una oferta. */}
          <TouchableOpacity style={styles.offerButton}>
            <Text style={styles.offerButtonText}>Hacer Oferta</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Barra de navegación inferior. */}
      <View style={styles.bottomNavBar}>
        {/* Elemento de navegación para "Inicio". */}
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home-outline" size={24} color="#fff" />
          <Text style={styles.navText}>Inicio</Text>
        </TouchableOpacity>
        {/* Elemento de navegación para "Configuración". */}
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="settings-outline" size={24} color="#fff" />
          <Text style={styles.navText}>Configuración</Text>
        </TouchableOpacity>
        {/* Elemento de navegación para "Billetera". */}
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="wallet-outline" size={24} color="#fff" />
          <Text style={styles.navText}>Billetera</Text>
        </TouchableOpacity>
        {/* Elemento de navegación para "Dashboard". */}
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="grid-outline" size={24} color="#fff" />
          <Text style={styles.navText}>Dashboard</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

// Hoja de estilos para el componente RequestDetailsScreen.
const styles = StyleSheet.create({
  // Estilos para el contenedor de carga.
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a2e", // Color de fondo oscuro.
  },
  // Estilos para el texto de carga.
  loadingText: {
    marginTop: 10,
    color: "#fff", // Color de texto blanco.
  },
  // Estilos para el texto de error.
  errorText: {
    color: "red", // Color de texto rojo.
    textAlign: "center",
    marginTop: 20,
  },
  // Estilos para la imagen de fondo.
  background: {
    flex: 1,
    resizeMode: "cover", // Ajusta la imagen para cubrir todo el espacio.
    justifyContent: "center",
    alignItems: "center",
  },
  // Estilos para la capa superpuesta oscura.
  overlay: {
    ...StyleSheet.absoluteFillObject, // Cubre todo el espacio del padre.
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo oscuro semitransparente.
  },
  // Estilos para el título del encabezado.
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff", // Color de texto blanco.
    marginTop: 50,
    marginBottom: 20,
    position: "absolute", // Posicionamiento absoluto.
    top: 0, // Alineado en la parte superior.
  },
  // Estilos para la tarjeta de detalles.
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.9)", // Fondo blanco semitransparente.
    borderRadius: 15,
    padding: 20,
    width: "90%",
    maxWidth: 400,
    shadowColor: "#000", // Sombra para dar profundidad.
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8, // Elevación para Android.
    marginTop: 100, // Ajuste para posicionar debajo del título.
    marginBottom: 20,
  },
  // Estilos para el encabezado de la tarjeta.
  cardHeader: {
    flexDirection: "row", // Elementos en fila.
    alignItems: "center",
    marginBottom: 15,
    borderBottomWidth: 1, // Borde inferior.
    borderBottomColor: "#eee",
    paddingBottom: 10,
  },
  // Estilos para los iconos dentro de la tarjeta.
  icon: {
    marginRight: 10,
  },
  // Estilos para el contenedor de texto del encabezado de la tarjeta.
  headerTextContainer: {
    flex: 1, // Ocupa el espacio restante.
  },
  // Estilos para el título de la tarjeta.
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  // Estilos para el texto de distancia.
  distance: {
    fontSize: 14,
    color: "#666",
  },
  // Estilos para el precio.
  price: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#007bff", // Color azul.
  },
  // Estilos para cada fila de detalles.
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  // Estilos para los iconos de detalle.
  detailIcon: {
    marginRight: 8,
  },
  // Estilos para el texto de detalle.
  detailText: {
    fontSize: 16,
    color: "#444",
  },
  // Estilos para el contenedor de botones.
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around", // Espacio equitativo entre botones.
    marginTop: 20,
  },
  // Estilos para el botón de "Contact Client".
  contactButton: {
    backgroundColor: "#e0e0e0", // Fondo gris claro.
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    width: "48%", // Ancho del 48% para dos botones.
    alignItems: "center",
  },
  // Estilos para el texto del botón de "Contact Client".
  contactButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "bold",
  },
  // Estilos para el botón de "Hacer Oferta".
  offerButton: {
    backgroundColor: "#007bff", // Fondo azul.
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    width: "48%",
    alignItems: "center",
  },
  // Estilos para el texto del botón de "Hacer Oferta".
  offerButtonText: {
    color: "#fff", // Color de texto blanco.
    fontSize: 16,
    fontWeight: "bold",
  },
  // Estilos para la barra de navegación inferior.
  bottomNavBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingVertical: 10,
    backgroundColor: "rgba(0, 0, 0, 0.8)", // Fondo oscuro semitransparente.
    position: "absolute", // Posicionamiento absoluto.
    bottom: 0, // Alineado en la parte inferior.
    borderTopLeftRadius: 20, // Bordes redondeados superiores.
    borderTopRightRadius: 20,
  },
  // Estilos para cada elemento de navegación.
  navItem: {
    alignItems: "center",
  },
  // Estilos para el texto de navegación.
  navText: {
    color: "#fff", // Color de texto blanco.
    fontSize: 12,
    marginTop: 5,
  },
});
