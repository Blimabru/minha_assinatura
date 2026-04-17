import { StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import { useBatteryOptimization } from '@/src/hooks/useBatteryOptimization';
import { BatteryOptimizationAlert } from '@/src/components/BatteryOptimizationAlert';

export default function TabOneScreen() {
  const { isBatteryOptimizationEnabled, checkPermission } = useBatteryOptimization();
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
    }, 1500);
  };

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.title}>Tab One</Text>
        <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
        <EditScreenInfo path="app/(tabs)/index.tsx" />
      </View>

      <BatteryOptimizationAlert
        visible={showAlert}
        onDismiss={() => setShowAlert(false)}
        onPermissionGranted={handlePermissionGranted}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
