/**
 * Tipos de dados para Assinatura/Contrato
 */

export interface SubscriptionFrequency {
  type: 'monthly' | 'yearly' | 'weekly' | 'daily' | 'custom';
  interval: number; // para custom: número de dias
}

export type SubscriptionRecurrence = 'mensal' | 'trimestral' | 'semestral' | 'anual';

export interface Subscription {
  id: string;
  name: string;
  description?: string;
  serviceName: string; // Nome do serviço (ex: "Netflix", "Spotify")
  category?: string; // Categoria (ex: "Streaming", "Produtividade")
  price: number; // Valor em reais
  currency: 'BRL' | 'USD' | 'EUR';
  recurrence: SubscriptionRecurrence;
  dueDate?: string; // Data de vencimento no formato YYYY-MM-DD
  frequency: SubscriptionFrequency;
  startDate: Date;
  expirationDate: Date; // Data de renovação/vencimento
  isActive: boolean;
  paymentMethod?: string; // Método de pagamento (ex: "Cartão de Crédito")
  reminderDaysBefore?: number; // Dias antes para alertar (padrão: 7)
  notificationId?: string; // ID da notificação agendada
  notificationEnabled: boolean; // Se alerta está ativado
  url?: string; // URL do serviço
  notes?: string; // Notas do usuário
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date; // Soft delete
}

export interface SubscriptionStats {
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
  totalMonthlyExpense: number;
  totalYearlyExpense: number;
  expiringThisWeek: Subscription[];
  expiringThisMonth: Subscription[];
}

export interface CreateSubscriptionDTO {
  name: string;
  description?: string;
  serviceName: string;
  category?: string;
  price: number;
  currency: 'BRL' | 'USD' | 'EUR';
  recurrence: SubscriptionRecurrence;
  dueDate?: string;
  frequency: SubscriptionFrequency;
  startDate: Date;
  expirationDate: Date;
  paymentMethod?: string;
  reminderDaysBefore?: number;
  url?: string;
  notes?: string;
}

export interface UpdateSubscriptionDTO {
  name?: string;
  description?: string;
  serviceName?: string;
  category?: string;
  price?: number;
  recurrence?: SubscriptionRecurrence;
  dueDate?: string;
  frequency?: SubscriptionFrequency;
  expirationDate?: Date;
  paymentMethod?: string;
  reminderDaysBefore?: number;
  notificationEnabled?: boolean;
  url?: string;
  notes?: string;
}
