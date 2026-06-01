import React, { useState, useMemo, useEffect } from 'react';
import { StyleSheet, FlatList, Platform } from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import DiscountCard from '@/src/components/UI/DiscountCard';
import SearchBar from '@/src/components/UI/SearchBar';
import { DiscountItem } from '@/src/types/discount';
import { useAuth } from '@/src/contexts/AuthContext';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getApiUrl = () => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:3000`;
  }
  return Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
};

const API_URL = getApiUrl();

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
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [searchQuery, setSearchQuery] = useState('');
  const [coupons, setCoupons] = useState<DiscountItem[]>(MOCK_DISCOUNTS);

  // Fetch dynamic coupons from NestJS server
  useEffect(() => {
    if (!user) return;

    const fetchCoupons = async () => {
      try {
        const token = await AsyncStorage.getItem(`user_${user.email}_token`);
        const response = await fetch(`${API_URL}/sync/coupons`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const serverCoupons = await response.json();
          if (serverCoupons && serverCoupons.length > 0) {
            const mappedServer: DiscountItem[] = serverCoupons.map((c: any) => ({
              id: c.id,
              serviceName: c.serviceName,
              description: c.description,
              discountCode: c.discountCode,
              discountPercentage: c.discountPercentage,
              externalLink: c.externalLink,
              affiliateLink: c.affiliateLink,
              category: c.category,
            }));
            const merged = [...mappedServer, ...MOCK_DISCOUNTS];
            const unique = merged.filter((item, index, self) =>
              self.findIndex(t => t.discountCode === item.discountCode) === index
            );
            setCoupons(unique);
          }
        }
      } catch (e) {
        console.warn('Erro ao carregar cupons dinâmicos do servidor:', e);
      }
    };

    fetchCoupons();
  }, [user]);

  const filteredDiscounts = useMemo(() => {
    let filtered = coupons;

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (item) =>
          item.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [searchQuery, coupons]);

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
