import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import { useSubscriptionNotifications, ScheduledAlert } from '../hooks/useSubscriptionNotifications';

interface SubscriptionExpirationAlertProps {
  visible: boolean;
  onDismiss: () => void;
}

export const SubscriptionExpirationAlert: React.FC<SubscriptionExpirationAlertProps> = ({
  visible,
  onDismiss,
}) => {
  const [testSubscriptionName, setTestSubscriptionName] = useState('Netflix');
  const [testDaysBeforeExpiration, setTestDaysBeforeExpiration] = useState(7);
  const {
    scheduledAlerts,
    isLoading,
    error,
    scheduleAlert,
    cancelAlert,
    clearAllAlerts,
    resetError,
  } = useSubscriptionNotifications();

  const handleScheduleTest = useCallback(async () => {
    try {
      // Agendamos para 7 dias a partir de agora
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + testDaysBeforeExpiration);

      await scheduleAlert(testSubscriptionName, expirationDate, testDaysBeforeExpiration);

      Alert.alert('Sucesso', `Notificação agendada para "${testSubscriptionName}"`);
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível agendar a notificação');
    }
  }, [testSubscriptionName, testDaysBeforeExpiration, scheduleAlert]);

  const handleCancelAlert = useCallback(
    async (alert: ScheduledAlert) => {
      try {
        await cancelAlert(alert.notificationId);
        Alert.alert('Sucesso', `Alerta cancelado para "${alert.subscriptionName}"`);
      } catch (err) {
        Alert.alert('Erro', 'Não foi possível cancelar o alerta');
      }
    },
    [cancelAlert]
  );

  const handleClearAll = useCallback(() => {
    Alert.alert('Confirmar', 'Deseja cancelar todas as notificações?', [
      { text: 'Cancelar', onPress: () => {} },
      {
        text: 'Confirmar',
        onPress: async () => {
          try {
            await clearAllAlerts();
            Alert.alert('Sucesso', 'Todas as notificações foram canceladas');
          } catch (err) {
            Alert.alert('Erro', 'Não foi possível cancelar as notificações');
          }
        },
      },
    ]);
  }, [clearAllAlerts]);

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onDismiss}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Alertas de Vencimento</Text>
          <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={resetError} style={styles.errorDismiss}>
              <Text style={styles.errorDismissText}>Descartar</Text>
            </TouchableOpacity>
          </View>
        )}

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Seção: Agendar novo alerta */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📅 Agendar Novo Alerta</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome do Serviço</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputValue}>{testSubscriptionName}</Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Dias antes do vencimento</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputValue}>{testDaysBeforeExpiration} dias</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, styles.primaryButton, isLoading && styles.buttonDisabled]}
              onPress={handleScheduleTest}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Agendar Notificação</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Seção: Notificações Agendadas */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🔔 Notificações Agendadas</Text>
              <Text style={styles.badge}>{scheduledAlerts.length}</Text>
            </View>

            {scheduledAlerts.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>Nenhuma notificação agendada</Text>
              </View>
            ) : (
              <View style={styles.alertsList}>
                {scheduledAlerts.map((alert, index) => (
                  <View key={`${alert.notificationId}-${index}`} style={styles.alertItem}>
                    <View style={styles.alertInfo}>
                      <Text style={styles.alertName}>{alert.subscriptionName}</Text>
                      <Text style={styles.alertDate}>
                        Vence em: {formatDate(alert.expirationDate)}
                      </Text>
                      <Text style={styles.alertTime}>
                        Alerta em: {alert.daysBeforeExpiration} dias antes
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleCancelAlert(alert)}
                    >
                      <Text style={styles.deleteButtonText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {scheduledAlerts.length > 0 && (
              <TouchableOpacity
                style={[styles.button, styles.dangerButton]}
                onPress={handleClearAll}
              >
                <Text style={styles.buttonText}>Limpar Todas as Notificações</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Seção: Informações */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ℹ️ Informações</Text>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                • As notificações são agendadas para dias antes do vencimento{'\n'}
                • Você receberá um alerta local no seu dispositivo{'\n'}
                • O nome do serviço será exibido na notificação
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 10 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  badge: {
    backgroundColor: '#007AFF',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
    overflow: 'hidden',
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 6,
  },
  inputContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputValue: {
    fontSize: 14,
    color: '#333',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
  },
  alertsList: {
    gap: 12,
  },
  alertItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  alertInfo: {
    flex: 1,
  },
  alertName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  alertDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  alertTime: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  deleteButtonText: {
    fontSize: 18,
  },
  errorContainer: {
    backgroundColor: '#FFE5E5',
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: '#FF3B30',
  },
  errorDismiss: {
    paddingHorizontal: 8,
  },
  errorDismissText: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#E8F4FF',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoText: {
    fontSize: 12,
    color: '#0055CC',
    lineHeight: 18,
  },
});
