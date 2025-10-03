import { StyleSheet, Text, View, ScrollView, ImageBackground, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNavigationBar from '@/components/BottomNavigationBar';


export default function HomeScreen() {
  const [userName, setUserName] = useState('Usuario');

  useEffect(() => {
    const loadUserName = async () => {
      try {
        const storedUserName = await AsyncStorage.getItem('userName');
        if (storedUserName) {
          setUserName(storedUserName);
        }
      } catch (error) {
        console.error('Error loading user name from AsyncStorage', error);
      }
    };

    loadUserName();
  }, []);

  return (
    <LinearGradient
      colors={['#1A2B4C', '#3366CC']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.welcomeText}>¡Bienvenido, {userName}!</Text>

        <Text style={styles.sectionTitle}>Tus Listas de Reproducción</Text>
        <View style={styles.playlistsContainer}>
          <View style={styles.playlistItem}>
            <View style={styles.playlistImagePlaceholder} />
            <Text style={styles.playlistText}>Tus Listas</Text>
          </View>
          <View style={styles.playlistItem}>
            <View style={styles.playlistImagePlaceholder} />
            <Text style={styles.playlistText}>Cuatro Millones</Text>
          </View>
          <View style={styles.playlistItem}>
            <View style={styles.playlistImagePlaceholder} />
            <Text style={styles.playlistText}>Reproducido Recientemente</Text>
          </View>
          <View style={styles.playlistItem}>
            <View style={styles.playlistImagePlaceholder} />
            <Text style={styles.playlistText}>Recomendaciones</Text>
          </View>
          <View style={styles.playlistItem}>
            <View style={styles.playlistImagePlaceholder} />
            <Text style={styles.playlistText}>Clasificación</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Recomendado para Ti</Text>
        <View style={styles.recommendedContainer}>
          <View style={styles.recommendedItem}>
            <View style={styles.recommendedImagePlaceholder} />
            <Text style={styles.recommendedText}>Reproducido Recientemente</Text>
          </View>
          <View style={styles.recommendedItem}>
            <View style={styles.recommendedImagePlaceholder} />
            <Text style={styles.recommendedText}>Lunas Bárbaras</Text>
          </View>
          <View style={styles.recommendedItem}>
            <View style={styles.recommendedImagePlaceholder} />
            <Text style={styles.recommendedText}>Patrulla Mitil</Text>
          </View>
          <View style={styles.recommendedItem}>
            <View style={styles.recommendedImagePlaceholder} />
            <Text style={styles.recommendedText}>Gour Siley</Text>
          </View>
          <View style={styles.recommendedItem}>
            <View style={styles.recommendedImagePlaceholder} />
            <Text style={styles.recommendedText}>Bery:</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
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
    paddingBottom: 100, // Space for bottom navigation
  },
  welcomeText: {
    fontSize: 28,
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
  playlistsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  playlistItem: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  playlistImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#333',
    borderRadius: 40,
    marginBottom: 10,
    
  },
  playlistText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
  recommendedContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  recommendedItem: {
    width: '48%', // Adjust as needed
    marginBottom: 15,
    alignItems: 'center',
  },
  recommendedImagePlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginBottom: 5,
    backgroundColor: '#333', // Placeholder background color
  },
  recommendedText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
  },
});