import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { commonStyles } from '../../theme/commonStyles';
import { useThemeColor } from '../../hooks/use-theme-color';
import { AppColors } from '../../theme/colors';
import { useColorScheme } from '../../hooks/use-color-scheme';

interface DatePickerButtonProps {
  date: Date;
  onDateChange: (event: any, selectedDate?: Date) => void;
  showDatePicker: boolean;
  onToggleDatePicker: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function DatePickerButton({
  date,
  onDateChange,
  showDatePicker,
  onToggleDatePicker,
  style,
  textStyle,
}: DatePickerButtonProps) {
  const theme = useColorScheme() ?? 'light';
  const textColor = useThemeColor({}, 'text');
  const borderColor = AppColors.border.default;

  return (
    <>
      <TouchableOpacity
        onPress={onToggleDatePicker}
        style={[
          commonStyles.input as ViewStyle,
          { borderColor },
          style,
        ]}
      >
        <Text style={[
          commonStyles.datePickerButtonText as TextStyle,
          { color: textColor },
          textStyle,
        ]}>
          {date.toLocaleDateString()}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
    </>
  );
}