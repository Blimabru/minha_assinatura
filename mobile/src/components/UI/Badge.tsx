/*
  Badge.tsx
  Componente pequeno para exibir rótulos de status (Cancelado, Vencido, Auto, etc.)

  Comentários (pt-br):
  - Este componente é intencionalmente simples: envolve um texto com padding e
    background color para ser usado em listas ou cards.
  - Importante manter estilo compacto e acessível para não quebrar o layout.
*/

import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

interface BadgeProps {
  text: string;
  color?: string;
  textColor?: string;
}

const Badge: React.FC<BadgeProps> = ({ text, color = '#E0E0E0', textColor = '#000' }) => {
  // Renderiza um pequeno rótulo com background color e texto em negrito.
  return (
    <View style={[styles.container, { backgroundColor: color }]}> 
      <Text style={[styles.text, { color: textColor }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default Badge;
