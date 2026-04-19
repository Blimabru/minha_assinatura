import { StyleSheet, ScrollView } from 'react-native';
import { useEffect, useState, useRef } from 'react';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import { useBatteryOptimization } from '@/src/hooks/useBatteryOptimization';
import { BatteryOptimizationAlert } from '@/src/components/BatteryOptimizationAlert';

export default function TabOneScreen() {
  const { isBatteryOptimizationEnabled, checkPermission } = useBatteryOptimization();
  const [showAlert, setShowAlert] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Mostrar alerta se a otimização estiver ativa
    if (isBatteryOptimizationEnabled === true) {
      setShowAlert(true);
    }
  }, [isBatteryOptimizationEnabled]);

  useEffect(() => {
    return () => {
      // Cleanup: limpar timeout ao desmontar
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handlePermissionGranted = async () => {
    // Aguardar um tempo para o usuário voltar das configurações
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      checkPermission();
      setShowAlert(false);
    }, 1500);
  };

  return (
    <>
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <Text style={styles.title}>Tab One</Text>
          <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
          <EditScreenInfo path="app/(tabs)/index.tsx" />
        </View>
      </ScrollView>

      <BatteryOptimizationAlert
        visible={showAlert}
        onDismiss={() => setShowAlert(false)}
        onPermissionGranted={handlePermissionGranted}
      />
    </>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
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
