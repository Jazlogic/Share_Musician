import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import BottomNavigationBar from '@/components/BottomNavigationBar';
import { useThemeColor } from '@/hooks/use-theme-color';
import { AppColors } from '../theme/colors';

import SolicitudesIcon from '@/assets/images/icons/solicitudes.png';
import AgendaIcon from '@/assets/images/icons/agenda.png';
import PerfilIcon from '@/assets/images/icons/perfil.png';
import PagosIcon from '@/assets/images/icons/pagos.png';

export default function MenuScreen() {
  const gradientStart = useThemeColor({ light: AppColors.background.gradientStartLight, dark: AppColors.background.gradientStartDark }, 'background');
  const gradientEnd = useThemeColor({ light: AppColors.background.gradientEndLight, dark: AppColors.background.gradientEndDark }, 'background');
  const menuTitleColor = useThemeColor({ light: AppColors.text.white, dark: AppColors.text.white }, 'text');
  const menuItemsBg = useThemeColor({ light: AppColors.background.menuContainer, dark: AppColors.background.menuContainer }, 'background');
  const borderBottom = useThemeColor({ light: AppColors.border.default, dark: AppColors.border.default }, 'borderTopColor');
  const menuItemTextColor = useThemeColor({ light: AppColors.text.black, dark: AppColors.text.black }, 'text');
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

        <View style={[styles.menuItemsContainer, { backgroundColor: menuItemsBg }]}>
          <Link href="/solicitudes" asChild>
            <TouchableOpacity style={styles.menuItem}>
              <IconSymbol style={[styles.IconSymbol, { backgroundColor: iconBgColor }]} source={SolicitudesIcon} />
              <Text style={[styles.menuItemText, { color: menuItemTextColor }]}>Solicquiades</Text>
            </TouchableOpacity>
          </Link>
          <Link href="/agenda" asChild>
            <TouchableOpacity style={styles.menuItem}>
              <IconSymbol  style={[styles.IconSymbol, { backgroundColor: iconBgColor }]} source={AgendaIcon} />
              <Text style={[styles.menuItemText, { color: menuItemTextColor }]}>Agenda</Text>
            </TouchableOpacity>
          </Link>
          <Link href="/perfil" asChild>
            <TouchableOpacity style={styles.menuItem}>
              <IconSymbol style={[styles.IconSymbol, { backgroundColor: iconBgColor }]} source={PerfilIcon} />
              <Text style={[styles.menuItemText, { color: menuItemTextColor }]}>Perfil</Text>
            </TouchableOpacity>
          </Link>
          <Link href="/pagos" asChild>
            <TouchableOpacity style={styles.menuItem}>
              <IconSymbol  style={[styles.IconSymbol, { backgroundColor: iconBgColor }]} source={PagosIcon} />
              <Text style={[styles.menuItemText, { color: menuItemTextColor }]}>Pagos</Text>
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
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  menuItemText: {
    fontSize: 18,
    marginLeft: 15,
    flex: 1,
  },
  IconSymbol: {
    width: 28,
    height: 28,
    borderRadius: 15,
  },

});