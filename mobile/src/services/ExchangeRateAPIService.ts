import { currencyConversionService } from '@/src/services/CurrencyConversionService';

interface OpenERApiResponse {
  result: 'success' | 'error';
  base_code: string;
  rates: {
    BRL?: number;
    EUR?: number;
    [currency: string]: number | undefined;
  };
}

interface ExchangeRateHostResponse {
  success: boolean;
  base: string;
  rates: {
    BRL?: number;
    EUR?: number;
    [currency: string]: number | undefined;
  };
}

async function fetchRatesFromOpenErApi(): Promise<{ brlRate: number; eurRate: number } | null> {
  const response = await fetch('https://open.er-api.com/v6/latest/USD');
  if (!response.ok) {
    throw new Error(`Falha na requisição open.er-api.com: ${response.status}`);
  }

  const data = (await response.json()) as OpenERApiResponse;
  if (data.result !== 'success') {
    throw new Error('API open.er-api.com retornou erro');
  }

  const brlRate = data.rates.BRL;
  const eurRate = data.rates.EUR;
  if (!brlRate || !eurRate) {
    throw new Error('Resposta inválida da open.er-api.com');
  }

  return { brlRate, eurRate };
}

async function fetchRatesFromExchangeRateHost(): Promise<{ brlRate: number; eurRate: number } | null> {
  const response = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=BRL,EUR');
  if (!response.ok) {
    throw new Error(`Falha na requisição exchangerate.host: ${response.status}`);
  }

  const data = (await response.json()) as ExchangeRateHostResponse;
  if (!data.success || data.base !== 'USD') {
    throw new Error('API exchangerate.host retornou erro');
  }

  const brlRate = data.rates.BRL;
  const eurRate = data.rates.EUR;
  if (!brlRate || !eurRate) {
    throw new Error('Resposta inválida da exchangerate.host');
  }

  return { brlRate, eurRate };
}

export async function fetchExchangeRates(): Promise<void> {
  let rates: { brlRate: number; eurRate: number } | null = null;

  try {
    rates = await fetchRatesFromOpenErApi();
  } catch (error) {
    console.warn('Falha ao buscar taxas de open.er-api.com:', error);
  }

  if (!rates) {
    try {
      rates = await fetchRatesFromExchangeRateHost();
    } catch (error) {
      console.warn('Falha ao buscar taxas de exchangerate.host:', error);
    }
  }

  if (!rates) {
    console.warn('Não foi possível atualizar taxas de câmbio. Usando taxas padrão internas.');
    return;
  }

  const { brlRate, eurRate } = rates;
  currencyConversionService.updateRates({
    USD_BRL: brlRate,
    USD_EUR: eurRate,
    BRL_USD: 1 / brlRate,
    BRL_EUR: eurRate / brlRate,
    EUR_USD: 1 / eurRate,
    EUR_BRL: brlRate / eurRate,
  });
}
