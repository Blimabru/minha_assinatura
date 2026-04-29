import React, { useState } from 'react';
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
import { useAutoScheduleNotifications } from '../hooks/useAutoScheduleNotifications';

interface CreateSubscriptionData {
  serviceName: string;
  price: number;
  expirationDate: Date;
  reminderDaysBefore: number;
}

/**
 * Componente que demonstra como integrar o sistema de notificações
 * ao cadastro de uma assinatura.
 * 
 * Fluxo:
 * 1. Usuário preenche dados da assinatura
 * 2. Sistema salva a assinatura no banco (não implementado aqui)
 * 3. Sistema chama scheduleForSubscription
 * 4. Notificação é agendada automaticamente
 */
export const SubscriptionNotificationIntegration: React.FC = () => {
  const [serviceName, setServiceName] = useState('Netflix');
  const [price, setPrice] = useState('34.90');
  const [expirationDays, setExpirationDays] = useState('30');
  const [reminderDays, setReminderDays] = useState('7');
  const [isLoading, setIsLoading] = useState(false);

  const { scheduleForSubscription } = useAutoScheduleNotifications();

  const handleCreateSubscription = async () => {
    try {
      setIsLoading(true);

      // Validar dados
      if (!serviceName.trim()) {
        Alert.alert('Erro', 'Nome do serviço é obrigatório');
        return;
      }

      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum <= 0) {
        Alert.alert('Erro', 'Preço deve ser maior que zero');
        return;
      }

      const expDays = parseInt(expirationDays);
      const remDays = parseInt(reminderDays);

      // Calcular data de expiração
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + expDays);

      // Criar objeto de assinatura (como seria salvo no banco)
      const subscription = {
        id: `sub-${Date.now()}`,
        serviceName: serviceName.trim(),
        price: priceNum,
        expirationDate,
        reminderDaysBefore: remDays,
        isActive: true,
      };

      // PASSO CRÍTICO: Agendar notificação ao criar assinatura
      const notificationId = await scheduleForSubscription(subscription);

      // Aqui você salvaria a assinatura no banco com o notificationId
      console.log('Assinatura criada com notificação:', {
        ...subscription,
        notificationId,
      });

      Alert.alert(
        'Sucesso',
        `Assinatura "${serviceName}" criada!\n\nNotificação agendada para:\n${new Date(expirationDate.getTime() - remDays * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}`
      );

      // Limpar form
      setServiceName('');
      setPrice('');
      setExpirationDays('30');
      setReminderDays('7');
    } catch (error) {
      console.error('Erro ao criar assinatura:', error);
      Alert.alert('Erro', `Falha ao criar assinatura: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Cadastrar Assinatura</Text>
      <Text style={styles.subtitle}>
        A notificação será agendada automaticamente no momento do cadastro
      </Text>

      <View style={styles.form}>
        <Text style={styles.label}>Nome do Serviço</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Netflix"
          value={serviceName}
          onChangeText={setServiceName}
          editable={!isLoading}
        />

        <Text style={styles.label}>Preço (R$)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 34.90"
          value={price}
          onChangeText={setPrice}
          keyboardType="decimal-pad"
          editable={!isLoading}
        />

        <Text style={styles.label}>Vencimento em (dias)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 30"
          value={expirationDays}
          onChangeText={setExpirationDays}
          keyboardType="number-pad"
          editable={!isLoading}
        />

        <Text style={styles.label}>Lembrete (dias antes)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 7"
          value={reminderDays}
          onChangeText={setReminderDays}
          keyboardType="number-pad"
          editable={!isLoading}
        />

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleCreateSubscription}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Cadastrar e Agendar Notificação</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <Text style={styles.infoTitle}>Como funciona:</Text>
        <Text style={styles.infoText}>
          1. Você preenche os dados da assinatura{'\n'}
          2. Clica em "Cadastrar"{'\n'}
          3. Sistema salva no banco (simulado){'\n'}
          4. Notificação é agendada automaticamente{'\n'}
          5. No dia marcado, você recebe um lembrete
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  form: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#fafafa',
  },
  button: {
    backgroundColor: '#0b7a5a',
    borderRadius: 8,
    padding: 14,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  info: {
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#0b7a5a',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0b7a5a',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#2e7d32',
    lineHeight: 20,
  },
});
