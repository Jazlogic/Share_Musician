import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { api} from '../services/api';

interface User {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  role: 'client' | 'leader' | 'musician' | 'admin';
  active_role: 'leader' | 'musician';
  status: 'active' | 'pending' | 'rejected';
  church_id: string | null;
  created_at: Date;
  updated_at: Date;
  email_verified?: boolean;
  verification_token?: string | null;
  profilekey: string | null;
}

interface MessageResponse {
  message: string;
  profilekey?: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  fetchUser: (userId: string) => Promise<void>;
  updateUserProfile: (updatedUser: Partial<User>) => Promise<void>;
  getProfileImageUrl: (profileKey: string) => Promise<string | null>;
  uploadProfileImage: (imageUri: string) => Promise<boolean>;
  getProfileImageHistory: (userId: string) => Promise<{ profileKey: string; url: string; uploadedAt: string; }[] | null>;
  selectProfileImageFromHistory: (userId: string, profileKey: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        throw new Error('No authentication token found.');
      }

      console.log('Fetching user data for ID:', userId);
      const response = await api.get<{ user: User}>(`/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      console.log('User data fetched successfully:', response.data);
      setUser(response.data.user || response.data);
    } catch (err: any) {
      console.error('Error fetching user data:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.status,
        userId: userId
      });
      
      // Si el usuario no existe (404), limpiar el token y redirigir al login
      if (err.message?.includes('404') || err.message?.includes('not found') || err.message?.includes('Usuario no encontrado')) {
        console.log('User not found, clearing authentication...');
        await AsyncStorage.removeItem('userToken');
        setUser(null);
        setError('Usuario no encontrado. Por favor, inicia sesión nuevamente.');
      } else if (err.message?.includes('403') || err.message?.includes('No autorizado')) {
        console.log('Token invalid or expired, clearing authentication...');
        await AsyncStorage.removeItem('userToken');
        setUser(null);
        setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
      } else {
        setError(err.message || 'Error al cargar datos del usuario.');
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserProfile = async (updatedUser: Partial<User>) => {
    setLoading(true);
    setError(null);
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        throw new Error('No authentication token found.');
      }
      console.log('Updating user:', updatedUser);
      if (!user || !user.user_id) {
        throw new Error('User not logged in.');
      }

      const response = await api.put<{ user: User }>(`/users/${user.user_id}`, updatedUser, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      setUser(response.data.user);
    } catch (err: any) {
      setError(err.message || 'Failed to update user profile.');
    } finally {
      setLoading(false);
    }
  };

  const getProfileImageUrl = async (profileKey: string): Promise<string | null> => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.error('No user token found');
        return null;
      }
      console.log('Intentando obtener URL de descarga para profileKey:', profileKey);
      const encodedProfileKey = encodeURIComponent(profileKey);
      console.log('Encoded profileKey:', encodedProfileKey);
       const response = await api.get<{ downloadURL: string}>(`/users/profile-image/${encodedProfileKey}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Respuesta de la solicitud:', response.data.downloadURL);
      const url = `/users/profile-image-proxy/${encodedProfileKey}`;
      return response.data.downloadURL;
    } catch (error) {
      console.error('Error fetching profile image URL:', error);
      return null;
    }
  };

  const uploadProfileImage = useCallback(async (imageUri: string): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token || !user?.user_id) {
        console.error('No user token or userId found');
        return false;
      }

      if (Platform.OS !== 'web') {
        const fileInfo = await FileSystem.getInfoAsync(imageUri);
        console.log('File info:', fileInfo);
        if (!fileInfo.exists) {
          console.error('File does not exist at URI:', imageUri);
          return false;
        }
      }

      const formData = new FormData();

      if (Platform.OS === 'web') {
        console.log('Image URI for web:', imageUri);
        const response = await fetch(imageUri);
        const blob = await response.blob();
        console.log('Blob size for web:', blob.size);
        formData.append('profileImage', blob, `profile-${user.user_id}.jpg`);
      } else {
        formData.append('profileImage', {
          uri: imageUri,
          name: `profile-${user.user_id}.jpg`,
          type: 'image/jpeg',
        } as any);
      }
      const response = await api.upload<MessageResponse>(
        `/users/${user.user_id}/profile-image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log('Respuesta de la subida de imagen:', response);

      if (response.data.profilekey) {
        // Actualizar el usuario en el contexto con la nueva profileKey
        setUser(prevUser => prevUser ? { ...prevUser, profilekey: response.data.profilekey ?? null } : null);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      return false;
    }
  }, [user?.user_id]);

  const getProfileImageHistory = useCallback(async (userId: string) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.error('No user token found');
        return null;
      }

      const response = await api.get<{ profileKey: string; url: string; uploadedAt: string; }[]>(`/users/${userId}/profile-image-history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching profile image history:', error);
      return null;
    }
  }, []);

  const selectProfileImageFromHistory = useCallback(async (userId: string, profileKey: string) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.error('No user token found');
        Alert.alert('Error', 'No se pudo autenticar para seleccionar la imagen de perfil.');
        return false;
      }

      const response = await api.post(`/users/${userId}/profile-image-history/select`, { profileKey }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        // Actualizar el perfil del usuario en el contexto si la selección fue exitosa
        if (user) {
          setUser(prevUser => prevUser ? { ...prevUser, profilekey: profileKey } : null);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error selecting profile image from history:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen de perfil del historial.');
      return false;
    }
  }, [user]);

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userId');
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userName');
      setUser(null);
      setError(null);
    } catch (err: any) {
      console.error('Error during logout:', err);
    }
  };

    const refreshUser = useCallback(async () => {
    setLoading(true); // Set loading to true at the start of refresh
    const storedUserId = await AsyncStorage.getItem('userId');
    if (storedUserId) {
      await fetchUser(storedUserId);
    } else {
      setUser(null);
      setLoading(false); // Set loading to false if no user is found
    }
  }, [fetchUser]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const contextValue = { user, loading, error, fetchUser, updateUserProfile, getProfileImageUrl, uploadProfileImage, getProfileImageHistory, selectProfileImageFromHistory, logout, refreshUser };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};