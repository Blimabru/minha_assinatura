// Componente para exibir conversão de moeda
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useCurrencyConversionToBRL, useExchangeRate } from '@/src/hooks/useCurrencyConversion';
import { formatCurrencyByCode } from '@/src/utils/formatCurrency';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import type { SupportedCurrency } from '@/src/services/CurrencyConversionService';

interface CurrencyConversionBadgeProps {
  value: number;
  fromCurrency: SupportedCurrency;
  size?: 'small' | 'medium' | 'large';
}

/**
 * Componente que exibe a conversão de moeda para BRL
 * Só exibe se a moeda não for BRL
 */
const CurrencyConversionBadge: React.FC<CurrencyConversionBadgeProps> = ({ 
  value, 
  fromCurrency, 
  size = 'medium' 
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const convertedValue = useCurrencyConversionToBRL(value, fromCurrency);
  const exchangeRate = useExchangeRate(fromCurrency, 'BRL');

  // Se for BRL, não exibe nada
  if (fromCurrency === 'BRL') {
    return null;
  }

  const fontSizes = {
    small: 12,
    medium: 13,
    large: 14,
  };

  const formattedConverted = formatCurrencyByCode(convertedValue, 'BRL');
  const formattedOriginal = formatCurrencyByCode(value, fromCurrency);

  const rateText = exchangeRate ? `Taxa: ${exchangeRate.toFixed(4)}` : undefined;

  return (
    <View style={styles.container}>
      <Text style={[
        styles.text,
        { 
          color: colors.textSecondary,
          fontSize: fontSizes[size]
        }
      ]}>
        {formattedOriginal} = {formattedConverted}
      </Text>
      {rateText ? (
        <Text style={[styles.rateText, { color: colors.textSecondary }]}>
          {rateText}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 2,
  },
  text: {
    fontWeight: '500',
  },
  rateText: {
    marginTop: 1,
    opacity: 0.7,
  },
});

export default CurrencyConversionBadge;
