import React from 'react';
import { View, StyleSheet, Switch } from 'react-native';
import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

/*
  settings.tsx
  App settings screen (Configurações)

  Comentários (pt-br):
  - Contém toggles e preferências do usuário. Aqui apenas exemplos estáticos.
  - Pode integrar permissões de bateria e preferências de notificações.
*/

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

      <View style={[styles.row, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
        <Text style={[styles.label, { color: colors.text }]}>Otimização de Bateria</Text>
        <Switch value={true} onValueChange={() => {}} />
      </View>

      <View style={[styles.row, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
        <Text style={[styles.label, { color: colors.text }]}>Notificações</Text>
        <Switch value={true} onValueChange={() => {}} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 12 },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 12, 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    marginBottom: 12,
    borderWidth: 1,
  },
  label: { fontSize: 16, fontWeight: '600' },
});
