import React from 'react';
import { StyleSheet, Pressable, Linking, Alert, View as RNView, Text } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

interface DiscountCardProps {
  id: string;
  serviceName: string;
  description: string;
  discountCode?: string;
  discountPercentage?: number;
  affiliateLink?: string;
  externalLink: string;
  category?: string;
}

export default function DiscountCard({
  serviceName,
  description,
  discountCode,
  discountPercentage,
  externalLink,
  affiliateLink,
}: DiscountCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Erro', 'Não foi possível abrir o link.');
    });
  };

  const handleCopyCode = () => {
    if (discountCode) {
      Alert.alert('Copiar cupom', 'Toque e segure o código para copiar manualmente.');
    }
  };

  return (
    <RNView
      style={[
        styles.container,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.cardBorder,
          shadowColor: colors.shadowColor,
          elevation: 3,
        },
      ]}
    >
      <RNView style={styles.header}>
        <Text style={[styles.serviceName, { color: colors.text }]}>{serviceName}</Text>
        {discountPercentage && (
          <RNView style={[styles.badge, { backgroundColor: colors.tint }]}>
            <Text style={styles.badgeText}>{discountPercentage}% OFF</Text>
          </RNView>
        )}
      </RNView>

      <Text style={[styles.description, { color: colors.textSecondary }]}>{description}</Text>

      <RNView style={styles.codeSection}>
        {discountCode && (
          <Pressable
            style={[styles.codeButton, { backgroundColor: colors.tint + '20' }]}
            onPress={handleCopyCode}
          >
            <FontAwesome name="copy" size={14} color={colors.tint} />
            <Text selectable style={[styles.codeText, { color: colors.tint }]}>{discountCode}</Text>
          </Pressable>
        )}
      </RNView>

      <RNView style={styles.buttonsContainer}>
        {affiliateLink && (
          <Pressable
            style={[styles.button, styles.affiliateButton, { borderColor: colors.tint, backgroundColor: 'transparent' }]}
            onPress={() => handleOpenLink(affiliateLink)}
          >
            <FontAwesome name="link" size={14} color={colors.tint} />
            <Text style={[styles.buttonText, { color: colors.tint }]}>Link Afiliado</Text>
          </Pressable>
        )}
        <Pressable
          style={[styles.button, { backgroundColor: colors.tint }]}
          onPress={() => handleOpenLink(externalLink)}
        >
          <FontAwesome name="external-link" size={14} color="#fff" />
          <Text style={[styles.buttonText, { color: '#fff' }]}>Visitar</Text>
        </Pressable>
      </RNView>
    </RNView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    // width controlled by parent FlatList padding
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  description: {
    fontSize: 13,
    marginBottom: 10,
    opacity: 0.7,
    lineHeight: 18,
  },
  codeSection: {
    marginBottom: 12,
  },
  codeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 8,
  },
  codeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    gap: 6,
  },
  affiliateButton: {
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
