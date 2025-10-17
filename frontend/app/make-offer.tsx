import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  ActivityIndicator,
  Dimensions,
  Platform 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColor } from '../hooks/use-theme-color';
import { FontAwesome } from '@expo/vector-icons';
import { api, MessageResponse } from '../services/api';
import { useUser } from '../context/UserContext';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppColors } from '../theme/colors';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;
const isWeb = Platform.OS === 'web';

interface Request {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string | object;
  event_date: string;
  start_time: string;
  end_time: string;
  price: number | null;
  total_price: number | null;
  status: string;
  instruments?: string[];
}

export default function MakeOfferScreen() {
  const { user } = useUser();
  const params = useLocalSearchParams();
  const requestId = params.requestId as string;
  const flow = params.flow as string;

  const [request, setRequest] = useState<Request | null>(null);
  const [price, setPrice] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Theme colors
  const gradientStart = useThemeColor({ light: AppColors.background.gradientStartLight, dark: AppColors.background.gradientStartDark }, 'background');
  const gradientEnd = useThemeColor({ light: AppColors.background.gradientEndLight, dark: AppColors.background.gradientEndDark }, 'background');
  const backgroundColor = useThemeColor({ light: AppColors.background.light, dark: AppColors.background.dark }, 'background');
  const cardBackgroundColor = useThemeColor({ light: AppColors.cardsRequest.primaryBackgroundLight, dark: AppColors.cardsRequest.primaryBackgroundDark }, 'background');
  const textColor = useThemeColor({ light: AppColors.text.defaultLight, dark: AppColors.text.defaultDark }, 'text');
  const secondaryTextColor = useThemeColor({ light: AppColors.text.secondary, dark: AppColors.text.secondary }, 'text');
  const inputBackgroundColor = useThemeColor({ light: AppColors.background.light, dark: AppColors.background.dark }, 'background');
  const borderColor = useThemeColor({ light: AppColors.neutral.grayMedium, dark: AppColors.neutral.grayMedium }, 'text');
  const buttonBackgroundColor = useThemeColor({ light: AppColors.button.backgroundLight, dark: AppColors.button.backgroundDark }, 'background');
  const buttonTextColor = useThemeColor({ light: AppColors.button.textLight, dark: AppColors.button.textDark }, 'text');
  const errorColor = useThemeColor({ light: AppColors.secondary.red, dark: AppColors.secondary.red }, 'text');
  const successColor = useThemeColor({ light: AppColors.secondary.green, dark: AppColors.secondary.green }, 'text');

  useEffect(() => {
    if (!requestId) {
      setError('ID de solicitud no proporcionado');
      setLoading(false);
      return;
    }

    if (!user || user.role !== 'musician') {
      setError('Solo los músicos pueden hacer ofertas');
      setLoading(false);
      return;
    }

    fetchRequestDetails();
  }, [requestId, user]);

  const fetchRequestDetails = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        setError('No se encontró token de autenticación');
        setLoading(false);
        return;
      }

      const response = await api.getRequestById<Request>(requestId, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.status === 200) {
        setRequest(response.data);
        
        // Sugerir precio basado en el precio estimado de la solicitud
        if (response.data.total_price) {
          const suggestedPrice = Math.round(response.data.total_price * 0.9); // 10% menos que el precio estimado
          setPrice(suggestedPrice.toString());
        }
        
        // Mensaje sugerido
        setMessage(`Hola, me interesa mucho tu solicitud "${response.data.title}". Tengo experiencia con los instrumentos requeridos y puedo ofrecerte un excelente servicio. ¿Te gustaría que conversemos sobre los detalles?`);
      } else {
        setError('Error al cargar los detalles de la solicitud');
      }
    } catch (error: any) {
      console.error('Error fetching request details:', error);
      setError(error.message || 'Error al cargar los detalles de la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user || !user.user_id) {
      Alert.alert('Error', 'Usuario no autenticado. Por favor, inicie sesión.');
      return;
    }

    if (!price || !message.trim()) {
      Alert.alert('Error', 'Por favor, completa todos los campos obligatorios.');
      return;
    }

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      Alert.alert('Error', 'El precio debe ser un número positivo.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        Alert.alert('Error', 'No se encontró token de autenticación.');
        return;
      }

      const offerData = {
        request_id: requestId,
        price: numericPrice,
        message: message.trim()
      };

      const response = await api.createOffer<MessageResponse>(offerData, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.status === 201) {
        Alert.alert(
          '¡Oferta Enviada!',
          'Tu oferta ha sido enviada exitosamente. El cliente será notificado y podrá revisar tu propuesta.',
          [
            {
              text: 'OK',
              onPress: () => router.back()
            }
          ]
        );
      }
    } catch (error: any) {
      console.error('Error creating offer:', error);
      
      if (error.message.includes('already made an offer')) {
        Alert.alert(
          'Oferta Duplicada',
          'Ya has hecho una oferta para esta solicitud.',
          [
            {
              text: 'Ver Mi Oferta',
              onPress: () => router.back()
            }
          ]
        );
      } else {
        Alert.alert('Error', error.message || 'Error al enviar la oferta. Por favor, inténtalo de nuevo.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <LinearGradient
        colors={[gradientStart, gradientEnd]}
        style={styles.fullScreenContainer}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={[styles.loadingText, { color: textColor }]}>
            Cargando detalles de la solicitud...
          </Text>
        </View>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient
        colors={[gradientStart, gradientEnd]}
        style={styles.fullScreenContainer}
      >
        <View style={styles.errorContainer}>
          <FontAwesome name="exclamation-triangle" size={48} color={errorColor} />
          <Text style={[styles.errorTitle, { color: textColor }]}>
            Error
          </Text>
          <Text style={[styles.errorText, { color: secondaryTextColor }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: buttonBackgroundColor }]}
            onPress={handleGoBack}
          >
            <FontAwesome name="arrow-left" size={16} color={buttonTextColor} />
            <Text style={[styles.backButtonText, { color: buttonTextColor }]}>
              Volver
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  if (!request) {
    return (
      <LinearGradient
        colors={[gradientStart, gradientEnd]}
        style={styles.fullScreenContainer}
      >
        <View style={styles.errorContainer}>
          <FontAwesome name="question-circle" size={48} color={secondaryTextColor} />
          <Text style={[styles.errorTitle, { color: textColor }]}>
            Solicitud no encontrada
          </Text>
          <Text style={[styles.errorText, { color: secondaryTextColor }]}>
            La solicitud que buscas no existe o ya no está disponible.
          </Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: buttonBackgroundColor }]}
            onPress={handleGoBack}
          >
            <FontAwesome name="arrow-left" size={16} color={buttonTextColor} />
            <Text style={[styles.backButtonText, { color: buttonTextColor }]}>
              Volver
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[gradientStart, gradientEnd]}
      style={styles.fullScreenContainer}
    >
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={[
          styles.scrollContent,
          isWeb && styles.scrollContentWeb
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, isWeb && styles.headerWeb]}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: buttonBackgroundColor }]}
            onPress={handleGoBack}
          >
            <FontAwesome name="arrow-left" size={16} color={buttonTextColor} />
            <Text style={[styles.backButtonText, { color: buttonTextColor }]}>
              Volver
            </Text>
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { color: textColor }]}>
            Hacer Oferta
          </Text>
        </View>

        {/* Request Details */}
        <View style={[styles.card, { backgroundColor: cardBackgroundColor }, isWeb && styles.cardWeb]}>
          <Text style={[styles.cardTitle, { color: textColor }]}>
            Detalles de la Solicitud
          </Text>
          
          <View style={styles.requestInfo}>
            <Text style={[styles.requestTitle, { color: textColor }]}>
              {request.title}
            </Text>
            
            <Text style={[styles.requestDescription, { color: secondaryTextColor }]}>
              {request.description}
            </Text>
            
            <View style={styles.requestMeta}>
              <View style={styles.metaItem}>
                <FontAwesome name="calendar" size={14} color={secondaryTextColor} />
                <Text style={[styles.metaText, { color: secondaryTextColor }]}>
                  {new Date(request.event_date).toLocaleDateString('es-ES')}
                </Text>
              </View>
              
              <View style={styles.metaItem}>
                <FontAwesome name="clock-o" size={14} color={secondaryTextColor} />
                <Text style={[styles.metaText, { color: secondaryTextColor }]}>
                  {request.start_time} - {request.end_time}
                </Text>
              </View>
              
              <View style={styles.metaItem}>
                <FontAwesome name="map-marker" size={14} color={secondaryTextColor} />
                <Text style={[styles.metaText, { color: secondaryTextColor }]}>
                  {typeof request.location === 'string' ? request.location : 
                   typeof request.location === 'object' && request.location ? 
                   (request.location as any).address || 'Ubicación no especificada' : 
                   'Ubicación no especificada'}
                </Text>
              </View>
              
              {request.total_price && (
                <View style={styles.metaItem}>
                  <FontAwesome name="money" size={14} color={secondaryTextColor} />
                  <Text style={[styles.metaText, { color: secondaryTextColor }]}>
                    Precio estimado: ${request.total_price.toLocaleString()}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Offer Form */}
        <View style={[styles.card, { backgroundColor: cardBackgroundColor }, isWeb && styles.cardWeb]}>
          <Text style={[styles.cardTitle, { color: textColor }]}>
            Tu Oferta
          </Text>
          
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: textColor }]}>
                Precio Propuesto (DOP)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: inputBackgroundColor,
                    borderColor: borderColor,
                    color: textColor
                  }
                ]}
                value={price}
                onChangeText={setPrice}
                placeholder="Ej: 450.00"
                placeholderTextColor={secondaryTextColor}
                keyboardType="numeric"
                editable={!submitting}
              />
              {request.total_price && (
                <Text style={[styles.inputHelp, { color: secondaryTextColor }]}>
                  Precio estimado: ${request.total_price.toLocaleString()} DOP
                </Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: textColor }]}>
                Mensaje para el Cliente
              </Text>
              <TextInput
                style={[
                  styles.textArea,
                  { 
                    backgroundColor: inputBackgroundColor,
                    borderColor: borderColor,
                    color: textColor
                  }
                ]}
                value={message}
                onChangeText={setMessage}
                placeholder="Escribe un mensaje personalizado para el cliente..."
                placeholderTextColor={secondaryTextColor}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                editable={!submitting}
              />
              <Text style={[styles.inputHelp, { color: secondaryTextColor }]}>
                Este mensaje ayudará al cliente a conocerte mejor y entender tu propuesta.
              </Text>
            </View>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            { 
              backgroundColor: submitting ? secondaryTextColor : buttonBackgroundColor,
              opacity: submitting ? 0.7 : 1
            }
          ]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={buttonTextColor} />
          ) : (
            <>
              <FontAwesome name="paper-plane" size={16} color={buttonTextColor} />
              <Text style={[styles.submitButtonText, { color: buttonTextColor }]}>
                Enviar Oferta
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  scrollContentWeb: {
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerWeb: {
    justifyContent: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 16,
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardWeb: {
    maxWidth: '100%',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  requestInfo: {
    gap: 12,
  },
  requestTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  requestDescription: {
    fontSize: 16,
    lineHeight: 24,
  },
  requestMeta: {
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 14,
    flex: 1,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 100,
  },
  inputHelp: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
