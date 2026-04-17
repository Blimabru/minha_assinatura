import { useEffect, useState } from 'react';
import { batteryOptimizationService } from '../services/BatteryOptimizationService';

interface UseBatteryOptimizationReturn {
  isBatteryOptimizationEnabled: boolean | null;
  isLoading: boolean;
  error: Error | null;
  checkPermission: () => Promise<void>;
}

export const useBatteryOptimization = (): UseBatteryOptimizationReturn => {
  const [isBatteryOptimizationEnabled, setIsBatteryOptimizationEnabled] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const checkPermission = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await batteryOptimizationService.isBatteryOptimizationEnabled();
      setIsBatteryOptimizationEnabled(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsBatteryOptimizationEnabled(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkPermission();
  }, []);

  return {
    isBatteryOptimizationEnabled,
    isLoading,
    error,
    checkPermission,
  };
};
