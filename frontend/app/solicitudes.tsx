import { Text, View } from 'react-native';
import { AppColors } from '../theme/colors';

import BottomNavigationBar from '@/components/BottomNavigationBar';
import {LinearGradient} from 'expo-linear-gradient';
import { useThemeColor } from '@/hooks/use-theme-color';
export default function SolicitudesScreen() {
   const gradientStart = useThemeColor({ light: AppColors.background.gradientStartLight, dark: AppColors.background.gradientStartDark }, 'background');
   const gradientEnd = useThemeColor({ light: AppColors.background.gradientEndLight, dark: AppColors.background.gradientEndDark }, 'background');
  return (
    <LinearGradient
      colors={[gradientStart, gradientEnd]}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: AppColors.background.light }}>Solicitudes Screen</Text>
      <BottomNavigationBar />
    </View>
    </LinearGradient>
  );
}