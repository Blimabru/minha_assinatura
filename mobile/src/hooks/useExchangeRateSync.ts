import { useEffect } from 'react';
import { fetchExchangeRates } from '@/src/services/ExchangeRateAPIService';

export function useExchangeRateSync() {
  useEffect(() => {
    fetchExchangeRates();

    const interval = setInterval(fetchExchangeRates, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
}
