import React from 'react';
import { View, StyleSheet, Switch } from 'react-native';
import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useSync } from '@/src/contexts/SyncContext';

/*
  settings.tsx
  App settings screen (Configurações)

  Comentários (pt-br):
  - Contém toggles e preferências do usuário.
  - Integra informações de status e logs visuais da sincronização automática em segundo plano.
*/

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { syncStatus, lastSyncedAt } = useSync();

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'syncing': return 'Sincronizando...';
      case 'synced': return 'Sincronizado';
      case 'offline': return 'Sem Conexão';
      case 'error': return 'Erro no Sync';
      default: return 'Ativa';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'syncing': return '#F59E0B'; // Laranja / Âmbar
      case 'synced': return '#10B981'; // Verde Esmeralda
      case 'offline': return '#6B7280'; // Cinza
      case 'error': return '#EF4444'; // Vermelho
      default: return colors.tint; // Roxo Padrão da App
    }
  };

  const getSyncDescription = (status: string, lastSync: string | null) => {
    switch (status) {
      case 'syncing':
        return 'Sincronizando e atualizando seus dados na nuvem em segundo plano...';
      case 'synced':
        return 'Seus dados locais estão idênticos aos salvos no banco de dados remoto.';
      case 'offline':
        return 'Dispositivo sem rede. As alterações locais serão enviadas quando a conexão voltar.';
      case 'error':
        return 'Conexão rejeitada pela API. Verifique se o servidor NestJS está ativo.';
      default:
        return lastSync 
          ? 'Seus dados estão protegidos e sincronizados de forma totalmente automática na nuvem.'
          : 'Sincronização ativa. O primeiro ciclo iniciará em segundo plano a qualquer momento.';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={styles.headerConf}>
        <Text style={[styles.title, { color: colors.text }]}>Configurações</Text>
      </View>

      {/* Bloco de Status da Sincronização Automática */}
      <View style={[styles.syncCard, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
        <View style={styles.syncHeader}>
          <Text style={[styles.syncTitle, { color: colors.text }]}>Sincronização na Nuvem</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(syncStatus) }]}>
            <Text style={styles.statusBadgeText}>{getStatusLabel(syncStatus)}</Text>
          </View>
        </View>
        
        <Text style={[styles.syncText, { color: colors.text }]}>
          {getSyncDescription(syncStatus, lastSyncedAt)}
        </Text>
        
        {lastSyncedAt && (
          <Text style={[styles.lastSyncText, { color: colors.tabIconDefault }]}>
            Último sincronismo: {lastSyncedAt}
          </Text>
        )}
      </View>

      <View style={[styles.row, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
        <Text style={[styles.label, { color: colors.text }]}>Otimização de Bateria</Text>
        <Switch value={true} onValueChange={() => {}} trackColor={{ false: colors.inputBackground, true: colors.tint }} thumbColor={colors.textInverse} />
      </View>

      <View style={[styles.row, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
        <Text style={[styles.label, { color: colors.text }]}>Notificações</Text>
        <Switch value={true} onValueChange={() => {}} trackColor={{ false: colors.inputBackground, true: colors.tint }} thumbColor={colors.textInverse} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerConf: {
    marginTop: 30,
  },
  container: {
    flex: 1, padding: 16
  },
  title: {
    fontSize: 26, fontWeight: '800', marginBottom: 12
  },
  syncCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  syncHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  syncTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  syncText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.85,
    marginBottom: 10,
  },
  lastSyncText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 12, 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    marginBottom: 12,
    borderWidth: 1,
  },
  label: {
    fontSize: 16, fontWeight: '600',
  },
});
