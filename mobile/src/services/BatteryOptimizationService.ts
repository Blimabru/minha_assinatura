import { NativeModules, Platform } from 'react-native';

const { BatteryOptimization } = NativeModules;

interface BatteryOptimizationService {
  isBatteryOptimizationEnabled(): Promise<boolean>;
  requestBatteryOptimizationExemption(): Promise<boolean>;
  openBatterySettings(): Promise<boolean>;
  openAppBatterySettings(): Promise<boolean>;
}

const createBatteryOptimizationService = (): BatteryOptimizationService => {
  if (Platform.OS !== 'android' || !BatteryOptimization) {
    return {
      isBatteryOptimizationEnabled: async () => false,
      requestBatteryOptimizationExemption: async () => false,
      openBatterySettings: async () => false,
      openAppBatterySettings: async () => false,
    };
  }

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
  };
};

export const batteryOptimizationService = createBatteryOptimizationService();
