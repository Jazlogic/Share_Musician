import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@react-navigation/native';
import BottomNavigationBar from '@/components/BottomNavigationBar';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '../theme/colors';
import { useUser } from './context/UserContext';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import DefaultAvatar from '@/assets/images/default-avatar.png'


interface UserProfile {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  role: 'leader' | 'musician' | 'admin';
  active_role: 'leader' | 'musician';
  status: 'active' | 'pending' | 'rejected';
  church_id: string | null;
  created_at: Date;
  updated_at: Date;
  email_verified?: boolean;
  verification_token?: string | null;
  profileKey: string | null;
}

const PerfilScreen = () => {
  const router = useRouter();
  const { user, loading, error, getProfileImageUrl, logout } = useUser();
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [isPersonalDetailsExpanded, setIsPersonalDetailsExpanded] = useState<boolean>(false);

  useEffect(() => {
    const fetchProfileImage = async () => {
      if (user?.profileKey) {
        const url = await getProfileImageUrl(user.profileKey);
        setProfileImageUrl(url);
      }
    };
    fetchProfileImage();
  }, [user?.profileKey, getProfileImageUrl]);

  const handleLogout = async () => {
    await logout();
    router.replace('/'); // Redirige al inicio de sesión
  };

  const renderProfileContent = (currentUser: UserProfile) => (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.profileHeader}>
        <Image
          source={profileImageUrl ? { uri: profileImageUrl } : DefaultAvatar}
          style={styles.profileImage}
        />
        <Text style={styles.userName}>{currentUser.name}</Text>
      </View>

      <TouchableOpacity
        style={styles.collapsibleHeader}
        onPress={() => setIsPersonalDetailsExpanded(!isPersonalDetailsExpanded)}
      >
        <Text style={styles.detailTitle}>Información Personal</Text>
        <Ionicons
          name={isPersonalDetailsExpanded ? "chevron-up-outline" : "chevron-down-outline"}
          size={24}
          color={AppColors.text.white}
        />
      </TouchableOpacity>

      {isPersonalDetailsExpanded && (
        <View style={styles.profileDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Teléfono:</Text>
            <Text style={styles.detailValue}>{currentUser.phone}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Rol:</Text>
            <Text style={styles.detailValue}>{currentUser.role}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Correo:</Text>
            <Text style={styles.detailValue}>{currentUser.active_role}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Rol Activo:</Text>
            <Text style={styles.detailValue}>{currentUser.email}</Text>
          </View>
          {currentUser.church_id && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>ID de Iglesia:</Text>
              <Text style={styles.detailValue}>{currentUser.church_id}</Text>
            </View>
          )}
        </View>
      )}

      {/* Botones de acción universales */}
      <View style={styles.universalActions}>
        <TouchableOpacity style={styles.universalActionButton}>
          <Ionicons name="pencil-outline" size={24} color={AppColors.text.white} />
          <Text style={styles.universalActionButtonText}>Editar Perfil</Text>
          <Ionicons name="chevron-forward-outline" size={24} color={AppColors.text.white} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.universalActionButton}>
          <Ionicons name="lock-closed-outline" size={24} color={AppColors.text.white} />
          <Text style={styles.universalActionButtonText}>Cambiar Contraseña</Text>
          <Ionicons name="chevron-forward-outline" size={24} color={AppColors.text.white} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.universalActionButton}>
          <Ionicons name="shield-checkmark-outline" size={24} color={AppColors.text.white} />
          <Text style={styles.universalActionButtonText}>Configuración de Privacidad</Text>
          <Ionicons name="chevron-forward-outline" size={24} color={AppColors.text.white} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.logoutButton, { backgroundColor: AppColors.primary.accent }]} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  if (loading) {
    return (
      <LinearGradient
        colors={[AppColors.background.gradientStartDark, AppColors.background.gradientEndDark]}
        style={styles.fullScreenContainer}
      >
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color={AppColors.primary.accent} />
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient
        colors={[AppColors.background.gradientStartDark, AppColors.background.gradientEndDark]}
        style={styles.fullScreenContainer}
      >
        <View style={styles.centeredContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity style={[styles.logoutButton, { backgroundColor: AppColors.primary.accent }]} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  if (!user) {
    return (
      <LinearGradient
        colors={[AppColors.background.gradientStartDark, AppColors.background.gradientEndDark]}
        style={styles.fullScreenContainer}
      >
        <View style={styles.centeredContainer}>
          <Text style={styles.noUserText}>No se encontró información del usuario.</Text>
          <TouchableOpacity style={[styles.logoutButton, { backgroundColor: AppColors.primary.accent }]} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[AppColors.background.gradientStartDark, AppColors.background.gradientEndDark]}
      style={styles.fullScreenContainer}
    >
      {renderProfileContent(user)}
      <BottomNavigationBar />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 20,
    paddingBottom: 150, // Añadido para dejar espacio a la BottomNavigationBar
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Fondo semi-transparente para la cabecera
    borderRadius: 15,
    padding: 20,
    width: '90%',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: AppColors.primary.accent,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: AppColors.text.white,
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 18,
    color: AppColors.text.secondary,
  },
  profileDetails: {
    width: '90%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Fondo semi-transparente para los detalles
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: AppColors.text.white,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.primary.accent,
    paddingBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: AppColors.text.white,
  },
  detailValue: {
    fontWeight: 'bold',
    fontSize: 10,
    color: AppColors.text.secondary,
  },
  logoutButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  logoutButtonText: {
    color: AppColors.text.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  noUserText: {
    fontSize: 20,
    color: AppColors.text.white,
    textAlign: 'center',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 18,
    color: AppColors.text.white,
    marginTop: 10,
  },
  errorText: {
    fontSize: 18,
    color: AppColors.secondary.red,
    textAlign: 'center',
    marginBottom: 20,
  },
  universalActions: {
    width: '90%',
    marginTop: 20,
    // borderTopWidth: 1,
    // borderTopColor: '#E0E0E0',
    paddingTop: 10,
  },
  universalActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 10,
    // borderBottomWidth: 1,
    // borderBottomColor: '#E0E0E0',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    marginBottom: 10,
  },
  universalActionButtonText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: AppColors.text.white,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 10,
  },
});

export default PerfilScreen;