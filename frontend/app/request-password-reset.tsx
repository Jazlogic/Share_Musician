import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { api, MessageResponse } from '../services/api';

export default function RequestPasswordResetScreen() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleRequestPasswordReset = async () => {
    if (!email) {
      Alert.alert('Error', 'Por favor, introduce tu correo electrónico.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post<MessageResponse>('/auth/request-password-reset', { email });
      if (response.status === 200) {
        Alert.alert('Correo enviado', response.data.message || 'Se ha enviado un correo electrónico con instrucciones para restablecer tu contraseña.');
        router.push({ pathname: '/set-password', params: { email } }); // Redirigir a la pantalla para establecer la contraseña con el email
      } else {
        Alert.alert('Error', response.data.message || 'Algo salió mal al solicitar el restablecimiento de contraseña.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo conectar al servidor.');
    } finally {
      setSubmitting(false);
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
        <Text style={styles.welcomeText}>Restablecer Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          placeholderTextColor="#A9A9A9"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TouchableOpacity
          style={styles.requestButton}
          onPress={handleRequestPasswordReset}
          disabled={submitting}
        >
          <Text style={styles.requestButtonText}>
            {submitting ? 'ENVIANDO...' : 'SOLICITAR RESTABLECIMIENTO'}
          </Text>
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
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 15,
  },
  requestButton: {
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
  requestButtonText: {
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