import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  View,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { AppColors } from '../../theme/colors';

interface StatusActionButtonProps {
  currentStatus: string;
  userRole: string;
  isClient: boolean;
  isMusician: boolean;
  onStatusChange: (newStatus: string, cancellationReason?: string) => Promise<void>;
  disabled?: boolean;
}

interface StatusAction {
  status: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  backgroundColor: string;
  requiresReason?: boolean;
}

const StatusActionButton: React.FC<StatusActionButtonProps> = ({
  currentStatus,
  userRole,
  isClient,
  isMusician,
  onStatusChange,
  disabled = false,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState<StatusAction | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({ light: AppColors.neutral.grayMedium, dark: AppColors.neutral.grayMedium }, 'text');

  const getAvailableActions = (): StatusAction[] => {
    const actions: StatusAction[] = [];

    if (isClient) {
      switch (currentStatus) {
        case 'CREATED':
        case 'OFFER_RECEIVED':
        case 'OFFER_ACCEPTED':
          actions.push({
            status: 'CANCELLED_BY_CLIENT',
            label: 'Cancelar Solicitud',
            icon: 'close-circle',
            color: AppColors.secondary.red,
            backgroundColor: `${AppColors.secondary.red}20`,
            requiresReason: true,
          });
          break;
        case 'OFFER_ACCEPTED':
          actions.push({
            status: 'CONFIRMED',
            label: 'Confirmar Evento',
            icon: 'checkmark-circle',
            color: AppColors.secondary.green,
            backgroundColor: `${AppColors.secondary.green}20`,
          });
          break;
        case 'CONFIRMED':
          actions.push({
            status: 'IN_PROGRESS',
            label: 'Iniciar Evento',
            icon: 'play-circle',
            color: AppColors.primary.blue,
            backgroundColor: `${AppColors.primary.blue}20`,
          });
          break;
        case 'IN_PROGRESS':
          actions.push({
            status: 'COMPLETED',
            label: 'Marcar como Completado',
            icon: 'checkmark-done-circle',
            color: AppColors.secondary.green,
            backgroundColor: `${AppColors.secondary.green}20`,
          });
          break;
        case 'CANCELLED_BY_CLIENT':
        case 'CANCELLED_BY_MUSICIAN':
          actions.push({
            status: 'REOPENED',
            label: 'Reabrir Solicitud',
            icon: 'refresh-circle',
            color: AppColors.primary.blue,
            backgroundColor: `${AppColors.primary.blue}20`,
          });
          break;
      }
    }

    if (isMusician) {
      switch (currentStatus) {
        case 'OFFER_ACCEPTED':
          actions.push({
            status: 'CANCELLED_BY_MUSICIAN',
            label: 'Cancelar Participación',
            icon: 'close-circle',
            color: AppColors.secondary.red,
            backgroundColor: `${AppColors.secondary.red}20`,
            requiresReason: true,
          });
          break;
        case 'OFFER_ACCEPTED':
          actions.push({
            status: 'CONFIRMED',
            label: 'Confirmar Participación',
            icon: 'checkmark-circle',
            color: AppColors.secondary.green,
            backgroundColor: `${AppColors.secondary.green}20`,
          });
          break;
        case 'CONFIRMED':
          actions.push({
            status: 'IN_PROGRESS',
            label: 'Iniciar Evento',
            icon: 'play-circle',
            color: AppColors.primary.blue,
            backgroundColor: `${AppColors.primary.blue}20`,
          });
          break;
        case 'IN_PROGRESS':
          actions.push({
            status: 'COMPLETED',
            label: 'Marcar como Completado',
            icon: 'checkmark-done-circle',
            color: AppColors.secondary.green,
            backgroundColor: `${AppColors.secondary.green}20`,
          });
          break;
      }
    }

    return actions;
  };

  const availableActions = getAvailableActions();

  if (availableActions.length === 0) {
    return null;
  }

  const handleActionPress = (action: StatusAction) => {
    setSelectedAction(action);
    if (action.requiresReason) {
      setShowModal(true);
    } else {
      handleConfirmAction(action);
    }
  };

  const handleConfirmAction = async (action: StatusAction) => {
    setIsLoading(true);
    try {
      await onStatusChange(action.status, action.requiresReason ? cancellationReason : undefined);
      setShowModal(false);
      setCancellationReason('');
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el estado de la solicitud');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelModal = () => {
    setShowModal(false);
    setCancellationReason('');
    setSelectedAction(null);
  };

  return (
    <>
      {availableActions.map((action, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.actionButton,
            {
              backgroundColor: action.backgroundColor,
              borderColor: action.color,
            },
          ]}
          onPress={() => handleActionPress(action)}
          disabled={disabled || isLoading}
        >
          <Ionicons name={action.icon} size={20} color={action.color} />
          <Text style={[styles.actionButtonText, { color: action.color }]}>
            {action.label}
          </Text>
        </TouchableOpacity>
      ))}

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={handleCancelModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor, borderColor }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              Motivo de Cancelación
            </Text>
            <TextInput
              style={[
                styles.reasonInput,
                {
                  backgroundColor,
                  borderColor,
                  color: textColor,
                },
              ]}
              placeholder="Explica el motivo de la cancelación..."
              placeholderTextColor={AppColors.text.secondary}
              value={cancellationReason}
              onChangeText={setCancellationReason}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancelModal}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.confirmButton,
                  { backgroundColor: AppColors.secondary.red },
                ]}
                onPress={() => selectedAction && handleConfirmAction(selectedAction)}
                disabled={isLoading || !cancellationReason.trim()}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.confirmButtonText}>Confirmar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    borderWidth: 1,
    marginVertical: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  reasonInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: AppColors.background.light,
    borderWidth: 1,
    borderColor: AppColors.neutral.grayMedium,
  },
  confirmButton: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cancelButtonText: {
    color: AppColors.text.defaultLight,
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default StatusActionButton;
