import React, { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Calendar, WeekCalendar, Agenda } from 'react-native-calendars';
import { AppColors } from '../theme/colors';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ScrollView } from 'react-native-gesture-handler';
import BottomNavigationBar from '@/components/BottomNavigationBar';

export default function AgendaScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'day'
  const gradientStart = useThemeColor({ light: AppColors.background.gradientStartLight, dark: AppColors.background.gradientStartDark }, 'background');
  const gradientEnd = useThemeColor({ light: AppColors.background.gradientEndLight, dark: AppColors.background.gradientEndDark }, 'background');
  const textColor = useThemeColor({ light: AppColors.text.light, dark: AppColors.text.dark }, 'text');
  const backgroundColor = useThemeColor({ light: AppColors.background.light, dark: AppColors.background.dark }, 'background');
  const itemBackgroundColor = useThemeColor({ light: AppColors.items.backgroundLight, dark: AppColors.items.backgroundDark }, 'background');

  const onDayPress = (day: any) => {
    setSelectedDate(day.dateString);
  };

  const renderCalendar = () => {
    switch (viewMode) {
      case 'month':
        return (
          <View style={{ backgroundColor: itemBackgroundColor, borderRadius: 10, padding: 10, margin: 10 }}>

          <Calendar
          
          onDayPress={onDayPress}
          markedDates={{
            [selectedDate]: { selected: true, disableTouchEvent: true, selectedColor: AppColors.primary.accent }
          }}
          theme={{
            backgroundColor: 'rgba(255, 255, 255, 0)',
            calendarBackground: 'rgba(255, 255, 255, 0.09)',
            textSectionTitleColor: textColor,
            selectedDayBackgroundColor: AppColors.primary.accent,
            selectedDayTextColor: AppColors.neutral.white,
            todayTextColor: AppColors.primary.accent,
            dayTextColor: textColor,
            textDisabledColor: AppColors.neutral.grayMedium,
            dotColor: AppColors.primary.accent,
            arrowColor: AppColors.primary.accent,
            monthTextColor: textColor,
            textDayFontFamily: 'monospace',
            textMonthFontFamily: 'monospace',
            textDayHeaderFontFamily: 'monospace',
            textDayFontSize: 16,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 16
          }}
          />
          </View>
        );
      case 'week':
        return (
          <View style={[styles.itemsWeek, { backgroundColor: itemBackgroundColor }]}>
            <Text style={{ color: textColor }}>Vista Semanal para {selectedDate}</Text>
          </View>
        );
      case 'day':
        return (
          // <Agenda
          //   selected={selectedDate}
          //   items={{
          //     [selectedDate]: [{
          //       name: 'Item for ' + selectedDate,
          //       height: 80,
          //       day: selectedDate
          //     }]
          //   }}
          //   renderItem={(item: any, firstItemInDay: boolean) => {
          //     return (
          //       <View style={{ backgroundColor: itemBackgroundColor, padding: 10, marginRight: 10, marginTop: 17, borderRadius: 5 }}>
          //         <Text style={{ color: textColor }}>{item.name}</Text>
          //       </View>
          //     );
          //   }}
          //   theme={{
          //     backgroundColor: backgroundColor,
          //     calendarBackground: itemBackgroundColor,
          //     agendaKnobColor: AppColors.primary.accent,
          //     agendaDayTextColor: textColor,
          //     agendaDayNumColor: textColor,
          //     agendaTodayColor: AppColors.primary.accent,
          //     indicatorColor: AppColors.primary.accent,
          //     textSectionTitleColor: textColor,
          //     selectedDayBackgroundColor: AppColors.primary.accent,
          //     selectedDayTextColor: AppColors.neutral.white,
          //     todayTextColor: AppColors.primary.accent,
          //     dayTextColor: textColor,
          //     textDisabledColor: AppColors.neutral.grayMedium,
          //     dotColor: AppColors.primary.accent,
          //     arrowColor: AppColors.primary.accent,
          //     monthTextColor: textColor,
          //     textDayFontFamily: 'monospace',
          //     textMonthFontFamily: 'monospace',
          //     textDayHeaderFontFamily: 'monospace',
          //     textDayFontSize: 16,
          //     textMonthFontSize: 16,
          //     textDayHeaderFontSize: 16
          //   }}
          // />
          <Text style={{ color: textColor }}>Vista Diaria para {selectedDate}</Text>
        );

      default:
        return null;
    }
  };

  return (
       <LinearGradient
      colors={[gradientStart, gradientEnd]}
      style={styles.Container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
    <ScrollView style={styles.container}>
      <View style={styles.viewModeContainer}>
        <TouchableOpacity onPress={() => setViewMode('month')} style={[styles.viewModeButton ,{backgroundColor: itemBackgroundColor}, viewMode === 'month' && styles.activeViewModeButton]}>
          <Text style={[styles.viewModeText, { color: textColor }]}>Mes</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setViewMode('week')} style={[styles.viewModeButton ,{backgroundColor: itemBackgroundColor}, viewMode === 'week' && styles.activeViewModeButton]}>
          <Text style={[styles.viewModeText, { color: textColor }]}>Semana</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setViewMode('day')} style={[styles.viewModeButton ,{backgroundColor: itemBackgroundColor}, viewMode === 'day' && styles.activeViewModeButton]}>
          <Text style={[styles.viewModeText, { color: textColor }]}>Día</Text>
        </TouchableOpacity>
      </View>
      {renderCalendar()}
    </ScrollView>
    <BottomNavigationBar/>
</LinearGradient>
  );
}

const styles = StyleSheet.create({
  Container: {
    flex: 1,
  },
  container: {
    flex: 1,
    marginTop: 50,
    paddingTop: 10,
  },
  viewModeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  viewModeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    // backgroundColor: AppColors.items.backgroundDark,
  },
  activeViewModeButton: {
    backgroundColor: AppColors.primary.accent,
  },
  viewModeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemsWeek:{
    flex: 1,
    justifyContent: 'center',
    borderRadius: 10, 
    padding: 10, 
    margin: 10
  }
});