// Router para navegação entre telas.
import React, { useState, useMemo } from 'react';

// Componentes nativos para botão, lista e estilos.
import { FlatList, Pressable, StyleSheet, Modal, TouchableOpacity, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';

// Componentes tematizados do projeto.
import { Text, View } from '@/components/Themed';

// Hook reativo que já alimenta a dashboard.
import { useSubscriptions, type SubscriptionItem } from '@/database/hooks/useSubscriptions';
import SearchBar from '@/components/UI/SearchBar';
import { formatCurrencyInput, parseCurrencyStringToNumber } from '../../src/utils/formatCurrency';
import { useTopAlert } from '../../src/hooks/useTopAlert.tsx';

// Ícones
import FontAwesome from '@expo/vector-icons/FontAwesome';
import CardItem from '@/components/UI/CardItem';

// Tela principal da aba Dashboard.
export default function TabOneScreen() {
  const { TopAlert, showError, showSuccess } = useTopAlert();

  // Dados derivados do banco (reativos).
  const { loading, items, activeSubscriptions, monthlyTotal, updateSubscription, categories } = useSubscriptions();

  // Estados para busca/filtragem (movido de subscriptions.tsx)
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'cancelled' | 'expired'>('all');

  const filtered = useMemo(() => {
    const base = filter === 'all' ? items : filter === 'active' ? items.filter(i => i.isActive) : items.filter(i => !i.isActive);
    return base.filter(i => i.serviceName.toLowerCase().includes(query.toLowerCase()));
  }, [items, filter, query]);

  // Estados para o modal de edição
  const [modalVisible, setModalVisible] = useState(false);
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
    setEditValue(formatCurrencyInput(subscription.value.toFixed(2).replace('.', ',')));
    setEditCurrency(subscription.currency);
    setEditBillingDate(subscription.billingDate.toString());
    setEditCategoryId(subscription.categoryId);
    setModalVisible(true);
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

  return (
    <View style={styles.container}>
      <TopAlert />
      
      {/* Search and filters (from Subscriptions screen) */}
      <SearchBar value={query} onChange={setQuery} placeholder="Buscar assinaturas..." />
      <View style={styles.filters}>
        {['Todas','Ativas','Canceladas','Expiradas'].map((f, idx) => (
          <Text key={f} onPress={() => setFilter(idx===0?'all':idx===1?'active':'cancelled')} style={[styles.filterItem, filter==='all' && idx===0?styles.filterActive:null]}>{f}</Text>
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
              value={item.value}
              currency={item.currency}
              billingDate={item.billingDate}
              isActive={item.isActive}
              onPress={() => openEditModal(item)}
              onEdit={() => openEditModal(item)}
            />
          )}
        />
      )}

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
  card: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d9d9d9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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