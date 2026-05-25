/*
  SearchBar.tsx
  Barra de busca simples usada na tela de assinaturas.

  Comentários (pt-br):
  - Componente reutilizável responsável por capturar texto de pesquisa.
  - Não faz lógica de filtragem por conta própria: apenas emite o texto via onChange.
*/

import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<Props> = ({ value, onChange, placeholder = 'Buscar assinaturas...' }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}>
      <FontAwesome name="search" size={16} color={colors.textSecondary} style={{ marginHorizontal: 8 }} />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        style={[styles.input, { color: colors.text }]}
        value={value}
        onChangeText={onChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 8,
    marginVertical: 12,
    borderWidth: 1,
    elevation: 1,
  },
  input: { flex: 1, paddingVertical: 6, paddingHorizontal: 4, fontSize: 14 },
});

export default SearchBar;
