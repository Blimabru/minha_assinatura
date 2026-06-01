import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Platform, Alert } from 'react-native';
import { Text } from '@/components/Themed';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSubscriptions } from '@/database/hooks/useSubscriptions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { StatusBar } from 'expo-status-bar';

// Helper to calculate days remaining
const getDaysRemaining = (dueDateStr: string) => {
  if (!dueDateStr) return null;
  
  try {
    const parts = dueDateStr.split('-');
    if (parts.length !== 3) return null;
    
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    
    const dueDate = new Date(year, month, day);
    const today = new Date();
    
    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  } catch (e) {
    return null;
  }
};

export default function NotificationsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const { activeSubscriptions, loading } = useSubscriptions();
  const [readAll, setReadAll] = useState(false);

  // Dynamic renewal alerts (due within 7 days)
  const renewalNotifications = useMemo(() => {
    if (loading) return [];
    
    const alerts: any[] = [];
    activeSubscriptions.forEach((sub) => {
      const days = getDaysRemaining(sub.dueDate);
      if (days !== null && days >= 0 && days <= 7) {
        let title = '';
        let description = '';
        let type: 'critical' | 'warning' | 'info' = 'info';

        if (days === 0) {
          title = `Vence hoje: ${sub.serviceName}`;
          description = `Sua assinatura do serviço ${sub.serviceName} no valor de ${sub.currency} ${sub.value.toFixed(2)} vence hoje!`;
          type = 'critical';
        } else if (days === 1) {
          title = `Vence amanhã: ${sub.serviceName}`;
          description = `Sua assinatura do serviço ${sub.serviceName} vence amanhã. Prepare o pagamento de ${sub.currency} ${sub.value.toFixed(2)}.`;
          type = 'critical';
        } else {
          title = `Renovação próxima: ${sub.serviceName}`;
          description = `O vencimento de ${sub.serviceName} está chegando! Restam ${days} dias para a renovação.`;
          type = 'warning';
        }

        alerts.push({
          id: `renewal_${sub.id}`,
          title,
          description,
          icon: sub.categoryIcon || 'credit-card',
          time: days === 0 ? 'Hoje' : days === 1 ? 'Amanhã' : `Em ${days} dias`,
          type,
          isSystem: false,
        });
      }
    });
    
    return alerts;
  }, [activeSubscriptions, loading]);

  // Promotional Notifications
  const promoNotifications = useMemo(() => {
    return [
      {
        id: 'promo_1',
        title: 'Desconto Exclusivo HostCloud',
        description: 'Aproveite 30% de desconto na HostCloud usando o cupom CLOUD30 na aba de Cupons!',
        icon: 'tag',
        time: 'Ativo',
        type: 'info',
        isSystem: true,
        route: '/discounts-page',
      },
      {
        id: 'promo_2',
        title: 'Ganhe Milhas em Dobro!',
        description: 'Conecte seu cartão de crédito na MilesUp e acumule em dobro hoje.',
        icon: 'plane',
        time: 'Novo',
        type: 'info',
        isSystem: true,
      },
    ];
  }, []);

  const allNotifications = useMemo(() => {
    if (readAll) return [];
    return [...renewalNotifications, ...promoNotifications];
  }, [renewalNotifications, promoNotifications, readAll]);

  const handleMarkAsRead = async () => {
    try {
      await AsyncStorage.setItem('notifications_read', 'true');
      setReadAll(true);
      Alert.alert('Sucesso', 'Todas as notificações foram marcadas como lidas.');
      router.back();
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      
      {/* Action Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Notificações</Text>
        {allNotifications.length > 0 && (
          <Pressable onPress={handleMarkAsRead} style={styles.markReadButton}>
            <FontAwesome name="check-square-o" size={14} color={colors.tint} />
            <Text style={[styles.markReadText, { color: colors.tint }]}>Marcar como lidas</Text>
          </Pressable>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {allNotifications.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.bellBox, { backgroundColor: colors.backgroundTertiary }]}>
              <FontAwesome name="bell-o" size={56} color={colors.textTertiary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Tudo limpo por aqui!</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Você não tem notificações pendentes. Novas atualizações e lembretes aparecerão aqui.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {allNotifications.map((notif) => (
              <Pressable
                key={notif.id}
                onPress={() => {
                  if (notif.route) {
                    router.push(notif.route as any);
                  }
                }}
                style={({ pressed }) => [
                  styles.card,
                  { 
                    backgroundColor: colors.cardBackground, 
                    borderColor: colors.cardBorder,
                    opacity: pressed ? 0.9 : 1
                  }
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.titleRow}>
                    <View 
                      style={[
                        styles.iconCircle, 
                        { 
                          backgroundColor: 
                            notif.type === 'critical' ? '#FEE2E2' : 
                            notif.type === 'warning' ? '#FEF3C7' : colors.backgroundTertiary 
                        }
                      ]}
                    >
                      <FontAwesome 
                        name={notif.icon as any} 
                        size={14} 
                        color={
                          notif.type === 'critical' ? '#EF4444' : 
                          notif.type === 'warning' ? '#F59E0B' : colors.tint
                        } 
                      />
                    </View>
                    <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
                      {notif.title}
                    </Text>
                  </View>
                  <View style={[styles.timeBadge, { backgroundColor: colors.backgroundTertiary }]}>
                    <Text style={[styles.timeText, { color: colors.textSecondary }]}>{notif.time}</Text>
                  </View>
                </View>
                <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
                  {notif.description}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  markReadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  markReadText: {
    fontSize: 13,
    fontWeight: '600',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  bellBox: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    opacity: 0.8,
  },
  list: {
    gap: 12,
  },
  card: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  timeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  timeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  cardDescription: {
    fontSize: 12,
    lineHeight: 16,
    paddingLeft: 38, // align with title text
  },
});
