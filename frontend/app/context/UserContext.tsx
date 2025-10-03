import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../services/api';

interface User {
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

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  fetchUser: (userId: string) => Promise<void>;
  updateUserProfile: (updatedUser: Partial<User>) => Promise<void>;
  getProfileImageUrl: (profileKey: string) => Promise<string | null>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        throw new Error('No authentication token found.');
      }

      const response = await api.get<{ user: User}>(`/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      console.log('Fetched user:', response);
      setUser(response.data.user || response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user data.');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

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
      console.log('Updated user:', response.data.user);
      setUser(response.data.user);
    } catch (err: any) {
      setError(err.message || 'Failed to update user profile.');
    } finally {
      setLoading(false);
    }
  };

  const getProfileImageUrl = async (profileKey: string): Promise<string | null> => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        throw new Error('No authentication token found.');
      }
      const response = await api.get<{ downloadURL: string }>(`/storage/download-url?key=${profileKey}`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      return response.data.downloadURL;
    } catch (err: any) {
      console.error('Error fetching profile image URL:', err);
      return null;
    }
  };

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

  useEffect(() => {
    const loadUser = async () => {
      const storedUserId = await AsyncStorage.getItem('userId');
      if (storedUserId) {
        fetchUser(storedUserId);
      } else {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, error, fetchUser, updateUserProfile, getProfileImageUrl, logout }}>
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