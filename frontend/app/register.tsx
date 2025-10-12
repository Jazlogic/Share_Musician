import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { api, MessageResponse } from '../services/api';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();

    if (!trimmedName || !trimmedEmail || !trimmedPhone) {
      Alert.alert('Campos requeridos', 'Nombre, correo y teléfono son obligatorios.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert('Correo inválido', 'Ingresa un correo electrónico válido.');
      return;
    }

    if (trimmedPhone.replace(/\D/g, '').length < 7) {
      Alert.alert('Teléfono inválido', 'Ingresa un teléfono válido.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post<MessageResponse>('/auth/register', { name: trimmedName, email: trimmedEmail, phone: trimmedPhone });
      if (response.status === 201) {
        Alert.alert('Registro exitoso', response.data.message);
        router.replace({ pathname: '/verify-email', params: { email: trimmedEmail } });
      } else {
        Alert.alert('Error de registro', response.data.message || 'Algo salió mal');
      }
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.detail && error.response.data.detail.includes('already exists')) {
        Alert.alert('Error de registro', 'El correo electrónico ya está registrado. Por favor, inicia sesión o usa otro correo.');
      } else {
        Alert.alert('Error', error.message || 'No se pudo conectar al servidor.');
      }
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
        <Text style={styles.welcomeText}>Crear cuenta</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre"
          placeholderTextColor="#A9A9A9"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          placeholderTextColor="#A9A9A9"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Teléfono"
          placeholderTextColor="#A9A9A9"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
        <TouchableOpacity style={[styles.registerButton, submitting && { opacity: 0.7 }]} onPress={handleRegister} disabled={submitting}>
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.registerButtonText}>{'REGISTRARSE'}</Text>
          )}
        </TouchableOpacity>
        <View style={styles.linksContainer}>
          <Link href="/" asChild>
            <TouchableOpacity>
              <Text style={styles.linkText}>¿Ya tienes una cuenta? Iniciar sesión</Text>
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
  registerButton: {
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
  registerButtonText: {
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