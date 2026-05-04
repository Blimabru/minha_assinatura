import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';

// 1. IMPORTANDO O HOOK DO SEU DATABASE
import { useSubscriptions } from '@/database/hooks/useSubscriptions';
import { formatCurrencyInput, parseCurrencyStringToNumber } from '../src/utils/formatCurrency';
import {
  buildSubscriptionDueDate,
  splitSubscriptionDueDate,
  SUBSCRIPTION_RECURRENCE_OPTIONS,
  type SubscriptionRecurrence,
} from '../src/utils/subscriptionSchedule';

export default function EditSubscriptionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); 

  const [valor, setValor] = useState('');
  const [moeda, setMoeda] = useState('BRL');
  const [recurrence, setRecurrence] = useState<SubscriptionRecurrence>('mensal');
  const [dueDay, setDueDay] = useState('');
  const [dueMonth, setDueMonth] = useState('');
  const [dueYear, setDueYear] = useState('');

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
      setRecurrence(assinatura.recurrence);
      const dueDateParts = splitSubscriptionDueDate(assinatura.dueDate);
      setDueDay(dueDateParts.day || String(assinatura.billingDate).padStart(2, '0'));
      setDueMonth(dueDateParts.month || String(new Date().getMonth() + 1).padStart(2, '0'));
      setDueYear(dueDateParts.year || String(new Date().getFullYear()));
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
    if (!valor || !dueDay || !dueMonth || !dueYear) {
      Alert.alert('Aviso', 'Preencha todos os campos!');
      return;
    }

    const dueDate = buildSubscriptionDueDate(dueDay, dueMonth, dueYear);
    if (!dueDate) {
      Alert.alert('Aviso', 'Data de vencimento inválida.');
      return;
    }

    try {
      const assinaturaId = Array.isArray(id) ? id[0] : id;
      
      // 4. USANDO A FUNÇÃO DE ATUALIZAÇÃO
      await updateSubscription(assinaturaId, {
        value: parseCurrencyStringToNumber(valor),
        billingDate: parseInt(dueDay, 10),
        recurrence,
        dueDate,
      });
      
      Alert.alert('Sucesso', 'Assinatura atualizada!');
      router.back(); 
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Assinatura</Text>

      <Text style={styles.label}>Valor ({moeda})</Text>
      <TextInput
        style={styles.input}
        value={valor}
        onChangeText={(text) => setValor(formatCurrencyInput(text))}
        keyboardType="numeric"
        placeholder="Ex: 39,90"
      />

      <Text style={styles.label}>Recorrência</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={recurrence}
          onValueChange={(value: SubscriptionRecurrence) => setRecurrence(value)}
          style={styles.picker}
        >
          {SUBSCRIPTION_RECURRENCE_OPTIONS.map((option) => (
            <Picker.Item key={option.value} label={option.label} value={option.value} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Vencimento (dia / mês / ano)</Text>
      <View style={styles.dueDateRow}>
        <TextInput
          style={[styles.input, styles.dueDateInput]}
          value={dueDay}
          onChangeText={setDueDay}
          keyboardType="numeric"
          placeholder="DD"
          maxLength={2}
        />
        <TextInput
          style={[styles.input, styles.dueDateInput]}
          value={dueMonth}
          onChangeText={setDueMonth}
          keyboardType="numeric"
          placeholder="MM"
          maxLength={2}
        />
        <TextInput
          style={[styles.input, styles.dueDateYearInput]}
          value={dueYear}
          onChangeText={setDueYear}
          keyboardType="numeric"
          placeholder="AAAA"
          maxLength={4}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSalvar}>
        <Text style={styles.buttonText}>Salvar Alterações</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  dueDateRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dueDateInput: {
    flex: 1,
    textAlign: 'center',
  },
  dueDateYearInput: {
    flex: 1.4,
    textAlign: 'center',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 20,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  button: {
    backgroundColor: '#007AFF', // Cor azul padrão de botões
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