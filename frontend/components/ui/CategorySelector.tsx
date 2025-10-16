import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useThemeColor } from '../../hooks/use-theme-color';
import { AppColors } from '../../theme/colors';

interface Category {
  id: string;
  name: string;
  price_factor?: number;
  icon?: string;
  description?: string;
  estimated_price?: number;
}

interface CategorySelectorProps {
  label: string;
  selectedCategory: Category | null;
  onCategorySelect: (category: Category) => void;
  categories: Category[];
  required?: boolean;
  error?: string;
  showPriceEstimate?: boolean;
  durationHours?: number;
}

const categoryIcons: { [key: string]: string } = {
  'Concierto': 'music',
  'Boda': 'heart',
  'Fiesta Privada': 'birthday-cake',
  'Evento Corporativo': 'briefcase',
  'Ceremonia Religiosa': 'church',
  'Festival': 'calendar',
  'Retiro Espiritual': 'leaf',
  'Celebración': 'gift',
  'Graduación': 'graduation-cap',
  'Aniversario': 'star',
};

export default function CategorySelector({
  label,
  selectedCategory,
  onCategorySelect,
  categories,
  required = false,
  error,
  showPriceEstimate = true,
  durationHours = 1
}: CategorySelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const textColor = useThemeColor({ light: AppColors.text.black, dark: AppColors.text.white }, 'text');
  const tintColor = useThemeColor({ light: AppColors.primary.blue, dark: AppColors.primary.accent }, 'tint');
  const backgroundColor = useThemeColor({ light: AppColors.background.light, dark: AppColors.background.dark }, 'background');
  const cardBackground = useThemeColor({ light: AppColors.cardsRequest.primaryBackgroundLight, dark: AppColors.cardsRequest.primaryBackgroundDark }, 'background');
  const errorColor = useThemeColor({ light: AppColors.secondary.red, dark: AppColors.secondary.red }, 'text');
  const placeholderColor = useThemeColor({ light: AppColors.text.secondary, dark: AppColors.text.secondary }, 'text');

  const calculateEstimatedPrice = (priceFactor: number = 1.0) => {
    const baseRate = 500; // Tarifa base por hora
    return Math.round(baseRate * durationHours * priceFactor);
  };

  const renderCategoryCard = ({ item }: { item: Category }) => {
    const iconName = categoryIcons[item.name] || 'music';
    const estimatedPrice = showPriceEstimate ? calculateEstimatedPrice(item.price_factor) : null;

    return (
      <TouchableOpacity
        style={[
          styles.categoryCard,
          {
            backgroundColor: cardBackground,
            borderColor: selectedCategory?.id === item.id ? tintColor : 'transparent',
            borderWidth: selectedCategory?.id === item.id ? 2 : 1,
          }
        ]}
        onPress={() => {
          onCategorySelect(item);
          setModalVisible(false);
        }}
      >
        <View style={styles.categoryHeader}>
          <FontAwesome 
            name={iconName as any} 
            size={24} 
            color={selectedCategory?.id === item.id ? tintColor : textColor} 
          />
          <Text style={[
            styles.categoryName,
            {
              color: selectedCategory?.id === item.id ? tintColor : textColor,
              fontWeight: selectedCategory?.id === item.id ? 'bold' : 'normal'
            }
          ]}>
            {item.name}
          </Text>
        </View>
        
        {item.description && (
          <Text style={[styles.categoryDescription, { color: textColor }]}>
            {item.description}
          </Text>
        )}
        
        <View style={styles.categoryFooter}>
          {item.price_factor && (
            <View style={styles.priceInfo}>
              <FontAwesome name="tag" size={14} color={tintColor} />
              <Text style={[styles.priceText, { color: textColor }]}>
                Factor: {item.price_factor}x
              </Text>
            </View>
          )}
          
          {estimatedPrice && showPriceEstimate && (
            <View style={styles.priceInfo}>
              <FontAwesome name="dollar" size={14} color="#4CAF50" />
              <Text style={[styles.estimatedPrice, { color: '#4CAF50' }]}>
                ~${estimatedPrice.toLocaleString()}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

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
            borderColor: error ? errorColor : selectedCategory ? tintColor : '#E0E0E0',
            borderWidth: 2,
          }
        ]}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.selectorContent}>
          <View style={styles.selectorLeft}>
            {selectedCategory ? (
              <>
                <FontAwesome 
                  name={categoryIcons[selectedCategory.name] as any || 'music'} 
                  size={20} 
                  color={tintColor} 
                />
                <Text style={[styles.selectorText, { color: textColor }]}>
                  {selectedCategory.name}
                </Text>
              </>
              ) : (
                <>
                  <FontAwesome name="tags" size={20} color={placeholderColor} />
                  <Text style={[styles.placeholderText, { color: placeholderColor }]}>
                    Seleccionar categoría de evento
                  </Text>
                </>
              )}
          </View>
          
          {selectedCategory && showPriceEstimate && (
            <View style={styles.pricePreview}>
              <FontAwesome name="dollar" size={16} color="#4CAF50" />
              <Text style={[styles.pricePreviewText, { color: '#4CAF50' }]}>
                ~${calculateEstimatedPrice(selectedCategory.price_factor).toLocaleString()}
              </Text>
            </View>
          )}
          
          <FontAwesome name="chevron-down" size={16} color={tintColor} />
        </View>
      </TouchableOpacity>

      {error && (
        <Text style={[styles.errorText, { color: errorColor }]}>{error}</Text>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textColor }]}>
                Seleccionar Categoría
              </Text>
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: tintColor }]}
                onPress={() => setModalVisible(false)}
              >
                <FontAwesome name="times" size={18} color="white" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={categories}
              renderItem={renderCategoryCard}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.categoriesList}
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
    justifyContent: 'space-between',
  },
  selectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectorText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  placeholderText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  pricePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 12,
  },
  pricePreviewText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
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
  categoriesList: {
    paddingBottom: 20,
  },
  categoryCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  categoryDescription: {
    fontSize: 14,
    marginBottom: 12,
    opacity: 0.7,
  },
  categoryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 12,
    marginLeft: 4,
    opacity: 0.7,
  },
  estimatedPrice: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
});
