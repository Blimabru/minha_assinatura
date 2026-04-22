import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSubscriptionNotifications } from '../hooks/useSubscriptionNotifications';

/**
 * Componente de Teste para Notificações
 * Use este painel para testar o sistema de notificações
 */
export const NotificationTestPanel: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { scheduleAlert, cancelAlert, scheduledAlerts, loadScheduledNotifications } =
    useSubscriptionNotifications();

  // Teste 1: Agendar notificação para 10 segundos (teste imediato)
  const handleTestImmediate = async () => {
    try {
      setIsLoading(true);

      const testDate = new Date();
      testDate.setSeconds(testDate.getSeconds() + 10); // 10 segundos

      const notificationId = await scheduleAlert(
        '🧪 Teste Netflix',
        testDate,
        0 // 0 dias antes
      );

      Alert.alert(
        'Sucesso',
        `Notificação agendada para 10 segundos!\n\nID: ${notificationId}\n\nFeche o app e espere...`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Erro', `Falha ao agendar: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Teste 2: Agendar para 1 minuto
  const handleTest1Minute = async () => {
    try {
      setIsLoading(true);

      const testDate = new Date();
      testDate.setMinutes(testDate.getMinutes() + 1);

      const notificationId = await scheduleAlert(
        '🧪 Teste Spotify',
        testDate,
        0
      );

      Alert.alert('Sucesso', `Notificação agendada para 1 minuto!\n\nID: ${notificationId}`);
    } catch (error) {
      Alert.alert('Erro', `Falha ao agendar: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Teste 3: Agendar para 5 minutos
  const handleTest5Minutes = async () => {
    try {
      setIsLoading(true);

      const testDate = new Date();
      testDate.setMinutes(testDate.getMinutes() + 5);

      const notificationId = await scheduleAlert(
        '🧪 Teste Disney+',
        testDate,
        0
      );

      Alert.alert('Sucesso', `Notificação agendada para 5 minutos!\n\nID: ${notificationId}`);
    } catch (error) {
      Alert.alert('Erro', `Falha ao agendar: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Teste 4: Simular assinatura com aviso 3 dias antes
  const handleTestRealCase = async () => {
    try {
      setIsLoading(true);

      // Assinatura com vencimento em 3 dias
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 3);

      // Aviso 2 dias antes
      const alertDate = new Date(expirationDate);
      alertDate.setDate(alertDate.getDate() - 2);

      // Se o alerta já passou, colocar para amanhã
      if (alertDate < new Date()) {
        alertDate.setDate(new Date().getDate() + 1);
      }

      const notificationId = await scheduleAlert(
        '💳 Netflix Premium',
        expirationDate,
        2
      );

      Alert.alert(
        'Caso Real Testado',
        `Assinatura: Netflix Premium\nVencimento: ${expirationDate.toLocaleDateString('pt-BR')}\nAviso: ${alertDate.toLocaleDateString('pt-BR')} às ${alertDate.toLocaleTimeString('pt-BR')}\n\nID: ${notificationId}`
      );
    } catch (error) {
      Alert.alert('Erro', `Falha: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Listar todas as notificações
  const handleListNotifications = async () => {
    try {
      setIsLoading(true);
      await loadScheduledNotifications();

      if (scheduledAlerts.length === 0) {
        Alert.alert('Info', 'Nenhuma notificação agendada');
      } else {
        const list = scheduledAlerts
          .map(
            (alert, idx) =>
              `${idx + 1}. ${alert.subscriptionName}\n   Vence: ${new Date(
                alert.expirationDate
              ).toLocaleDateString('pt-BR')}\n   ID: ${alert.notificationId.substring(0, 8)}...`
          )
          .join('\n\n');

        Alert.alert(
          `${scheduledAlerts.length} Notificações Agendadas`,
          list,
          [{ text: 'Fechar' }]
        );
      }
    } catch (error) {
      Alert.alert('Erro', `Falha ao listar: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Cancelar última notificação
  const handleCancelLast = async () => {
    try {
      if (scheduledAlerts.length === 0) {
        Alert.alert('Info', 'Nenhuma notificação para cancelar');
        return;
      }

      setIsLoading(true);
      const lastAlert = scheduledAlerts[scheduledAlerts.length - 1];
      await cancelAlert(lastAlert.notificationId);

      Alert.alert('Sucesso', `Cancelada: ${lastAlert.subscriptionName}`);
    } catch (error) {
      Alert.alert('Erro', `Falha ao cancelar: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>🧪 Painel de Teste - Notificações</Text>
        <Text style={styles.subtitle}>
          Agendadas: {scheduledAlerts.length}
        </Text>
      </View>

      {/* Testes Rápidos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Testes Rápidos</Text>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton, isLoading && styles.disabled]}
          onPress={handleTestImmediate}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Text style={styles.buttonText}>🚀 10 Segundos</Text>
              <Text style={styles.buttonSubtext}>Teste imediato</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton, isLoading && styles.disabled]}
          onPress={handleTest1Minute}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Text style={styles.buttonText}>⏱️ 1 Minuto</Text>
              <Text style={styles.buttonSubtext}>Teste rápido</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton, isLoading && styles.disabled]}
          onPress={handleTest5Minutes}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Text style={styles.buttonText}>⏰ 5 Minutos</Text>
              <Text style={styles.buttonSubtext}>Teste normal</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Caso Real */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📱 Caso Real</Text>

        <TouchableOpacity
          style={[styles.button, styles.successButton, isLoading && styles.disabled]}
          onPress={handleTestRealCase}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Text style={styles.buttonText}>💳 Simular Assinatura</Text>
              <Text style={styles.buttonSubtext}>Vencimento em 3 dias</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Gerenciamento */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚙️ Gerenciamento</Text>

        <TouchableOpacity
          style={[styles.button, styles.infoButton, isLoading && styles.disabled]}
          onPress={handleListNotifications}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Text style={styles.buttonText}>📋 Listar Todas</Text>
              <Text style={styles.buttonSubtext}>Ver agendadas</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.dangerButton, isLoading && styles.disabled]}
          onPress={handleCancelLast}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Text style={styles.buttonText}>🗑️ Cancelar Última</Text>
              <Text style={styles.buttonSubtext}>Remove a mais recente</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Instruções */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📖 Como Usar</Text>

        <View style={styles.instructionBox}>
          <Text style={styles.instructionStep}>
            <Text style={styles.bold}>Passo 1:</Text> Toque em um botão de teste acima
          </Text>
          <Text style={styles.instructionStep}>
            <Text style={styles.bold}>Passo 2:</Text> Feche o app completamente
          </Text>
          <Text style={styles.instructionStep}>
            <Text style={styles.bold}>Passo 3:</Text> Aguarde o tempo (ex: 10s, 1m, 5m)
          </Text>
          <Text style={styles.instructionStep}>
            <Text style={styles.bold}>Passo 4:</Text> Você receberá uma notificação no topo da tela
          </Text>
          <Text style={styles.instructionStep}>
            <Text style={styles.bold}>Passo 5:</Text> Clique para abrir o app
          </Text>
        </View>
      </View>

      {/* Debug Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🐛 Informações de Debug</Text>

        <View style={styles.debugBox}>
          <Text style={styles.debugText}>Notificações agendadas: {scheduledAlerts.length}</Text>
          <Text style={styles.debugText}>Plataforma: Android / iOS</Text>
          <Text style={styles.debugText}>Status: Pronto para teste</Text>
        </View>
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 12,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  successButton: {
    backgroundColor: '#34C759',
  },
  infoButton: {
    backgroundColor: '#00A8E8',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  disabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  buttonSubtext: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
    marginTop: 2,
  },
  instructionBox: {
    backgroundColor: '#E8F4FF',
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  instructionStep: {
    fontSize: 12,
    color: '#0055CC',
    marginBottom: 6,
    lineHeight: 16,
  },
  bold: {
    fontWeight: '600',
  },
  debugBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  debugText: {
    fontSize: 11,
    color: '#666',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  spacer: {
    height: 30,
  },
});
