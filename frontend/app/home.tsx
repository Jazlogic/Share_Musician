import { StyleSheet, Text, View, ScrollView, ImageBackground, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNavigationBar from '@/components/BottomNavigationBar';
import { useThemeColor } from "@/hooks/use-theme-color";
import {AppColors} from '../theme/colors';



export default function HomeScreen() {
  const [userName, setUserName] = useState('Usuario');
  
  const gradientStart = useThemeColor(
    {
      light: AppColors.background.gradientStartLight,
      dark: AppColors.background.gradientStartDark,
    },
    "background"
  );
    const gradientEnd = useThemeColor(
    {
      light: AppColors.background.gradientEndLight,
      dark: AppColors.background.gradientEndDark,
    },
    "background"
  );
  const textColor = useThemeColor(
    {
      light: AppColors.text.light,
      dark: AppColors.text.dark,
    },
    "text"
  );
  const itemBackgroundColor = useThemeColor(
    {
      light: AppColors.cardsRequest.primaryBackgroundLight,
      dark: AppColors.cardsRequest.primaryBackgroundDark,
    },
    "background"
  );
  const secondaryCardsRequestBackgroundColor = useThemeColor(
    {
      light: AppColors.cardsRequest.secondaryBackgroundLight,
      dark: AppColors.cardsRequest.secondaryBackgroundDark,
    },
    "background"
  );

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
      colors={[gradientStart, gradientEnd]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={[styles.welcomeText , {color: textColor}]}>¡Bienvenido!</Text>
        <Text style={[styles.welcomeTextName, {color: textColor}]}>{userName.split(' ')[0]}</Text>

        <Text style={[styles.sectionTitle, {color: textColor}]}>Tus Listas de Reproducción</Text>
        <View style={styles.playlistsContainer}>
          <View style={[styles.playlistItem, {backgroundColor: itemBackgroundColor}]}>
            <View style={[styles.playlistImagePlaceholder, {backgroundColor: textColor}]} />
            <Text style={[styles.playlistText, {color: textColor}]}>Tus Listas</Text>
          </View>
          <View style={[styles.playlistItem, {backgroundColor: secondaryCardsRequestBackgroundColor}]}>
            <View style={[styles.playlistImagePlaceholder, {backgroundColor: textColor}]} />
            <Text style={[styles.playlistText, {color: textColor}]}>Cuatro Millones</Text>
          </View>
          <View style={[styles.playlistItem, {backgroundColor: itemBackgroundColor}]}>
            <View style={[styles.playlistImagePlaceholder, {backgroundColor: textColor}]} /> 
            <Text style={[styles.playlistText, {color: textColor}]}>Reproducido Recientemente</Text>
          </View>
          <View style={[styles.playlistItem, {backgroundColor: secondaryCardsRequestBackgroundColor}]}>
            <View style={[styles.playlistImagePlaceholder, {backgroundColor: textColor}]} />
            <Text style={[styles.playlistText, {color: textColor}]}>Recomendaciones</Text>
          </View>
          <View style={[styles.playlistItem, {backgroundColor: itemBackgroundColor}]}>
            <View style={[styles.playlistImagePlaceholder, {backgroundColor: textColor}]} />
            <Text style={[styles.playlistText, {color: textColor}]}>Clasificación</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, {color: textColor}]}>Recomendado para Ti</Text>
        <View style={styles.recommendedContainer}>
          <View style={[styles.recommendedItem]}>
            <View style={[styles.recommendedImagePlaceholder, {backgroundColor: textColor}]} />
            <Text style={[styles.recommendedText, {color: textColor}]}>Reproducido Recientemente</Text>
          </View>
          <View style={[styles.recommendedItem]}>
            <View style={[styles.recommendedImagePlaceholder, {backgroundColor: textColor}]} />
            <Text style={[styles.recommendedText, {color: textColor}]}>Lunas Bárbaras</Text>
          </View>
          <View style={[styles.recommendedItem]}>
            <View style={[styles.recommendedImagePlaceholder, {backgroundColor: textColor}]} />
            <Text style={[styles.recommendedText, {color: textColor}]}>Patrulla Mitil</Text>
          </View>
          <View style={[styles.recommendedItem]}>
            <View style={[styles.recommendedImagePlaceholder, {backgroundColor: textColor}]} />
            <Text style={[styles.recommendedText, {color: textColor}]}>Gour Siley</Text>
          </View>
          <View style={[styles.recommendedItem]}>
            <View style={[styles.recommendedImagePlaceholder, {backgroundColor: textColor}]} />
            <Text style={[styles.recommendedText, {color: textColor}]}>Bery:</Text>
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 0,
    textAlign: 'center',
  },
  welcomeTextName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
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
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  playlistImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
    
  },
  playlistText: {
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
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  recommendedImagePlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginBottom: 5,
  },
  recommendedText: {
    fontSize: 14,
    textAlign: 'center',
  },
});