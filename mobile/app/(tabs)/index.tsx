// Hook de estado para controlar loading do botão.
import { useState } from 'react';

// Componentes nativos para botão, lista e estilos.
import { Alert, FlatList, Pressable, StyleSheet } from 'react-native';

// Q = helper de query do Watermelon (where, etc).
import { Q } from '@nozbe/watermelondb';

// Componentes tematizados do projeto.
import { Text, View } from '@/components/Themed';

// Instância singleton do banco.
import database from '@/database';

// Models para tipagem das coleções.
import User from '@/database/models/User';
import Category from '@/database/models/Category';
import Subscription from '@/database/models/Subscription';

// Hook reativo que já alimenta a dashboard.
import { useSubscriptions } from '@/database/hooks/useSubscriptions';

// Tela principal da aba Dashboard.
export default function TabOneScreen() {
  // Dados derivados do banco (reativos).
  const { loading, activeSubscriptions, monthlyTotal } = useSubscriptions();

  // Estado para bloquear múltiplos cliques no botão de criar.
  const [creating, setCreating] = useState(false);

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      <Text style={styles.total}>Total mensal: R$ {monthlyTotal.toFixed(2)}</Text>

      {/* Botão de create para validar fluxo local */}
      <Pressable
        style={[styles.button, creating && styles.buttonDisabled]}
        onPress={handleAddTestSubscription}
        disabled={creating}
      >
        <Text style={styles.buttonText}>
          {creating ? 'Criando...' : 'Adicionar assinatura de teste'}
        </Text>
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
              <Text style={styles.service}>{item.serviceName}</Text>
              <Text>
                {item.currency} {item.value.toFixed(2)} - dia {item.billingDate}
              </Text>
            </View>
          )}
        />
      )}
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
  button: {
    backgroundColor: '#0b7a5a',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
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
  },
  service: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
});