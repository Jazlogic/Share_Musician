import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { commonStyles } from '../../theme/commonStyles';

interface ButtonProps {
  onPress: () => void;
  title?: string;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle;
  children?: React.ReactNode;
}

export default function Button({ onPress, title, style, textStyle, children }: ButtonProps) {
  return (
    <TouchableOpacity
      style={[
        commonStyles.buttonPrimary,
        style,
      ]}
      onPress={onPress}
    >
      {title && <Text style={[
        commonStyles.buttonPrimaryText,
        textStyle,
      ]}>
        {title}
      </Text>}
      {children}
    </TouchableOpacity>
  );
}