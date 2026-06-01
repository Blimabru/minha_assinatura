import React, { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useSubscriptions } from '@/database/hooks/useSubscriptions';
import { formatCurrencyByCode } from '../../src/utils/formatCurrency';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

export default function ReportsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { items, monthlyTotal } = useSubscriptions();

  const annualProjection = useMemo(() => monthlyTotal * 12, [monthlyTotal]);

  const categorySummary = useMemo(() => {
    const totals = items.reduce((acc, item) => {
      const name = item.categoryName || 'Outros';
      acc[name] = (acc[name] || 0) + item.value;
      return acc;
    }, {} as Record<string, number>);

    const entries = Object.entries(totals).map(([category, total]) => ({ category, total }));
    const maxValue = Math.max(...entries.map((entry) => entry.total), 1);

    return entries
      .sort((a, b) => b.total - a.total)
      .map((entry) => ({
        ...entry,
        width: `${Math.max((entry.total / maxValue) * 100, 8)}%` as `${number}%`,
      }));
  }, [items]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent}>
      <View style={styles.headerRep}>
          <Text style={[styles.title, { color: colors.text }]}>Relatórios</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Análise completa das suas assinaturas.</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}> 
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Custo Mensal</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{formatCurrencyByCode(monthlyTotal, 'BRL')}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}> 
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Projeção Anual</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{formatCurrencyByCode(annualProjection, 'BRL')}</Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Gastos por Categoria</Text>
      <View style={[styles.chartCard, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}> 
        {categorySummary.length ? (
          <FlatList
            data={categorySummary}
            keyExtractor={(item) => item.category}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.chartRow}>
                <Text style={[styles.chartLabel, { color: colors.text }]}>{item.category}</Text>
                <Text style={[styles.chartAmount, { color: colors.textSecondary }]}>{formatCurrencyByCode(item.total, 'BRL')}</Text>
                <View style={[styles.chartBarTrack, { backgroundColor: colors.chartTrackBg }]}> 
                  <View style={[styles.chartBarFill, { width: item.width, backgroundColor: colors.tint }]} />
                </View>
              </View>
            )}
          />
        ) : (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Nenhum dado de categoria disponível.</Text>
        )}
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Exportar dados</Text>
      <View style={styles.exportActions}>
        <Pressable style={[styles.exportButton, { backgroundColor: '#f87171' }]}>
          <Text style={styles.exportButtonText}>Exportar PDF</Text>
        </Pressable>
        <Pressable style={[styles.exportButton, { backgroundColor: '#34d399' }]}>
          <Text style={styles.exportButtonText}>Exportar CSV</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerRep: {
    marginTop: 30,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  chartCard: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    gap: 14,
    marginBottom: 20,
  },
  chartRow: {
    gap: 12,
    marginBottom: 16,
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: '#c0c0c0',
  },
  chartLabel: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  chartAmount: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  chartBarTrack: {
    width: '100%',
    height: 12,
    borderRadius: 999,
    overflow: 'hidden',
  },
  chartBarFill: {
    height: '100%',
    borderRadius: 999,
  },
  emptyText: {
    fontSize: 14,
  },
  exportActions: {
    gap: 12,
  },
  exportButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  exportButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});