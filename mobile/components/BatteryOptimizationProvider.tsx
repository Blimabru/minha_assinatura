/**
 * Componente que encapsula a lógica de verificação de bateria.
 * 
 * Este componente:
 * 1. Usa o hook useBatteryOptimization para gerenciar estado
 * 2. Renderiza o modal quando otimização está ativa
 * 3. Integra com openBatterySettings para abrir configurações
 */

import React, { useCallback } from 'react';
import { useBatteryOptimization } from '@/hooks/useBatteryOptimization';
import { openBatterySettings } from '@/utils/batteryOptimization';
import BatteryOptimizationModal from './BatteryOptimizationModal';

/**
 * Componente wrapper que gerencia o fluxo completo de alerta de bateria.
 */
export default function BatteryOptimizationProvider() {
  const {
    showAlert,
    isLoading,
    dismissAlert,
  } = useBatteryOptimization();

  /**
   * Callback para abrir configurações e depois dismissar o modal.
   */
  const handleOpenSettings = useCallback(async () => {
    await openBatterySettings();
    // Dismissa o modal após abrir as configurações
    dismissAlert();
  }, [dismissAlert]);

  return (
    <BatteryOptimizationModal
      visible={showAlert}
      onDismiss={dismissAlert}
      onOpenSettings={handleOpenSettings}
      isLoading={isLoading}
    />
  );
}
