import React, { useState } from 'react';
import { Alert, View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator, Platform } from 'react-native';
import { batteryOptimizationService } from '../services/BatteryOptimizationService';

interface BatteryOptimizationAlertProps {
  visible: boolean;
  onDismiss: () => void;
  onPermissionGranted?: () => void;
}

export const BatteryOptimizationAlert: React.FC<BatteryOptimizationAlertProps> = ({
  visible,
  onDismiss,
  onPermissionGranted,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestPermission = async () => {
    try {
      setIsLoading(true);
      await batteryOptimizationService.requestBatteryOptimizationExemption();
      onPermissionGranted?.();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível abrir as configurações de bateria');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenSettings = async () => {
    try {
      setIsLoading(true);
      await batteryOptimizationService.openAppBatterySettings();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível abrir as configurações');
    } finally {
      setIsLoading(false);
    }
  };

  if (Platform.OS !== 'android') {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.container}>
        <View style={styles.alertBox}>
          <Text style={styles.title}>⚡ Otimização de Bateria</Text>
          
          <Text style={styles.subtitle}>Verificação de Permissões</Text>
          
          <Text style={styles.description}>
            O Android pode estar matando nossas notificações agendadas para economizar bateria. Para garantir que você receba todos os alertas de vencimento, é necessário desativar a otimização de bateria para este aplicativo.
          </Text>

          <View style={styles.stepsContainer}>
            <Text style={styles.stepsTitle}>Como permitir:</Text>
            <Text style={styles.step}>1. Toque em "Permitir Agora"</Text>
            <Text style={styles.step}>2. Toque em "Remover da Otimização"</Text>
            <Text style={styles.step}>3. Pronto! Notificações funcionarão normalmente</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onDismiss}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Agora Não</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.permitButton]}
              onPress={handleRequestPermission}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.permitButtonText}>Permitir Agora</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.moreInfoButton}
            onPress={handleOpenSettings}
            disabled={isLoading}
          >
            <Text style={styles.moreInfoText}>Configurações de Bateria</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  alertBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    marginBottom: 16,
  },
  stepsContainer: {
    backgroundColor: '#f5f5f5',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderRadius: 8,
  },
  stepsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  step: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
  permitButton: {
    backgroundColor: '#FF9500',
  },
  permitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  moreInfoButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  moreInfoText: {
    color: '#007AFF',
    fontSize: 13,
    fontWeight: '500',
  },
});
