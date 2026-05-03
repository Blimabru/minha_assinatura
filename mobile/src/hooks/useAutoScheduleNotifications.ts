import { useCallback } from 'react';
import { useSubscriptionNotifications } from './useSubscriptionNotifications';

interface SubscriptionData {
  id: string;
  serviceName: string;
  expirationDate: Date;
  reminderDaysBefore?: number;
  notificationId?: string;
  isActive: boolean;
}

/**
 * Hook que integra o agendamento automático de notificações com o cadastro de assinaturas
 * 
 * Quando uma assinatura é criada ou atualizada, automaticamente agenda uma notificação
 * para alertar o usuário dias antes do vencimento
 */
export const useAutoScheduleNotifications = () => {
  const { scheduleAlert, updateAlert, cancelAlert } = useSubscriptionNotifications();

  /**
   * Agenda ou atualiza a notificação para uma assinatura
   * Deve ser chamada ao criar ou editar uma assinatura
   */
  const scheduleForSubscription = useCallback(
    async (subscription: SubscriptionData) => {
      try {
        if (!subscription.isActive) {
          return;
        }

        const reminderDays = subscription.reminderDaysBefore ?? 7; // Padrão: 7 dias antes

        // Se já tem notificação agendada, atualizar
        if (subscription.notificationId) {
          await updateAlert(
            subscription.notificationId,
            subscription.serviceName,
            new Date(subscription.expirationDate),
            reminderDays
          );
          console.log(`✓ Notificação atualizada para "${subscription.serviceName}"`);
          return subscription.notificationId;
        }

        // Caso contrário, agendar nova
        const notificationId = await scheduleAlert(
          subscription.serviceName,
          new Date(subscription.expirationDate),
          reminderDays
        );

        console.log(`✓ Notificação agendada para "${subscription.serviceName}" (ID: ${notificationId})`);
        return notificationId;
      } catch (error) {
        console.error(`Erro ao agendar notificação para "${subscription.serviceName}":`, error);
        throw error;
      }
    },
    [scheduleAlert, updateAlert]
  );

  /**
   * Cancela a notificação de uma assinatura
   * Deve ser chamada ao deletar uma assinatura ou desativar notificações
   */
  const cancelForSubscription = useCallback(
    async (subscription: SubscriptionData) => {
      try {
        if (!subscription.notificationId) {
          return;
        }

        await cancelAlert(subscription.notificationId);
        console.log(`✓ Notificação cancelada para "${subscription.serviceName}"`);
      } catch (error) {
        console.error(`Erro ao cancelar notificação para "${subscription.serviceName}":`, error);
        throw error;
      }
    },
    [cancelAlert]
  );

  return {
    scheduleForSubscription,
    cancelForSubscription,
  };
};
