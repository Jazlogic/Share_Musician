import { Link } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { AppColors } from '../theme/colors';

import ConfigIcon from '@/assets/images/icons/config.png';
import DashboardIcon from '@/assets/images/icons/dashboard.png';
import HomeIcon from '@/assets/images/icons/home.png';
import MenuIcon from '@/assets/images/icons/menu.png';
import WalletIcon from '@/assets/images/icons/wallet.png';


export default function BottomNavigationBar() {
  const backgroundColor = useThemeColor({ light: AppColors.BottomNavigationBar.backgroundLight, dark: AppColors.BottomNavigationBar.backgroundDark }, 'background');
  const textColor = useThemeColor({ light: AppColors.BottomNavigationBar.textLight, dark: AppColors.BottomNavigationBar.textDark }, 'text');
  const iconBgColor = useThemeColor({ light: '#777', dark: '#333' }, 'icon');
  const borderTopColor = useThemeColor({ light: AppColors.BottomNavigationBar.borderTopLight, dark: AppColors.BottomNavigationBar.borderBottomDark }, 'borderTopColor');
  const borderColor = useThemeColor({ light: AppColors.BottomNavigationBar.borderLight, dark: AppColors.BottomNavigationBar.borderDark }, 'borderTopColor');

 
  return (
    <View style={[styles.bottomNav, { backgroundColor, borderTopColor ,borderColor}]}>
      
      <Link href="/home" asChild>
        <TouchableOpacity style={styles.navItem}>
          <IconSymbol size={34} source={HomeIcon} style={{ borderRadius: 15, backgroundColor: iconBgColor }} />
          <Text style={[styles.navText, { color: textColor }]}>Inicio</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/wallet" asChild>
        <TouchableOpacity style={styles.navItem}>
          <IconSymbol size={34} source={WalletIcon} style={{ borderRadius: 15, backgroundColor: iconBgColor }} />
          <Text style={[styles.navText, { color: textColor}]}>Billetera</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/menu" asChild>
        <TouchableOpacity style={styles.navItem}>
          <IconSymbol size={54} source={MenuIcon} style={{ borderRadius: 35, backgroundColor: iconBgColor }} />
          <Text style={[styles.navText, { color: textColor }]}>Menú</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/dashboard" asChild>
        <TouchableOpacity style={styles.navItem}>
          <IconSymbol size={34} source={DashboardIcon} style={{ borderRadius: 15, backgroundColor: iconBgColor }} />
          <Text style={[styles.navText, { color: textColor }]}>Dashboard</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/settings" asChild>
        <TouchableOpacity style={styles.navItem}>
          <IconSymbol size={34} source={ConfigIcon} style={{ borderRadius: 15, backgroundColor: iconBgColor }} />
          <Text style={[styles.navText, { color: textColor }]}>Config</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderRadius: 25,
    borderWidth: 2.5,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    marginBottom: 10,
    margin: 5,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    marginTop: 5,
  },
});