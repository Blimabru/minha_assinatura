export type SubscriptionRecurrence = 'mensal' | 'trimestral' | 'semestral' | 'anual';

export const SUBSCRIPTION_RECURRENCE_OPTIONS: Array<{
  label: string;
  value: SubscriptionRecurrence;
}> = [
  { label: 'Mensal', value: 'mensal' },
  { label: 'Trimestral', value: 'trimestral' },
  { label: 'Semestral', value: 'semestral' },
  { label: 'Anual', value: 'anual' },
];

export function getSubscriptionRecurrenceLabel(recurrence?: string): string {
  switch (recurrence) {
    case 'trimestral':
      return 'Trimestral';
    case 'semestral':
      return 'Semestral';
    case 'anual':
      return 'Anual';
    case 'mensal':
    default:
      return 'Mensal';
  }
}

function normalizeNumericPart(value: string): string {
  return value.padStart(2, '0');
}

export function buildSubscriptionDueDate(day: string, month: string, year: string): string | null {
  const dayNumber = Number(day);
  const monthNumber = Number(month);
  const yearNumber = Number(year);

  if (
    !Number.isInteger(dayNumber) ||
    !Number.isInteger(monthNumber) ||
    !Number.isInteger(yearNumber) ||
    dayNumber < 1 ||
    dayNumber > 31 ||
    monthNumber < 1 ||
    monthNumber > 12 ||
    yearNumber < 1900
  ) {
    return null;
  }

  const date = new Date(yearNumber, monthNumber - 1, dayNumber);

  if (
    date.getFullYear() !== yearNumber ||
    date.getMonth() !== monthNumber - 1 ||
    date.getDate() !== dayNumber
  ) {
    return null;
  }

  return `${yearNumber}-${normalizeNumericPart(String(monthNumber))}-${normalizeNumericPart(String(dayNumber))}`;
}

export function splitSubscriptionDueDate(dueDate?: string): { day: string; month: string; year: string } {
  if (!dueDate) {
    return { day: '', month: '', year: '' };
  }

  const isoMatch = dueDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return {
      year: isoMatch[1],
      month: isoMatch[2],
      day: isoMatch[3],
    };
  }

  const parsed = new Date(dueDate);
  if (Number.isNaN(parsed.getTime())) {
    return { day: '', month: '', year: '' };
  }

  return {
    day: normalizeNumericPart(String(parsed.getDate())),
    month: normalizeNumericPart(String(parsed.getMonth() + 1)),
    year: String(parsed.getFullYear()),
  };
}

export function formatSubscriptionDueDate(dueDate?: string, fallbackBillingDate?: number): string {
  if (dueDate) {
    const parts = splitSubscriptionDueDate(dueDate);

    if (parts.day && parts.month && parts.year) {
      return `${parts.day}/${parts.month}/${parts.year}`;
    }
  }

  if (fallbackBillingDate) {
    return `dia ${fallbackBillingDate}`;
  }

  return 'sem data';
}
