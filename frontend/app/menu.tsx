import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import BottomNavigationBar from '@/components/BottomNavigationBar';
import { useThemeColor } from '@/hooks/use-theme-color';
import { AppColors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons'; // Importar Ionicons

import SolicitudesIcon from '@/assets/images/icons/solicitudes.png';
import AgendaIcon from '@/assets/images/icons/agenda.png';
import PerfilIcon from '@/assets/images/icons/perfil.png';
import PagosIcon from '@/assets/images/icons/pagos.png';

export default function MenuScreen() {
  const gradientStart = useThemeColor({ light: AppColors.background.gradientStartLight, dark: AppColors.background.gradientStartDark }, 'background');
  const gradientEnd = useThemeColor({ light: AppColors.background.gradientEndLight, dark: AppColors.background.gradientEndDark }, 'background');
  const menuTitleColor = useThemeColor({ light: AppColors.text.white, dark: AppColors.text.white }, 'text');
  // const menuItemsBg = useThemeColor({ light: AppColors.background.menuContainer, dark: AppColors.background.menuContainer }, 'background'); // Ya no es necesario
  // const borderBottom = useThemeColor({ light: AppColors.border.default, dark: AppColors.border.default }, 'borderTopColor'); // Ya no es necesario
  // const menuItemTextColor = useThemeColor({ light: AppColors.text.black, dark: AppColors.text.black }, 'text'); // Ya no es necesario
  const iconBgColor = useThemeColor({ light: AppColors.icon.background, dark: AppColors.icon.background }, 'icon');

  return (
    <LinearGradient
      colors={[gradientStart, gradientEnd]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={[styles.menuTitle, { color: menuTitleColor }]}>Menú</Text>

        <View style={styles.menuItemsContainer}> {/* Eliminado backgroundColor dinámico */}
          <Link href="/solicitudes" asChild>
            <TouchableOpacity style={styles.menuItem}>
              <IconSymbol style={[styles.IconSymbol, { backgroundColor: iconBgColor }]} source={SolicitudesIcon} />
              <Text style={styles.menuItemText}>Solicitudes</Text>
              <Ionicons name="chevron-forward-outline" size={24} color={AppColors.text.white} />
            </TouchableOpacity>
          </Link>
          <Link href="/agenda" asChild>
            <TouchableOpacity style={styles.menuItem}>
              <IconSymbol  style={[styles.IconSymbol, { backgroundColor: iconBgColor }]} source={AgendaIcon} />
              <Text style={styles.menuItemText}>Agenda</Text>
              <Ionicons name="chevron-forward-outline" size={24} color={AppColors.text.white} />
            </TouchableOpacity>
          </Link>
          <Link href="/perfil" asChild>
            <TouchableOpacity style={styles.menuItem}>
              <IconSymbol style={[styles.IconSymbol, { backgroundColor: iconBgColor }]} source={PerfilIcon} />
              <Text style={styles.menuItemText}>Perfil</Text>
              <Ionicons name="chevron-forward-outline" size={24} color={AppColors.text.white} />
            </TouchableOpacity>
          </Link>
          <Link href="/pagos" asChild>
            <TouchableOpacity style={styles.menuItem}>
              <IconSymbol  style={[styles.IconSymbol, { backgroundColor: iconBgColor }]} source={PagosIcon} />
              <Text style={styles.menuItemText}>Pagos</Text>
              <Ionicons name="chevron-forward-outline" size={24} color={AppColors.text.white} />
            </TouchableOpacity>
          </Link>
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
  scrollViewContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  menuTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  menuItemsContainer: {
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Añadido
    paddingVertical: 15,
    paddingHorizontal: 10, // Añadido
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Añadido
    borderRadius: 10, // Añadido
    marginBottom: 10, // Añadido
    // borderBottomWidth: 1, // Eliminado
  },
  menuItemText: {
    flex: 1,
    marginLeft: 10, // Ajustado
    fontSize: 16, // Ajustado
    color: AppColors.text.white, // Ajustado
  },
  IconSymbol: {
    width: 28,
    height: 28,
    borderRadius: 15,
  },

});