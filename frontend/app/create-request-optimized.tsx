import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColor } from '../hooks/use-theme-color';
import { FontAwesome } from '@expo/vector-icons';
import BottomNavigationBar from '../components/BottomNavigationBar';
import { api, ApiResponse, MessageResponse } from '../services/api';
import { useUser } from '../context/UserContext';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppColors } from '../theme/colors';

// Importar componentes optimizados
import SmartInput from '../components/ui/SmartInput';
import CategorySelector from '../components/ui/CategorySelector';
import InstrumentSelector from '../components/ui/InstrumentSelector';
import LocationSelector from '../components/ui/LocationSelector';
import DateTimeSelector from '../components/ui/DateTimeSelector';

interface EventType {
  id: string;
  name: string;
  price_factor?: number;
  description?: string;
}

interface Instrument {
  id: string;
  name: string;
  category: string;
  price_factor?: number;
}

interface LocationData {
  address: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  district?: string;
}

interface FormData {
  title: string;
  description: string;
  category: EventType | null;
  instruments: Instrument[];
  location: LocationData;
  eventDate: string;
  startTime: Date;
  endTime: Date;
  isPublic: boolean;
}

interface FormErrors {
  title?: string;
  description?: string;
  category?: string;
  instruments?: string;
  location?: string;
  eventDate?: string;
  startTime?: string;
  endTime?: string;
}

const titleSuggestions = [
  'Concierto Benéfico',
  'Boda de María y Juan',
  'Evento Corporativo',
  'Fiesta de Cumpleaños',
  'Ceremonia de Graduación',
  'Festival Musical',
  'Retiro Espiritual',
  'Celebración de Aniversario',
  'Evento Religioso',
  'Concierto en Vivo',
];

const descriptionSuggestions = [
  'Necesitamos música para crear un ambiente especial en nuestro evento',
  'Buscamos músicos talentosos para amenizar nuestra celebración',
  'Requiero servicios musicales profesionales para un evento importante',
  'Necesito música en vivo para complementar nuestra actividad',
  'Buscamos artistas que puedan crear la atmósfera perfecta',
];

export default function CreateRequestOptimizedScreen() {
  const { user } = useUser();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: null,
    instruments: [],
    location: { address: '' },
    eventDate: '',
    startTime: new Date(),
    endTime: new Date(),
    isPublic: true,
  });
  
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const gradientStart = useThemeColor({ 
    light: AppColors.cardsRequest.gradientStartLight, 
    dark: AppColors.cardsRequest.gradientStartDark 
  }, 'background');
  const gradientEnd = useThemeColor({ 
    light: AppColors.cardsRequest.gradientEndLight, 
    dark: AppColors.cardsRequest.gradientEndDark 
  }, 'background');
  const textColor = useThemeColor({ light: AppColors.text.black, dark: AppColors.text.white }, 'text');
  const tintColor = useThemeColor({ light: AppColors.text.black, dark: AppColors.text.white }, 'tint');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [eventTypesResponse, instrumentsResponse] = await Promise.all([
        api.getEventTypes<EventType[]>(),
        api.getInstruments<Instrument[]>(),
      ]);

      if (eventTypesResponse.status === 200) {
        setEventTypes(eventTypesResponse.data);
      }

      if (instrumentsResponse.status === 200) {
        setInstruments(instrumentsResponse.data);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos iniciales');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio';
    } else if (formData.title.length < 5) {
      newErrors.title = 'El título debe tener al menos 5 caracteres';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    } else if (formData.description.length < 10) {
      newErrors.description = 'La descripción debe tener al menos 10 caracteres';
    }

    if (!formData.category) {
      newErrors.category = 'Debes seleccionar una categoría';
    }

    if (formData.instruments.length === 0) {
      newErrors.instruments = 'Debes seleccionar al menos un instrumento';
    }

    if (!formData.location.address.trim()) {
      newErrors.location = 'La ubicación es obligatoria';
    }

    if (!formData.eventDate) {
      newErrors.eventDate = 'La fecha del evento es obligatoria';
    } else {
      const eventDate = new Date(formData.eventDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (eventDate < today) {
        newErrors.eventDate = 'La fecha del evento no puede ser en el pasado';
      }
    }

    if (formData.startTime >= formData.endTime) {
      newErrors.endTime = 'La hora de fin debe ser posterior a la hora de inicio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateEstimatedPrice = (): number => {
    if (!formData.category || formData.instruments.length === 0 || !formData.startTime || !formData.endTime) {
      return 0;
    }

    const durationMs = formData.endTime.getTime() - formData.startTime.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);
    
    const baseRate = 500; // Tarifa base por hora
    const categoryFactor = formData.category.price_factor || 1.0;
    const instrumentFactor = formData.instruments.reduce((acc, instrument) => 
      acc + (instrument.price_factor || 1.0), 0) / formData.instruments.length;
    
    return Math.round(baseRate * durationHours * categoryFactor * instrumentFactor);
  };

  const handleSubmit = async () => {
    if (!user || !user.user_id) {
      Alert.alert('Error', 'Usuario no autenticado. Por favor, inicie sesión.');
      return;
    }

    if (!validateForm()) {
      Alert.alert('Error', 'Por favor, corrige los errores en el formulario.');
      return;
    }

    setIsSubmitting(true);

    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        Alert.alert('Error', 'No se encontró token de autenticación.');
        return;
      }

      const requestData = {
        title: formData.title,
        description: formData.description,
        category: formData.category?.name,
        instrument: formData.instruments.map(i => i.name).join(', '),
        event_date: formData.eventDate,
        start_time: formData.startTime.toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: false 
        }),
        end_time: formData.endTime.toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: false 
        }),
        location: JSON.stringify(formData.location),
        is_public: formData.isPublic,
      };

      const response: ApiResponse<MessageResponse> = await api.createRequest(requestData, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.status === 201) {
        Alert.alert(
          '¡Éxito!', 
          'Solicitud creada correctamente. Los músicos podrán ver tu solicitud y hacer ofertas.',
          [
            {
              text: 'Ver Solicitudes',
              onPress: () => router.push('/solicitudes')
            },
            {
              text: 'Crear Otra',
              onPress: () => {
                setFormData({
                  title: '',
                  description: '',
                  category: null,
                  instruments: [],
                  location: { address: '' },
                  eventDate: '',
                  startTime: new Date(),
                  endTime: new Date(),
                  isPublic: true,
                });
                setErrors({});
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', response.data.message || 'Error al crear la solicitud.');
      }
    } catch (error: any) {
      console.error('Error creating request:', error);
      Alert.alert('Error', error.message || 'Error de red o servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <LinearGradient colors={[gradientStart, gradientEnd]} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tintColor} />
          <Text style={[styles.loadingText, { color: textColor }]}>
            Cargando datos...
          </Text>
        </View>
      </LinearGradient>
    );
  }

  const estimatedPrice = calculateEstimatedPrice();

  return (
    <LinearGradient colors={[gradientStart, gradientEnd]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: textColor }]}>
            Crear Solicitud Musical
          </Text>
          <Text style={[styles.headerSubtitle, { color: textColor, opacity: 0.7 }]}>
            Completa los campos para crear tu solicitud
          </Text>
        </View>

        <View style={styles.formContainer}>
          {/* Título con sugerencias */}
          <SmartInput
            label="Título del Evento"
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
            placeholder="Ej: Concierto Benéfico"
            icon="pencil"
            suggestions={titleSuggestions}
            required
            error={errors.title}
          />

          {/* Descripción con sugerencias */}
          <SmartInput
            label="Descripción del Evento"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder="Describe tu evento y qué tipo de música necesitas..."
            icon="align-left"
            suggestions={descriptionSuggestions}
            multiline
            required
            error={errors.description}
          />

          {/* Selector de categoría con precios */}
          <CategorySelector
            label="Tipo de Evento"
            selectedCategory={formData.category}
            onCategorySelect={(category) => setFormData({ ...formData, category })}
            categories={eventTypes}
            required
            error={errors.category}
            showPriceEstimate={true}
            durationHours={formData.startTime && formData.endTime ? 
              (formData.endTime.getTime() - formData.startTime.getTime()) / (1000 * 60 * 60) : 1
            }
          />

          {/* Selector de instrumentos */}
          <InstrumentSelector
            label="Instrumentos Requeridos"
            selectedInstruments={formData.instruments}
            onInstrumentsChange={(instruments) => setFormData({ ...formData, instruments })}
            instruments={instruments}
            required
            error={errors.instruments}
            maxSelections={3}
            showPriceFactor={true}
          />

          {/* Selector de ubicación */}
          <LocationSelector
            label="Ubicación del Evento"
            location={formData.location}
            onLocationChange={(location) => setFormData({ ...formData, location })}
            required
            error={errors.location}
          />

          {/* Selector de fecha y hora */}
          <DateTimeSelector
            label="Fecha y Hora del Evento"
            selectedDate={formData.eventDate}
            startTime={formData.startTime}
            endTime={formData.endTime}
            onDateChange={(date) => setFormData({ ...formData, eventDate: date })}
            onStartTimeChange={(time) => setFormData({ ...formData, startTime: time })}
            onEndTimeChange={(time) => setFormData({ ...formData, endTime: time })}
            required
            error={errors.eventDate || errors.startTime || errors.endTime}
            showDuration={true}
          />

          {/* Estimación de precio */}
          {estimatedPrice > 0 && (
            <View style={[styles.priceEstimateContainer, { backgroundColor: 'rgba(76, 175, 80, 0.1)' }]}>
              <FontAwesome name="dollar" size={24} color="#4CAF50" />
              <View style={styles.priceEstimateText}>
                <Text style={[styles.priceEstimateLabel, { color: textColor }]}>
                  Precio Estimado
                </Text>
                <Text style={[styles.priceEstimateAmount, { color: '#4CAF50' }]}>
                  ${estimatedPrice.toLocaleString()}
                </Text>
              </View>
            </View>
          )}

          {/* Botón de envío */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              { 
                backgroundColor: isSubmitting ? '#999' : tintColor,
                opacity: isSubmitting ? 0.7 : 1
              }
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <FontAwesome name="paper-plane" size={18} color="white" />
                <Text style={styles.submitButtonText}>
                  Crear Solicitud
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      <BottomNavigationBar />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    backdropFilter: 'blur(10px)',
  },
  priceEstimateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  priceEstimateText: {
    marginLeft: 15,
  },
  priceEstimateLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  priceEstimateAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginTop: 10,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
