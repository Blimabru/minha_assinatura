import React, { useState, useMemo } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import DiscountCard from '@/src/components/UI/DiscountCard';
import SearchBar from '@/src/components/UI/SearchBar';
import { DiscountItem } from '@/src/types/discount';

// Dados mockados - você pode integrar com banco de dados depois
const MOCK_DISCOUNTS: DiscountItem[] = [
  {
    id: '1',
    serviceName: 'Netflix',
    description: 'Streaming de filmes e séries ilimitado',
    discountCode: 'SAVE15',
    discountPercentage: 15,
    externalLink: 'https://www.netflix.com',
    affiliateLink: 'https://netflix.com/affiliate',
    category: 'Entretenimento',
  },
  {
    id: '2',
    serviceName: 'Spotify',
    description: 'Múltiplos planos de música streaming',
    discountCode: 'SAVE20',
    discountPercentage: 20,
    externalLink: 'https://www.spotify.com',
    affiliateLink: 'https://spotify.com/affiliate',
    category: 'Entretenimento',
  },
  {
    id: '3',
    serviceName: 'Adobe Creative Cloud',
    description: 'Suite completa para criação de conteúdo',
    discountCode: 'CREATIVE30',
    discountPercentage: 30,
    externalLink: 'https://www.adobe.com',
    affiliateLink: 'https://adobe.com/affiliate',
    category: 'Produtividade',
  },
  {
    id: '5',
    serviceName: 'GitHub Pro',
    description: 'Repositórios privados ilimitados para desenvolvedores',
    discountCode: 'DEV25',
    discountPercentage: 25,
    externalLink: 'https://github.com/pricing',
    affiliateLink: 'https://github.com/affiliate',
    category: 'Desenvolvimento',
  },
];

export default function DiscountsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDiscounts = useMemo(() => {
    let filtered = MOCK_DISCOUNTS;

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (item) =>
          item.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [searchQuery]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Cupons & Afiliados</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Economize em suas assinaturas</Text>
      </View>

      <View style={{ paddingHorizontal: 16 }}>
        <SearchBar
          placeholder="Buscar descontos..."
          onChange={setSearchQuery}
          value={searchQuery}
        />
      </View>

      <FlatList
        data={filteredDiscounts}
        renderItem={({ item }) => <DiscountCard {...item} />}
        keyExtractor={(item) => item.id}
        scrollEnabled={true}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <FontAwesome name="inbox" size={48} color={colors.iconSecondary} />
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>Nenhum desconto encontrado</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.75,
  },
  listContent: {
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 16,
    opacity: 0.5,
  },
});
