// formatCurrency.ts
// Utilitários para formatar valores em BRL enquanto o usuário digita

export function formatCurrencyInput(raw: string, maxDecimals = 2): string {
  // Nova estratégia: interpretar entrada como número de centavos.
  // Ex: digitar "1" -> "0,01"; "12" -> "0,12"; "123" -> "1,23";
  if (raw == null) return '';

  // Remove tudo que não seja dígito
  const digits = (raw.match(/\d+/g) || []).join('');

  if (digits.length === 0) return '';

  // Garantir ao menos 2 dígitos para centavos
  const padded = digits.padStart(maxDecimals + 1, '0');

  const intPartRaw = padded.slice(0, -maxDecimals);
  const fracPart = padded.slice(-maxDecimals);

  // Remove zeros à esquerda da parte inteira
  const intPart = intPartRaw.replace(/^0+(?=\d)/, '') || '0';

  // Formata milhares com ponto
  const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `${withThousands},${fracPart}`;
}

export function parseCurrencyStringToNumber(formatted: string): number {
  if (!formatted) return 0;
  // Remove pontos de milhares e troca vírgula por ponto para parseFloat
  const cleaned = formatted.replace(/\./g, '').replace(',', '.');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}
