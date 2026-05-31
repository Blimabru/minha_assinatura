import { currencyConversionService } from '@/src/services/CurrencyConversionService';

interface ExchangeRateApiResponse {
  result: 'success' | 'error';
  base_code: string;
  rates: {
    BRL?: number;
    EUR?: number;
    [currency: string]: number | undefined;
  };
}

export async function fetchExchangeRates(): Promise<void> {
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!response.ok) {
      throw new Error(`Falha na requisição de taxas: ${response.status}`);
    }

    const data = (await response.json()) as ExchangeRateApiResponse;

    if (data.result !== 'success') {
      throw new Error('API de câmbio retornou erro');
    }

    const brlRate = data.rates.BRL;
    const eurRate = data.rates.EUR;

    if (!brlRate || !eurRate) {
      throw new Error('Resposta inválida da API de câmbio');
    }

    currencyConversionService.updateRates({
      USD_BRL: brlRate,
      USD_EUR: eurRate,
      BRL_USD: 1 / brlRate,
      BRL_EUR: eurRate / brlRate,
      EUR_USD: 1 / eurRate,
      EUR_BRL: brlRate / eurRate,
    });
  } catch (error) {
    console.warn('Falha ao buscar taxas de câmbio:', error);
  }
}
