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

interface Props {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<Props> = ({ value, onChangeText, placeholder = 'Buscar assinaturas...' }) => {
  return (
    <View style={styles.container}>
      <FontAwesome name="search" size={16} color="#999" style={{ marginHorizontal: 8 }} />
      <TextInput
        placeholder={placeholder}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    marginVertical: 12,
    marginHorizontal: 16,
    elevation: 1,
  },
  input: { flex: 1, paddingVertical: 6, paddingHorizontal: 4, fontSize: 14 },
});

export default SearchBar;
