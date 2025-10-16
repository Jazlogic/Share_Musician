import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColor } from '../hooks/use-theme-color';
import { FontAwesome } from '@expo/vector-icons';
import BottomNavigationBar from '../components/BottomNavigationBar';
import { api, ApiResponse, MessageResponse } from '../services/api';
import { useUser } from '../context/UserContext';
import { router, Stack } from 'expo-router';
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
  const { width, height } = Dimensions.get('window');
  const isTablet = width >= 768;
  const isWeb = Platform.OS === 'web';
  
  // Estado para manejar los pasos
  const [currentStep, setCurrentStep] = useState(0);
  
  // Definir los pasos del wizard
  const steps = [
    { id: 'title', title: 'Título del Evento', description: '¿Cómo se llama tu evento?' },
    { id: 'description', title: 'Descripción', description: 'Cuéntanos más detalles' },
    { id: 'category', title: 'Tipo de Evento', description: '¿Qué tipo de evento es?' },
    { id: 'instruments', title: 'Instrumentos', description: '¿Qué instrumentos necesitas?' },
    { id: 'location', title: 'Ubicación', description: '¿Dónde será el evento?' },
    { id: 'datetime', title: 'Fecha y Hora', description: '¿Cuándo será el evento?' },
    { id: 'review', title: 'Revisar', description: 'Revisa tu solicitud' },
  ];
  
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
  const [lastSubmissionTime, setLastSubmissionTime] = useState<number>(0);
  
  // Funciones para navegar entre pasos
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  // Función para verificar duplicados
  const checkForDuplicateRequest = async (): Promise<boolean> => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) return false;

      // Obtener solicitudes creadas por el usuario
      const response = await api.getCreatedRequests({
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.status === 200 && response.data) {
        const existingRequests = Array.isArray(response.data) ? response.data : [];
        
        // Verificar si existe una solicitud similar
        const isDuplicate = existingRequests.some((request: any) => {
          // Comparar título (case insensitive)
          const titleMatch = request.title?.toLowerCase() === formData.title.toLowerCase();
          
          // Comparar descripción (case insensitive, palabras clave)
          const descriptionMatch = request.description?.toLowerCase() === formData.description.toLowerCase();
          
          // Comparar ubicación
          const locationMatch = request.location === formData.location.address;
          
          // Comparar fecha (mismo día)
          const requestDate = new Date(request.event_date);
          const formDate = new Date(formData.eventDate);
          const dateMatch = requestDate.toDateString() === formDate.toDateString();
          
          // Si coincide título Y (descripción O ubicación O fecha), es probable duplicado
          return titleMatch && (descriptionMatch || locationMatch || dateMatch);
        });

        return isDuplicate;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      return false; // En caso de error, permitir crear la solicitud
    }
  };
  
  // Función para renderizar el paso actual
  const renderCurrentStep = () => {
    const step = steps[currentStep];
    
    switch (step.id) {
      case 'title':
        return (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: textColor }]}>{step.title}</Text>
            <Text style={[styles.stepDescription, { color: textColor, opacity: 0.7 }]}>{step.description}</Text>
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
          </View>
        );
        
      case 'description':
        return (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: textColor }]}>{step.title}</Text>
            <Text style={[styles.stepDescription, { color: textColor, opacity: 0.7 }]}>{step.description}</Text>
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
          </View>
        );
        
      case 'category':
        return (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: textColor }]}>{step.title}</Text>
            <Text style={[styles.stepDescription, { color: textColor, opacity: 0.7 }]}>{step.description}</Text>
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
          </View>
        );
        
      case 'instruments':
        return (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: textColor }]}>{step.title}</Text>
            <Text style={[styles.stepDescription, { color: textColor, opacity: 0.7 }]}>{step.description}</Text>
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
          </View>
        );
        
      case 'location':
        return (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: textColor }]}>{step.title}</Text>
            <Text style={[styles.stepDescription, { color: textColor, opacity: 0.7 }]}>{step.description}</Text>
            <LocationSelector
              label="Ubicación del Evento"
              location={formData.location}
              onLocationChange={(location) => setFormData({ ...formData, location })}
              required
              error={errors.location}
            />
          </View>
        );
        
      case 'datetime':
        return (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: textColor }]}>{step.title}</Text>
            <Text style={[styles.stepDescription, { color: textColor, opacity: 0.7 }]}>{step.description}</Text>
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
          </View>
        );
        
      case 'review':
        return (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: textColor }]}>{step.title}</Text>
            <Text style={[styles.stepDescription, { color: textColor, opacity: 0.7 }]}>{step.description}</Text>
            <View style={[styles.reviewContainer, { backgroundColor: semiTransparentBackground }]}>
              <Text style={[styles.reviewItem, { color: textColor }]}>
                <Text style={{ fontWeight: 'bold' }}>Título:</Text> {formData.title}
              </Text>
              <Text style={[styles.reviewItem, { color: textColor }]}>
                <Text style={{ fontWeight: 'bold' }}>Descripción:</Text> {formData.description}
              </Text>
              <Text style={[styles.reviewItem, { color: textColor }]}>
                <Text style={{ fontWeight: 'bold' }}>Tipo:</Text> {formData.category?.name}
              </Text>
              <Text style={[styles.reviewItem, { color: textColor }]}>
                <Text style={{ fontWeight: 'bold' }}>Instrumentos:</Text> {formData.instruments.map(i => i.name).join(', ')}
              </Text>
              <Text style={[styles.reviewItem, { color: textColor }]}>
                <Text style={{ fontWeight: 'bold' }}>Ubicación:</Text> {formData.location.address}
              </Text>
              <Text style={[styles.reviewItem, { color: textColor }]}>
                <Text style={{ fontWeight: 'bold' }}>Fecha:</Text> {formData.eventDate}
              </Text>
            </View>
          </View>
        );
        
      default:
        return null;
    }
  };

  const gradientStart = useThemeColor({ 
    light: AppColors.cardsRequest.gradientStartLight, 
    dark: AppColors.cardsRequest.gradientStartDark 
  }, 'background');
  const gradientEnd = useThemeColor({ 
    light: AppColors.cardsRequest.gradientEndLight, 
    dark: AppColors.cardsRequest.gradientEndDark 
  }, 'background');
  const textColor = useThemeColor({ light: AppColors.text.black, dark: AppColors.text.white }, 'text');
  const tintColor = useThemeColor({ light: AppColors.primary.blue, dark: AppColors.primary.accent }, 'tint');
  const backgroundColor = useThemeColor({ light: AppColors.background.light, dark: AppColors.background.dark }, 'background');
  const errorColor = useThemeColor({ light: AppColors.secondary.red, dark: AppColors.secondary.red }, 'text');
  const placeholderColor = useThemeColor({ light: AppColors.text.secondary, dark: AppColors.text.secondary }, 'text');
  const successColor = useThemeColor({ light: AppColors.secondary.green, dark: AppColors.secondary.green }, 'text');
  const successBackgroundColor = useThemeColor({ light: 'rgba(76, 175, 80, 0.1)', dark: 'rgba(76, 175, 80, 0.2)' }, 'background');
  const semiTransparentBackground = useThemeColor({ light: 'rgba(255, 255, 255, 0.1)', dark: 'rgba(255, 255, 255, 0.05)' }, 'background');
  const buttonBackgroundColor = useThemeColor({ light: 'rgba(255, 255, 255, 0.2)', dark: 'rgba(255, 255, 255, 0.1)' }, 'background');
  const borderColor = useThemeColor({ light: 'rgba(255, 255, 255, 0.1)', dark: 'rgba(255, 255, 255, 0.05)' }, 'text');
  const shadowColor = useThemeColor({ light: '#000', dark: '#fff' }, 'text');

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

    // Verificar timeout entre solicitudes (30 segundos)
    const currentTime = Date.now();
    const timeSinceLastSubmission = currentTime - lastSubmissionTime;
    const minTimeBetweenSubmissions = 30000; // 30 segundos

    if (timeSinceLastSubmission < minTimeBetweenSubmissions) {
      const remainingTime = Math.ceil((minTimeBetweenSubmissions - timeSinceLastSubmission) / 1000);
      Alert.alert(
        'Espera un momento',
        `Debes esperar ${remainingTime} segundos antes de crear otra solicitud.`,
        [{ text: 'Entendido' }]
      );
      return;
    }

    // Verificar duplicados antes de enviar
    const isDuplicate = await checkForDuplicateRequest();
    if (isDuplicate) {
      Alert.alert(
        'Solicitud Duplicada',
        'Ya tienes una solicitud similar. ¿Estás seguro de que quieres crear otra?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Crear de Todos Modos', onPress: () => submitRequest() }
        ]
      );
      return;
    }

    submitRequest();
  };

  const submitRequest = async () => {
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
        // Actualizar timestamp de última solicitud
        setLastSubmissionTime(Date.now());
        
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
                setCurrentStep(0); // Volver al primer paso
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
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={[gradientStart, gradientEnd]} style={styles.container}>
        <ScrollView contentContainerStyle={[
          styles.scrollContainer, 
          isTablet && styles.scrollContainerTablet,
          isWeb && styles.scrollContainerWeb
        ]}>
        <View style={[
          styles.header, 
          isTablet && styles.headerTablet,
          isWeb && styles.headerWeb
        ]}>
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={[styles.backButton, { backgroundColor: buttonBackgroundColor }]}
              onPress={() => router.back()}
            >
              <FontAwesome name="arrow-left" size={20} color={textColor} />
            </TouchableOpacity>
            <Text style={[
              styles.headerTitle, 
              { color: textColor }, 
              isTablet && styles.headerTitleTablet,
              isWeb && styles.headerTitleWeb
            ]}>
              Crear Solicitud Musical
            </Text>
            <View style={{ width: 40 }} />
          </View>
          <Text style={[styles.headerSubtitle, { color: textColor, opacity: 0.7 }]}>
            Completa los campos para crear tu solicitud
          </Text>
        </View>

        {/* Indicador de progreso */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: buttonBackgroundColor }]}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${((currentStep + 1) / steps.length) * 100}%`,
                  backgroundColor: tintColor 
                }
              ]} 
            />
          </View>
          <Text style={[styles.progressText, { color: textColor }]}>
            Paso {currentStep + 1} de {steps.length}
          </Text>
        </View>

        <View style={[
          styles.formContainer, 
          isTablet && styles.formContainerTablet,
          isWeb && styles.formContainerWeb,
          { backgroundColor: semiTransparentBackground }
        ]}>
          {renderCurrentStep()}
          
          {/* Botones de navegación */}
          <View style={[styles.navigationContainer, { borderTopColor: borderColor }]}>
            {currentStep > 0 && (
              <TouchableOpacity
                style={[styles.navButton, styles.backButton, { borderColor: tintColor }]}
                onPress={prevStep}
              >
                <FontAwesome name="arrow-left" size={16} color={tintColor} />
                <Text style={[styles.navButtonText, { color: tintColor }]}>Anterior</Text>
              </TouchableOpacity>
            )}
            
            <View style={{ flex: 1 }} />
            
            {currentStep < steps.length - 1 ? (
              <TouchableOpacity
                style={[styles.navButton, styles.nextButton, { backgroundColor: tintColor, shadowColor }]}
                onPress={nextStep}
              >
                <Text style={[styles.navButtonText, { color: 'white' }]}>Siguiente</Text>
                <FontAwesome name="arrow-right" size={16} color="white" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.navButton, 
                  styles.submitButton, 
                  { 
                    backgroundColor: isSubmitting ? buttonBackgroundColor : tintColor,
                    opacity: isSubmitting ? 0.7 : 1
                  }
                ]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <FontAwesome name="check" size={16} color="white" />
                )}
                <Text style={[styles.navButtonText, { color: 'white' }]}>
                  {isSubmitting ? 'Creando...' : 'Crear Solicitud'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Estimación de precio */}
        {estimatedPrice > 0 && (
          <View style={[styles.priceEstimateContainer, { backgroundColor: successBackgroundColor }]}>
            <FontAwesome name="dollar" size={24} color={successColor} />
            <View style={styles.priceEstimateText}>
              <Text style={[styles.priceEstimateLabel, { color: textColor }]}>
                Precio Estimado
              </Text>
              <Text style={[styles.priceEstimateAmount, { color: successColor }]}>
                ${estimatedPrice.toLocaleString()}
              </Text>
            </View>
          </View>
        )}

      </ScrollView>
      <BottomNavigationBar />
    </LinearGradient>
    </>
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
  // Estilos responsive
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  scrollContainerTablet: {
    maxWidth: 800,
    alignSelf: 'center',
  },
  scrollContainerWeb: {
    maxWidth: 1200,
    alignSelf: 'center',
    paddingHorizontal: 60,
  },
  headerTablet: {
    marginBottom: 40,
  },
  headerWeb: {
    marginBottom: 50,
  },
  headerTitleTablet: {
    fontSize: 32,
  },
  headerTitleWeb: {
    fontSize: 36,
  },
  formContainerTablet: {
    padding: 30,
  },
  formContainerWeb: {
    padding: 40,
    maxWidth: 1000,
  },
  webColumn: {
    flex: 1,
    paddingHorizontal: 10,
  },
  webRow: {
    flexDirection: 'row',
    gap: 20,
  },
  // Estilos para el sistema de pasos
  progressContainer: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  stepContainer: {
    marginBottom: 30,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    minWidth: 120,
    justifyContent: 'center',
  },
  backButton: {
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  nextButton: {
    elevation: 3,
    // shadowColor will be set dynamically
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  submitButton: {
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  reviewContainer: {
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
  },
  reviewItem: {
    fontSize: 16,
    marginBottom: 12,
    lineHeight: 22,
  },
});
