import React, { useState } from 'react';
import { View, StyleSheet, Switch, Pressable, ActivityIndicator } from 'react-native';
import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useSync } from '@/src/contexts/SyncContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuth } from '@/src/contexts/AuthContext';
import PurchaseModal from '@/components/PurchaseModal';

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
  const { syncStatus, lastSyncedAt, syncInBackground } = useSync();
  const { isPremium } = useAuth();
  const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);

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
          <View style={styles.syncTitleContainer}>
            <FontAwesome 
              name={
                syncStatus === 'syncing' ? 'refresh' :
                syncStatus === 'synced' ? 'check-circle' :
                syncStatus === 'offline' ? 'exclamation-circle' :
                syncStatus === 'error' ? 'exclamation-triangle' : 'cloud'
              } 
              size={18} 
              color={getStatusColor(syncStatus)} 
              style={styles.syncHeaderIcon} 
            />
            <Text style={[styles.syncTitle, { color: colors.text }]}>Sincronização na Nuvem</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(syncStatus) }]}>
            <Text style={styles.statusBadgeText}>{getStatusLabel(syncStatus)}</Text>
          </View>
        </View>
        
        <Text style={[styles.syncText, { color: colors.textSecondary }]}>
          {getSyncDescription(syncStatus, lastSyncedAt)}
        </Text>
        
        <View style={[styles.syncFooter, { borderTopColor: colors.cardBorder }]}>
          {lastSyncedAt ? (
            <Text style={[styles.lastSyncText, { color: colors.textTertiary }]}>
              Último: {lastSyncedAt}
            </Text>
          ) : (
            <Text style={[styles.lastSyncText, { color: colors.textTertiary }]}>
              Nunca sincronizado
            </Text>
          )}
          
          <Pressable
            onPress={syncInBackground}
            disabled={syncStatus === 'syncing'}
            style={({ pressed }) => [
              styles.syncButton,
              { 
                backgroundColor: syncStatus === 'syncing' ? colors.inputBackground : colors.tint,
                borderColor: colors.cardBorder,
                opacity: pressed && syncStatus !== 'syncing' ? 0.8 : 1,
              }
            ]}
          >
            {syncStatus === 'syncing' ? (
              <View style={styles.syncButtonContent}>
                <ActivityIndicator size="small" color={colors.textSecondary} style={{ marginRight: 6 }} />
                <Text style={[styles.syncButtonText, { color: colors.textSecondary }]}>Sincronizando...</Text>
              </View>
            ) : (
              <View style={styles.syncButtonContent}>
                <FontAwesome name="refresh" size={12} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={[styles.syncButtonText, { color: '#FFF' }]}>Sincronizar</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {/* Bloco Premium / Remover Anúncios */}
      <View style={[styles.syncCard, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
        <View style={styles.syncHeader}>
          <View style={styles.syncTitleContainer}>
            <FontAwesome name="star" size={18} color="#F5A623" style={styles.syncHeaderIcon} />
            <Text style={[styles.syncTitle, { color: colors.text }]}>Versão do Aplicativo</Text>
          </View>
          {isPremium ? (
            <View style={[styles.statusBadge, { backgroundColor: '#F5A623' }]}>
              <Text style={styles.statusBadgeText}>Premium</Text>
            </View>
          ) : (
            <View style={[styles.statusBadge, { backgroundColor: colors.tint }]}>
              <Text style={styles.statusBadgeText}>Gratuito</Text>
            </View>
          )}
        </View>

        {isPremium ? (
          <Text style={[styles.syncText, { color: colors.textSecondary }]}>
            Parabéns! Você tem acesso vitalício à versão Premium. Todos os anúncios foram permanentemente desativados.
          </Text>
        ) : (
          <>
            <Text style={[styles.syncText, { color: colors.textSecondary }]}>
              Você está utilizando a versão gratuita com suporte a anúncios. Remova-os agora mesmo!
            </Text>
            <View style={[styles.syncFooter, { borderTopColor: colors.cardBorder }]}>
              <Text style={[styles.lastSyncText, { color: colors.textTertiary }]}>
                Apenas R$ 5,00 (Taxa única)
              </Text>
              
              <Pressable
                onPress={() => setPurchaseModalVisible(true)}
                style={({ pressed }) => [
                  styles.syncButton,
                  { 
                    backgroundColor: '#F5A623',
                    borderColor: '#F5A623',
                    opacity: pressed ? 0.8 : 1,
                  }
                ]}
              >
                <View style={styles.syncButtonContent}>
                  <FontAwesome name="star" size={12} color="#FFF" style={{ marginRight: 6 }} />
                  <Text style={[styles.syncButtonText, { color: '#FFF' }]}>Remover Anúncios</Text>
                </View>
              </Pressable>
            </View>
          </>
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

      <PurchaseModal visible={purchaseModalVisible} onClose={() => setPurchaseModalVisible(false)} />
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
    fontSize: 11,
    fontStyle: 'italic',
  },
  syncTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncHeaderIcon: {
    marginRight: 6,
  },
  syncFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
  },
  syncButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  syncButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncButtonText: {
    fontSize: 12,
    fontWeight: '600',
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
