// Componente para gerenciar taxas de câmbio
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TextInput, ScrollView } from 'react-native';
import { currencyConversionService } from '@/src/services/CurrencyConversionService';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import type { SupportedCurrency } from '@/src/services/CurrencyConversionService';

const CURRENCY_PAIRS: Array<{ from: SupportedCurrency; to: SupportedCurrency; label: string }> = [
  { from: 'USD', to: 'BRL', label: 'USD → BRL' },
  { from: 'EUR', to: 'BRL', label: 'EUR → BRL' },
  { from: 'BRL', to: 'USD', label: 'BRL → USD' },
  { from: 'EUR', to: 'USD', label: 'EUR → USD' },
];

interface ExchangeRateConfigProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Modal de configuração de taxas de câmbio
 * Permite ao usuário visualizar e atualizar manualmente as taxas
 */
const ExchangeRateConfig: React.FC<ExchangeRateConfigProps> = ({ visible, onClose }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const rates = useMemo(() => currencyConversionService.getAllRates(), []);
  
  const [editingRate, setEditingRate] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleUpdateRate = (from: SupportedCurrency, to: SupportedCurrency, newRate: string) => {
    const rate = parseFloat(newRate);
    if (!isNaN(rate) && rate > 0) {
      currencyConversionService.updateRate(from, to, rate);
      setEditingRate(null);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.tint }]}>
          <Text style={[styles.headerTitle, { color: colors.textInverse }]}>
            Taxas de Câmbio
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {CURRENCY_PAIRS.map(({ from, to, label }) => {
            const rateKey = `${from}_${to}`;
            const currentRate = rates[rateKey];
            const isEditing = editingRate === rateKey;

            return (
              <View
                key={rateKey}
                style={[
                  styles.rateItem,
                  { 
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.cardBorder,
                  }
                ]}
              >
                <View style={styles.rateLeft}>
                  <Text style={[styles.rateLabel, { color: colors.text }]}>
                    {label}
                  </Text>
                  {!isEditing && (
                    <Text style={[styles.rateValue, { color: colors.tint }]}>
                      {currentRate?.toFixed(4) || 'N/A'}
                    </Text>
                  )}
                </View>

                {isEditing ? (
                  <View style={styles.editActions}>
                    <TextInput
                      style={[
                        styles.rateInput,
                        {
                          backgroundColor: colors.inputBackground,
                          color: colors.text,
                          borderColor: colors.inputBorder,
                        },
                      ]}
                      value={editValue}
                      onChangeText={setEditValue}
                      placeholder="0.00"
                      placeholderTextColor={colors.textTertiary}
                      keyboardType="decimal-pad"
                    />
                    <Pressable
                      style={[styles.confirmButton, { backgroundColor: colors.tint }]}
                      onPress={() =>
                        handleUpdateRate(from, to, editValue)
                      }
                    >
                      <Text style={[styles.buttonText, { color: colors.textInverse }]}>
                        ✓
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[styles.cancelButton, { backgroundColor: colors.error }]}
                      onPress={() => setEditingRate(null)}
                    >
                      <Text style={[styles.buttonText, { color: colors.textInverse }]}>
                        ✕
                      </Text>
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    style={[styles.editButton, { backgroundColor: colors.backgroundTertiary }]}
                    onPress={() => {
                      setEditingRate(rateKey);
                      setEditValue(currentRate?.toString() || '');
                    }}
                  >
                    <Text style={[styles.editButtonText, { color: colors.text }]}>
                      Editar
                    </Text>
                  </Pressable>
                )}
              </View>
            );
          })}

          <View style={[styles.infoBox, { backgroundColor: colors.backgroundTertiary }]}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>
              💡 Dica
            </Text>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Use uma API de câmbio em tempo real para atualizar essas taxas
              automaticamente. Veja a documentação para mais detalhes.
            </Text>
          </View>
        </ScrollView>

        <Pressable
          style={[styles.closeButton, { backgroundColor: colors.tint }]}
          onPress={onClose}
        >
          <Text style={[styles.closeButtonText, { color: colors.textInverse }]}>
            Fechar
          </Text>
        </Pressable>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 32,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    padding: 16,
  },
  rateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  rateLeft: {
    flex: 1,
  },
  rateLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  rateValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  editActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rateInput: {
    width: 80,
    height: 36,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  confirmButton: {
    width: 36,
    height: 36,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    width: 36,
    height: 36,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  infoBox: {
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    lineHeight: 18,
  },
  closeButton: {
    margin: 16,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ExchangeRateConfig;
