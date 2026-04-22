import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export interface SubscriptionExpirationAlert {
  id: string;
  subscriptionId: string;
  subscriptionName: string;
  expirationDate: Date;
  notificationDate: Date;
  notificationId?: string;
  isScheduled: boolean;
  createdAt: Date;
}

export class SubscriptionNotificationService {
  private static instance: SubscriptionNotificationService;

  private constructor() {
    this.initializeNotifications();
  }

  static getInstance(): SubscriptionNotificationService {
    if (!SubscriptionNotificationService.instance) {
      SubscriptionNotificationService.instance = new SubscriptionNotificationService();
    }
    return SubscriptionNotificationService.instance;
  }

  private async initializeNotifications(): Promise<void> {
    // Configurar comportamento das notificações
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    // Solicitar permissão no iOS
    if (Platform.OS === 'ios') {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Notificação: permissão não concedida no iOS');
      }
    }

    // Android pode agendar sem permissão explícita, mas é bom solicitar
    if (Platform.OS === 'android') {
      // Android 12+ requer permissão POST_NOTIFICATIONS
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Notificação: permissão não concedida no Android');
        }
      } catch (error) {
        console.warn('Erro ao solicitar permissões de notificação:', error);
      }
    }
  }

  /**
   * Agenda uma notificação de alerta de vencimento de assinatura
   * @param subscriptionName Nome do serviço
   * @param expirationDate Data de vencimento
   * @param daysBeforeExpiration Quantos dias antes enviar o alerta (padrão: 0 dias - hoje)
   * @returns ID da notificação agendada
   */
  async scheduleExpirationAlert(
    subscriptionName: string,
    expirationDate: Date,
    daysBeforeExpiration: number = 0
  ): Promise<string> {
    try {
      // Calcular data/hora do alerta
      const alertDate = new Date(expirationDate);
      alertDate.setDate(alertDate.getDate() - daysBeforeExpiration);

      // Se a data do alerta já passou, não agendar
      if (alertDate < new Date()) {
        console.warn(`Data de alerta já passou para ${subscriptionName}`);
        return '';
      }

      // Agendar notificação
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Lembrete de Vencimento',
          body: daysBeforeExpiration === 0 
            ? `Sua assinatura "${subscriptionName}" vence hoje`
            : `Sua assinatura "${subscriptionName}" vence em ${daysBeforeExpiration} dias`,
          data: {
            subscriptionName,
            expirationDate: expirationDate.toISOString(),
            daysBeforeExpiration,
          },
          sound: true,
          badge: 1,
        },
        trigger: {
          type: 'timeInterval' as const,
          seconds: Math.max(1, Math.floor((alertDate.getTime() - Date.now()) / 1000)),
        } as any,
      });

      console.log(`✓ Notificação agendada: ${subscriptionName} em ${alertDate.toISOString()}`);
      return notificationId;
    } catch (error) {
      console.error('Erro ao agendar notificação:', error);
      throw error;
    }
  }

  /**
   * Cancela uma notificação agendada
   * @param notificationId ID da notificação
   */
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      if (!notificationId) return;
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log(`✓ Notificação cancelada: ${notificationId}`);
    } catch (error) {
      console.error('Erro ao cancelar notificação:', error);
      throw error;
    }
  }

  /**
   * Reagendar uma notificação (cancela a antiga e cria uma nova)
   */
  async rescheduleExpirationAlert(
    previousNotificationId: string,
    subscriptionName: string,
    expirationDate: Date,
    daysBeforeExpiration: number = 7
  ): Promise<string> {
    await this.cancelNotification(previousNotificationId);
    return this.scheduleExpirationAlert(subscriptionName, expirationDate, daysBeforeExpiration);
  }

  /**
   * Obtém todas as notificações agendadas
   */
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Erro ao obter notificações agendadas:', error);
      return [];
    }
  }

  /**
   * Limpa todas as notificações agendadas
   */
  async clearAllScheduledNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('✓ Todas as notificações foram canceladas');
    } catch (error) {
      console.error('Erro ao limpar notificações:', error);
      throw error;
    }
  }

  /**
   * Configura o comportamento ao clicar na notificação
   */
  setupNotificationResponseListener(
    callback: (notification: Notifications.Notification) => void
  ): () => void {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        callback(response.notification);
      }
    );

    return () => subscription.remove();
  }

  /**
   * Configura o comportamento quando notificação é recebida (app em foreground)
   */
  setupNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ): () => void {
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        callback(notification);
      }
    );

    return () => subscription.remove();
  }
}

export const subscriptionNotificationService = SubscriptionNotificationService.getInstance();
