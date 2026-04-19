import * as Notifications from 'expo-notifications';
import { useState, useCallback, useEffect, useRef } from 'react';
import { subscriptionNotificationService } from '../services/SubscriptionNotificationService';

export interface ScheduledAlert {
  subscriptionName: string;
  expirationDate: Date;
  notificationId: string;
  daysBeforeExpiration: number;
}

export const useSubscriptionNotifications = () => {
  // State separado por domínio - evita re-renders desnecessários
  const [scheduledAlerts, setScheduledAlerts] = useState<ScheduledAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Flag para evitar memory leaks - previne setState em componentes desmontados
  const isMountedRef = useRef(true);

  // Carregar notificações agendadas ao montar o hook
  useEffect(() => {
    loadScheduledNotifications();

    // Listeners para quando notificação é recebida ou clicada
    let unsubscribeReceived: (() => void) | null = null;
    let unsubscribeResponse: (() => void) | null = null;

    try {
      unsubscribeReceived = subscriptionNotificationService.setupNotificationReceivedListener(
        (notification) => {
          console.log('Notificação recebida:', notification);
        }
      );

      unsubscribeResponse = subscriptionNotificationService.setupNotificationResponseListener(
        (notification) => {
          console.log('Notificação clicada:', notification);
          // Aqui você pode navegar para uma tela específica ou executar uma ação
        }
      );
    } catch (error) {
      console.warn('Erro ao configurar listeners:', error);
    }

    return () => {
      isMountedRef.current = false;
      if (unsubscribeReceived) unsubscribeReceived();
      if (unsubscribeResponse) unsubscribeResponse();
    };
  }, []);

  const loadScheduledNotifications = useCallback(async () => {
    try {
      if (!isMountedRef.current) return;
      setIsLoading(true);
      setError(null);
      const scheduled = await subscriptionNotificationService.getScheduledNotifications();

      const alerts: ScheduledAlert[] = scheduled.map((notification) => ({
        subscriptionName: notification.content.data?.subscriptionName || 'Desconhecido',
        expirationDate: notification.content.data?.expirationDate
          ? new Date(notification.content.data.expirationDate)
          : new Date(),
        notificationId: notification.identifier,
        daysBeforeExpiration: notification.content.data?.daysBeforeExpiration || 7,
      }));

      if (isMountedRef.current) {
        setScheduledAlerts(alerts);
        setIsLoading(false);
      }
    } catch (error) {
      if (isMountedRef.current) {
        setError(`Erro ao carregar notificações: ${error}`);
        setIsLoading(false);
      }
    }
  }, []);

  const scheduleAlert = useCallback(
    async (subscriptionName: string, expirationDate: Date, daysBeforeExpiration: number = 7) => {
      try {
        if (!isMountedRef.current) return '';
        setIsLoading(true);
        setError(null);

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

        if (isMountedRef.current) {
          setScheduledAlerts((prev) => [...prev, newAlert]);
          setIsLoading(false);
        }

        return notificationId;
      } catch (error) {
        const errorMessage = `Erro ao agendar alerta: ${error}`;
        if (isMountedRef.current) {
          setError(errorMessage);
          setIsLoading(false);
        }
        throw error;
      }
    },
    []
  );

  const cancelAlert = useCallback(async (notificationId: string) => {
    try {
      if (!isMountedRef.current) return;
      setIsLoading(true);
      setError(null);

      await subscriptionNotificationService.cancelNotification(notificationId);

      if (isMountedRef.current) {
        setScheduledAlerts((prev) =>
          prev.filter((alert) => alert.notificationId !== notificationId)
        );
        setIsLoading(false);
      }
    } catch (error) {
      const errorMessage = `Erro ao cancelar alerta: ${error}`;
      if (isMountedRef.current) {
        setError(errorMessage);
        setIsLoading(false);
      }
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
        if (!isMountedRef.current) return '';
        setIsLoading(true);
        setError(null);

        const newNotificationId =
          await subscriptionNotificationService.rescheduleExpirationAlert(
            previousNotificationId,
            subscriptionName,
            expirationDate,
            daysBeforeExpiration
          );

        if (isMountedRef.current) {
          setScheduledAlerts((prev) =>
            prev
              .filter((alert) => alert.notificationId !== previousNotificationId)
              .concat([
                {
                  subscriptionName,
                  expirationDate,
                  notificationId: newNotificationId,
                  daysBeforeExpiration,
                },
              ])
          );
          setIsLoading(false);
        }

        return newNotificationId;
      } catch (error) {
        const errorMessage = `Erro ao atualizar alerta: ${error}`;
        if (isMountedRef.current) {
          setError(errorMessage);
          setIsLoading(false);
        }
        throw error;
      }
    },
    []
  );

  const clearAllAlerts = useCallback(async () => {
    try {
      if (!isMountedRef.current) return;
      setIsLoading(true);
      setError(null);
      await subscriptionNotificationService.clearAllScheduledNotifications();

      if (isMountedRef.current) {
        setScheduledAlerts([]);
        setIsLoading(false);
      }
    } catch (error) {
      const errorMessage = `Erro ao limpar alertas: ${error}`;
      if (isMountedRef.current) {
        setError(errorMessage);
        setIsLoading(false);
      }
      throw error;
    }
  }, []);

  const resetError = useCallback(() => {
    if (isMountedRef.current) {
      setError(null);
    }
  }, []);

  return {
    // State
    scheduledAlerts,
    isLoading,
    error,

    // Actions
    scheduleAlert,
    cancelAlert,
    updateAlert,
    clearAllAlerts,
    loadScheduledNotifications,
    resetError,
  };
};
