import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { useThemeColor } from '../../hooks/use-theme-color';
import { commonStyles } from '../../theme/commonStyles';
import { Colors } from '../../theme/tokens';
import { useColorScheme } from '../../hooks/use-color-scheme';

interface CategoryPickerProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string) => void;
}

export function CategoryPicker({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryPickerProps) {
  const theme = useColorScheme() ?? 'light';
  const textColor = useThemeColor({}, 'text');
  const primaryColor = Colors.primaryAccent;
  const borderColor = Colors.backgroundDark;

  const renderCategoryItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        commonStyles.categoryItem as ViewStyle,
        { borderColor },
        selectedCategory === item && { backgroundColor: primaryColor },
      ]}
      onPress={() => onSelectCategory(item)}
    >
      <Text
        style={[
          commonStyles.categoryItemText as TextStyle,
          { color: textColor },
          selectedCategory === item && { color: Colors.backgroundLight },
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={categories}
      renderItem={renderCategoryItem}
      keyExtractor={(item) => item}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[commonStyles.categoryList as ViewStyle, { borderColor }]} // Apply border color to the list container
    />
  );
}