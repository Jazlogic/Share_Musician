import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Link, useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { api, MessageResponse } from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SetPasswordScreen() {
  const { email: emailParam, code: codeParam } = useLocalSearchParams();
  const [email, setEmail] = useState((emailParam as string) || '');
  const [code, setCode] = useState((codeParam as string) || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false); // Nuevo estado para controlar la verificación del código
  const router = useRouter();
  const { refreshUser } = useUser();

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam as string);
    }
    if (codeParam) {
      setCode(codeParam as string);
    }
    // Si ambos parámetros están presentes, intentar verificar el código automáticamente
    if (emailParam && codeParam) {
      handleVerifyCode(emailParam as string, codeParam as string);
    }
  }, [emailParam, codeParam]);

  const handleVerifyCode = async (emailToVerify: string, codeToVerify: string) => {
    try {
      const response = await api.post<MessageResponse>('/auth/verify-reset-code', { email: emailToVerify, code: codeToVerify });
      if (response.status === 200) {
        Alert.alert('Éxito', response.data.message);
        setIsCodeVerified(true);
      } else {
        Alert.alert('Error', response.data.message || 'Código de verificación inválido.');
        setIsCodeVerified(false);
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'No se pudo verificar el código. Inténtalo de nuevo.');
      setIsCodeVerified(false);
    }
  };

  const handleSetPassword = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    try {
      const response = await api.post<MessageResponse>('/auth/reset-password', { token: code, newPassword: password });
      if (response.status === 200) {
        Alert.alert('Contraseña establecida', response.data.message);
        if (response.data.user && response.data.user.name && response.data.user.user_id && response.data.token) {
          await AsyncStorage.setItem('userName', response.data.user.name);
          await AsyncStorage.setItem('userId', response.data.user.user_id);
          await AsyncStorage.setItem('userToken', response.data.token);
          await refreshUser();
          router.replace('/home');
        } else {
          router.replace('/');
        }
      } else {
        Alert.alert('Error', response.data.message || 'Algo salió mal');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo conectar al servidor.');
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
        <Text style={styles.welcomeText}>Establece tu contraseña</Text>
        {!emailParam && (
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            placeholderTextColor="#A9A9A9"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            editable={!emailParam} // Make email editable only if not passed as param
          />
        )}
        {!codeParam && (
          <TextInput
            style={styles.input}
            placeholder="Código de verificación"
            placeholderTextColor="#A9A9A9"
            value={code}
            onChangeText={setCode}
            editable={!codeParam} // Make code editable only if not passed as param
          />
        )}

        {!isCodeVerified && email && !codeParam && (
          <TouchableOpacity style={styles.setPasswordButton} onPress={() => handleVerifyCode(email, code)}>
            <Text style={styles.setPasswordButtonText}>VERIFICAR CÓDIGO</Text>
          </TouchableOpacity>
        )}

        {isCodeVerified && (
          <>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Nueva contraseña"
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
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirmar nueva contraseña"
                placeholderTextColor="#A9A9A9"
                secureTextEntry={!showPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
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
            <TouchableOpacity style={styles.setPasswordButton} onPress={handleSetPassword}>
              <Text style={styles.setPasswordButtonText}>ESTABLECER CONTRASEÑA</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={styles.linksContainer}>
          <Link href="/" asChild>
            <TouchableOpacity>
              <Text style={styles.linkText}>Volver a Iniciar sesión</Text>
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
  },
  welcomeText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 40,
  },
  input: {
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 15,
  },
  setPasswordButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#007BFF',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    boxShadow: '0px 5px 6.27px rgba(0, 0, 0, 0.34)',
    elevation: 10,
  },
  setPasswordButtonText: {
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
});