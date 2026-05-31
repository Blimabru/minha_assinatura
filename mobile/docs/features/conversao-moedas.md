# Conversão de Moedas no Dashboard

## 📌 Overview

A feature de conversão de moedas permite que assinaturas em USD e EUR sejam exibidas também em BRL (Real) no dashboard, oferecendo uma visão consolidada do gasto total em reais.

## 🎯 Funcionalidades Implementadas

### 1. **Serviço de Conversão** (`CurrencyConversionService.ts`)
- Mantém taxas de câmbio atualizadas
- Converte entre BRL, USD e EUR
- Interface simples e reutilizável em toda a aplicação

```typescript
import { currencyConversionService } from '@/src/services/CurrencyConversionService';

// Converter USD para BRL
const brlValue = currencyConversionService.convertToBRL(100, 'USD'); // 500

// Converter entre moedas
const eurValue = currencyConversionService.convert(100, 'USD', 'EUR'); // 92

// Obter taxa de câmbio
const rate = currencyConversionService.getRate('USD', 'BRL'); // 5.0
```

### 2. **Hooks de Conversão** (`useCurrencyConversion.ts`)
- Hooks React reutilizáveis para converter moedas
- Usando `useMemo` para otimizar performance

```typescript
import { useCurrencyConversionToBRL, useExchangeRate } from '@/src/hooks/useCurrencyConversion';

// No seu componente React
const convertedValue = useCurrencyConversionToBRL(100, 'USD');
const rate = useExchangeRate('USD', 'BRL');
```

### 3. **Componente de Badge** (`CurrencyConversionBadge.tsx`)
- Exibe a conversão de moeda no CardItem
- Mostra taxa de câmbio utilizada
- Só aparece quando a moeda não é BRL

### 4. **Integração no CardItem** 
- Cada assinatura exibe:
  - Valor original com sua moeda
  - Conversão para BRL (quando aplicável)
  - Taxa de câmbio utilizada

### 5. **Cálculo de Total Mensal Consolidado**
- O `monthlyTotal` agora soma todas as assinaturas ativas convertidas para BRL
- Oferece uma visão real do gasto mensal em reais

## 💾 Taxas de Câmbio Atuais

As taxas estão hardcoded no `CurrencyConversionService.ts`:

```typescript
'USD_BRL': 5.0,    // 1 USD = 5 BRL
'EUR_BRL': 5.5,    // 1 EUR = 5.5 BRL
'BRL_USD': 0.2,    // 1 BRL = 0.2 USD
'EUR_USD': 1.09,   // 1 EUR = 1.09 USD
```

## 🔄 Atualizando Taxas em Tempo Real

### Opção 1: Atualizar manualmente
```typescript
import { currencyConversionService } from '@/src/services/CurrencyConversionService';

// Atualizar taxa de câmbio
currencyConversionService.updateRate('USD', 'BRL', 5.25);
```

### Opção 2: Integrar com API de câmbio (Recomendado)

Crie um serviço que busca taxas em tempo real:

```typescript
// src/services/ExchangeRateAPIService.ts
export async function fetchExchangeRates() {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json();
    
    // Atualizar as taxas no serviço de conversão
    const brlRate = data.rates.BRL;
    const eurRate = data.rates.EUR;
    
    currencyConversionService.updateRate('USD', 'BRL', brlRate);
    currencyConversionService.updateRate('EUR', 'BRL', eurRate / brlRate);
    
  } catch (error) {
    console.error('Erro ao atualizar taxas:', error);
  }
}
```

Depois, chamar periodicamente (por exemplo, ao abrir o app):

```typescript
import { useEffect } from 'react';
import { fetchExchangeRates } from '@/src/services/ExchangeRateAPIService';

export function useExchangeRateSync() {
  useEffect(() => {
    // Buscar taxas ao montar
    fetchExchangeRates();
    
    // Atualizar a cada hora
    const interval = setInterval(fetchExchangeRates, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
}
```

## 📊 Exemplo de Uso no Dashboard

Seu dashboard agora mostra:

### Card de Métrica
- **Custo Mensal**: Soma de todas as assinaturas ativas convertidas para BRL
  - Se tinha 1x USD 100 + 1x BRL 50 = R$ 550,00

### Cards de Assinatura
Cada assinatura exibe:
```
Netflix
Mensal • Vence em 15 dias
$12.99
≈ R$ 64,95
(1 USD = 5.00 BRL)
```

## 🧪 Testando a Feature

Para testar localmente:

1. Adicionar assinatura com USD:
   - Nome: "Spotify Plus"
   - Valor: 12.99
   - Moeda: USD

2. Adicionar assinatura com BRL:
   - Nome: "Netflix"
   - Valor: 50
   - Moeda: BRL

3. No dashboard você deve ver:
   - Spotify Plus com valor em USD e conversão em BRL
   - Netflix apenas com valor em BRL
   - Total mensal consolidado em BRL

## 🔐 Segurança

Considere:
- Usar HTTPS ao buscar taxas de câmbio de APIs externas
- Validar as taxas recebidas (não aceitar valores extremamente altos/baixos)
- Adicionar timeout nas requisições de câmbio
- Cachear taxas localmente com timestamp de atualização

## 📱 Estrutura de Arquivos

```
src/
├── services/
│   └── CurrencyConversionService.ts    # Lógica de conversão
├── hooks/
│   └── useCurrencyConversion.ts        # Hooks React
└── components/UI/
    └── CurrencyConversionBadge.tsx     # Badge de conversão

database/hooks/
└── useSubscriptions.ts                  # Hook atualizado com conversões
```

## 🐛 Troubleshooting

### Moeda não está sendo convertida
- Verificar se a moeda está em maiúsculas (USD, EUR, BRL)
- Verificar se existe taxa de câmbio para essa moeda no serviço

### Total mensal não está correto
- Verificar se todas as assinaturas têm moedas válidas
- Limpar cache do app ou fazer reload

### Taxa de câmbio não atualiza
- Verificar intervalo de atualização
- Confirmar se a API está respondendo
- Verificar logs do console

## 📚 Referências

- API de câmbio recomendada: https://exchangerate-api.com/
- Outras opções: Fixer.io, Open Exchange Rates
