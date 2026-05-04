import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

// 1. IMPORTANDO O HOOK DO SEU DATABASE
import { useSubscriptions } from '@/database/hooks/useSubscriptions';
import { formatCurrencyInput, parseCurrencyStringToNumber } from '../src/utils/formatCurrency';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

export default function EditSubscriptionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light']; 

  const [valor, setValor] = useState('');
  const [moeda, setMoeda] = useState('BRL');
  const [dataVencimento, setDataVencimento] = useState('');

  // 2. EXTRAINDO AS FUNÇÕES DO SEU HOOK
  // (Atenção: verifique se os nomes das funções dentro do seu useSubscription.ts são exatamente esses)
  const { getSubscriptionById, updateSubscription } = useSubscriptions();

  const carregarDadosDaAssinatura = useCallback(async () => {
  try {
    const assinaturaId = Array.isArray(id) ? id[0] : id; 
    const assinatura = await getSubscriptionById(assinaturaId);
    if (assinatura) {
      setValor(formatCurrencyInput(String(Math.round(assinatura.value * 100))));
      setMoeda(assinatura.currency || 'BRL');
      setDataVencimento(String(assinatura.billingDate));
    }
  } catch (error) {
    console.error(error);
    Alert.alert('Erro', 'Não foi possível carregar os dados da assinatura.');
  }
}, [id, getSubscriptionById]);

useEffect(() => {
  if (id) {
    carregarDadosDaAssinatura();
  }
}, [id, carregarDadosDaAssinatura]);

  const handleSalvar = async () => {
    if (!valor || !dataVencimento) {
      Alert.alert('Aviso', 'Preencha todos os campos!');
      return;
    }

    try {
      const assinaturaId = Array.isArray(id) ? id[0] : id;
      
      // 4. USANDO A FUNÇÃO DE ATUALIZAÇÃO
      await updateSubscription(assinaturaId, {
        value: parseCurrencyStringToNumber(valor),
        billingDate: parseInt(dataVencimento, 10) 
      });
      
      Alert.alert('Sucesso', 'Assinatura atualizada!');
      router.back(); 
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Editar Assinatura</Text>

      <Text style={[styles.label, { color: colors.text }]}>Valor ({moeda})</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.inputBorder }]}
        value={valor}
        onChangeText={(text) => setValor(formatCurrencyInput(text))}
        keyboardType="numeric"
        placeholder="Ex: 39,90"
        placeholderTextColor={colors.textTertiary}
      />

      <Text style={[styles.label, { color: colors.text }]}>Data de Vencimento (Dia)</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.inputBorder }]}
        value={dataVencimento}
        onChangeText={setDataVencimento}
        keyboardType="numeric"
        placeholder="Ex: 15"
        placeholderTextColor={colors.textTertiary}
      />

      <TouchableOpacity style={[styles.button, { backgroundColor: colors.tint }]} onPress={handleSalvar}>
        <Text style={styles.buttonText}>Salvar Alterações</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});