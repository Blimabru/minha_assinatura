/**
 * Hook customizado para gerenciar alertas de otimização de bateria.
 * 
 * Fornece lógica reativa para:
 * - Verificar se otimização está ativa (Doze Mode, Low Power Mode ou bateria baixa)
 * - Controlar visibilidade do modal
 * - Sincronizar com mudanças de estado de bateria
 */

import { useEffect, useState, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';

import {
  checkBatteryOptimization,
  getBatteryStatus,
} from '@/utils/batteryOptimization';

/**
 * Estado gerenciado pelo hook
 */
interface BatteryOptimizationState {
  isOptimizationEnabled: boolean;
  showAlert: boolean;
  isLoading: boolean;
  batteryLevel?: number;
}

/**
 * Valor padrão do estado
 */
const initialState: BatteryOptimizationState = {
  isOptimizationEnabled: false,
  showAlert: false,
  isLoading: true,
};

/**
 * Hook que gerencia o fluxo de verificação e alertas de otimização de bateria.
 * 
 * Verifica:
 * - Low Power Mode (modo de economia de energia)
 * - Doze Mode (otimização de bateria)
 * - Bateria em nível crítico
 * 
 * Uso:
 * ```tsx
 * const { isOptimizationEnabled, showAlert, dismissAlert } = useBatteryOptimization();
 * 
 * return (
 *   <BatteryOptimizationModal
 *     visible={showAlert}
 *     onDismiss={dismissAlert}
 *   />
 * );
 * ```
 */
export function useBatteryOptimization() {
  const [state, setState] = useState<BatteryOptimizationState>(initialState);
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);

  /**
   * Verifica o estado da otimização de bateria ao montar o componente.
   */
  const checkAndAlertBatteryStatus = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      // Verifica status atual de bateria
      const result = await checkBatteryOptimization();
      const status = await getBatteryStatus();

      // Mostra alerta apenas se otimização estiver ativa
      setState((prev) => ({
        ...prev,
        isOptimizationEnabled: result.isOptimizationEnabled,
        showAlert: result.isOptimizationEnabled,
        isLoading: false,
        batteryLevel: status?.batteryLevel,
      }));

      // Log detalhado
      if (result.isOptimizationEnabled) {
        console.log('🔋 Estado de bateria detectado:', {
          lowPowerMode: status?.isLowPowerMode,
          dozeMode: status?.isDozeMode,
          batteryLevel: status?.batteryLevel,
          isBatteryLow: status?.isBatteryLow,
        });
      }
    } catch (err) {
      console.error('❌ Erro ao verificar otimização de bateria:', err);
      setState((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  }, []);

  /**
   * Callback para dismissar o alerta.
   */
  const dismissAlert = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showAlert: false,
    }));
  }, []);

  /**
   * Monitora mudanças do estado da app (quando volta do background)
   */
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
    // Se voltou do background para foreground, reche verificação
    if (appState === 'background' && nextAppState === 'active') {
      checkAndAlertBatteryStatus();
    }
    setAppState(nextAppState);
  }, [appState, checkAndAlertBatteryStatus]);

  /**
   * Executa verificação ao montar
   */
  useEffect(() => {
    checkAndAlertBatteryStatus();
  }, [checkAndAlertBatteryStatus]);

  return {
    ...state,
    dismissAlert,
    retry: checkAndAlertBatteryStatus,
  };
}
