/**
 * Utilitários para verificar e gerenciar permissões de otimização de bateria no Android.
 * 
 * O objetivo é garantir que as notificações agendadas de assinaturas não sejam
 * interrompidas pela otimização de bateria (Doze Mode) ou modo de economia de energia (Low Power Mode) no Android.
 */

import { Platform, NativeModules, Linking } from 'react-native';

/**
 * Tipos de retorno para operações de bateria
 */
export interface BatteryCheckResult {
  isOptimizationEnabled: boolean;
}

export interface BatteryStatus {
  isLowPowerMode?: boolean;
  isDozeMode?: boolean;
  batteryLevel?: number;
  isBatteryLow?: boolean;
}

/**
 * Verifica se o dispositivo está com otimização de bateria ativa (apenas Android).
 * 
 * Detecta:
 * - Low Power Mode (modo de economia de energia)
 * - Doze Mode (otimização de bateria)
 * - Bateria crítica/baixa
 * 
 * Se não conseguir verificar, retorna `isOptimizationEnabled: false` para não quebrar a app.
 */
export async function checkBatteryOptimization(): Promise<BatteryCheckResult> {
  // Esta funcionalidade só existe no Android
  if (Platform.OS !== 'android') {
    return {
      isOptimizationEnabled: false,
    };
  }

  try {
    // Tenta acessar o módulo nativo RNCBatteryManager
    const RNBatteryManager = NativeModules.RNCBatteryManager;

    if (!RNBatteryManager || !RNBatteryManager.isLowPowerModeEnabled) {
      return {
        isOptimizationEnabled: false,
      };
    }

    // Chama função nativa para verificar estado
    // Esta função agora detecta Low Power Mode, Doze Mode e bateria baixa
    const isEnabled = await RNBatteryManager.isLowPowerModeEnabled();

    return {
      isOptimizationEnabled: isEnabled || false,
    };
  } catch (error) {
    console.warn('⚠️ Não foi possível verificar otimização de bateria:', error);

    return {
      isOptimizationEnabled: false,
    };
  }
}

/**
 * Obtém informações detalhadas sobre o estado de bateria do dispositivo.
 * 
 * Retorna um objeto com:
 * - isLowPowerMode: Se o modo de economia de energia está ativado
 * - isDozeMode: Se o Doze Mode está ativado
 * - batteryLevel: Nível atual da bateria (0-100)
 * - isBatteryLow: Se a bateria está baixa (<20%)
 * - lowBatteryWarning: Se há aviso de bateria baixa (Android 12+)
 */
export async function getBatteryStatus(): Promise<BatteryStatus> {
  if (Platform.OS !== 'android') {
    return {};
  }

  try {
    const RNBatteryManager = NativeModules.RNCBatteryManager;

    if (!RNBatteryManager || !RNBatteryManager.getBatteryStatus) {
      return {};
    }

    const status = await RNBatteryManager.getBatteryStatus();
    return status || {};
  } catch (error) {
    console.warn('⚠️ Não foi possível obter status de bateria:', error);
    return {};
  }
}

/**
 * Obtém apenas o nível percentual de bateria (0-100)
 */
export async function getBatteryLevel(): Promise<number> {
  if (Platform.OS !== 'android') {
    return -1;
  }

  try {
    const RNBatteryManager = NativeModules.RNCBatteryManager;

    if (!RNBatteryManager || !RNBatteryManager.getBatteryLevel) {
      return -1;
    }

    const level = await RNBatteryManager.getBatteryLevel();
    return level ?? -1;
  } catch (error) {
    console.warn('⚠️ Não foi possível obter nível de bateria:', error);
    return -1;
  }
}

/**
 * Abre as configurações nativas do Android para o usuário excluir a app da otimização de bateria.
 * 
 * No Android, a tela exata varia por fabricante:
 * - Samsung: "Battery and device care"
 * - MIUI: "Battery & app management"
 * - Stock Android: "Battery Optimization"
 */
export async function openBatterySettings(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  try {
    // Tenta abrir a tela de configurações de bateria do Android
    await Linking.openSettings();
  } catch (error) {
    console.error('❌ Erro ao abrir configurações de bateria:', error);
    // Se falhar, tenta abrir as configurações gerais do telefone
    try {
      await Linking.openURL('android-app://com.android.settings/');
    } catch (innerError) {
      console.error('❌ Erro ao abrir configurações gerais:', innerError);
    }
  }
}
