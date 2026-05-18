/*
  CardItem.tsx
  Card de lista para exibir informações resumidas de uma assinatura.

  Comentários (pt-br):
  - Este componente representa uma linha da lista (card) no estilo do design.
  - Contém ícone, nome do serviço, periodicidade e valor.
  - Possui callbacks `onPress` e `onEdit` para navegação/ações do usuário.
  - Mantive o componente genérico para reutilização em Dashboard e Listas.
*/

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Badge from './Badge';
import { formatCurrencyByCode } from '../../utils/formatCurrency';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import type { SubscriptionStatus } from '@/database/hooks/useSubscriptions';
import { formatSubscriptionDueDate, getSubscriptionRecurrenceLabel, type SubscriptionRecurrence } from '../../utils/subscriptionSchedule';

interface Props {
  id: string;
  serviceName: string;
  iconName?: string;
  value: number;
  currency: string;
  billingDate: number;
  status: SubscriptionStatus;
  recurrence: SubscriptionRecurrence;
  dueDate?: string;
  onPress?: () => void;
  onMenuPress?: () => void;
}

export const CardItem: React.FC<Props> = ({ serviceName, iconName = 'music', value, currency, billingDate, status, recurrence, dueDate, onPress, onMenuPress }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const formattedValue = formatCurrencyByCode(value, currency);
  const badgeText = status === 'inactive' ? 'Inativa' : status === 'cancelled' ? 'Cancelada' : '';
  const badgeColor = status === 'inactive' ? colors.inactiveBg : colors.cancelledBg;
  const badgeTextColor = status === 'inactive' ? colors.inactiveText : colors.cancelledText;
  const scheduleLabel = `${getSubscriptionRecurrenceLabel(recurrence)} • ${formatSubscriptionDueDate(dueDate, billingDate)}`;

  // Componente visual que aplica o layout do design: ícone + texto + ações
  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]} 
      onPress={onPress} 
      activeOpacity={0.8}
    >
      <View style={styles.left}> 
        <View style={[styles.iconPlaceholder, { backgroundColor: colors.iconPlaceholderBg }]}>
          <FontAwesome name={iconName as any} size={22} color={colors.iconPrimary} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.title, { color: colors.text }]}>{serviceName}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{scheduleLabel}</Text>
          <Text style={[styles.price, { color: colors.text }]}>{formattedValue}</Text>
        </View>
      </View>

      <View style={styles.right}>
        {badgeText ? (
          <Badge text={badgeText} color={badgeColor} textColor={badgeTextColor} />
        ) : null}
        <TouchableOpacity onPress={onMenuPress} style={styles.editButton}>
          <FontAwesome name="ellipsis-v" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: { flex: 1 },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  subtitle: { fontSize: 13, marginVertical: 2 },
  price: { fontSize: 16, fontWeight: '800', marginTop: 4 },
  right: { alignItems: 'flex-end', marginLeft: 8 },
  editButton: { padding: 6, marginTop: 6 },
});

export default CardItem;
