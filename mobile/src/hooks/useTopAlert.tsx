import React, { useState, useRef, useCallback } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

/*
  useTopAlert.ts
  Hook customizado para exibir notificações no topo da tela.

  Comentários (pt-br):
  - Gerencia estado de notificação (message, type, animação).
  - Auto-dismiss após N segundos.
  - Retorna componente TopAlert + funções (showError, showWarning, showSuccess).
*/

type AlertType = 'error' | 'warning' | 'success';

interface TopAlertState {
  message: string;
  type: AlertType;
  isVisible: boolean;
}

export function useTopAlert() {
  const [state, setState] = useState<TopAlertState>({
    message: '',
    type: 'error',
    isVisible: false,
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<number | null>(null);

  // Mostrar notificação com auto-dismiss
  const showAlert = useCallback((message: string, type: AlertType = 'error', duration = 3000) => {
    // Cancela timeout anterior se houver
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setState({ message, type, isVisible: true });

    // Anima entrada
    Animated.timing(fadeAnim, { toValue: 1, duration: 180, useNativeDriver: true }).start();

    // Auto-dismiss
    const t = setTimeout(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
        setState((prev) => ({ ...prev, isVisible: false }));
      });
    }, duration);

    timeoutRef.current = t as unknown as number;
  }, [fadeAnim]);

  // Atalhos para tipos de alerta
  const showError = useCallback((message: string) => showAlert(message, 'error', 3000), [showAlert]);
  const showWarning = useCallback((message: string) => showAlert(message, 'warning', 3000), [showAlert]);
  const showSuccess = useCallback((message: string) => showAlert(message, 'success', 2500), [showAlert]);

  // Cleanup ao desmontar
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current as unknown as number);
      }
    };
  }, []);

  // Componente TopAlert que deve ser renderizado no topo da tela
  const TopAlert = () => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    if (!state.isVisible) return null;

    const bgColor =
      state.type === 'error' ? colors.error : state.type === 'warning' ? colors.warning : colors.success;

    return (
      <Animated.View
        pointerEvents="none"
        style={[
          styles.container,
          { opacity: fadeAnim, backgroundColor: bgColor },
        ]}
      >
        <Text style={styles.message}>{state.message}</Text>
      </Animated.View>
    );
  };

  return {
    TopAlert,
    showError,
    showWarning,
    showSuccess,
    showAlert,
  };
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 18,
    left: 16,
    right: 16,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    zIndex: 1000,
    elevation: 10,
  },
  message: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
  },
});
