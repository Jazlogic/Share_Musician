import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useThemeColor } from '../../hooks/use-theme-color';
import { AppColors } from '../../theme/colors';

interface SmartInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  icon: keyof typeof FontAwesome.glyphMap;
  suggestions?: string[];
  onSuggestionSelect?: (suggestion: string) => void;
  multiline?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  autoComplete?: boolean;
  required?: boolean;
  error?: string;
}

export default function SmartInput({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  suggestions = [],
  onSuggestionSelect,
  multiline = false,
  keyboardType = 'default',
  autoComplete = true,
  required = false,
  error
}: SmartInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  const textColor = useThemeColor({ light: AppColors.text.black, dark: AppColors.text.white }, 'text');
  const tintColor = useThemeColor({ light: AppColors.primary.blue, dark: AppColors.primary.accent }, 'tint');
  const backgroundColor = useThemeColor({ light: AppColors.background.light, dark: AppColors.background.dark }, 'background');
  const errorColor = useThemeColor({ light: AppColors.secondary.red, dark: AppColors.secondary.red }, 'text');
  const placeholderColor = useThemeColor({ light: AppColors.text.secondary, dark: AppColors.text.secondary }, 'text');
  const inputBackgroundColor = useThemeColor({ light: 'rgba(255, 255, 255, 0.1)', dark: 'rgba(0, 0, 0, 0.2)' }, 'background');
  const shadowColor = useThemeColor({ light: '#000', dark: '#fff' }, 'text');

  useEffect(() => {
    if (autoComplete && suggestions.length > 0) {
      if (value.length > 0) {
        const filtered = suggestions.filter(suggestion =>
          suggestion.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredSuggestions(filtered.slice(0, 5)); // Mostrar máximo 5 sugerencias
        setShowSuggestions(filtered.length > 0);
      } else {
        // Si no hay texto, mostrar las primeras 5 sugerencias
        setFilteredSuggestions(suggestions.slice(0, 5));
        setShowSuggestions(true);
      }
    } else {
      setShowSuggestions(false);
    }
  }, [value, suggestions, autoComplete]);

  const handleSuggestionPress = (suggestion: string) => {
    onChangeText(suggestion);
    onSuggestionSelect?.(suggestion);
    setShowSuggestions(false);
  };

  const handleFocus = () => {
    if (autoComplete && suggestions.length > 0) {
      if (value.length > 0) {
        const filtered = suggestions.filter(suggestion =>
          suggestion.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredSuggestions(filtered.slice(0, 5));
        setShowSuggestions(filtered.length > 0);
      } else {
        // Si está vacío, mostrar las primeras 5 sugerencias
        setFilteredSuggestions(suggestions.slice(0, 5));
        setShowSuggestions(true);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: textColor }]}>
        {label}
        {required && <Text style={{ color: errorColor }}> *</Text>}
      </Text>
      
      <View style={[styles.inputContainer, { borderColor: error ? errorColor : tintColor, backgroundColor: inputBackgroundColor }]}>
        <FontAwesome name={icon} size={20} color={tintColor} style={styles.icon} />
        <TextInput
          style={[
            styles.input,
            {
              color: textColor,
              textAlignVertical: multiline ? 'top' : 'center',
              height: multiline ? 80 : 50,
            }
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          multiline={multiline}
          keyboardType={keyboardType}
          onFocus={handleFocus}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 300)}
        />
      </View>

      {error && (
        <Text style={[styles.errorText, { color: errorColor }]}>{error}</Text>
      )}

      {showSuggestions && filteredSuggestions.length > 0 && (
        <View style={[styles.suggestionsContainer, { backgroundColor, borderColor: tintColor, shadowColor }]}>
          {filteredSuggestions.map((item, index) => (
            <TouchableOpacity
              key={`${item}-${index}`}
              style={[styles.suggestionItem, { borderBottomColor: tintColor }]}
              onPress={() => handleSuggestionPress(item)}
            >
              <FontAwesome name="search" size={14} color={tintColor} style={styles.suggestionIcon} />
              <Text style={[styles.suggestionText, { color: textColor }]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 15,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  errorText: {
    fontSize: 14,
    marginTop: 5,
    marginLeft: 5,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 70, // Altura fija para evitar problemas con '100%'
    left: 0,
    right: 0,
    borderWidth: 2,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
  },
  suggestionIcon: {
    marginRight: 10,
  },
  suggestionText: {
    fontSize: 16,
    flex: 1,
  },
});
