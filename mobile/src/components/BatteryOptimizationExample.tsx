import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useBatteryOptimization } from '@/src/hooks/useBatteryOptimization';
import { BatteryOptimizationAlert } from '@/src/components/BatteryOptimizationAlert';

/**
 * Exemplo de uso do fluxo de permissão de bateria
 * 
 * Este componente demonstra como usar o hook e o alerta de otimização de bateria.
 * Você pode integrar isso em sua tela principal ou durante o primeiro acesso.
 */
export const BatteryOptimizationExample = () => {
  const { isBatteryOptimizationEnabled, isLoading, error, checkPermission } = useBatteryOptimization();
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    // Mostrar alerta se a otimização estiver ativa
    if (isBatteryOptimizationEnabled === true) {
      setShowAlert(true);
    }
  }, [isBatteryOptimizationEnabled]);

  const handlePermissionGranted = async () => {
    // Aguardar um tempo para o usuário voltar das configurações
    setTimeout(() => {
      checkPermission();
      setShowAlert(false);
    }, 1000);
  };

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.title}>Estado da Otimização de Bateria</Text>
        
        {isLoading && <Text style={styles.text}>Verificando...</Text>}
        
        {error && <Text style={styles.error}>Erro: {error.message}</Text>}
        
        {isBatteryOptimizationEnabled === true && (
          <Text style={styles.warning}>
            ⚠️ Otimização de bateria ativa - Notificações podem ser bloqueadas
          </Text>
        )}
        
        {isBatteryOptimizationEnabled === false && (
          <Text style={styles.success}>
            ✓ Otimização de bateria desativada - Notificações funcionarão normalmente
          </Text>
        )}
      </View>

      <BatteryOptimizationAlert
        visible={showAlert}
        onDismiss={() => setShowAlert(false)}
        onPermissionGranted={handlePermissionGranted}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    margin: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  text: {
    fontSize: 14,
    color: '#666',
  },
  warning: {
    fontSize: 14,
    color: '#FF6B00',
    fontWeight: '500',
  },
  success: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '500',
  },
  error: {
    fontSize: 14,
    color: '#FF3B30',
  },
});
