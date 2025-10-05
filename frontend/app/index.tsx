import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, MessageResponse } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const storedUserName = await AsyncStorage.getItem('userName');
        if (storedUserName) {
          router.replace('/home');
        }
      } catch (error) {
        console.error('Error checking login status:', error);
      }
    };
    checkLoginStatus();
  }, []);

  const handleLogin = async () => {
    try {
      console.log('Sending login request with:', { email, password });
      const response = await api.post<MessageResponse>('/auth/login', { email, password });
      if (response.status === 200) {
        if (response.data.user && response.data.user.name && response.data.user.user_id && response.data.token) {
          await AsyncStorage.setItem('userName', response.data.user.name);
          console.log('Stored userName:', response.data.user.name);
          await AsyncStorage.setItem('userId', response.data.user.user_id);
          console.log('Stored userId:', response.data.user.user_id);
          await AsyncStorage.setItem('userToken', response.data.token);
          console.log('Stored userToken:', response.data.token);
        }
        router.replace('/home');
      } else {
        Alert.alert('Error', response.data.message || 'Login failed');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An error occurred');
    }
  };

  return (
    <LinearGradient
      colors={['#1A2B4C', '#3366CC']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        <Text style={styles.welcomeText}>¡Bienvenido de nuevo!</Text>
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          placeholderTextColor="#A9A9A9"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <View style={styles.passwordInputContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Contraseña"
            placeholderTextColor="#A9A9A9"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={styles.togglePasswordButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={24}
              color="#A9A9A9"
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>INICIAR SESIÓN</Text>
        </TouchableOpacity>
        <View style={styles.linksContainer}>
          <Link href="/register" asChild>
            <TouchableOpacity>
              <Text style={styles.linkText}>Crear cuenta</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    
  },
  content: {
    alignItems: 'center',
    width: '80%',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 40,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 15,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 20,
    fontSize: 18,
    color: '#FFFFFF',
  },
  togglePasswordButton: {
    padding: 10,
  },
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#007BFF',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    boxShadow: '0px 2px 6.27px rgba(0, 0, 0, 0.34)',
    elevation: 10,
  },
  loginButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  linkText: {
    color: '#ADD8E6',
    fontSize: 16,
  },
});