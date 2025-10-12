import { LinearGradient } from 'expo-linear-gradient';
import { api, MessageResponse } from '../services/api';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Link, useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';

export default function VerifyEmailScreen() {
  const { email: emailParam } = useLocalSearchParams();
  const [email, setEmail] = useState((emailParam as string) || '');
  const [verificationCode, setVerificationCode] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam as string);
    }
  }, [emailParam]);

  const handleVerifyEmail = async () => {
    try {
      const response = await api.post<MessageResponse>('/auth/verify-email', { email, code: verificationCode });
      if (response.status === 200) {
        Alert.alert('Verificación exitosa', response.data.message);
        console.log('1. Código de verificación:', verificationCode);
        router.replace({ pathname: '/set-password', params: { email, code: verificationCode, flow: 'registration' } });
      } else {
        console.log('1. El error de verificación es:', response.data.message || 'Algo salió mal');
        Alert.alert('Error de verificación', response.data.message || 'Algo salió mal');
      }
    } catch (error: any) {
      console.error('1. Error al verificar el correo electrónico:', error.message || 'No se pudo conectar al servidor.');
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
        <Text style={styles.welcomeText}>Verifica tu correo electrónico</Text>
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          placeholderTextColor="#A9A9A9"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          editable={!emailParam} // Make email editable only if not passed as param
        />
        <TextInput
          style={styles.input}
          placeholder="Código de verificación"
          placeholderTextColor="#A9A9A9"
          value={verificationCode}
          onChangeText={setVerificationCode}
        />
        <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyEmail}>
          <Text style={styles.verifyButtonText}>VERIFICAR</Text>
        </TouchableOpacity>
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
    width: '100%',
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 15,
  },
  verifyButton: {
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
  verifyButtonText: {
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