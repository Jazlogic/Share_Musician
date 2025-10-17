import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '../../theme/colors';

interface StatusBadgeProps {
  status: string;
  size?: 'small' | 'medium' | 'large';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'medium' }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'CREATED':
        return {
          label: 'Creada',
          color: AppColors.secondary.orange,
          backgroundColor: `${AppColors.secondary.orange}20`,
          icon: 'add-circle' as keyof typeof Ionicons.glyphMap,
        };
      case 'OFFER_RECEIVED':
        return {
          label: 'Ofertas Recibidas',
          color: AppColors.primary.blue,
          backgroundColor: `${AppColors.primary.blue}20`,
          icon: 'mail' as keyof typeof Ionicons.glyphMap,
        };
      case 'OFFER_ACCEPTED':
        return {
          label: 'Oferta Aceptada',
          color: AppColors.secondary.green,
          backgroundColor: `${AppColors.secondary.green}20`,
          icon: 'checkmark-circle' as keyof typeof Ionicons.glyphMap,
        };
      case 'CONFIRMED':
        return {
          label: 'Confirmada',
          color: AppColors.primary.accent,
          backgroundColor: `${AppColors.primary.accent}20`,
          icon: 'shield-checkmark' as keyof typeof Ionicons.glyphMap,
        };
      case 'IN_PROGRESS':
        return {
          label: 'En Progreso',
          color: AppColors.secondary.orange,
          backgroundColor: `${AppColors.secondary.orange}20`,
          icon: 'play-circle' as keyof typeof Ionicons.glyphMap,
        };
      case 'COMPLETED':
        return {
          label: 'Completada',
          color: AppColors.secondary.green,
          backgroundColor: `${AppColors.secondary.green}20`,
          icon: 'checkmark-done-circle' as keyof typeof Ionicons.glyphMap,
        };
      case 'CANCELLED_BY_CLIENT':
        return {
          label: 'Cancelada por Cliente',
          color: AppColors.secondary.red,
          backgroundColor: `${AppColors.secondary.red}20`,
          icon: 'close-circle' as keyof typeof Ionicons.glyphMap,
        };
      case 'CANCELLED_BY_MUSICIAN':
        return {
          label: 'Cancelada por Músico',
          color: AppColors.secondary.red,
          backgroundColor: `${AppColors.secondary.red}20`,
          icon: 'close-circle' as keyof typeof Ionicons.glyphMap,
        };
      case 'REOPENED':
        return {
          label: 'Reabierta',
          color: AppColors.primary.blue,
          backgroundColor: `${AppColors.primary.blue}20`,
          icon: 'refresh-circle' as keyof typeof Ionicons.glyphMap,
        };
      case 'EXPIRED':
        return {
          label: 'Expirada',
          color: AppColors.text.secondary,
          backgroundColor: `${AppColors.text.secondary}20`,
          icon: 'time' as keyof typeof Ionicons.glyphMap,
        };
      case 'ARCHIVED':
        return {
          label: 'Archivada',
          color: AppColors.text.secondary,
          backgroundColor: `${AppColors.text.secondary}20`,
          icon: 'archive' as keyof typeof Ionicons.glyphMap,
        };
      default:
        return {
          label: status,
          color: AppColors.text.secondary,
          backgroundColor: `${AppColors.text.secondary}20`,
          icon: 'help-circle' as keyof typeof Ionicons.glyphMap,
        };
    }
  };

  const config = getStatusConfig(status);
  const sizeConfig = getSizeConfig(size);

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.backgroundColor,
          borderColor: config.color,
          paddingVertical: sizeConfig.paddingVertical,
          paddingHorizontal: sizeConfig.paddingHorizontal,
        },
      ]}
    >
      <Ionicons
        name={config.icon}
        size={sizeConfig.iconSize}
        color={config.color}
        style={styles.icon}
      />
      <Text
        style={[
          styles.label,
          {
            color: config.color,
            fontSize: sizeConfig.fontSize,
          },
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
};

const getSizeConfig = (size: 'small' | 'medium' | 'large') => {
  switch (size) {
    case 'small':
      return {
        paddingVertical: 4,
        paddingHorizontal: 8,
        iconSize: 14,
        fontSize: 12,
      };
    case 'large':
      return {
        paddingVertical: 12,
        paddingHorizontal: 16,
        iconSize: 20,
        fontSize: 16,
      };
    default: // medium
      return {
        paddingVertical: 8,
        paddingHorizontal: 12,
        iconSize: 16,
        fontSize: 14,
      };
  }
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 6,
  },
  label: {
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default StatusBadge;
