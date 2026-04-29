import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

// 1. IMPORTANDO O HOOK DO SEU DATABASE
import { useSubscriptions } from '@/database/hooks/useSubscriptions';

export default function EditSubscriptionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); 

  const [valor, setValor] = useState('');
  const [dataVencimento, setDataVencimento] = useState('');

  // 2. EXTRAINDO AS FUNÇÕES DO SEU HOOK
  // (Atenção: verifique se os nomes das funções dentro do seu useSubscription.ts são exatamente esses)
  const { getSubscriptionById, updateSubscription } = useSubscriptions();

  const carregarDadosDaAssinatura = useCallback(async () => {
  try {
    const assinaturaId = Array.isArray(id) ? id[0] : id; 
    const assinatura = await getSubscriptionById(assinaturaId);
    if (assinatura) {
      setValor(String(assinatura.value)); 
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
        value: parseFloat(valor),
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
    <View style={styles.container}>
      <Text style={styles.title}>Editar Assinatura</Text>

      <Text style={styles.label}>Valor (R$)</Text>
      <TextInput
        style={styles.input}
        value={valor}
        onChangeText={setValor}
        keyboardType="numeric"
        placeholder="Ex: 39.90"
      />

      <Text style={styles.label}>Data de Vencimento (Dia)</Text>
      <TextInput
        style={styles.input}
        value={dataVencimento}
        onChangeText={setDataVencimento}
        keyboardType="numeric"
        placeholder="Ex: 15"
      />

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