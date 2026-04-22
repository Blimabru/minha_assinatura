/**
 * Exemplo de Componente: Formulário de Criação de Assinatura com Alertas
 *
 * Este componente demonstra como:
 * 1. Capturar dados da assinatura
 * 2. Agendar uma notificação de vencimento
 * 3. Gerenciar o estado da notificação
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSubscriptionNotifications } from '../hooks/useSubscriptionNotifications';
import { CreateSubscriptionDTO, Subscription, SubscriptionFrequency } from '../types/subscription';

interface SubscriptionFormExampleProps {
  onSubscriptionCreated?: (subscription: Subscription) => void;
}

export const SubscriptionFormExample: React.FC<SubscriptionFormExampleProps> = ({
  onSubscriptionCreated,
}) => {
  const [formData, setFormData] = useState<CreateSubscriptionDTO>({
    name: 'Netflix',
    serviceName: 'Netflix',
    price: 34.9,
    currency: 'BRL',
    frequency: { type: 'monthly', interval: 1 } as SubscriptionFrequency,
    startDate: new Date(),
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias de agora
  });

  const [reminderDays, setReminderDays] = useState('7');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { scheduleAlert, isLoading, error } = useSubscriptionNotifications();

  const handleSubmit = useCallback(async () => {
    try {
      setIsSubmitting(true);

      // Validar dados
      if (!formData.name || !formData.serviceName || !formData.price) {
        Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
        return;
      }

      // Criar objeto de assinatura
      const subscription: Subscription = {
        id: `sub-${Date.now()}`,
        name: formData.name,
        description: formData.description,
        serviceName: formData.serviceName,
        price: formData.price,
        currency: formData.currency,
        frequency: formData.frequency,
        startDate: formData.startDate,
        expirationDate: formData.expirationDate,
        isActive: true,
        notificationEnabled: true,
        reminderDaysBefore: parseInt(reminderDays, 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Agendar notificação de vencimento
      const notificationId = await scheduleAlert(
        formData.serviceName,
        formData.expirationDate,
        parseInt(reminderDays, 10)
      );

      subscription.notificationId = notificationId;

      // Persistir assinatura (você faria isso em um banco de dados)
      console.log('Assinatura criada:', subscription);

      // Callback
      onSubscriptionCreated?.(subscription);

      Alert.alert(
        'Sucesso',
        `Assinatura "${formData.serviceName}" criada!\nNotificação agendada para ${reminderDays} dias antes do vencimento.`
      );

      // Resetar form
      setFormData({
        name: '',
        serviceName: '',
        price: 0,
        currency: 'BRL',
        frequency: { type: 'monthly', interval: 1 } as SubscriptionFrequency,
        startDate: new Date(),
        expirationDate: new Date(),
      });
      setReminderDays('7');
    } catch (err) {
      Alert.alert(
        'Erro',
        'Não foi possível criar a assinatura. Tente novamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, reminderDays, scheduleAlert, onSubscriptionCreated]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <Text style={styles.title}>📝 Registrar Nova Assinatura</Text>

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Nome da Assinatura */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Nome da Assinatura *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Minha Netflix"
            value={formData.name}
            onChangeText={(text) =>
              setFormData({ ...formData, name: text })
            }
            editable={!isSubmitting}
          />
        </View>

        {/* Serviço */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Serviço *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Netflix, Spotify, etc"
            value={formData.serviceName}
            onChangeText={(text) =>
              setFormData({ ...formData, serviceName: text })
            }
            editable={!isSubmitting}
          />
        </View>

        {/* Preço */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Preço (R$) *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 34.90"
            value={formData.price.toString()}
            onChangeText={(text) =>
              setFormData({
                ...formData,
                price: parseFloat(text) || 0,
              })
            }
            keyboardType="decimal-pad"
            editable={!isSubmitting}
          />
        </View>

        {/* Data de Expiração */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Data de Vencimento *</Text>
          <View style={styles.dateDisplay}>
            <Text style={styles.dateText}>
              {formData.expirationDate.toLocaleDateString('pt-BR')}
            </Text>
            <Text style={styles.dateHint}>
              (configure na aplicação de agenda)
            </Text>
          </View>
        </View>

        {/* Dias para Alerta */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>📢 Alertar quantos dias antes?</Text>
          <View style={styles.reminderSelector}>
            {['3', '5', '7', '14'].map((days) => (
              <TouchableOpacity
                key={days}
                style={[
                  styles.reminderOption,
                  reminderDays === days && styles.reminderOptionActive,
                ]}
                onPress={() => setReminderDays(days)}
              >
                <Text
                  style={[
                    styles.reminderOptionText,
                    reminderDays === days && styles.reminderOptionTextActive,
                  ]}
                >
                  {days}d
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.helperText}>
            Você receberá uma notificação {reminderDays} dias antes do vencimento
          </Text>
        </View>

        {/* Descrição */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Descrição (opcional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Notas sobre esta assinatura..."
            value={formData.description}
            onChangeText={(text) =>
              setFormData({ ...formData, description: text })
            }
            multiline
            numberOfLines={3}
            editable={!isSubmitting}
          />
        </View>

        {/* Botão de Envio */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (isSubmitting || isLoading) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting || isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.submitButtonText}>✓ Criar Assinatura</Text>
              <Text style={styles.submitButtonSubtext}>Com notificação agendada</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>💡 Como funciona:</Text>
          <Text style={styles.infoText}>
            • Ao criar uma assinatura, uma notificação local será agendada{'\n'}
            • A notificação será exibida {reminderDays} dias antes do
            vencimento{'\n'}
            • Você pode gerenciar os alertas a qualquer momento
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  errorBanner: {
    backgroundColor: '#FFE5E5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    paddingTop: 10,
    paddingBottom: 10,
    textAlignVertical: 'top',
  },
  dateDisplay: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  dateHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  reminderSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  reminderOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  reminderOptionActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  reminderOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  reminderOptionTextActive: {
    color: '#fff',
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  submitButtonSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  infoSection: {
    backgroundColor: '#E8F4FF',
    borderRadius: 8,
    padding: 12,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0055CC',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#0055CC',
    lineHeight: 18,
  },
});
