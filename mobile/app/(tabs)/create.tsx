import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/components/Themed';

/*
  create.tsx
  Tab that redirects to the existing subscription create route.

  Comentários (pt-br):
  - Mantemos a rota única '/subscriptions/create' para formulário.
  - Esta tela apenas encaminha o usuário, preservando o fluxo atual.
*/

export default function CreateTab() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/subscriptions/create');
  }, [router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator />
      <Text>Redirecting to create...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
