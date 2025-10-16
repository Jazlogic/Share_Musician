import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, FlatList, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useThemeColor } from '../../hooks/use-theme-color';
import { AppColors } from '../../theme/colors';

interface LocationData {
  address: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  district?: string;
}

interface LocationSelectorProps {
  label: string;
  location: LocationData;
  onLocationChange: (location: LocationData) => void;
  required?: boolean;
  error?: string;
}

const popularVenues = [
  { name: 'Teatro Nacional', address: 'Av. Máximo Gómez, Santo Domingo', coordinates: { lat: 18.48605, lng: -69.93121 } },
  { name: 'Auditorio Nacional', address: 'Av. Máximo Gómez, Santo Domingo', coordinates: { lat: 18.48605, lng: -69.93121 } },
  { name: 'Palacio de Bellas Artes', address: 'Av. Independencia, Santo Domingo', coordinates: { lat: 18.47386, lng: -69.89924 } },
  { name: 'Centro de Convenciones', address: 'Av. George Washington, Santo Domingo', coordinates: { lat: 18.45791, lng: -69.92531 } },
  { name: 'Parque Colón', address: 'Calle El Conde, Santo Domingo', coordinates: { lat: 18.47386, lng: -69.89924 } },
  { name: 'Plaza de la Cultura', address: 'Av. Pedro Henríquez Ureña, Santo Domingo', coordinates: { lat: 18.47386, lng: -69.89924 } },
  { name: 'Iglesia de la Altagracia', address: 'Calle Arzobispo Nouel, Santo Domingo', coordinates: { lat: 18.47386, lng: -69.89924 } },
  { name: 'Hotel Jaragua', address: 'Av. George Washington, Santo Domingo', coordinates: { lat: 18.45791, lng: -69.92531 } },
  { name: 'Centro Olímpico', address: 'Av. Monumental, Santo Domingo', coordinates: { lat: 18.48605, lng: -69.93121 } },
  { name: 'Universidad Autónoma', address: 'Av. Máximo Gómez, Santo Domingo', coordinates: { lat: 18.48605, lng: -69.93121 } },
];

const popularAreas = [
  'Santo Domingo Centro',
  'Santo Domingo Este',
  'Santo Domingo Norte',
  'Santo Domingo Oeste',
  'Santiago de los Caballeros',
  'La Romana',
  'San Pedro de Macorís',
  'Higüey',
  'Puerto Plata',
  'Barahona',
];

export default function LocationSelector({
  label,
  location,
  onLocationChange,
  required = false,
  error
}: LocationSelectorProps) {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredVenues, setFilteredVenues] = useState(popularVenues);
  const [filteredAreas, setFilteredAreas] = useState<string[]>([]);

  const textColor = useThemeColor({ light: AppColors.text.black, dark: AppColors.text.white }, 'text');
  const tintColor = useThemeColor({ light: AppColors.primary.blue, dark: AppColors.primary.accent }, 'tint');
  const backgroundColor = useThemeColor({ light: AppColors.background.light, dark: AppColors.background.dark }, 'background');
  const cardBackground = useThemeColor({ light: AppColors.cardsRequest.primaryBackgroundLight, dark: AppColors.cardsRequest.primaryBackgroundDark }, 'background');
  const errorColor = useThemeColor({ light: AppColors.secondary.red, dark: AppColors.secondary.red }, 'text');
  const placeholderColor = useThemeColor({ light: AppColors.text.secondary, dark: AppColors.text.secondary }, 'text');

  useEffect(() => {
    if (searchQuery.length > 0) {
      const venues = popularVenues.filter(venue =>
        venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredVenues(venues);

      const areas = popularAreas.filter(area =>
        area.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredAreas(areas);
    } else {
      setFilteredVenues(popularVenues);
      setFilteredAreas([]);
    }
  }, [searchQuery]);

  const handleLocationSelect = (venue: any) => {
    const locationData: LocationData = {
      address: `${venue.name} - ${venue.address}`,
      latitude: venue.coordinates.lat,
      longitude: venue.coordinates.lng,
      city: 'Santo Domingo',
      district: venue.name
    };
    onLocationChange(locationData);
    setShowModal(false);
  };

  const handleAreaSelect = (area: string) => {
    const locationData: LocationData = {
      address: area,
      city: area.includes('Santo Domingo') ? 'Santo Domingo' : area,
      district: area
    };
    onLocationChange(locationData);
    setShowModal(false);
  };

  const handleManualLocation = () => {
    if (searchQuery.trim().length > 0) {
      const locationData: LocationData = {
        address: searchQuery.trim(),
        city: 'Santo Domingo',
        district: searchQuery.trim()
      };
      onLocationChange(locationData);
      setShowModal(false);
    }
  };

  const getCurrentLocation = () => {
    Alert.alert(
      'Ubicación Actual',
      'Esta funcionalidad requerirá permisos de ubicación. Por ahora, selecciona una ubicación de la lista.',
      [{ text: 'OK' }]
    );
  };

  const renderLocationItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.locationItem, { backgroundColor: cardBackground }]}
      onPress={() => handleLocationSelect(item)}
    >
      <View style={styles.locationIcon}>
        <FontAwesome name="map-marker" size={20} color={tintColor} />
      </View>
      <View style={styles.locationInfo}>
        <Text style={[styles.locationName, { color: textColor }]}>{item.name}</Text>
        <Text style={[styles.locationAddress, { color: textColor, opacity: 0.7 }]}>{item.address}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderAreaItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[styles.locationItem, { backgroundColor: cardBackground }]}
      onPress={() => handleAreaSelect(item)}
    >
      <View style={styles.locationIcon}>
        <FontAwesome name="building" size={20} color={tintColor} />
      </View>
      <View style={styles.locationInfo}>
        <Text style={[styles.locationName, { color: textColor }]}>{item}</Text>
        <Text style={[styles.locationAddress, { color: textColor, opacity: 0.7 }]}>Área general</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: textColor }]}>
        {label}
        {required && <Text style={{ color: errorColor }}> *</Text>}
      </Text>
      
      <TouchableOpacity
        style={[
          styles.selectorButton,
          {
            backgroundColor: cardBackground,
            borderColor: error ? errorColor : location.address ? tintColor : '#E0E0E0',
            borderWidth: 2,
          }
        ]}
        onPress={() => setShowModal(true)}
      >
        <View style={styles.selectorContent}>
          <FontAwesome name="map-marker" size={20} color={tintColor} />
          <Text style={[
            styles.selectorText,
            { color: location.address ? textColor : placeholderColor }
          ]}>
            {location.address || 'Seleccionar ubicación'}
          </Text>
          <FontAwesome name="chevron-down" size={16} color={tintColor} />
        </View>
      </TouchableOpacity>

      {error && (
        <Text style={[styles.errorText, { color: errorColor }]}>{error}</Text>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textColor }]}>
                Seleccionar Ubicación
              </Text>
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: tintColor }]}
                onPress={() => setShowModal(false)}
              >
                <FontAwesome name="times" size={18} color="white" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <FontAwesome name="search" size={16} color={tintColor} style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, { color: textColor, borderColor: tintColor }]}
                placeholder="Buscar ubicación..."
                placeholderTextColor={placeholderColor}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <View style={styles.quickActions}>
              <TouchableOpacity
                style={[styles.quickActionButton, { backgroundColor: tintColor }]}
                onPress={getCurrentLocation}
              >
                <FontAwesome name="location-arrow" size={16} color="white" />
                <Text style={styles.quickActionText}>Mi Ubicación</Text>
              </TouchableOpacity>
              
              {searchQuery.trim().length > 0 && (
                <TouchableOpacity
                  style={[styles.quickActionButton, { backgroundColor: '#4CAF50' }]}
                  onPress={handleManualLocation}
                >
                  <FontAwesome name="plus" size={16} color="white" />
                  <Text style={styles.quickActionText}>Usar Texto</Text>
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={filteredVenues}
              renderItem={renderLocationItem}
              keyExtractor={(item) => item.name}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                filteredAreas.length > 0 ? (
                  <View>
                    <Text style={[styles.sectionTitle, { color: textColor }]}>Áreas Populares</Text>
                    {filteredAreas.map((area, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[styles.locationItem, { backgroundColor: cardBackground }]}
                        onPress={() => handleAreaSelect(area)}
                      >
                        <View style={styles.locationIcon}>
                          <FontAwesome name="building" size={20} color={tintColor} />
                        </View>
                        <View style={styles.locationInfo}>
                          <Text style={[styles.locationName, { color: textColor }]}>{area}</Text>
                          <Text style={[styles.locationAddress, { color: textColor, opacity: 0.7 }]}>Área general</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                    <Text style={[styles.sectionTitle, { color: textColor, marginTop: 20 }]}>Lugares Populares</Text>
                  </View>
                ) : (
                  <Text style={[styles.sectionTitle, { color: textColor }]}>Lugares Populares</Text>
                )
              }
              contentContainerStyle={styles.listContainer}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  selectorButton: {
    borderRadius: 12,
    padding: 16,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectorText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  errorText: {
    fontSize: 14,
    marginTop: 5,
    marginLeft: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
  },
  quickActions: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flex: 1,
    justifyContent: 'center',
  },
  quickActionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  listContainer: {
    paddingBottom: 20,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
  },
});
