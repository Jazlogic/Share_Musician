import { Tabs } from 'expo-router';
import React from 'react';
import { TouchableOpacity } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { AppColors } from '../../theme/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';

import HomeIcon from '@/assets/images/icons/home.png';
import DashboardIcon from '@/assets/images/icons/dashboard.png';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: AppColors.primary.accent,
        headerShown: false,
        tabBarButton: ({ delayLongPress, disabled, onBlur, onFocus, onLongPress, onPressIn, onPressOut, ref, ...props }) => <TouchableOpacity {...props} />,
        animation: "none", // Disable animations for web to prevent useNativeDriver warning
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} source={HomeIcon} color={color} />,
        }}
      />
      <Tabs.Screen
        name="solicitudes"
        options={{
          title: 'Solicitudes',
          tabBarIcon: ({ color }) => <IconSymbol size={28} source={DashboardIcon} color={color} />,
        }}
      />
    </Tabs>
  );
}
