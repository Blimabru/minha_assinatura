import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { Text, View } from '@/components/Themed';
import { useSubscriptions, type SubscriptionItem, type SubscriptionStatus } from '@/database/hooks/useSubscriptions';
import CardItem from '../../src/components/UI/CardItem';

export default function HomeScreen() {
  const router = useRouter();
  const { loading, items, deleteSubscription, setSubscriptionStatus, totalExpenses } = useSubscriptions();
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionItem | null>(null);

  const upcomingItems = useMemo(() => {
    return items
      .filter((item) => item.status === 'active' && item.dueDate)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5);
  }, [items]);

  function openActionMenu(subscription: SubscriptionItem) {
    setSelectedSubscription(subscription);
    setMenuVisible(true);
  }

  function closeActionMenu() {
    setMenuVisible(false);
  }

  function handleEdit() {
    if (!selectedSubscription) return;
    closeActionMenu();
    router.push(`/edit?id=${selectedSubscription.id}`);
  }

  async function handleDelete() {
    if (!selectedSubscription) return;

    Alert.alert(
      'Excluir assinatura',
      `Deseja excluir "${selectedSubscription.serviceName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            if (!selectedSubscription) return;
            try {
              await deleteSubscription(selectedSubscription.id);
            } catch (error) {
              console.error(error);
              Alert.alert('Erro', 'Não foi possível excluir a assinatura.');
            }
            closeActionMenu();
          },
        },
      ]
    );
  }

  async function handleStatusChange(status: SubscriptionStatus) {
    if (!selectedSubscription) return;
    try {
      await setSubscriptionStatus(selectedSubscription.id, status);
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível alterar o status.');
    }
    closeActionMenu();
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greeting}>Olá, Kéven</Text>
          <Text style={styles.description}>Resumo rápido das próximas assinaturas.</Text>
        </View>
        <Pressable style={styles.bellButton} onPress={() => Alert.alert('Notificações', 'Não há novas notificações.')}> 
          <Text style={styles.bellIcon}>🔔</Text>
        </Pressable>
      </View>

      <View style={styles.summaryGrid}>
        <View style={[styles.summaryCard, styles.summaryCardPurple]}>
          <Text style={styles.cardLabel}>Custo Mensal</Text>
          <Text style={styles.cardValue}>{totalExpenses ? `R$ ${totalExpenses.toFixed(2).replace('.', ',')}` : 'R$ 0,00'}</Text>
        </View>
        <View style={[styles.summaryCard, styles.summaryCardOrange]}>
          <Text style={styles.cardLabel}>Assinaturas Ativas</Text>
          <Text style={styles.cardValue}>{items.filter((item) => item.status === 'active').length}</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Próximos Vencimentos</Text>
          <Text style={styles.sectionHint}>Acompanhe as cobranças mais próximas</Text>
        </View>
        <Text style={styles.linkText} onPress={() => router.push('/subscriptions')}>Ver todos</Text>
      </View>

      <FlatList
        data={upcomingItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>{loading ? 'Carregando...' : 'Nenhum vencimento próximo.'}</Text>
        }
        renderItem={({ item }) => (
          <CardItem
            id={item.id}
            serviceName={item.serviceName}
            iconName={item.categoryIcon}
            value={item.value}
            currency={item.currency}
            billingDate={item.billingDate}
            status={item.status}
            recurrence={item.recurrence}
            dueDate={item.dueDate}
            onPress={() => openActionMenu(item)}
            onMenuPress={() => openActionMenu(item)}
          />
        )}
      />

      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={closeActionMenu}>
        <Pressable style={styles.modalOverlay} onPress={closeActionMenu}>
          <Pressable style={styles.menuContent} onPress={() => {}}>
            <Text style={styles.menuTitle}>Opções</Text>
            <Text style={styles.menuSubtitle}>{selectedSubscription?.serviceName}</Text>
            <Text style={styles.menuAction} onPress={handleEdit}>Editar assinatura</Text>
            <Text style={styles.menuAction} onPress={() => handleStatusChange('active')}>Marcar como ativa</Text>
            <Text style={styles.menuAction} onPress={() => handleStatusChange('inactive')}>Marcar como inativa</Text>
            <Text style={styles.menuAction} onPress={() => handleStatusChange('cancelled')}>Marcar como cancelada</Text>
            <Text style={[styles.menuAction, styles.menuDanger]} onPress={handleDelete}>Excluir assinatura</Text>
            <Text style={styles.menuClose} onPress={closeActionMenu}>Fechar</Text>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f6ff',
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f8f6ff',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    backgroundColor: '#f8f6ff',
    fontWeight: '800',
    color: '#111827',
  },
  description: {
    fontSize: 14,
    backgroundColor: '#f8f6ff',
    color: '#6b7280',
  },
  bellButton: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
  },
  bellIcon: {
    fontSize: 20,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    minHeight: 130,
    justifyContent: 'space-between',
  },
  summaryCardPurple: {
    backgroundColor: '#8b5cf6',
  },
  summaryCardOrange: {
    backgroundColor: '#f97316',
  },
  cardLabel: {
    color: '#e0e7ff',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  cardValue: {
    marginTop: 18,
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
  },
  sectionHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f6ff',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    backgroundColor: '#f8f6ff',
    fontWeight: '800',
    color: '#111827',
  },
  sectionHint: {
    backgroundColor: '#f8f6ff',
    fontSize: 13,
    color: '#6b7280',
  },
  linkText: {
    color: '#7c3aed',
    fontWeight: '700',
    fontSize: 14,
  },
  listContainer: {
    paddingBottom: 100,
  },
  emptyText: {
    marginTop: 24,
    textAlign: 'center',
    color: '#6b7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  menuContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  menuSubtitle: {
    color: '#6b7280',
    marginBottom: 18,
  },
  menuAction: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#f3f4ff',
    color: '#3730a3',
    fontWeight: '700',
    marginBottom: 10,
  },
  menuDanger: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  menuClose: {
    textAlign: 'center',
    color: '#7c3aed',
    fontWeight: '800',
    marginTop: 8,
  },
});
