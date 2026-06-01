import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { synchronize } from '@nozbe/watermelondb/sync';
import database from '@/database'; // WatermelonDB local database
import { useAuth } from './AuthContext';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';

interface SyncContextType {
  syncStatus: SyncStatus;
  lastSyncedAt: string | null;
  syncInBackground: () => Promise<void>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

// URL local da API dinâmica de acordo com o ambiente (emulador, dispositivo físico ou localhost)
const getApiUrl = () => {
  const hostUri = Constants.expoConfig?.hostUri; // Ex: "192.168.1.100:8081"
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:3000`;
  }
  return Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
};

const API_URL = getApiUrl();

export const SyncProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  // Carrega o último horário de sincronização salvo ao inicializar
  useEffect(() => {
    const loadLastSync = async () => {
      try {
        const value = await AsyncStorage.getItem('last_synced_at');
        if (value) {
          setLastSyncedAt(value);
        }
      } catch (e) {
        console.warn('Falha ao carregar último sync do AsyncStorage', e);
      }
    };
    loadLastSync();
  }, []);

  // Executa o ciclo de sincronização em segundo plano
  const syncInBackground = async (): Promise<void> => {
    // Só sincroniza se houver um usuário logado
    if (!user) {
      setSyncStatus('idle');
      return;
    }

    // Evita múltiplas sincronizações simultâneas
    if (syncStatus === 'syncing') return;

    setSyncStatus('syncing');

    try {
      // 1. Simulação ou recuperação do Token JWT associado ao usuário.
      // Em produção, você pegaria o token real do AuthContext.
      // Para fins de teste local rápido, simulamos ou recuperamos o token
      const token = await AsyncStorage.getItem(`user_${user.email}_token`) || 'simulated_jwt_token_for_dev';

      // 2. Dispara o protocolo oficial de sincronização do WatermelonDB
      await synchronize({
        database,
        pullChanges: async ({ lastPulledAt }) => {
          const response = await fetch(
            `${API_URL}/sync?last_pulled_at=${lastPulledAt || 0}`,
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error(`Falha no pull da API (Status ${response.status})`);
          }

          const { changes, timestamp } = await response.json();
          return { changes, timestamp };
        },
        pushChanges: async ({ changes }) => {
          const response = await fetch(`${API_URL}/sync`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ changes }),
          });

          if (!response.ok) {
            throw new Error(`Falha no push da API (Status ${response.status})`);
          }
        },
      });

      // 3. Atualiza o estado de sucesso e persiste a data
      const nowStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const fullDateStr = `Hoje às ${nowStr}`;
      
      await AsyncStorage.setItem('last_synced_at', fullDateStr);
      setLastSyncedAt(fullDateStr);
      setSyncStatus('synced');

      // Limpa para 'idle' após exibir sucesso por alguns segundos
      setTimeout(() => setSyncStatus('idle'), 5000);

    } catch (error: any) {
      console.warn('Erro na sincronização automática:', error);
      
      // Tenta discernir erro de conexão física
      if (error.message && (error.message.includes('Network request failed') || error.message.includes('Failed to fetch'))) {
        setSyncStatus('offline');
      } else {
        setSyncStatus('error');
      }
    }
  };

  // Efeito 1: Sincroniza automaticamente quando o usuário faz login ou inicia o app logado
  useEffect(() => {
    if (user) {
      syncInBackground();
    } else {
      setSyncStatus('idle');
    }
  }, [user]);

  // Efeito 2: Sincronização periódica a cada 30 segundos se o usuário estiver ativo/logado
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      syncInBackground();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [user]);

  return (
    <SyncContext.Provider value={{ syncStatus, lastSyncedAt, syncInBackground }}>
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync deve ser usado dentro de um SyncProvider');
  }
  return context;
};
