import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, ScrollView, Alert, ActivityIndicator, View as RNView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useSubscriptions } from '@/database/hooks/useSubscriptions';
import { formatCurrencyByCode } from '../../src/utils/formatCurrency';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';

export default function ReportsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { items, monthlyTotal } = useSubscriptions();

  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingCSV, setExportingCSV] = useState(false);

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

  const handleExportCSV = async () => {
    if (items.length === 0) {
      Alert.alert('Exportar CSV', 'Nenhuma assinatura cadastrada para exportar.');
      return;
    }

    setExportingCSV(true);
    try {
      // Cabeçalho do CSV
      let csvContent = 'Serviço,Valor,Moeda,Recorrência,Data de Vencimento,Categoria,Status\n';
      
      // Conteúdo do CSV
      items.forEach((item) => {
        const valueFormatted = item.value.toFixed(2);
        const name = item.serviceName.replace(/"/g, '""');
        const cat = (item.categoryName || 'Outros').replace(/"/g, '""');
        csvContent += `"${name}",${valueFormatted},"${item.currency}","${item.recurrence}","${item.dueDate || ''}","${cat}","${item.status}"\n`;
      });

      // Cria a instância do arquivo utilizando a nova API Expo SDK 54
      const file = new File(Paths.cache, 'minhas_assinaturas.csv');
      
      // Grava o arquivo de forma síncrona/nativa
      file.write(csvContent);

      // Abre a folha de compartilhamento nativa com a URI do arquivo
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'text/csv',
          dialogTitle: 'Exportar Assinaturas (CSV)',
          UTI: 'public.comma-separated-values-text',
        });
      } else {
        Alert.alert('Erro', 'O compartilhamento não está disponível neste dispositivo.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Ocorreu um erro ao exportar o arquivo CSV.');
    } finally {
      setExportingCSV(false);
    }
  };

  const handleExportPDF = async () => {
    if (items.length === 0) {
      Alert.alert('Exportar PDF', 'Nenhuma assinatura cadastrada para exportar.');
      return;
    }

    setExportingPDF(true);
    try {
      const formattedMonthlyTotal = formatCurrencyByCode(monthlyTotal, 'BRL');
      const formattedAnnualProjection = formatCurrencyByCode(annualProjection, 'BRL');

      // Geração de HTML das linhas da tabela
      const tableRowsHtml = items
        .map(
          (item) => `
        <tr class="table-row">
          <td class="td-service">${item.serviceName}</td>
          <td class="td-category">${item.categoryName || 'Outros'}</td>
          <td class="td-recurrence">${item.recurrence.charAt(0).toUpperCase() + item.recurrence.slice(1)}</td>
          <td class="td-date">${item.dueDate ? item.dueDate.split('-').reverse().join('/') : 'Sem data'}</td>
          <td class="td-value">${formatCurrencyByCode(item.value, item.currency)}</td>
        </tr>
      `
        )
        .join('');

      // Geração de HTML do resumo por categorias
      const categoryRowsHtml = categorySummary
        .map(
          (cat) => `
        <div class="category-row">
          <div class="category-info">
            <span class="category-name">${cat.category}</span>
            <span class="category-total">${formatCurrencyByCode(cat.total, 'BRL')}</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill" style="width: ${cat.width};"></div>
          </div>
        </div>
      `
        )
        .join('');

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Relatório de Assinaturas</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
            
            body {
              font-family: 'Inter', sans-serif;
              color: #1F2937;
              margin: 0;
              padding: 40px;
              background-color: #FFFFFF;
            }

            .header {
              border-bottom: 2px solid #E5E7EB;
              padding-bottom: 24px;
              margin-bottom: 32px;
            }

            .logo-container {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }

            .title {
              font-size: 28px;
              font-weight: 800;
              color: #111827;
              margin: 0;
            }

            .subtitle {
              font-size: 14px;
              color: #6B7280;
              margin-top: 4px;
            }

            .date-stamp {
              font-size: 12px;
              color: #9CA3AF;
              text-align: right;
              line-height: 1.6;
            }

            .stats-container {
              display: flex;
              gap: 20px;
              margin-bottom: 36px;
            }

            .stat-card {
              flex: 1;
              background-color: #F9FAFB;
              border: 1px solid #E5E7EB;
              border-radius: 16px;
              padding: 20px;
            }

            .stat-label {
              font-size: 11px;
              font-weight: 600;
              color: #4B5563;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 8px;
            }

            .stat-value {
              font-size: 24px;
              font-weight: 800;
              color: #111827;
            }

            .stat-value.primary {
              color: #3B82F6;
            }

            .section-title {
              font-size: 18px;
              font-weight: 700;
              color: #111827;
              margin-top: 32px;
              margin-bottom: 16px;
              border-left: 4px solid #3B82F6;
              padding-left: 10px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 40px;
            }

            th {
              background-color: #F3F4F6;
              color: #374151;
              font-size: 11px;
              font-weight: 600;
              text-transform: uppercase;
              text-align: left;
              padding: 12px 16px;
              border-bottom: 2px solid #E5E7EB;
            }

            .table-row {
              border-bottom: 1px solid #F3F4F6;
            }

            .table-row:last-child {
              border-bottom: 2px solid #E5E7EB;
            }

            td {
              padding: 14px 16px;
              font-size: 14px;
              color: #374151;
            }

            .td-service {
              font-weight: 600;
              color: #111827;
            }

            .td-category {
              color: #4B5563;
            }

            .td-value {
              font-weight: 700;
              color: #111827;
              text-align: right;
            }

            th.th-value {
              text-align: right;
            }

            .categories-container {
              background-color: #F9FAFB;
              border: 1px solid #E5E7EB;
              border-radius: 16px;
              padding: 24px;
              margin-bottom: 40px;
            }

            .category-row {
              margin-bottom: 16px;
            }

            .category-row:last-child {
              margin-bottom: 0;
            }

            .category-info {
              display: flex;
              justify-content: space-between;
              font-size: 14px;
              font-weight: 600;
              margin-bottom: 6px;
            }

            .category-name {
              color: #374151;
            }

            .category-total {
              color: #111827;
            }

            .bar-track {
              width: 100%;
              height: 8px;
              background-color: #E5E7EB;
              border-radius: 999px;
              overflow: hidden;
            }

            .bar-fill {
              height: 100%;
              background-color: #3B82F6;
              border-radius: 999px;
            }

            .footer {
              text-align: center;
              font-size: 11px;
              color: #9CA3AF;
              margin-top: 60px;
              border-top: 1px solid #F3F4F6;
              padding-top: 16px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-container">
              <div>
                <h1 class="title">Minha Assinatura</h1>
                <p class="subtitle">Relatório Geral Financeiro de Assinaturas</p>
              </div>
              <div class="date-stamp">
                Gerado em: ${new Date().toLocaleDateString('pt-BR')}<br>
                Total: ${items.length} assinaturas
              </div>
            </div>
          </div>

          <div class="stats-container">
            <div class="stat-card">
              <div class="stat-label">Custo Mensal Consolidado</div>
              <div class="stat-value primary">${formattedMonthlyTotal}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Projeção de Gasto Anual</div>
              <div class="stat-value">${formattedAnnualProjection}</div>
            </div>
          </div>

          <h2 class="section-title">Minhas Assinaturas</h2>
          <table>
            <thead>
              <tr>
                <th>Serviço</th>
                <th>Categoria</th>
                <th>Recorrência</th>
                <th>Próximo Vencimento</th>
                <th class="th-value">Valor</th>
              </tr>
            </thead>
            <tbody>
              ${tableRowsHtml}
            </tbody>
          </table>

          <h2 class="section-title">Gastos por Categoria</h2>
          <div class="categories-container">
            ${categoryRowsHtml}
          </div>

          <div class="footer">
            Minha Assinatura App &copy; ${new Date().getFullYear()} - Todos os direitos reservados.<br>
            Relatório gerado localmente e criptografado no dispositivo.
          </div>
        </body>
        </html>
      `;

      // Gera o arquivo PDF a partir do HTML
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
      });

      // Abre a folha de compartilhamento nativa
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Exportar Relatório Financeiro (PDF)',
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('Erro', 'O compartilhamento não está disponível neste dispositivo.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Ocorreu um erro ao gerar o relatório em PDF.');
    } finally {
      setExportingPDF(false);
    }
  };

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
              <RNView style={[styles.chartRow, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
                <Text style={[styles.chartLabel, { color: colors.text }]}>{item.category}</Text>
                <Text style={[styles.chartAmount, { color: colors.textSecondary }]}>{formatCurrencyByCode(item.total, 'BRL')}</Text>
                <RNView style={[styles.chartBarTrack, { backgroundColor: colors.chartTrackBg }]}> 
                  <RNView style={[styles.chartBarFill, { width: item.width, backgroundColor: colors.tint }]} />
                </RNView>
              </RNView>
            )}
          />
        ) : (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Nenhum dado de categoria disponível.</Text>
        )}
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Exportar dados</Text>
      <View style={styles.exportActions}>
        <Pressable
          style={[styles.exportButton, { backgroundColor: '#f87171' }]}
          onPress={handleExportPDF}
          disabled={exportingPDF || exportingCSV}
        >
          {exportingPDF ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.exportButtonText}>Exportar PDF</Text>
          )}
        </Pressable>
        <Pressable
          style={[styles.exportButton, { backgroundColor: '#34d399' }]}
          onPress={handleExportCSV}
          disabled={exportingPDF || exportingCSV}
        >
          {exportingCSV ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.exportButtonText}>Exportar CSV</Text>
          )}
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
    padding: 12,
    borderRadius: 14,
    borderWidth: 0.5,
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
    justifyContent: 'center',
    height: 52,
  },
  exportButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});