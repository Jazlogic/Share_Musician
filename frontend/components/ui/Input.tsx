import React from 'react';
import { TextInput, StyleSheet, ViewStyle, TextStyle, TextInputProps, StyleProp } from 'react-native';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { AppColors } from '../../theme/colors';
import { Spacing } from '../../theme/tokens';

interface InputProps extends TextInputProps {
  style?: StyleProp<TextStyle>;
}

export function Input({ style, ...rest }: InputProps) {
  const theme = useColorScheme() ?? 'light';
  const borderColor = AppColors.border.default;
  const textColor = AppColors.text[theme];

  return (
    <TextInput
      style={[
        styles.input,
        { borderColor, color: textColor },
        style,
      ]}
      placeholderTextColor={AppColors.text.secondary}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: Spacing.sm,
    padding: Spacing.md,
    fontSize: 16,
  },
});