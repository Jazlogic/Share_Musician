import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeColor } from '../hooks/use-theme-color';
import { AppColors } from '../theme/colors';

interface FloatingCreateButtonProps {
  visible?: boolean;
  style?: any;
}

export default function FloatingCreateButton({ 
  visible = true, 
  style 
}: FloatingCreateButtonProps) {
  const router = useRouter();
  const backgroundColor = useThemeColor(
    { light: AppColors.button.backgroundLight, dark: AppColors.button.backgroundDark },
    'background'
  );
  const textColor = useThemeColor(
    { light: AppColors.button.textLight, dark: AppColors.button.textDark },
    'text'
  );

  if (!visible) return null;

  return (
    <TouchableOpacity
      style={[styles.floatingButton, { backgroundColor }, style]}
      onPress={() => router.push('/create-request-optimized')}
      activeOpacity={0.8}
    >
      <View style={styles.buttonContent}>
        <FontAwesome name="star" size={20} color={textColor} />
        <FontAwesome name="plus" size={16} color={textColor} style={styles.plusIcon} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 100, // Above bottom navigation
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  buttonContent: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusIcon: {
    position: 'absolute',
    top: -2,
    right: -2,
  },
});
