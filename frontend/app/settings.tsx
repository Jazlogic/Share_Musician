import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import BottomNavigationBar from '@/components/BottomNavigationBar';

export default function SettingsScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userName');
      Alert.alert('Sesión cerrada', 'Has cerrado sesión correctamente.');
      router.replace('/'); // Redirige a la pantalla de inicio de sesión
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      Alert.alert('Error', 'No se pudo cerrar la sesión.');
    }
  };

  return (
    <LinearGradient
      colors={['#1A2B4C', '#3366CC']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.sectionTitle}>Cuenta</Text>
        <View style={styles.card}>
          <View style={styles.cardItem}>
            <Text style={styles.cardItemText}>Nombre de Usuario</Text>
            <Text style={styles.arrowIcon}>{'>'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.cardItem}>
            <Text style={styles.cardItemText}>Correo Electrónico</Text>
            <Text style={styles.arrowIcon}>{'>'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.cardItem}>
            <Text style={styles.cardItemText}>Cambiar Contraseña</Text>
            <Text style={styles.arrowIcon}>{'>'}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Preferencias</Text>
        <View style={styles.card}>
          <View style={styles.cardItem}>
            <Text style={styles.cardItemText}>Notificaciones Push</Text>
            <Switch
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={'#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              value={true}
              onValueChange={() => {}}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.cardItem}>
            <Text style={styles.cardItemText}>Modo Oscuro</Text>
            <Switch
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={'#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              value={false}
              onValueChange={() => {}}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Soporte</Text>
        <View style={styles.card}>
          <View style={styles.cardItem}>
            <Text style={styles.cardItemText}>Ayuda y Soporte</Text>
            <Text style={styles.arrowIcon}>{'>'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.cardItem}>
            <Text style={styles.cardItemText}>Plan: Premium</Text>
            <Text style={styles.cardItemText}>Expira el 10 de octubre de 2024</Text>
          </View>
        </View>

        {/* Log Out Section */}
        <Text style={styles.sectionTitle}>Cerrar Sesión</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.cardItem} onPress={handleLogout}>
            <Text style={styles.cardItemText}>Cerrar Sesión</Text>
            <Text style={styles.arrowIcon}>{'>'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigationBar/>
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
    paddingBottom: 100, // Space for bottom navigation
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 30,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
    marginTop: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  cardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  cardItemText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  arrowIcon: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  manageSubscriptionButtonText: {
    color: '#007BFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: 'center',
  },
  navIconPlaceholder: {
    width: 30,
    height: 30,
    backgroundColor: '#333', // Placeholder background color
    marginBottom: 5,
  },
  navText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
});