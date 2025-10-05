import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '../theme/colors';
import { useUser } from '../context/UserContext';
import * as ImagePicker from 'expo-image-picker';

interface ProfileImageGalleryProps {
  onClose: () => void;
  onSelectImage: (imageUrl: string) => void;
}

const ProfileImageGallery: React.FC<ProfileImageGalleryProps> = ({
  onClose,
  onSelectImage,
}) => {
  const { user, getProfileImageHistory, uploadProfileImage, selectProfileImageFromHistory } = useUser();
  const [images, setImages] = useState<Array<{ url: string; title: string; profileKey: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [isPublic, setIsPublic] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      if (user?.user_id) {
        const imageHistory = await getProfileImageHistory(user.user_id);
        if (imageHistory) {
          setImages(imageHistory.map(img => ({ ...img, title: `Image ${new Date(img.uploadedAt).toLocaleDateString()}` })));
        }
      }
    } catch (error) {
      console.error('Error loading images:', error);
      Alert.alert('Error', 'No se pudieron cargar las imágenes del historial');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadNew = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets[0].uri) {
      setUploading(true);
      try {
        const success = await uploadProfileImage(result.assets[0].uri);
        if (success) {
          await loadImages(); // Recargar las imágenes después de subir una nueva
        } else {
          Alert.alert('Error', 'No se pudo subir la imagen');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        Alert.alert('Error', 'Ocurrió un error al subir la imagen');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSelectImage = async (profileKey: string, imageUrl: string) => {
    if (user?.user_id) {
      const success = await selectProfileImageFromHistory(user.user_id, profileKey);
      if (success) {
        onSelectImage(imageUrl);
        Alert.alert('Éxito', 'Imagen de perfil actualizada correctamente.');
      } else {
        Alert.alert('Error', 'No se pudo establecer la imagen como perfil actual.');
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={AppColors.primary.accent} />
        <Text style={styles.loadingText}>Cargando imágenes...</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[AppColors.background.gradientStartDark, AppColors.background.gradientEndDark]}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Profile Photos</Text>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handleUploadNew}
          disabled={uploading}
        >
          <Ionicons name="add" size={24} color={AppColors.text.white} />
          <Text style={styles.uploadButtonText}>Upload New</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color={AppColors.text.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.imageGrid}>
          {images.map((image, index) => (
            <TouchableOpacity
              key={index}
              style={styles.imageContainer}
              onPress={() => handleSelectImage(image.profileKey, image.url)}
            >
              <Image source={{ uri: image.url }} style={styles.image} />
              <Text style={styles.imageTitle}>{image.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.publicGalleryContainer}>
          <Text style={styles.publicGalleryText}>Public Gallery</Text>
          <Switch
            value={isPublic}
            onValueChange={setIsPublic}
            trackColor={{ false: '#767577', true: AppColors.primary.accent }}
            thumbColor={AppColors.text.white}
          />
        </View>
      </View>

      {uploading && (
        <View style={styles.uploadingOverlay}>
          <ActivityIndicator size="large" color={AppColors.primary.accent} />
          <Text style={styles.uploadingText}>Subiendo imagen...</Text>
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.text.white,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.primary.accent,
    padding: 8,
    borderRadius: 20,
    position: 'absolute',
    right: 40,
  },
  uploadButtonText: {
    color: AppColors.text.white,
    marginLeft: 5,
    fontSize: 14,
  },
  closeButton: {
    position: 'absolute',
    right: 0,
  },
  scrollView: {
    flex: 1,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  imageContainer: {
    width: '30%',
    marginBottom: 20,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: AppColors.primary.accent,
  },
  imageTitle: {
    color: AppColors.text.white,
    marginTop: 5,
    fontSize: 12,
    textAlign: 'center',
  },
  footer: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  publicGalleryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
  },
  publicGalleryText: {
    color: AppColors.text.white,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.background.gradientStartDark,
  },
  loadingText: {
    color: AppColors.text.white,
    marginTop: 10,
    fontSize: 16,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    color: AppColors.text.white,
    marginTop: 10,
    fontSize: 16,
  },
});

export default ProfileImageGallery;