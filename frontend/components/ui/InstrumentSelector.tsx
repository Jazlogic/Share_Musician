import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useThemeColor } from '../../hooks/use-theme-color';
import { AppColors } from '../../theme/colors';

interface Instrument {
  id: string;
  name: string;
  category: string;
  price_factor?: number;
  icon?: string;
  description?: string;
}

interface InstrumentSelectorProps {
  label: string;
  selectedInstruments: Instrument[];
  onInstrumentsChange: (instruments: Instrument[]) => void;
  instruments: Instrument[];
  required?: boolean;
  error?: string;
  maxSelections?: number;
  showPriceFactor?: boolean;
}

const instrumentIcons: { [key: string]: string } = {
  'Guitarra Acústica': 'music',
  'Guitarra Eléctrica': 'music',
  'Piano': 'keyboard-o',
  'Batería': 'music',
  'Violín': 'music',
  'Bajo': 'music',
  'Saxofón': 'music',
  'Trompeta': 'music',
  'Flauta': 'music',
  'Armónica': 'music',
  'Órgano': 'keyboard-o',
  'Sintetizador': 'keyboard-o',
  'Micrófono': 'microphone',
  'Amplificador': 'volume-up',
};

const categoryColors: { [key: string]: string } = {
  'cuerda': '#FF6B6B',
  'teclado': '#4ECDC4',
  'viento': '#45B7D1',
  'percusión': '#96CEB4',
  'electrónico': '#FFEAA7',
  'vocal': '#DDA0DD',
};

export default function InstrumentSelector({
  label,
  selectedInstruments,
  onInstrumentsChange,
  instruments,
  required = false,
  error,
  maxSelections = 3,
  showPriceFactor = true
}: InstrumentSelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const textColor = useThemeColor({ light: AppColors.text.black, dark: AppColors.text.white }, 'text');
  const tintColor = useThemeColor({ light: AppColors.primary.blue, dark: AppColors.primary.accent }, 'tint');
  const backgroundColor = useThemeColor({ light: AppColors.background.light, dark: AppColors.background.dark }, 'background');
  const cardBackground = useThemeColor({ light: AppColors.cardsRequest.primaryBackgroundLight, dark: AppColors.cardsRequest.primaryBackgroundDark }, 'background');
  const errorColor = useThemeColor({ light: AppColors.secondary.red, dark: AppColors.secondary.red }, 'text');
  const placeholderColor = useThemeColor({ light: AppColors.text.secondary, dark: AppColors.text.secondary }, 'text');

  const categories = ['all', ...Array.from(new Set(instruments.map(i => i.category)))];

  const filteredInstruments = selectedCategory === 'all' 
    ? instruments 
    : instruments.filter(i => i.category === selectedCategory);

  const toggleInstrument = (instrument: Instrument) => {
    const isSelected = selectedInstruments.some(selected => selected.id === instrument.id);
    
    if (isSelected) {
      onInstrumentsChange(selectedInstruments.filter(selected => selected.id !== instrument.id));
    } else if (selectedInstruments.length < maxSelections) {
      onInstrumentsChange([...selectedInstruments, instrument]);
    }
  };

  const removeInstrument = (instrumentId: string) => {
    onInstrumentsChange(selectedInstruments.filter(selected => selected.id !== instrumentId));
  };

  const getCategoryDisplayName = (category: string) => {
    const categoryNames: { [key: string]: string } = {
      'cuerda': 'Cuerda',
      'teclado': 'Teclado',
      'viento': 'Viento',
      'percusión': 'Percusión',
      'electrónico': 'Electrónico',
      'vocal': 'Vocal',
    };
    return categoryNames[category] || category;
  };

  const renderSelectedInstruments = () => {
    if (selectedInstruments.length === 0) {
      return (
        <View style={[styles.selectedContainer, { borderColor: '#E0E0E0' }]}>
          <FontAwesome name="music" size={20} color={placeholderColor} />
          <Text style={[styles.placeholderText, { color: placeholderColor }]}>
            Seleccionar instrumentos
          </Text>
        </View>
      );
    }

    return (
      <View style={[styles.selectedContainer, { borderColor: tintColor }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {selectedInstruments.map((instrument) => (
            <View key={instrument.id} style={[styles.selectedChip, { backgroundColor: tintColor }]}>
              <FontAwesome 
                name={instrumentIcons[instrument.name] as any || 'music'} 
                size={14} 
                color="white" 
              />
              <Text style={styles.selectedChipText}>{instrument.name}</Text>
              <TouchableOpacity onPress={() => removeInstrument(instrument.id)}>
                <FontAwesome name="times" size={12} color="white" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
        <FontAwesome name="chevron-down" size={16} color={tintColor} />
      </View>
    );
  };

  const renderInstrumentCard = ({ item }: { item: Instrument }) => {
    const isSelected = selectedInstruments.some(selected => selected.id === item.id);
    const iconName = instrumentIcons[item.name] || 'music';
    const categoryColor = categoryColors[item.category] || tintColor;

    return (
      <TouchableOpacity
        style={[
          styles.instrumentCard,
          {
            backgroundColor: cardBackground,
            borderColor: isSelected ? tintColor : 'transparent',
            borderWidth: isSelected ? 2 : 1,
          }
        ]}
        onPress={() => toggleInstrument(item)}
        disabled={!isSelected && selectedInstruments.length >= maxSelections}
      >
        <View style={styles.instrumentHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
            <FontAwesome name={iconName as any} size={16} color="white" />
          </View>
          <Text style={[
            styles.instrumentName,
            {
              color: isSelected ? tintColor : textColor,
              fontWeight: isSelected ? 'bold' : 'normal'
            }
          ]}>
            {item.name}
          </Text>
          {isSelected && (
            <FontAwesome name="check-circle" size={20} color={tintColor} />
          )}
        </View>
        
        <View style={styles.instrumentFooter}>
          <Text style={[styles.categoryText, { color: textColor }]}>
            {getCategoryDisplayName(item.category)}
          </Text>
          
          {item.price_factor && showPriceFactor && (
            <View style={styles.priceInfo}>
              <FontAwesome name="tag" size={12} color={tintColor} />
              <Text style={[styles.priceText, { color: textColor }]}>
                {item.price_factor}x
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
        <Text style={[styles.selectionInfo, { color: tintColor }]}>
          ({selectedInstruments.length}/{maxSelections})
        </Text>
      </Text>
      
      <TouchableOpacity
        style={[
          styles.selectorButton,
          {
            backgroundColor: cardBackground,
            borderColor: error ? errorColor : selectedInstruments.length > 0 ? tintColor : '#E0E0E0',
            borderWidth: 2,
          }
        ]}
        onPress={() => setModalVisible(true)}
      >
        {renderSelectedInstruments()}
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
                Seleccionar Instrumentos
              </Text>
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: tintColor }]}
                onPress={() => setModalVisible(false)}
              >
                <FontAwesome name="times" size={18} color="white" />
              </TouchableOpacity>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilter}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    {
                      backgroundColor: selectedCategory === category ? tintColor : cardBackground,
                      borderColor: tintColor,
                    }
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    {
                      color: selectedCategory === category ? 'white' : textColor,
                    }
                  ]}>
                    {category === 'all' ? 'Todos' : getCategoryDisplayName(category)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <FlatList
              data={filteredInstruments}
              renderItem={renderInstrumentCard}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.instrumentsList}
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
  selectionInfo: {
    fontSize: 14,
    fontWeight: '400',
  },
  selectorButton: {
    borderRadius: 12,
    padding: 16,
  },
  selectedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  placeholderText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedChipText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 6,
    marginRight: 6,
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
  categoryFilter: {
    marginBottom: 20,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  instrumentsList: {
    paddingBottom: 20,
  },
  instrumentCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  instrumentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  instrumentName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  instrumentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 12,
    opacity: 0.7,
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
});
