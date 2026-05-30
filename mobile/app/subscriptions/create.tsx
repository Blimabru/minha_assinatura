import React, { useEffect, useState, useRef } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, FlatList, Modal, Pressable, View as RNView, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';

import { Text } from '@/components/Themed';
import { database } from '@/database';
import type User from '@/database/models/User';
import type Category from '@/database/models/Category';
import type Subscription from '@/database/models/Subscription';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { formatCurrencyInput, parseCurrencyStringToNumber } from '../../src/utils/formatCurrency';
import { useTopAlert } from '../../src/hooks/useTopAlert';
import {
  buildSubscriptionDueDate,
  SUBSCRIPTION_RECURRENCE_OPTIONS,
  type SubscriptionRecurrence,
} from '../../src/utils/subscriptionSchedule';

// Componentes de formulário (usando React Native nativo)
import FontAwesome from '@expo/vector-icons/FontAwesome';

// Tipo para dados do formulário
interface FormData {
  serviceName: string;
  value: string;
  currency: string;
  categoryId: string;
  recurrence: SubscriptionRecurrence;
  realizationDay: string;
  realizationMonth: string;
  realizationYear: string;
}

// Tipo para categorias
interface CategoryItem {
  id: string;
  name: string;
  icon: string;
}

const CURRENCIES = ['BRL', 'USD', 'EUR', 'GBP', 'JPY'];

export default function CreateSubscriptionScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { TopAlert, showError, showSuccess } = useTopAlert();

  // Estados do formulário
  const [formData, setFormData] = useState<FormData>({
    serviceName: '',
    value: '',
    currency: 'BRL',
    categoryId: '',
    recurrence: 'mensal',
    realizationDay: String(new Date().getDate()).padStart(2, '0'),
    realizationMonth: String(new Date().getMonth() + 1).padStart(2, '0'),
    realizationYear: String(new Date().getFullYear()),
  });

  // Estados de UI
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(
    new Date(
      parseInt(formData.realizationYear, 10) || new Date().getFullYear(),
      (parseInt(formData.realizationMonth, 10) - 1) || new Date().getMonth(),
      parseInt(formData.realizationDay, 10) || new Date().getDate()
    )
  );
  const datePickerRef = useRef<any>(null);



  // Modal para seletor de categoria
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  // Modal para seletor de moeda
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);

  // Efeito para carregar categorias e usuário padrão
  useEffect(() => {
    const load = async () => {
      try {
        const users = database.get<User>('users');
        const categoriesCollection = database.get<Category>('categories');

        // Obtém primeiro usuário (ou cria um padrão)
        let userList = await users.query().fetch();

        if (userList.length === 0) {
          // Cria usuário padrão se não existir
          await database.write(async () => {
            const createdUser = await users.create((user) => {
              user.name = 'Usuario Local';
              user.email = 'usuario.local@minhaassinatura.app';
              user.passwordHash = 'local_dev_only';
              user.currencyPreference = 'BRL';
            });
            setCurrentUserId(createdUser.id);
          });
          userList = await users.query().fetch();
        }

        if (userList.length > 0) {
          setCurrentUserId(userList[0].id);
        }

        // Carrega categorias
        const categoriesList = await categoriesCollection.query().fetch();

        if (categoriesList.length === 0) {
          // Cria categorias padrão se não existirem
          await database.write(async () => {
            const defaultCategories = [
              { name: 'Streaming', icon: 'tv' },
              { name: 'Produtividade', icon: 'briefcase' },
              { name: 'Música', icon: 'music' },
              { name: 'Fitness', icon: 'heart' },
              { name: 'Educação', icon: 'graduation-cap' },
              { name: 'Outros', icon: 'ellipsis-h' },
            ];

            for (const cat of defaultCategories) {
              await categoriesCollection.create((category) => {
                category.name = cat.name;
                category.icon = cat.icon;
              });
            }
          });

          const updatedCategories = await categoriesCollection.query().fetch();
          setCategories(
            updatedCategories.map((cat) => ({
              id: cat.id,
              name: cat.name,
              icon: cat.icon,
            }))
          );
        } else {
          setCategories(
            categoriesList.map((cat) => ({
              id: cat.id,
              name: cat.name,
              icon: cat.icon,
            }))
          );
        }
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        showError('Não foi possível carregar as categorias.');
      }
    };

    load();
  }, [showError]);

  // Validar campos obrigatórios
  function validateForm(): boolean {
    if (!formData.serviceName.trim()) {
      showError('Nome do serviço é obrigatório.');
      return false;
    }

    if (!formData.value.trim()) {
      showError('Valor é obrigatório.');
      return false;
    }

    const valueNum = parseCurrencyStringToNumber(formData.value);
    if (isNaN(valueNum) || valueNum <= 0) {
      showError('Valor deve ser um número positivo.');
      return false;
    }

    if (!formData.currency) {
      showError('Moeda é obrigatória.');
      return false;
    }

    if (!formData.recurrence) {
      showError('Recorrência é obrigatória.');
      return false;
    }

    const dueDate = buildSubscriptionDueDate(
      formData.realizationDay,
      formData.realizationMonth,
      formData.realizationYear
    );
    if (!dueDate) {
      showError('A data de realização deve ser válida.');
      return false;
    }

    if (!formData.categoryId) {
      showError('Categoria é obrigatória.');
      return false;
    }

    return true;
  }

  // Salvar assinatura
  async function handleSave() {
    if (!validateForm()) {
      return;
    }

    if (!currentUserId) {
      showError('Usuário não identificado.');
      return;
    }

    setLoading(true);

    try {
      const dueDate = buildSubscriptionDueDate(
        formData.realizationDay,
        formData.realizationMonth,
        formData.realizationYear
      );
      if (!dueDate) {
        showError('A data de realização deve ser válida.');
        return;
      }

      const subscriptions = database.get<Subscription>('subscriptions');

      await database.write(async () => {
        await subscriptions.create((subscription) => {
          subscription.serviceName = formData.serviceName.trim();
          subscription.value = parseCurrencyStringToNumber(formData.value);
          subscription.currency = formData.currency;
          subscription.billingDate = parseInt(formData.realizationDay, 10);
          subscription.categoryId = formData.categoryId;
          subscription.userId = currentUserId;
          subscription.isActive = true;
          subscription.status = 'active';
          subscription.recurrence = formData.recurrence;
          subscription.dueDate = dueDate;
        });
      });

      // Mostra notificação de sucesso (top) e redireciona para a tela inicial
      showSuccess('Assinatura cadastrada com sucesso!');
      setTimeout(() => {
        router.replace('/');
      }, 2500);
    } catch (error) {
      console.error('Erro ao salvar assinatura:', error);
      showError('Não foi possível salvar a assinatura.');
    } finally {
      setLoading(false);
    }
  }

  // Renderizar campo de texto
  function renderTextField(
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string = '',
    keyboardType: 'default' | 'decimal-pad' | 'numeric' = 'default'
  ) {
    return (
      <RNView style={styles.fieldContainer}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          style={[
            styles.input,
            { color: colors.text, borderColor: colors.text },
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.text}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          editable={!loading}
        />
      </RNView>
    );
  }



  // Renderizar seletor (categoria, moeda, data)
  function renderSelector(
    label: string,
    value: string,
    placeholder: string,
    onPress: () => void
  ) {
    const displayValue =
      value && categories.find((c) => c.id === value)
        ? categories.find((c) => c.id === value)?.name
        : value || placeholder;

    return (
      <RNView style={styles.fieldContainer}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity
          style={[
            styles.selectorButton,
            { borderColor: colors.text, backgroundColor: colors.background },
          ]}
          onPress={onPress}
          disabled={loading}
        >
          <Text style={{ color: colors.text }}>{displayValue}</Text>
          <FontAwesome name="chevron-down" size={16} color={colors.text} />
        </TouchableOpacity>
      </RNView>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Top notifications */}
      <TopAlert />
      <RNView style={styles.content}>
        <Text style={styles.title}>Adicionar Nova Assinatura</Text>

        {/* Campo: Nome do Serviço */}
        {renderTextField(
          'Nome do Serviço',
          formData.serviceName,
          (text) =>
            setFormData((prev) => ({ ...prev, serviceName: text })),
          'Ex: Netflix, Adobe Creative Cloud...'
        )}

        {/* Campo: Valor */}
        {renderTextField(
          'Valor',
          formData.value,
          (text) => setFormData((prev) => ({ ...prev, value: formatCurrencyInput(text) })),
          '0,00',
          'numeric'
        )}

        {/* Campo: Moeda */}
        {renderSelector(
          'Moeda',
          formData.currency,
          'Selecione a moeda',
          () => setCurrencyModalVisible(true)
        )}

        {/* Campo: Recorrência */}
        <RNView style={styles.fieldContainer}>
          <Text style={styles.label}>Recorrência</Text>
          <RNView style={[styles.pickerWrapper, { borderColor: colors.text, backgroundColor: colors.background }]}>
            <Picker
              selectedValue={formData.recurrence}
              onValueChange={(itemValue: SubscriptionRecurrence) =>
                setFormData((prev) => ({ ...prev, recurrence: itemValue }))
              }
              style={styles.inlinePicker}
            >
              {SUBSCRIPTION_RECURRENCE_OPTIONS.map((option) => (
                <Picker.Item key={option.value} label={option.label} value={option.value} />
              ))}
            </Picker>
          </RNView>
        </RNView>

        {/* Campo: Data de Realização da Assinatura */}
        <RNView style={styles.fieldContainer}>
          <Text style={styles.label}>Data de Realização da Assinatura</Text>
          <TouchableOpacity
            style={[
              styles.datePickerButton,
              {
                borderColor: colors.tint,
                backgroundColor: colors.background,
                height: 48,
                paddingHorizontal: 14,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.12,
                shadowRadius: 6,
                elevation: 3,
              },
            ]}
            onPress={async () => {
              if (!datePickerRef.current && Platform.OS !== 'web') {
                try {
                  // carregar dinamicamente para evitar erro de inicialização da rota
                  const mod = await import('@react-native-community/datetimepicker');
                  datePickerRef.current = mod.default || mod;
                } catch (e) {
                  console.error('Erro ao carregar DateTimePicker:', e);
                  showError('Não foi possível abrir o seletor de data.');
                  return;
                }
              }
              setShowDatePicker(true);
            }}
            disabled={loading}
          >
            <Text style={[styles.dateText, { color: colors.text }]}>{`${String(selectedDate.getDate()).padStart(2, '0')} / ${String(
              selectedDate.getMonth() + 1
            ).padStart(2, '0')} / ${selectedDate.getFullYear()}`}</Text>
            <FontAwesome name="calendar" size={18} color={colors.tint} />
          </TouchableOpacity>
          <Text style={{ color: colors.textSecondary, marginTop: 8 }}>O aplicativo calculará a data de vencimento automaticamente com base na recorrência informada.</Text>

          {showDatePicker && datePickerRef.current && (() => {
            const DP = datePickerRef.current;
            return (
              <DP
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'android' ? 'calendar' : 'default'}
                onChange={(_event: any, date: Date | undefined) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (date) {
                    setSelectedDate(date);
                    setFormData((prev) => ({
                      ...prev,
                      realizationDay: String(date.getDate()).padStart(2, '0'),
                      realizationMonth: String(date.getMonth() + 1).padStart(2, '0'),
                      realizationYear: String(date.getFullYear()),
                    }));
                  }
                }}
              />
            );
          })()}
        </RNView>

        {/* Campo: Categoria */}
        {renderSelector(
          'Categoria',
          formData.categoryId,
          'Selecione a categoria',
          () => setCategoryModalVisible(true)
        )}

        {/* Botão Salvar */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: colors.tint, opacity: loading ? 0.6 : 1 },
          ]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Salvando...' : 'Salvar Assinatura'}
          </Text>
        </TouchableOpacity>

        {/* Modal de Seleção de Moeda */}
        <Modal
          transparent
          visible={currencyModalVisible}
          onRequestClose={() => setCurrencyModalVisible(false)}
        >
          <RNView style={styles.modalOverlay}>
            <RNView
              style={[
                styles.modalContent,
                { backgroundColor: colors.background },
              ]}
            >
              <Text style={styles.modalTitle}>Selecione a Moeda</Text>
              <FlatList
                data={CURRENCIES}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <Pressable
                    style={[
                      styles.modalItem,
                      formData.currency === item && {
                        backgroundColor: colors.tint,
                      },
                    ]}
                    onPress={() => {
                      setFormData((prev) => ({ ...prev, currency: item }));
                      setCurrencyModalVisible(false);
                    }}
                  >
                    <Text
                      style={{
                        color:
                          formData.currency === item
                            ? 'white'
                            : colors.text,
                      }}
                    >
                      {item}
                    </Text>
                  </Pressable>
                )}
              />
              <Pressable
                style={[
                  styles.modalCloseButton,
                  { backgroundColor: colors.tint },
                ]}
                onPress={() => setCurrencyModalVisible(false)}
              >
                <Text style={{ color: 'white' }}>Fechar</Text>
              </Pressable>
            </RNView>
          </RNView>
        </Modal>

        {/* Modal de Seleção de Categoria */}
        <Modal
          transparent
          visible={categoryModalVisible}
          onRequestClose={() => setCategoryModalVisible(false)}
        >
          <RNView style={styles.modalOverlay}>
            <RNView
              style={[
                styles.modalContent,
                { backgroundColor: colors.background },
              ]}
            >
              <Text style={styles.modalTitle}>Selecione a Categoria</Text>
              <FlatList
                data={categories}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <Pressable
                    style={[
                      styles.modalItem,
                      formData.categoryId === item.id && {
                        backgroundColor: colors.tint,
                      },
                    ]}
                    onPress={() => {
                      setFormData((prev) => ({ ...prev, categoryId: item.id }));
                      setCategoryModalVisible(false);
                    }}
                  >
                    <FontAwesome
                      name={item.icon as any}
                      size={20}
                      color={
                        formData.categoryId === item.id ? 'white' : colors.text
                      }
                      style={{ marginRight: 10 }}
                    />
                    <Text
                      style={{
                        color:
                          formData.categoryId === item.id
                            ? 'white'
                            : colors.text,
                      }}
                    >
                      {item.name}
                    </Text>
                  </Pressable>
                )}
              />
              <Pressable
                style={[
                  styles.modalCloseButton,
                  { backgroundColor: colors.tint },
                ]}
                onPress={() => setCategoryModalVisible(false)}
              >
                <Text style={{ color: 'white' }}>Fechar</Text>
              </Pressable>
            </RNView>
          </RNView>
        </Modal>
      </RNView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  fieldContainer: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  dueDateRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dueDateInput: {
    flex: 1,
  },
  dueDateYearInput: {
    flex: 1.4,
  },
  datePickerButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
  },
  selectorButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  submitButton: {
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalCloseButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },

});
