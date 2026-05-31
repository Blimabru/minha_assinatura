// Serviço de conversão de moedas
// Mantém taxas de câmbio atualizadas

export type SupportedCurrency = 'BRL' | 'USD' | 'EUR';

interface ExchangeRates {
  [key: string]: number;
}

class CurrencyConversionService {
  private rates: ExchangeRates = {
    'BRL_USD': 0.2, // 1 BRL = 0.2 USD (exemplo)
    'BRL_EUR': 0.18,
    'USD_BRL': 5.0, // 1 USD = 5 BRL
    'USD_EUR': 0.92,
    'EUR_BRL': 5.5, // 1 EUR = 5.5 BRL
    'EUR_USD': 1.09,
  };

  /**
   * Converte um valor de uma moeda para outra
   * @param value - Valor a converter
   * @param fromCurrency - Moeda de origem
   * @param toCurrency - Moeda de destino
   * @returns Valor convertido
   */
  convert(value: number, fromCurrency: SupportedCurrency, toCurrency: SupportedCurrency): number {
    if (fromCurrency === toCurrency) return value;

    const rateKey = `${fromCurrency}_${toCurrency}`;
    const rate = this.rates[rateKey];

    if (!rate) {
      console.warn(`Taxa de câmbio não encontrada para ${rateKey}`);
      return value;
    }

    return Math.round(value * rate * 100) / 100;
  }

  /**
   * Converte para BRL (moeda padrão da aplicação)
   */
  convertToBRL(value: number, fromCurrency: SupportedCurrency): number {
    return this.convert(value, fromCurrency, 'BRL');
  }

  /**
   * Atualiza a taxa de câmbio
   * Útil quando integrado com uma API de câmbio em tempo real
   */
  updateRate(fromCurrency: SupportedCurrency, toCurrency: SupportedCurrency, rate: number): void {
    const rateKey = `${fromCurrency}_${toCurrency}`;
    this.rates[rateKey] = rate;
  }

  /**
   * Obtém a taxa atual entre duas moedas
   */
  getRate(fromCurrency: SupportedCurrency, toCurrency: SupportedCurrency): number | null {
    const rateKey = `${fromCurrency}_${toCurrency}`;
    return this.rates[rateKey] ?? null;
  }

  /**
   * Obtém todas as taxas
   */
  getAllRates(): ExchangeRates {
    return { ...this.rates };
  }
}

// Exportar instância única (singleton)
export const currencyConversionService = new CurrencyConversionService();

export default CurrencyConversionService;
