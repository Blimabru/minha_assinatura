// Router para navegação entre telas.
import React, { useState, useMemo } from 'react';

// Componentes nativos para botão, lista e estilos.
import { Alert, FlatList, Pressable, StyleSheet, Modal, TouchableOpacity, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';

// Componentes tematizados do projeto.
import { Text, View } from '@/components/Themed';

// Hook reativo que já alimenta a dashboard.
import { useSubscriptions, type SubscriptionItem, type SubscriptionStatus } from '@/database/hooks/useSubscriptions';
import SearchBar from '../../src/components/UI/SearchBar';
import { formatCurrencyInput, parseCurrencyStringToNumber } from '../../src/utils/formatCurrency';
import { useTopAlert } from '../../src/hooks/useTopAlert';

// Ícones
import CardItem from '../../src/components/UI/CardItem';

// Tela principal da aba Dashboard.
export default function TabOneScreen() {
  const { TopAlert, showError, showSuccess } = useTopAlert();

  // Dados derivados do banco (reativos).
  const { loading, items, activeSubscriptions, monthlyTotal, updateSubscription, deleteSubscription, setSubscriptionStatus, categories } = useSubscriptions();

  // Estados para busca/filtragem (movido de subscriptions.tsx)
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'cancelled'>('all');

  const filtered = useMemo(() => {
    const base =
      filter === 'all'
        ? items
        : filter === 'active'
          ? items.filter((i) => i.status === 'active')
          : items.filter((i) => i.status === filter);
    return base.filter(i => i.serviceName.toLowerCase().includes(query.toLowerCase()));
  }, [items, filter, query]);

  // Estados para o modal de edição
  const [modalVisible, setModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionItem | null>(null);
  const [editServiceName, setEditServiceName] = useState('');
  const [editValue, setEditValue] = useState('');
  const [editCurrency, setEditCurrency] = useState('');
  const [editBillingDate, setEditBillingDate] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');

  // Função para abrir modal de edição
  function openEditModal(subscription: SubscriptionItem) {
    setSelectedSubscription(subscription);
    setEditServiceName(subscription.serviceName);
    setEditValue(formatCurrencyInput(String(Math.round(subscription.value * 100))));
    setEditCurrency(subscription.currency);
    setEditBillingDate(subscription.billingDate.toString());
    setEditCategoryId(subscription.categoryId);
    setModalVisible(true);
  }

  function openActionMenu(subscription: SubscriptionItem) {
    setSelectedSubscription(subscription);
    setMenuVisible(true);
  }

  function closeActionMenu() {
    setMenuVisible(false);
  }

  // Função para salvar edição
  async function handleSaveEdit() {
    if (!selectedSubscription) return;

    const newValue = parseCurrencyStringToNumber(editValue);
    const newBillingDate = parseInt(editBillingDate);

    if (!editServiceName.trim()) {
      showError('Nome do serviço é obrigatório.');
      return;
    }

    if (isNaN(newValue) || newValue <= 0) {
      showError('Valor deve ser um número positivo.');
      return;
    }

    if (!editCurrency.trim()) {
      showError('Moeda é obrigatória.');
      return;
    }

    if (isNaN(newBillingDate) || newBillingDate < 1 || newBillingDate > 31) {
      showError('Data de vencimento deve ser um dia válido (1-31).');
      return;
    }

    if (!editCategoryId) {
      showError('Categoria é obrigatória.');
      return;
    }

    try {
      await updateSubscription(selectedSubscription.id, {
        serviceName: editServiceName.trim(),
        value: newValue,
        currency: editCurrency.trim(),
        billingDate: newBillingDate,
        categoryId: editCategoryId,
      });
      showSuccess('Assinatura atualizada com sucesso.');
      setModalVisible(false);
    } catch (error) {
      console.error(error);
      showError('Não foi possível salvar as alterações.');
    }
  }

  async function handleChangeStatus(status: SubscriptionStatus) {
    if (!selectedSubscription) return;

    try {
      await setSubscriptionStatus(selectedSubscription.id, status);
      const statusLabel = status === 'active' ? 'ativa' : status === 'inactive' ? 'inativa' : 'cancelada';
      showSuccess(`Assinatura marcada como ${statusLabel}.`);
      closeActionMenu();
    } catch (error) {
      console.error(error);
      showError('Não foi possível alterar o status da assinatura.');
    }
  }

  function handleDeleteSubscription() {
    if (!selectedSubscription) return;

    Alert.alert(
      'Excluir assinatura',
      `Deseja excluir "${selectedSubscription.serviceName}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSubscription(selectedSubscription.id);
              showSuccess('Assinatura excluída com sucesso.');
              closeActionMenu();
            } catch (error) {
              console.error(error);
              showError('Não foi possível excluir a assinatura.');
            }
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <TopAlert />
      
      {/* Search and filters (from Subscriptions screen) */}
      <SearchBar value={query} onChange={setQuery} placeholder="Buscar assinaturas..." />
      <View style={styles.filters}>
        {[
          { label: 'Todas', value: 'all' },
          { label: 'Ativas', value: 'active' },
          { label: 'Inativas', value: 'inactive' },
          { label: 'Canceladas', value: 'cancelled' },
        ].map((item) => (
          <Text
            key={item.value}
            onPress={() => setFilter(item.value as 'all' | 'active' | 'inactive' | 'cancelled')}
            style={[styles.filterItem, filter === item.value ? styles.filterActive : null]}
          >
            {item.label}
          </Text>
        ))}
      </View>

      {loading ? (
        <Text>Carregando assinaturas...</Text>
      ) : filtered.length === 0 ? (
        <Text>Nenhuma assinatura encontrada.</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <CardItem
              id={item.id}
              serviceName={item.serviceName}
              iconName={item.categoryIcon}
              value={item.value}
              currency={item.currency}
              billingDate={item.billingDate}
              status={item.status}
              onPress={() => openEditModal(item)}
              onMenuPress={() => openActionMenu(item)}
            />
          )}
        />
      )}

      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={closeActionMenu}>
        <Pressable style={styles.menuOverlay} onPress={closeActionMenu}>
          <Pressable style={styles.menuContainer} onPress={() => {}}>
            <Text style={styles.menuTitle}>Ações da assinatura</Text>
            <Text style={styles.menuSubtitle}>{selectedSubscription?.serviceName}</Text>

            <Pressable style={styles.menuActionButton} onPress={() => {
              if (selectedSubscription) {
                closeActionMenu();
                openEditModal(selectedSubscription);
              }
            }}>
              <Text style={styles.menuActionText}>Editar assinatura</Text>
            </Pressable>

            <Pressable style={styles.menuActionButton} onPress={() => handleChangeStatus('active')}>
              <Text style={styles.menuActionText}>Marcar como ativa</Text>
            </Pressable>

            <Pressable style={styles.menuActionButton} onPress={() => handleChangeStatus('inactive')}>
              <Text style={styles.menuActionText}>Marcar como inativa</Text>
            </Pressable>

            <Pressable style={styles.menuActionButton} onPress={() => handleChangeStatus('cancelled')}>
              <Text style={styles.menuActionText}>Marcar como cancelada</Text>
            </Pressable>

            <Pressable style={[styles.menuActionButton, styles.menuDangerButton]} onPress={handleDeleteSubscription}>
              <Text style={[styles.menuActionText, styles.menuDangerText]}>Excluir assinatura</Text>
            </Pressable>

            <Pressable style={styles.menuCloseButton} onPress={closeActionMenu}>
              <Text style={styles.menuCloseText}>Fechar</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Editar Assinatura</Text>
          {selectedSubscription && (
            <>
              <Text style={styles.modalLabel}>Nome do Serviço:</Text>
              <TextInput
                style={styles.input}
                value={editServiceName}
                onChangeText={setEditServiceName}
                placeholder="Ex: Netflix"
              />

              <Text style={styles.modalLabel}>Valor:</Text>
              <TextInput
                style={styles.input}
                value={editValue}
                onChangeText={(t) => setEditValue(formatCurrencyInput(t))}
                keyboardType="numeric"
                placeholder="Ex: 39.90"
              />

              <Text style={styles.modalLabel}>Moeda:</Text>
              <TextInput
                style={styles.input}
                value={editCurrency}
                onChangeText={setEditCurrency}
                placeholder="Ex: BRL, USD"
              />

              <Text style={styles.modalLabel}>Dia de Vencimento:</Text>
              <TextInput
                style={styles.input}
                value={editBillingDate}
                onChangeText={setEditBillingDate}
                keyboardType="numeric"
                placeholder="Ex: 10"
              />

              <Text style={styles.modalLabel}>Categoria:</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={editCategoryId}
                  onValueChange={(itemValue: string) => setEditCategoryId(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Selecione uma categoria" value="" />
                  {categories.map((category) => (
                    <Picker.Item key={category.id} label={category.name} value={category.id} />
                  ))}
                </Picker>
              </View>

              <Pressable style={styles.saveButton} onPress={handleSaveEdit}>
                <Text style={styles.saveButtonText}>Salvar</Text>
              </Pressable>
              <Pressable style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  total: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  filters: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  filterItem: { padding: 8, backgroundColor: '#e9e9e9', borderRadius: 8, marginRight: 8 },
  filterActive: { backgroundColor: '#ddd' },
  cardsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, flex: 1, marginRight: 8 },
  cardLabel: { color: '#666', fontWeight: '600' },
  cardValue: { fontSize: 20, fontWeight: '800', marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginVertical: 12 },
  chartPlaceholder: { backgroundColor: '#fff', borderRadius: 12, height: 200, justifyContent: 'center', alignItems: 'center' },
  addButton: {
    backgroundColor: '#0b7a5a',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  list: {
    gap: 12,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  menuSubtitle: {
    marginTop: 4,
    marginBottom: 16,
    color: '#666',
  },
  menuActionButton: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#f4f4f4',
    marginBottom: 10,
  },
  menuActionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
  },
  menuDangerButton: {
    backgroundColor: '#fff1f1',
  },
  menuDangerText: {
    color: '#b42318',
  },
  menuCloseButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  menuCloseText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#007bff',
  },
  cardContent: {
    flex: 1,
  },
  editIcon: {
    padding: 8,
  },
  service: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  saveButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#ccc',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#000',
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
  },
  picker: {
    height: 50,
    width: '100%',
  },
});