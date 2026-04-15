// Router para navegação entre telas.
import { useRouter } from 'expo-router';

// Componentes nativos para botão, lista e estilos.
import { FlatList, Pressable, StyleSheet } from 'react-native';

// Ícones para o botão.
import FontAwesome from '@expo/vector-icons/FontAwesome';

// Componentes tematizados do projeto.
import { Text, View } from '@/components/Themed';

// Hook reativo que já alimenta a dashboard.
import { useSubscriptions } from '@/database/hooks/useSubscriptions';

// Tela principal da aba Dashboard.
export default function TabOneScreen() {
  // Router para navegação.
  const router = useRouter();

  // Dados derivados do banco (reativos).
  const { loading, activeSubscriptions, monthlyTotal } = useSubscriptions();

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
  },
  service: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
});