import * as Notifications from 'expo-notifications';
import { useState, useCallback, useEffect } from 'react';
import { subscriptionNotificationService } from '../services/SubscriptionNotificationService';

export interface ScheduledAlert {
  subscriptionName: string;
  expirationDate: Date;
  notificationId: string;
  daysBeforeExpiration: number;
}

interface NotificationData {
  subscriptionName?: string;
  expirationDate?: string;
  daysBeforeExpiration?: number;
}

interface UseSubscriptionNotificationsState {
  scheduledAlerts: ScheduledAlert[];
  isLoading: boolean;
  error: string | null;
}

export const useSubscriptionNotifications = () => {
  const [state, setState] = useState<UseSubscriptionNotificationsState>({
    scheduledAlerts: [],
    isLoading: false,
    error: null,
  });

  // Carregar notificações agendadas ao montar o hook
  useEffect(() => {
    loadScheduledNotifications();

    // Listeners para quando notificação é recebida ou clicada
    const unsubscribeReceived = subscriptionNotificationService.setupNotificationReceivedListener(
      (notification) => {
        console.log('Notificação recebida:', notification);
      }
    );

    const unsubscribeResponse = subscriptionNotificationService.setupNotificationResponseListener(
      (notification) => {
        console.log('Notificação clicada:', notification);
        // Aqui você pode navegar para uma tela específica ou executar uma ação
      }
    );

    return () => {
      unsubscribeReceived();
      unsubscribeResponse();
    };
  }, []);

  const loadScheduledNotifications = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const scheduled = await subscriptionNotificationService.getScheduledNotifications();

      const alerts: ScheduledAlert[] = scheduled.map((notification) => {
        const data = notification.content.data as NotificationData;
        return {
          subscriptionName: data?.subscriptionName || 'Desconhecido',
          expirationDate: data?.expirationDate ? new Date(data.expirationDate) : new Date(),
          notificationId: notification.identifier,
          daysBeforeExpiration: data?.daysBeforeExpiration || 7,
        };
      });

      setState((prev) => ({
        ...prev,
        scheduledAlerts: alerts,
        isLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: `Erro ao carregar notificações: ${error}`,
        isLoading: false,
      }));
    }
  }, []);

  const scheduleAlert = useCallback(
    async (subscriptionName: string, expirationDate: Date, daysBeforeExpiration: number = 7) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const notificationId = await subscriptionNotificationService.scheduleExpirationAlert(
          subscriptionName,
          expirationDate,
          daysBeforeExpiration
        );

        const newAlert: ScheduledAlert = {
          subscriptionName,
          expirationDate,
          notificationId,
          daysBeforeExpiration,
        };

        setState((prev) => ({
          ...prev,
          scheduledAlerts: [...prev.scheduledAlerts, newAlert],
          isLoading: false,
        }));

        return notificationId;
      } catch (error) {
        const errorMessage = `Erro ao agendar alerta: ${error}`;
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
        throw error;
      }
    },
    []
  );

  const cancelAlert = useCallback(async (notificationId: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      await subscriptionNotificationService.cancelNotification(notificationId);

      setState((prev) => ({
        ...prev,
        scheduledAlerts: prev.scheduledAlerts.filter(
          (alert) => alert.notificationId !== notificationId
        ),
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = `Erro ao cancelar alerta: ${error}`;
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      throw error;
    }
  }, []);

  const updateAlert = useCallback(
    async (
      previousNotificationId: string,
      subscriptionName: string,
      expirationDate: Date,
      daysBeforeExpiration: number = 7
    ) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const newNotificationId =
          await subscriptionNotificationService.rescheduleExpirationAlert(
            previousNotificationId,
            subscriptionName,
            expirationDate,
            daysBeforeExpiration
          );

        setState((prev) => ({
          ...prev,
          scheduledAlerts: prev.scheduledAlerts
            .filter((alert) => alert.notificationId !== previousNotificationId)
            .concat([
              {
                subscriptionName,
                expirationDate,
                notificationId: newNotificationId,
                daysBeforeExpiration,
              },
            ]),
          isLoading: false,
        }));

        return newNotificationId;
      } catch (error) {
        const errorMessage = `Erro ao atualizar alerta: ${error}`;
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
        throw error;
      }
    },
    []
  );

  const clearAllAlerts = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      await subscriptionNotificationService.clearAllScheduledNotifications();

      setState((prev) => ({
        ...prev,
        scheduledAlerts: [],
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = `Erro ao limpar alertas: ${error}`;
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      throw error;
    }
  }, []);

  const resetError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    // State
    scheduledAlerts: state.scheduledAlerts,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    scheduleAlert,
    cancelAlert,
    updateAlert,
    clearAllAlerts,
    loadScheduledNotifications,
    resetError,
  };
};
