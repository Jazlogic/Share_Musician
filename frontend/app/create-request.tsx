import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColor } from '../hooks/use-theme-color';
import { FontAwesome } from '@expo/vector-icons';
import BottomNavigationBar from '../components/BottomNavigationBar';
import { Calendar, LocaleConfig } from 'react-native-calendars';

LocaleConfig.locales['es'] = {
  monthNames: [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ],
  monthNamesShort: [
    'Ene',
    'Feb',
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Sep',
    'Oct',
    'Nov',
    'Dic',
  ],
  dayNames: [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
  ],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
};
LocaleConfig.defaultLocale = 'es';
import { AppColors } from '../theme/colors';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function CreateRequestScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [price, setPrice] = useState('0');
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timePickerMode, setTimePickerMode] = useState<'start' | 'end'>('start'); // 'start' or 'end'
  const [date, setDate] = useState(new Date());
  const [timeError, setTimeError] = useState('');

  useEffect(() => {
    if (startTime && endTime) {
      if (startTime.getTime() > endTime.getTime()) {
        setTimeError('La hora de inicio no puede ser posterior a la hora de término.');
      } else {
        setTimeError('');
      }
    }
  }, [startTime, endTime]);

  useEffect(() => {
    if (startTime && endTime && !timeError) {
      const diffMs = endTime.getTime() - startTime.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      if (diffHours > 0) {
        setPrice((diffHours * 600).toFixed(2));
      } else {
        setPrice('0');
      }
    } else {
      setPrice('0');
    }
  }, [startTime, endTime, timeError]);

  const gradientStart = useThemeColor({ light: AppColors.cardsRequest.gradientStartLight, dark: AppColors.cardsRequest.gradientStartDark }, 'background');
  const gradientEnd = useThemeColor({ light: AppColors.cardsRequest.gradientEndLight, dark: AppColors.cardsRequest.gradientEndDark }, 'background');
  const textColor = useThemeColor({ light: AppColors.text.black, dark: AppColors.text.white }, 'text');
  const tintColor = useThemeColor({ light: AppColors.text.black, dark: AppColors.text.white }, 'tint');
  const backgroundColor = useThemeColor({ light: AppColors.cardsRequest.primaryBackgroundLight, dark: AppColors.cardsRequest.primaryBackgroundDark }, 'background');

  const selectedDayTextColor = useThemeColor({ light: AppColors.neutral.white, dark: AppColors.neutral.white }, 'text');
  const disabledTextColor = useThemeColor({ light: AppColors.neutral.grayMedium, dark: AppColors.neutral.grayMedium }, 'text');
  const shadowColor = useThemeColor({ light: AppColors.neutral.black, dark: AppColors.neutral.black }, 'background');
  const closeButtonBackgroundColor = useThemeColor({ light: AppColors.primary.lightBlue, dark: AppColors.primary.lightBlue }, 'background');
  const buttonTextColor = useThemeColor({ light: AppColors.neutral.white, dark: AppColors.neutral.white }, 'text');
  const submitButtonBackgroundColor = useThemeColor({ light: AppColors.button.backgroundLight, dark: AppColors.button.backgroundDark }, 'background');
  const submitButtonTextColor = useThemeColor({ light: AppColors.button.textLight, dark: AppColors.button.textDark }, 'text');
  const errorTextColor = useThemeColor({ light: AppColors.secondary.red, dark: AppColors.secondary.red }, 'text');

  const handleSubmit = () => {
    // Lógica para enviar la solicitud
    console.log({ title, description, category, eventDate, startTime, endTime, price });
  };

  const onDayPress = (day: any) => {
    setEventDate(day.dateString);
    setDatePickerVisible(false);
  };

  const onTimeChange = (event: any, selectedDate: Date | undefined) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      if (timePickerMode === 'start') {
        setStartTime(selectedDate);
      } else {
        setEndTime(selectedDate);
      }
    }
  };

  const showTimepickerModal = (mode: 'start' | 'end') => {
    setTimePickerMode(mode);
    setShowTimePicker(true);
  };

  const dynamicStyles = StyleSheet.create({
    formContainer: {
      width: '90%',
      backgroundColor: backgroundColor,
      borderRadius: 15,
      padding: 20,
      alignItems: 'center',
    },
    input: {
      flex: 1,
      height: 50,
      borderRadius: 10,
      paddingHorizontal: 15,
      fontSize: 16,
      borderWidth: 1,
      borderColor: tintColor,
      color: textColor,
    },
    submitButton: {
      paddingVertical: 15,
      paddingHorizontal: 30,
      borderRadius: 10,
      marginTop: 20,
      width: '100%',
      alignItems: 'center',
      backgroundColor: submitButtonBackgroundColor,
    },
    submitButtonText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: submitButtonTextColor,
    },
    modalView: {
      margin: 20,
      backgroundColor: backgroundColor,
      borderRadius: 20,
      padding: 35,
      alignItems: "center",
      shadowColor: shadowColor,
      shadowOffset: {
        width: 0,
        height: 2
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5
    },
    closeButton: {
      borderRadius: 20,
      padding: 10,
      elevation: 2,
      marginTop: 15,
      backgroundColor: closeButtonBackgroundColor,
    },
    textStyle: {
      fontWeight: "bold",
      textAlign: "center",
      color: buttonTextColor,
    },
    timeErrorText: {
      color: errorTextColor,
      marginBottom: 10,
    }
  });

  return (
    <LinearGradient
      colors={[gradientStart, gradientEnd]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: textColor }]}>Crear Solicitud</Text>
        </View>

        <View style={dynamicStyles.formContainer}>
          <View style={styles.inputGroup}>
            <FontAwesome name="pencil" size={20} color={tintColor} style={styles.inputIcon} />
            <TextInput
              style={[dynamicStyles.input, { color: textColor, borderColor: tintColor }]}
              placeholder="Title"
              placeholderTextColor={tintColor}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <FontAwesome name="pencil" size={20} color={tintColor} style={styles.inputIcon} />
            <TextInput
              style={[dynamicStyles.input, { color: textColor, borderColor: tintColor }]}
              placeholder="Description"
              placeholderTextColor={tintColor}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View style={styles.inputGroup}>
            <FontAwesome name="tags" size={20} color={tintColor} style={styles.inputIcon} />
            <TextInput
              style={[dynamicStyles.input, { color: textColor, borderColor: tintColor }]}
              placeholder="Categoria (ej. Musica, Producion)"
              placeholderTextColor={tintColor}
              value={category}
              onChangeText={setCategory}
            />
          </View>

          <View style={styles.inputGroup}>
            <FontAwesome name="calendar" size={20} color={tintColor} style={styles.inputIcon} />
            <TouchableOpacity style={styles.iconButton} onPress={() => setDatePickerVisible(true)}>
            <TextInput
              style={[dynamicStyles.input, { color: textColor, borderColor: tintColor }]}
              placeholder="Fecha del evento"
              placeholderTextColor={tintColor}
              value={eventDate}
              onChangeText={setEventDate}
              editable={false} // Make the TextInput not editable directly
            />
              {/* <FontAwesome name="calendar" size={20} color={tintColor} /> */}
            </TouchableOpacity>
          </View>

          <Modal
            animationType="slide"
            transparent={true}
            visible={isDatePickerVisible}
            onRequestClose={() => setDatePickerVisible(false)}
          >
            <View style={styles.centeredView}>
              <View style={[dynamicStyles.modalView, { backgroundColor: backgroundColor, shadowColor: shadowColor }]}>
                <Calendar
                  onDayPress={onDayPress}
                  markedDates={{
                    [eventDate]: { selected: true, disableTouchEvent: true, selectedColor: tintColor }
                  }}
                  theme={{
                    backgroundColor: 'rgba(255, 255, 255, 0)',
                    calendarBackground: backgroundColor,
                    textSectionTitleColor: textColor,
                    selectedDayBackgroundColor: tintColor,
                    selectedDayTextColor: selectedDayTextColor,
                    todayTextColor: tintColor,
                    dayTextColor: textColor,
                    textDisabledColor: disabledTextColor,
                    dotColor: tintColor,
                    arrowColor: tintColor,
                    monthTextColor: textColor,
                    textDayFontFamily: 'monospace',
                    textMonthFontFamily: 'monospace',
                    textDayFontSize: 16,
                    textMonthFontSize: 16,
                    textDayHeaderFontSize: 16
                  }}
                />
                <TouchableOpacity onPress={() => setDatePickerVisible(false)} style={[dynamicStyles.closeButton, { backgroundColor: closeButtonBackgroundColor }]}>
                  <Text style={[dynamicStyles.textStyle, { color: buttonTextColor }]}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <View style={styles.inputGroup}>
            <FontAwesome name="clock-o" size={20} color={tintColor} />
            <TouchableOpacity style={styles.iconButton} onPress={() => showTimepickerModal('start')}>
            {/* <FontAwesome name="clock-o" size={20} color={tintColor} style={styles.inputIcon} /> */}
            <TextInput
              style={[styles.input, { color: textColor, borderColor: tintColor }]}
              placeholder="Hora de inicio (ej. 18:00) = "
              placeholderTextColor={tintColor}
              value={startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              editable={false}
            />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <FontAwesome name="clock-o" size={20} color={tintColor} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: textColor, borderColor: tintColor }]}
              placeholder="End Time"
              placeholderTextColor={tintColor}
              value={endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              editable={false}
            />
            <TouchableOpacity style={styles.iconButton} onPress={() => showTimepickerModal('end')}>
              <FontAwesome name="clock-o" size={20} color={tintColor} />
            </TouchableOpacity>
          </View>

          {timeError ? <Text style={[dynamicStyles.timeErrorText, { color: errorTextColor }]}>{timeError}</Text> : null}

          {showTimePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={date}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={onTimeChange}
            />
          )}

          <View style={styles.inputGroup}>
            <FontAwesome name="dollar" size={20} color={tintColor} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: textColor, borderColor: tintColor }]}
              placeholder="Price (USD)"
              placeholderTextColor={tintColor}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              editable={false} // El precio se calculará automáticamente
            />
          </View>

          <TouchableOpacity style={[dynamicStyles.submitButton, { backgroundColor: submitButtonBackgroundColor }]} onPress={handleSubmit}>
            <Text style={[dynamicStyles.submitButtonText, { color: submitButtonTextColor }]}>SUBMIT REQUEST</Text>
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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 50,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  formContainer: {
    width: '90%',
    backgroundColor: AppColors.cardsRequest.primaryBackgroundLight, // Usar color de fondo de AppColors
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: AppColors.primary.accent, // Usar color de borde de AppColors
    color: AppColors.text.black, // Usar color de texto de AppColors
  },
  iconButton: {
    padding: 10,
  },
  submitButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
    backgroundColor: AppColors.button.backgroundLight, // Usar color de fondo de botón de AppColors
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.button.textLight, // Usar color de texto de botón de AppColors
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: AppColors.background.light, // Usar color de fondo de modal de AppColors
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: AppColors.neutral.black, // Usar color de sombra de AppColors
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  closeButton: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 15,
    backgroundColor: AppColors.primary.lightBlue, // Usar color de fondo de botón de cierre de AppColors
  },
  textStyle: {
    fontWeight: "bold",
    textAlign: "center",
    color: AppColors.neutral.white, // Usar color de texto de AppColors
  }
});