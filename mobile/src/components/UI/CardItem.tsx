/*
  CardItem.tsx
  Card de lista para exibir informações resumidas de uma assinatura.

  Comentários (pt-br):
  - Este componente representa uma linha da lista (card) no estilo do design.
  - Contém ícone, nome do serviço, periodicidade e valor.
  - Possui callbacks `onPress` e `onEdit` para navegação/ações do usuário.
  - Mantive o componente genérico para reutilização em Dashboard e Listas.
*/

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Badge from './Badge';
import { formatCurrencyByCode } from '../../utils/formatCurrency';

interface Props {
  id: string;
  serviceName: string;
  iconName?: string;
  value: number;
  currency: string;
  billingDate: number;
  isActive: boolean;
  onPress?: () => void;
  onEdit?: () => void;
}

export const CardItem: React.FC<Props> = ({ serviceName, iconName = 'music', value, currency, billingDate, isActive, onPress, onEdit }) => {
  const formattedValue = formatCurrencyByCode(value, currency);

  // Componente visual que aplica o layout do design: ícone + texto + ações
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.left}> 
        <View style={styles.iconPlaceholder}>
          <FontAwesome name={iconName as any} size={22} color="#8b5cf6" />
        </View>
        <View style={styles.info}>
          <Text style={styles.title}>{serviceName}</Text>
          <Text style={styles.subtitle}>Mensal</Text>
          <Text style={styles.price}>{formattedValue}</Text>
        </View>
      </View>

      <View style={styles.right}>
        {!isActive ? (
          <Badge text="Cancelado" color="#FFCDD2" />
        ) : null}
        <TouchableOpacity onPress={onEdit} style={styles.editButton}>
          <FontAwesome name="ellipsis-v" size={16} color="#999" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: { flex: 1 },
  title: { fontSize: 16, fontWeight: '700', color: '#111' },
  subtitle: { fontSize: 13, color: '#777', marginVertical: 2 },
  price: { fontSize: 16, fontWeight: '800', color: '#111' },
  right: { alignItems: 'flex-end', marginLeft: 8 },
  editButton: { padding: 6, marginTop: 6 },
});

export default CardItem;
