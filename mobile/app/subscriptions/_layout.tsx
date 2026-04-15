import React from 'react';
import { Stack } from 'expo-router';

export default function SubscriptionsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="create"
        options={{
          headerTitle: 'Adicionar Assinatura',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
