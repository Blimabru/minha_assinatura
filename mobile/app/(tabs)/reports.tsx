import React, { useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { useSubscriptions } from '@/database/hooks/useSubscriptions';
import { formatCurrencyByCode } from '../../src/utils/formatCurrency';

export default function ReportsScreen() {
  const { items, monthlyTotal } = useSubscriptions();

  const annualProjection = useMemo(() => monthlyTotal * 12, [monthlyTotal]);

  const categories = useMemo(() => {
    const grouped = items.reduce<Record<string, number>>((acc, item) => {
      acc[item.categoryName] = (acc[item.categoryName] || 0) + item.value;
      return acc;
    }, {});

    const entries = Object.entries(grouped).map(([category, value]) => ({ category, value }));
    const maxValue = Math.max(...entries.map((item) => item.value), 1);
    return entries
      .sort((a, b) => b.value - a.value)
      .map((item) => ({
        ...item,
        width: `${Math.max((item.value / maxValue) * 100, 10)}%` as `${number}%`,
      }));
  }, [items]);

  function handleExport(type: 'PDF' | 'CSV') {
    Alert.alert('Exportar', `Exportando relatório como ${type}...`);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Relatórios</Text>
      <Text style={styles.subtitle}>Análise completa das suas assinaturas</Text>

      <View style={styles.cardsRow}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Custo Mensal</Text>
          <Text style={styles.cardValue}>{formatCurrencyByCode(monthlyTotal, 'BRL')}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Projeção Anual</Text>
          <Text style={styles.cardValue}>{formatCurrencyByCode(annualProjection, 'BRL')}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Gastos por Categoria</Text>
      <View style={styles.chartCard}>
        {categories.length > 0 ? (
          categories.map((item) => (
            <View key={item.category} style={styles.chartRow}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartLabel}>{item.category}</Text>
                <Text style={styles.chartValue}>{formatCurrencyByCode(item.value, 'BRL')}</Text>
              </View>
              <View style={styles.chartTrack}>
                <View style={[styles.chartBar, { width: item.width }]} />
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Adicione assinaturas para gerar relatórios.</Text>
        )}
      </View>

      <View style={styles.exportSection}>
        <Pressable style={[styles.exportButton, styles.pdfButton]} onPress={() => handleExport('PDF')}>
          <Text style={styles.exportButtonText}>Exportar PDF</Text>
        </Pressable>
        <Pressable style={[styles.exportButton, styles.csvButton]} onPress={() => handleExport('CSV')}>
          <Text style={styles.exportButtonText}>Exportar CSV</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f6ff',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  subtitle: {
    color: '#6b7280',
    marginBottom: 18,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 22,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  cardLabel: {
    color: '#6b7280',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  cardValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#111827',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
    color: '#111827',
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    gap: 14,
    marginBottom: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  chartRow: {
    gap: 10,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  chartLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  chartValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  chartTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: '#e5e7eb',
    overflow: 'hidden',
  },
  chartBar: {
    height: '100%',
    backgroundColor: '#8b5cf6',
  },
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
    marginVertical: 20,
  },
  exportSection: {
    gap: 12,
  },
  exportButton: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  pdfButton: {
    backgroundColor: '#fee2e2',
  },
  csvButton: {
    backgroundColor: '#dcfce7',
  },
  exportButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
});
