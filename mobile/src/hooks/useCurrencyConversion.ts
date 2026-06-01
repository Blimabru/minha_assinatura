// Hook para usar conversão de moedas
import { useMemo } from 'react';
import { currencyConversionService } from '@/src/services/CurrencyConversionService';
import type { SupportedCurrency } from '@/src/services/CurrencyConversionService';

/**
 * Hook para converter valores de moeda
 * @param value - Valor a converter
 * @param fromCurrency - Moeda de origem
 * @param toCurrency - Moeda de destino (padrão: BRL)
 * @returns Valor convertido
 */
export function useCurrencyConversion(
  value: number,
  fromCurrency: SupportedCurrency,
  toCurrency: SupportedCurrency = 'BRL'
): number {
  return useMemo(() => {
    return currencyConversionService.convert(value, fromCurrency, toCurrency);
  }, [value, fromCurrency, toCurrency]);
}

/**
 * Hook para converter para BRL
 * @param value - Valor a converter
 * @param fromCurrency - Moeda de origem
 * @returns Valor em BRL
 */
export function useCurrencyConversionToBRL(value: number, fromCurrency: SupportedCurrency): number {
  return useMemo(() => {
    return currencyConversionService.convertToBRL(value, fromCurrency);
  }, [value, fromCurrency]);
}

/**
 * Hook para obter taxa de câmbio entre duas moedas
 */
export function useExchangeRate(
  fromCurrency: SupportedCurrency,
  toCurrency: SupportedCurrency = 'BRL'
): number | null {
  return useMemo(() => {
    return currencyConversionService.getRate(fromCurrency, toCurrency);
  }, [fromCurrency, toCurrency]);
}
