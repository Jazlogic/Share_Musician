import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Platform } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FontAwesome } from '@expo/vector-icons';
import { useThemeColor } from '../../hooks/use-theme-color';
import { AppColors } from '../../theme/colors';

interface DateTimeSelectorProps {
  label: string;
  selectedDate: string;
  startTime: Date;
  endTime: Date;
  onDateChange: (date: string) => void;
  onStartTimeChange: (time: Date) => void;
  onEndTimeChange: (time: Date) => void;
  required?: boolean;
  error?: string;
  showDuration?: boolean;
}

LocaleConfig.locales['es'] = {
  monthNames: [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ],
  monthNamesShort: [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
  ],
  dayNames: [
    'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado',
  ],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
};

LocaleConfig.defaultLocale = 'es';

const timeSuggestions = [
  { label: 'Mañana (8:00 - 12:00)', start: '08:00', end: '12:00' },
  { label: 'Tarde (14:00 - 18:00)', start: '14:00', end: '18:00' },
  { label: 'Noche (19:00 - 23:00)', start: '19:00', end: '23:00' },
  { label: 'Todo el día (8:00 - 23:00)', start: '08:00', end: '23:00' },
];

const quickDates = [
  { label: 'Hoy', days: 0 },
  { label: 'Mañana', days: 1 },
  { label: 'En 3 días', days: 3 },
  { label: 'En una semana', days: 7 },
  { label: 'En 2 semanas', days: 14 },
];

export default function DateTimeSelector({
  label,
  selectedDate,
  startTime,
  endTime,
  onDateChange,
  onStartTimeChange,
  onEndTimeChange,
  required = false,
  error,
  showDuration = true
}: DateTimeSelectorProps) {
  const [showDateModal, setShowDateModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [timePickerMode, setTimePickerMode] = useState<'start' | 'end'>('start');
  const [showTimePicker, setShowTimePicker] = useState(false);

  const textColor = useThemeColor({ light: AppColors.text.black, dark: AppColors.text.white }, 'text');
  const tintColor = useThemeColor({ light: AppColors.primary.blue, dark: AppColors.primary.accent }, 'tint');
  const backgroundColor = useThemeColor({ light: AppColors.background.light, dark: AppColors.background.dark }, 'background');
  const cardBackground = useThemeColor({ light: AppColors.cardsRequest.primaryBackgroundLight, dark: AppColors.cardsRequest.primaryBackgroundDark }, 'background');
  const errorColor = useThemeColor({ light: AppColors.secondary.red, dark: AppColors.secondary.red }, 'text');
  const placeholderColor = useThemeColor({ light: AppColors.text.secondary, dark: AppColors.text.secondary }, 'text');

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Seleccionar fecha';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getDuration = () => {
    const diffMs = endTime.getTime() - startTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes > 0 ? diffMinutes + 'm' : ''}`;
    }
    return `${diffMinutes}m`;
  };

  const isTimeValid = () => {
    return startTime.getTime() < endTime.getTime();
  };

  const handleDateSelect = (day: any) => {
    onDateChange(day.dateString);
    setShowDateModal(false);
  };

  const handleQuickDateSelect = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    onDateChange(date.toISOString().split('T')[0]);
    setShowDateModal(false);
  };

  const handleTimeSuggestion = (start: string, end: string) => {
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    
    const newStartTime = new Date();
    newStartTime.setHours(startHour, startMinute, 0, 0);
    
    const newEndTime = new Date();
    newEndTime.setHours(endHour, endMinute, 0, 0);
    
    onStartTimeChange(newStartTime);
    onEndTimeChange(newEndTime);
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    
    if (selectedDate) {
      if (timePickerMode === 'start') {
        onStartTimeChange(selectedDate);
      } else {
        onEndTimeChange(selectedDate);
      }
    }
  };

  const showTimePickerModal = (mode: 'start' | 'end') => {
    setTimePickerMode(mode);
    setShowTimeModal(true);
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: textColor }]}>
        {label}
        {required && <Text style={{ color: errorColor }}> *</Text>}
      </Text>

      {/* Date Selection */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>📅 Fecha del Evento</Text>
        <TouchableOpacity
          style={[
            styles.selectorButton,
            {
              backgroundColor: cardBackground,
              borderColor: selectedDate ? tintColor : '#E0E0E0',
              borderWidth: 2,
            }
          ]}
          onPress={() => setShowDateModal(true)}
        >
          <FontAwesome name="calendar" size={20} color={tintColor} />
          <Text style={[styles.selectorText, { color: selectedDate ? textColor : placeholderColor }]}>
            {formatDate(selectedDate)}
          </Text>
          <FontAwesome name="chevron-down" size={16} color={tintColor} />
        </TouchableOpacity>
      </View>

      {/* Quick Date Options */}
      {selectedDate && (
        <View style={styles.quickOptions}>
          <Text style={[styles.quickOptionsTitle, { color: textColor }]}>Fechas Rápidas:</Text>
          <View style={styles.quickOptionsContainer}>
            {quickDates.map((quickDate, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.quickOptionButton, { backgroundColor: tintColor }]}
                onPress={() => handleQuickDateSelect(quickDate.days)}
              >
                <Text style={styles.quickOptionText}>{quickDate.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Time Selection */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>⏰ Horario del Evento</Text>
        
        {/* Time Suggestions */}
        <View style={styles.timeSuggestions}>
          {timeSuggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.timeSuggestionButton, { backgroundColor: cardBackground }]}
              onPress={() => handleTimeSuggestion(suggestion.start, suggestion.end)}
            >
              <Text style={[styles.timeSuggestionText, { color: textColor }]}>
                {suggestion.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom Time Selection */}
        <View style={styles.timeContainer}>
          <TouchableOpacity
            style={[
              styles.timeButton,
              {
                backgroundColor: cardBackground,
                borderColor: isTimeValid() ? tintColor : errorColor,
                borderWidth: 2,
              }
            ]}
            onPress={() => showTimePickerModal('start')}
          >
            <FontAwesome name="clock-o" size={16} color={tintColor} />
            <Text style={[styles.timeButtonText, { color: textColor }]}>
              Inicio: {formatTime(startTime)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.timeButton,
              {
                backgroundColor: cardBackground,
                borderColor: isTimeValid() ? tintColor : errorColor,
                borderWidth: 2,
              }
            ]}
            onPress={() => showTimePickerModal('end')}
          >
            <FontAwesome name="clock-o" size={16} color={tintColor} />
            <Text style={[styles.timeButtonText, { color: textColor }]}>
              Fin: {formatTime(endTime)}
            </Text>
          </TouchableOpacity>
        </View>

        {showDuration && (
          <View style={styles.durationContainer}>
            <FontAwesome name="hourglass-half" size={16} color="#4CAF50" />
            <Text style={[styles.durationText, { color: '#4CAF50' }]}>
              Duración: {getDuration()}
            </Text>
          </View>
        )}

        {!isTimeValid() && (
          <Text style={[styles.errorText, { color: errorColor }]}>
            La hora de fin debe ser posterior a la hora de inicio
          </Text>
        )}
      </View>

      {error && (
        <Text style={[styles.errorText, { color: errorColor }]}>{error}</Text>
      )}

      {/* Date Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showDateModal}
        onRequestClose={() => setShowDateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textColor }]}>
                Seleccionar Fecha
              </Text>
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: tintColor }]}
                onPress={() => setShowDateModal(false)}
              >
                <FontAwesome name="times" size={18} color="white" />
              </TouchableOpacity>
            </View>
            
            <Calendar
              onDayPress={handleDateSelect}
              markedDates={{
                [selectedDate]: { selected: true, selectedColor: tintColor }
              }}
              minDate={getMinDate()}
              theme={{
                backgroundColor: backgroundColor,
                calendarBackground: backgroundColor,
                textSectionTitleColor: textColor,
                selectedDayBackgroundColor: tintColor,
                selectedDayTextColor: 'white',
                todayTextColor: tintColor,
                dayTextColor: textColor,
                textDisabledColor: '#999',
                dotColor: tintColor,
                arrowColor: tintColor,
                monthTextColor: textColor,
                textDayFontSize: 16,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 14
              }}
            />
          </View>
        </View>
      </Modal>

      {/* Time Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showTimeModal}
        onRequestClose={() => setShowTimeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textColor }]}>
                Seleccionar Hora {timePickerMode === 'start' ? 'de Inicio' : 'de Fin'}
              </Text>
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: tintColor }]}
                onPress={() => setShowTimeModal(false)}
              >
                <FontAwesome name="times" size={18} color="white" />
              </TouchableOpacity>
            </View>
            
            {Platform.OS === 'ios' && (
              <DateTimePicker
                value={timePickerMode === 'start' ? startTime : endTime}
                mode="time"
                is24Hour={true}
                display="spinner"
                onChange={handleTimeChange}
                style={styles.timePicker}
              />
            )}
            
            {Platform.OS === 'android' && showTimePicker && (
              <DateTimePicker
                value={timePickerMode === 'start' ? startTime : endTime}
                mode="time"
                is24Hour={true}
                display="default"
                onChange={handleTimeChange}
              />
            )}
            
            {Platform.OS === 'android' && !showTimePicker && (
              <TouchableOpacity
                style={[styles.timePickerButton, { backgroundColor: tintColor }]}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.timePickerButtonText}>
                  Mostrar Selector de Hora
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  selectorText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  quickOptions: {
    marginBottom: 15,
  },
  quickOptionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  quickOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickOptionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  quickOptionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  timeSuggestions: {
    marginBottom: 15,
  },
  timeSuggestionButton: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  timeSuggestionText: {
    fontSize: 14,
    textAlign: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  timeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  timeButtonText: {
    fontSize: 14,
    marginLeft: 8,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    justifyContent: 'center',
  },
  durationText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 14,
    marginTop: 5,
    marginLeft: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timePicker: {
    height: 200,
  },
  timePickerButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  timePickerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
