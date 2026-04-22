import { NativeModules, Platform, NativeEventEmitter } from 'react-native';

const { BatteryOptimization } = NativeModules;

interface BatteryOptimizationService {
  isBatteryOptimizationEnabled(): Promise<boolean>;
  requestBatteryOptimizationExemption(): Promise<boolean>;
  openBatterySettings(): Promise<boolean>;
  openAppBatterySettings(): Promise<boolean>;
  addEventListener(callback: (isEnabled: boolean) => void): () => void;
}

const createBatteryOptimizationService = (): BatteryOptimizationService => {
  if (Platform.OS !== 'android' || !BatteryOptimization) {
    return {
      isBatteryOptimizationEnabled: async () => false,
      requestBatteryOptimizationExemption: async () => false,
      openBatterySettings: async () => false,
      openAppBatterySettings: async () => false,
      addEventListener: () => () => {},
    };
  }

  const emitter = new NativeEventEmitter(BatteryOptimization);
  
  return {
    isBatteryOptimizationEnabled: () =>
      new Promise((resolve, reject) => {
        BatteryOptimization.isBatteryOptimizationEnabled(
          (error: string | null, result: boolean) => {
            if (error) reject(new Error(error));
            else resolve(result);
          }
        );
      }),

    requestBatteryOptimizationExemption: () =>
      new Promise((resolve, reject) => {
        BatteryOptimization.requestBatteryOptimizationExemption(
          (error: string | null, result: boolean) => {
            if (error) reject(new Error(error));
            else resolve(result);
          }
        );
      }),

    openBatterySettings: () =>
      new Promise((resolve, reject) => {
        BatteryOptimization.openBatterySettings(
          (error: string | null, result: boolean) => {
            if (error) reject(new Error(error));
            else resolve(result);
          }
        );
      }),

    openAppBatterySettings: () =>
      new Promise((resolve, reject) => {
        BatteryOptimization.openAppBatterySettings(
          (error: string | null, result: boolean) => {
            if (error) reject(new Error(error));
            else resolve(result);
          }
        );
      }),

    addEventListener: (callback: (isEnabled: boolean) => void) => {
      const subscription = emitter.addListener(
        'batteryOptimizationChanged',
        callback
      );
      
      return () => {
        subscription.remove();
      };
    },
  };
};

export const batteryOptimizationService = createBatteryOptimizationService();
