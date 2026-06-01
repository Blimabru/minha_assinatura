import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, StyleSheet, TextInput } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useSubscriptions, type SubscriptionItem, type SubscriptionStatus } from '@/database/hooks/useSubscriptions';
import SearchBar from '../../src/components/UI/SearchBar';
import CardItem from '../../src/components/UI/CardItem';
import { formatCurrencyInput, parseCurrencyStringToNumber } from '../../src/utils/formatCurrency';
import { useTopAlert } from '../../src/hooks/useTopAlert';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import {
  buildSubscriptionDueDate,
  splitSubscriptionDueDate,
  SUBSCRIPTION_RECURRENCE_OPTIONS,
  type SubscriptionRecurrence,
} from '../../src/utils/subscriptionSchedule';
import { Picker } from '@react-native-picker/picker';
import AdBanner from '@/components/AdBanner';

export default function SubscriptionsListScreen() {
  const { TopAlert, showError, showSuccess } = useTopAlert();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { loading, items, updateSubscription, deleteSubscription, setSubscriptionStatus, categories } = useSubscriptions();

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'cancelled'>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionItem | null>(null);
  const [editServiceName, setEditServiceName] = useState('');
  const [editValue, setEditValue] = useState('');
  const [editCurrency, setEditCurrency] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editRecurrence, setEditRecurrence] = useState<SubscriptionRecurrence>('mensal');
  const [editDueDay, setEditDueDay] = useState('');
  const [editDueMonth, setEditDueMonth] = useState('');
  const [editDueYear, setEditDueYear] = useState('');

  const filteredSubscriptions = useMemo(() => {
    const filteredByStatus =
      filter === 'all'
        ? items
        : filter === 'active'
          ? items.filter((item) => item.status === 'active')
          : items.filter((item) => item.status === filter);

    return filteredByStatus.filter((item) =>
      item.serviceName.toLowerCase().includes(query.toLowerCase()) ||
      item.categoryName.toLowerCase().includes(query.toLowerCase())
    );
  }, [items, filter, query]);

  function openEditModal(subscription: SubscriptionItem) {
    setSelectedSubscription(subscription);
    setEditServiceName(subscription.serviceName);
    setEditValue(formatCurrencyInput(String(Math.round(subscription.value * 100))));
    setEditCurrency(subscription.currency);
    setEditCategoryId(subscription.categoryId);
    setEditRecurrence(subscription.recurrence);
    const dueDateParts = splitSubscriptionDueDate(subscription.dueDate);
    setEditDueDay(dueDateParts.day || subscription.billingDate.toString().padStart(2, '0'));
    setEditDueMonth(dueDateParts.month || String(new Date().getMonth() + 1).padStart(2, '0'));
    setEditDueYear(dueDateParts.year || String(new Date().getFullYear()));
    setModalVisible(true);
  }

  function openActionMenu(subscription: SubscriptionItem) {
    setSelectedSubscription(subscription);
    setMenuVisible(true);
  }

  function closeActionMenu() {
    setMenuVisible(false);
  }

  async function handleSaveEdit() {
    if (!selectedSubscription) return;

    const newValue = parseCurrencyStringToNumber(editValue);

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

    if (!editRecurrence) {
      showError('Recorrência é obrigatória.');
      return;
    }

    const dueDate = buildSubscriptionDueDate(editDueDay, editDueMonth, editDueYear);
    if (!dueDate) {
      showError('Data de vencimento deve ser uma data válida.');
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
        billingDate: parseInt(editDueDay, 10),
        categoryId: editCategoryId,
        recurrence: editRecurrence,
        dueDate,
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
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <TopAlert />

      <View style={styles.headerAss}>
          <Text style={[styles.title, { color: colors.text }]}>Assinaturas</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Gerencie todas as assinaturas cadastradas.</Text>
      </View>

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
            style={[
              styles.filterItem,
              {
                backgroundColor: filter === item.value ? colors.tint : colors.backgroundTertiary,
                color: filter === item.value ? colors.textInverse : colors.text,
              },
              filter === item.value && styles.filterActive,
            ]}
          >
            {item.label}
          </Text>
        ))}
      </View>

      <FlatList
        data={filteredSubscriptions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={(
          <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}> 
            {loading ? 'Carregando assinaturas...' : 'Nenhuma assinatura encontrada.'}
          </Text>
        )}
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
            onPress={() => openEditModal(item)}
            onMenuPress={() => openActionMenu(item)}
          />
        )}
      />

      <AdBanner />

      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={closeActionMenu}>
        <Pressable style={styles.menuOverlay} onPress={closeActionMenu}>
          <Pressable style={[styles.menuContainer, { backgroundColor: colors.cardBackground }]} onPress={() => {}}>
            <Text style={[styles.menuTitle, { color: colors.text }]}>Ações da assinatura</Text>
            <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>{selectedSubscription?.serviceName}</Text>

            <Pressable style={[styles.menuActionButton, { backgroundColor: colors.backgroundTertiary }]} onPress={() => {
              if (selectedSubscription) {
                closeActionMenu();
                openEditModal(selectedSubscription);
              }
            }}>
              <Text style={[styles.menuActionText, { color: colors.text }]}>Editar assinatura</Text>
            </Pressable>

            <Pressable style={[styles.menuActionButton, { backgroundColor: colors.backgroundTertiary }]} onPress={() => handleChangeStatus('active')}>
              <Text style={[styles.menuActionText, { color: colors.text }]}>Marcar como ativa</Text>
            </Pressable>

            <Pressable style={[styles.menuActionButton, { backgroundColor: colors.backgroundTertiary }]} onPress={() => handleChangeStatus('inactive')}>
              <Text style={[styles.menuActionText, { color: colors.text }]}>Marcar como inativa</Text>
            </Pressable>

            <Pressable style={[styles.menuActionButton, { backgroundColor: colors.backgroundTertiary }]} onPress={() => handleChangeStatus('cancelled')}>
              <Text style={[styles.menuActionText, { color: colors.text }]}>Marcar como cancelada</Text>
            </Pressable>

            <Pressable style={[styles.menuActionButton, styles.menuDangerButton, { backgroundColor: colors.cancelledBg }]} onPress={handleDeleteSubscription}>
              <Text style={[styles.menuActionText, styles.menuDangerText, { color: colors.cancelledText }]}>Excluir assinatura</Text>
            </Pressable>

            <Pressable style={styles.menuCloseButton} onPress={closeActionMenu}>
              <Text style={[styles.menuCloseText, { color: colors.tint }]}>Fechar</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}> 
          <Text style={[styles.modalTitle, { color: colors.text }]}>Editar Assinatura</Text>
          {selectedSubscription && (
            <>
              <Text style={[styles.modalLabel, { color: colors.text }]}>Nome do Serviço:</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.inputBorder }]}
                value={editServiceName}
                onChangeText={setEditServiceName}
                placeholder="Ex: Netflix"
                placeholderTextColor={colors.textTertiary}
              />

              <Text style={[styles.modalLabel, { color: colors.text }]}>Valor:</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.inputBorder }]}
                value={editValue}
                onChangeText={(t) => setEditValue(formatCurrencyInput(t))}
                keyboardType="numeric"
                placeholder="Ex: 39.90"
                placeholderTextColor={colors.textTertiary}
              />

              <Text style={[styles.modalLabel, { color: colors.text }]}>Moeda:</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.inputBorder }]}
                value={editCurrency}
                onChangeText={setEditCurrency}
                placeholder="Ex: BRL"
                placeholderTextColor={colors.textTertiary}
              />

              <Text style={[styles.modalLabel, { color: colors.text }]}>Recorrência:</Text>
              <View style={[styles.pickerContainer, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}> 
                <Picker
                  selectedValue={editRecurrence}
                  onValueChange={(itemValue: SubscriptionRecurrence) => setEditRecurrence(itemValue)}
                  style={[styles.picker, { color: colors.text }]}
                >
                  {SUBSCRIPTION_RECURRENCE_OPTIONS.map((option) => (
                    <Picker.Item key={option.value} label={option.label} value={option.value} />
                  ))}
                </Picker>
              </View>

              <Text style={[styles.modalLabel, { color: colors.text }]}>Vencimento (dia / mês / ano):</Text>
              <View style={styles.dueDateRow}>
                <TextInput
                  style={[styles.input, styles.dueDateInput, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.inputBorder }]}
                  value={editDueDay}
                  onChangeText={setEditDueDay}
                  keyboardType="numeric"
                  placeholder="DD"
                  placeholderTextColor={colors.textTertiary}
                  maxLength={2}
                />
                <TextInput
                  style={[styles.input, styles.dueDateInput, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.inputBorder }]}
                  value={editDueMonth}
                  onChangeText={setEditDueMonth}
                  keyboardType="numeric"
                  placeholder="MM"
                  placeholderTextColor={colors.textTertiary}
                  maxLength={2}
                />
                <TextInput
                  style={[styles.input, styles.dueDateYearInput, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.inputBorder }]}
                  value={editDueYear}
                  onChangeText={setEditDueYear}
                  keyboardType="numeric"
                  placeholder="AAAA"
                  placeholderTextColor={colors.textTertiary}
                  maxLength={4}
                />
              </View>

              <Text style={[styles.modalLabel, { color: colors.text }]}>Categoria:</Text>
              <View style={[styles.pickerContainer, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}> 
                <Picker
                  selectedValue={editCategoryId}
                  onValueChange={(itemValue: string) => setEditCategoryId(itemValue)}
                  style={[styles.picker, { color: colors.text }]}
                >
                  <Picker.Item label="Selecione uma categoria" value="" />
                  {categories.map((category) => (
                    <Picker.Item key={category.id} label={category.name} value={category.id} />
                  ))}
                </Picker>
              </View>

              <Pressable style={[styles.saveButton, { backgroundColor: colors.tint }]} onPress={handleSaveEdit}>
                <Text style={styles.saveButtonText}>Salvar</Text>
              </Pressable>
              <Pressable style={[styles.cancelButton, { backgroundColor: colors.backgroundTertiary }]} onPress={() => setModalVisible(false)}>
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancelar</Text>
              </Pressable>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  headerAss: {
    marginTop: 30,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 16,
  },
  filters: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  filterItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    fontSize: 13,
  },
  filterActive: {
    fontWeight: '700',
  },
  listContainer: {
    paddingBottom: 32,
  },
  emptyMessage: {
    marginTop: 20,
    textAlign: 'center',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    padding: 20,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  menuSubtitle: {
    marginTop: 4,
    marginBottom: 16,
  },
  menuActionButton: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  menuActionText: {
    fontSize: 15,
    fontWeight: '600',
  },
  menuCloseButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  menuCloseText: {
    fontSize: 15,
    fontWeight: '700',
  },
  menuDangerButton: {
    marginTop: 4,
  },
  menuDangerText: {},
  modalContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 15,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    padding: 12,
    marginBottom: 15,
    borderRadius: 12,
    fontSize: 15,
  },
  dueDateRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  dueDateInput: {
    flex: 1,
    marginBottom: 0,
    textAlign: 'center',
  },
  dueDateYearInput: {
    flex: 1.4,
    marginBottom: 0,
    textAlign: 'center',
  },
  saveButton: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
  },
  picker: {
    height: 52,
    width: '100%',
  },
});