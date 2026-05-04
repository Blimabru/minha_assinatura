// Router para navegação entre telas.
import React, { useState } from 'react';
import { useRouter } from 'expo-router';

// Componentes nativos para botão, lista e estilos.
import { Alert, FlatList, Pressable, StyleSheet, Modal, TouchableOpacity, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';

// Componentes tematizados do projeto.
import { Text, View } from '@/components/Themed';

// Instância singleton do banco.
import { database } from '@/database';

// Models para tipagem das coleções.
import User from '@/database/models/User';
import Category from '@/database/models/Category';
import Subscription from '@/database/models/Subscription';

// Hook reativo que já alimenta a dashboard.
import { useSubscriptions, type SubscriptionItem } from '@/database/hooks/useSubscriptions';

// Ícones
import FontAwesome from '@expo/vector-icons/FontAwesome';

// Tela principal da aba Dashboard.
export default function TabOneScreen() {
  // Router para navegação.
  const router = useRouter();

  // Dados derivados do banco (reativos).
  const { loading, activeSubscriptions, monthlyTotal, updateSubscription, categories } = useSubscriptions();

  // Estado para bloquear múltiplos cliques no botão de criar.
  const [creating, setCreating] = useState(false);

  // Estados para o modal de edição
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionItem | null>(null);
  const [editServiceName, setEditServiceName] = useState('');
  const [editValue, setEditValue] = useState('');
  const [editCurrency, setEditCurrency] = useState('');
  const [editBillingDate, setEditBillingDate] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');

  // Função de teste para inserir dados locais.
  // Importante: valida o fluxo offline-first ponta a ponta.
  async function handleAddTestSubscription() {
    // Evita toque duplo durante operação assíncrona.
    if (creating) return;

    setCreating(true);

    try {
      // Coleções tipadas para leitura/escrita.
      const users = database.get<User>('users');
      const categories = database.get<Category>('categories');
      const subscriptions = database.get<Subscription>('subscriptions');

      // Busca um usuário padrão por email.
      let defaultUser = await users
        .query(Q.where('email', 'usuario.local@minhaassinatura.app'))
        .fetch();

      // Busca uma categoria padrão por nome.
      let defaultCategory = await categories
        .query(Q.where('name', 'Streaming'))
        .fetch();

      // Todas as escritas no Watermelon precisam ocorrer dentro de database.write.
      await database.write(async () => {
        // Cria usuário padrão apenas se não existir.
        if (defaultUser.length === 0) {
          const createdUser = await users.create((user) => {
            user.name = 'Usuario Local';
            user.email = 'usuario.local@minhaassinatura.app';
            user.passwordHash = 'local_dev_only';
            user.currencyPreference = 'BRL';
          });

          // Atualiza variável local com usuário recém-criado.
          defaultUser = [createdUser];
        }

        // Cria categoria padrão apenas se não existir.
        if (defaultCategory.length === 0) {
          const createdCategory = await categories.create((category) => {
            category.name = 'Streaming';
            category.icon = 'tv';
          });

          // Atualiza variável local com categoria recém-criada.
          defaultCategory = [createdCategory];
        }

        // Cria assinatura de teste com timestamp para diferenciar nome.
        await subscriptions.create((subscription) => {
          subscription.userId = defaultUser[0].id;
          subscription.categoryId = defaultCategory[0].id;
          subscription.serviceName = `Netflix Teste ${Date.now()}`;
          subscription.value = 39.9;
          subscription.currency = 'BRL';
          subscription.billingDate = 10;
          subscription.isActive = true;
        });
      });

      // Feedback de sucesso.
      Alert.alert('Sucesso', 'Assinatura de teste criada no banco local.');
    } catch (error) {
      // Feedback de erro para diagnóstico rápido.
      console.error(error);
      Alert.alert('Erro', 'Não foi possível criar a assinatura de teste.');
    } finally {
      // Libera botão no fim da execução.
      setCreating(false);
    }
  }

  // Função para abrir modal de edição
  function openEditModal(subscription: SubscriptionItem) {
    setSelectedSubscription(subscription);
    setEditServiceName(subscription.serviceName);
    setEditValue(subscription.value.toString());
    setEditCurrency(subscription.currency);
    setEditBillingDate(subscription.billingDate.toString());
    setEditCategoryId(subscription.categoryId);
    setModalVisible(true);
  }

  // Função para salvar edição
  async function handleSaveEdit() {
    if (!selectedSubscription) return;

    const newValue = parseFloat(editValue);
    const newBillingDate = parseInt(editBillingDate);

    if (!editServiceName.trim()) {
      Alert.alert('Erro', 'Nome do serviço é obrigatório.');
      return;
    }

    if (isNaN(newValue) || newValue <= 0) {
      Alert.alert('Erro', 'Valor deve ser um número positivo.');
      return;
    }

    if (!editCurrency.trim()) {
      Alert.alert('Erro', 'Moeda é obrigatória.');
      return;
    }

    if (isNaN(newBillingDate) || newBillingDate < 1 || newBillingDate > 31) {
      Alert.alert('Erro', 'Data de vencimento deve ser um dia válido (1-31).');
      return;
    }

    if (!editCategoryId) {
      Alert.alert('Erro', 'Categoria é obrigatória.');
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
      Alert.alert('Sucesso', 'Assinatura atualizada com sucesso.');
      setModalVisible(false);
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      <Text style={styles.total}>Total mensal: R$ {monthlyTotal.toFixed(2)}</Text>

      {/* Botão principal: Adicionar Assinatura */}
      <Pressable
        style={styles.addButton}
        onPress={() => router.push('/subscriptions/create')}
      >
        <FontAwesome name="plus" size={20} color="white" />
        <Text style={styles.addButtonText}>Adicionar Assinatura</Text>
      </Pressable>

      {loading ? (
        <Text>Carregando assinaturas...</Text>
      ) : activeSubscriptions.length === 0 ? (
        <Text>Nenhuma assinatura ativa ainda.</Text>
      ) : (
        <FlatList
          data={activeSubscriptions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardContent}>
                <Text style={styles.service}>{item.serviceName}</Text>
                <Text>
                  {item.currency} {item.value.toFixed(2)} - dia {item.billingDate}
                </Text>
              </View>
              <TouchableOpacity onPress={() => openEditModal(item)} style={styles.editIcon}>
                <FontAwesome name="edit" size={20} color="#007bff" />
              </TouchableOpacity>
            </View>
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
                onChangeText={setEditValue}
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