// Router para navegação entre telas.
import React, { useState, useMemo } from 'react';

// Componentes nativos para botão, lista e estilos.
import { Alert, FlatList, Pressable, StyleSheet, Modal, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';

// Componentes tematizados do projeto.
import { Text, View } from '@/components/Themed';

// Hook reativo que já alimenta a dashboard.
import { useSubscriptions, type SubscriptionItem, type SubscriptionStatus } from '@/database/hooks/useSubscriptions';
import SearchBar from '../../src/components/UI/SearchBar';
import { formatCurrencyByCode, formatCurrencyInput, parseCurrencyStringToNumber } from '../../src/utils/formatCurrency';
import { useTopAlert } from '../../src/hooks/useTopAlert';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import {
  buildSubscriptionDueDate,
  splitSubscriptionDueDate,
  SUBSCRIPTION_RECURRENCE_OPTIONS,
  type SubscriptionRecurrence,
} from '../../src/utils/subscriptionSchedule';

// Ícones
import CardItem from '../../src/components/UI/CardItem';

// Tela principal da aba Dashboard.
export default function TabOneScreen() {
  const { TopAlert, showError, showSuccess } = useTopAlert();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Dados derivados do banco (reativos).
  const { loading, items, totalExpenses, updateSubscription, deleteSubscription, setSubscriptionStatus, categories } = useSubscriptions();

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

  const expenseSummary = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + item.value;
        return acc;
      },
      { active: 0, inactive: 0, cancelled: 0 } as Record<SubscriptionStatus, number>
    );
  }, [items]);

  const chartData = useMemo(() => {
    const entries = [
      { key: 'active' as const, label: 'Ativas', color: colors.chartActive },
      { key: 'inactive' as const, label: 'Inativas', color: colors.chartInactive },
      { key: 'cancelled' as const, label: 'Canceladas', color: colors.chartCancelled },
    ];

    const maxValue = Math.max(...entries.map((entry) => expenseSummary[entry.key]), 1);

    return entries.map((entry) => ({
      ...entry,
      value: expenseSummary[entry.key],
      width: `${Math.max((expenseSummary[entry.key] / maxValue) * 100, 8)}%` as `${number}%`,
    }));
  }, [expenseSummary, colors]);

  // Estados para o modal de edição
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

  // Função para abrir modal de edição
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

  // Função para salvar edição
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
    <View style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={(
          <>
            <TopAlert />

            <View style={styles.summaryGrid}>
              <View style={[styles.summaryCard, styles.summaryCardPrimary, { backgroundColor: colors.tint }]}>
                  <Text style={[styles.summaryLabel, { color: colors.textInverse }]}>Gasto total</Text>
                  <Text style={[styles.summaryValue, { color: colors.textInverse }]}>{formatCurrencyByCode(totalExpenses, 'BRL')}</Text>
                  <Text style={[styles.summaryHint, { color: colors.textInverse }]}>Somando todas as assinaturas</Text>
                </View>

              <View style={styles.summaryRow}>
                <View style={[styles.summaryMiniCard, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Ativas</Text>
                  <Text style={[styles.summaryMiniValue, { color: colors.text }]}>{formatCurrencyByCode(expenseSummary.active, 'BRL')}</Text>
                </View>
                <View style={[styles.summaryMiniCard, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Canceladas</Text>
                  <Text style={[styles.summaryMiniValue, { color: colors.text }]}>{formatCurrencyByCode(expenseSummary.cancelled, 'BRL')}</Text>
                </View>
              </View>
            </View>

            <View style={styles.chartSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Distribuição dos gastos</Text>
              <View style={[styles.chartCard, { backgroundColor: colors.chartCardBackground, borderColor: colors.cardBorder }]}>
                {chartData.map((item) => (
                  <View key={item.key} style={styles.chartItem}>
                    <View style={styles.chartHeader}>
                      <Text style={[styles.chartLabel, { color: colors.text }]}>{item.label}</Text>
                      <Text style={[styles.chartValue, { color: colors.textSecondary }]}>{formatCurrencyByCode(item.value, 'BRL')}</Text>
                    </View>
                    <View style={[styles.chartTrack, { backgroundColor: colors.chartTrackBg }]}>
                      <View style={[styles.chartFill, { width: item.width, backgroundColor: item.color }]} />
                    </View>
                  </View>
                ))}
              </View>
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
          </>
        )}
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
                placeholder="Ex: BRL, USD"
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
  container: {
    flex: 1,
    padding: 16,
  },
  listContainer: {
    paddingBottom: 32,
    gap: 6,
  },
  summaryGrid: {
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    borderRadius: 18,
    padding: 18,
  },
  summaryCardPrimary: {
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryMiniCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  summaryValue: {
    marginTop: 8,
    fontSize: 26,
    fontWeight: '800',
  },
  summaryMiniValue: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '800',
  },
  summaryHint: {
    marginTop: 6,
    fontSize: 12,
  },
  chartSection: {
    marginBottom: 16,
  },
  chartCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartItem: {
    gap: 10,
    paddingBottom: 4,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chartLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  chartValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  chartTrack: {
    height: 12,
    borderRadius: 999,
    overflow: 'hidden',
  },
  chartFill: {
    height: '100%',
    borderRadius: 999,
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
  filterItem: { padding: 8, borderRadius: 8, marginRight: 8 },
  filterActive: { fontWeight: '600' },
  cardsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  card: { borderRadius: 12, padding: 16, flex: 1, marginRight: 8 },
  cardLabel: { fontWeight: '600' },
  cardValue: { fontSize: 20, fontWeight: '800', marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginVertical: 12 },
  chartPlaceholder: { borderRadius: 12, height: 200, justifyContent: 'center', alignItems: 'center' },
  addButton: {
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
  emptyMessage: {
    marginTop: 12,
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
    borderRadius: 10,
    marginBottom: 10,
  },
  menuActionText: {
    fontSize: 15,
    fontWeight: '600',
  },
  menuDangerButton: {
    // Color applied via inline style
  },
  menuDangerText: {
    // Color applied via inline style
  },
  menuCloseButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  menuCloseText: {
    fontSize: 15,
    fontWeight: '700',
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
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
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
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
  },
  picker: {
    height: 50,
    width: '100%',
  },
});