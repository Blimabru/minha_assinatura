import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from '@/components/Themed';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuth } from '@/src/contexts/AuthContext';
import PurchaseModal from './PurchaseModal';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

const ADVERTISEMENTS = [
  {
    title: 'Hospedagem HostCloud',
    description: '30% OFF em servidores Cloud e VPS! Use o cupom CLOUD30.',
    icon: 'cloud',
    color: '#3B82F6',
  },
  {
    title: 'Organize suas Finanças',
    description: 'Conheça o DWH 401 Finances. Planilhas premium automatizadas.',
    icon: 'pie-chart',
    color: '#10B981',
  },
  {
    title: 'Milhas em Dobro!',
    description: 'Cadastre seus cartões no MilesUp e viaje de graça mais rápido.',
    icon: 'plane',
    color: '#F59E0B',
  },
];

export default function AdBanner() {
  const { isPremium } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [adIndex, setAdIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  // Auto-rotate ads every 8 seconds
  useEffect(() => {
    if (isPremium) return;

    const interval = setInterval(() => {
      setAdIndex((prev) => (prev + 1) % ADVERTISEMENTS.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [isPremium]);

  if (isPremium) return null;

  const currentAd = ADVERTISEMENTS[adIndex];

  return (
    <View style={[styles.wrapper, { borderColor: colors.cardBorder }]}>
      <Pressable 
        onPress={() => setModalVisible(true)}
        style={({ pressed }) => [
          styles.container, 
          { backgroundColor: colors.cardBackground, opacity: pressed ? 0.95 : 1 }
        ]}
      >
        {/* Ad Indicator Tag */}
        <View style={[styles.adTag, { backgroundColor: colors.backgroundTertiary }]}>
          <Text style={[styles.adTagText, { color: colors.textSecondary }]}>Anúncio</Text>
        </View>

        <View style={styles.contentRow}>
          <View style={[styles.iconContainer, { backgroundColor: currentAd.color }]}>
            <FontAwesome name={currentAd.icon as any} size={16} color="#FFF" />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{currentAd.title}</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>{currentAd.description}</Text>
          </View>
        </View>
      </Pressable>

      {/* Remove Ads Close Trigger */}
      <Pressable 
        onPress={() => setModalVisible(true)}
        style={[styles.closeButton, { backgroundColor: colors.backgroundSecondary, borderColor: colors.cardBorder }]}
      >
        <FontAwesome name="times" size={10} color={colors.textSecondary} />
      </Pressable>

      {/* Embedded Checkout Modal */}
      <PurchaseModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  container: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
  },
  adTag: {
    position: 'absolute',
    top: 6,
    right: 32,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adTagText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 24, // spacing to avoid overlap with close button
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
  },
  description: {
    fontSize: 10,
    lineHeight: 14,
  },
  closeButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});
