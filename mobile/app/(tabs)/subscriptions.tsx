import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { Text, View } from '@/components/Themed';
import { useSubscriptions, type SubscriptionItem, type SubscriptionStatus } from '@/database/hooks/useSubscriptions';
import SearchBar from '../../src/components/UI/SearchBar';
import CardItem from '../../src/components/UI/CardItem';

const FILTERS = [
  { label: 'Todas', value: 'all' },
  { label: 'Ativas', value: 'active' },
  { label: 'Canceladas', value: 'cancelled' },
  { label: 'Vencidas', value: 'expired' },
] as const;

type FilterValue = (typeof FILTERS)[number]['value'];

export default function SubscriptionsScreen() {
  const router = useRouter();
  const { loading, items, deleteSubscription, setSubscriptionStatus } = useSubscriptions();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterValue>('all');
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionItem | null>(null);

  const now = new Date();

  const filteredItems = useMemo(() => {
    const base = items.filter((item) => {
      const matchesSearch = item.serviceName.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;

      if (filter === 'all') return true;
      if (filter === 'active') return item.status === 'active';
      if (filter === 'cancelled') return item.status === 'cancelled';
      if (filter === 'expired') {
        return item.status === 'active' && item.dueDate ? new Date(item.dueDate) < now : false;
      }
      return true;
    });

    return base.sort((a, b) => new Date(a.dueDate || '').getTime() - new Date(b.dueDate || '').getTime());
  }, [items, filter, search, now]);

  function openMenu(subscription: SubscriptionItem) {
    setSelectedSubscription(subscription);
    setMenuVisible(true);
  }

  function closeMenu() {
    setMenuVisible(false);
  }

  function handleEdit() {
    if (!selectedSubscription) return;
    closeMenu();
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
            closeMenu();
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
    closeMenu();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Assinaturas</Text>
      <Text style={styles.subtitle}>Veja todas as suas assinaturas e gerencie com facilidade.</Text>

      <SearchBar value={search} onChange={setSearch} placeholder="Buscar assinaturas..." />

      <View style={styles.filterRow}>
        {FILTERS.map((item) => (
          <Pressable
            key={item.value}
            style={[styles.filterButton, filter === item.value ? styles.filterButtonActive : null]}
            onPress={() => setFilter(item.value)}
          >
            <Text style={[styles.filterText, filter === item.value ? styles.filterTextActive : null]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>{loading ? 'Carregando assinaturas...' : 'Nenhuma assinatura encontrada.'}</Text>
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
            onPress={() => openMenu(item)}
            onMenuPress={() => openMenu(item)}
          />
        )}
      />

      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={closeMenu}>
        <Pressable style={styles.modalOverlay} onPress={closeMenu}>
          <Pressable style={styles.menuBox} onPress={() => {}}>
            <Text style={styles.menuTitle}>Ações</Text>
            <Text style={styles.menuSubtitle}>{selectedSubscription?.serviceName}</Text>
            <Text style={styles.menuAction} onPress={handleEdit}>Editar assinatura</Text>
            <Text style={styles.menuAction} onPress={() => handleStatusChange('active')}>Marcar ativa</Text>
            <Text style={styles.menuAction} onPress={() => handleStatusChange('inactive')}>Marcar inativa</Text>
            <Text style={styles.menuAction} onPress={() => handleStatusChange('cancelled')}>Marcar cancelada</Text>
            <Text style={[styles.menuAction, styles.menuDanger]} onPress={handleDelete}>Excluir assinatura</Text>
            <Text style={styles.menuClose} onPress={closeMenu}>Fechar</Text>
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
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  subtitle: {
    color: '#6b7280',
    marginBottom: 18,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#f3f4f6',
  },
  filterButtonActive: {
    backgroundColor: '#7c3aed',
  },
  filterText: {
    color: '#111827',
    fontWeight: '700',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContainer: {
    paddingBottom: 96,
  },
  emptyText: {
    marginTop: 24,
    color: '#6b7280',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  menuBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  menuTitle: {
    fontSize: 18,
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
