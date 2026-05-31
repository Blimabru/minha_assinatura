import React, { useState } from 'react';
import { StyleSheet, TextInput, Pressable, Alert, View as RNView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useAuth } from '@/src/contexts/AuthContext';

export default function RegisterScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { signUp } = useAuth();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateInputs = () => {
    if (!email.trim()) {
      Alert.alert('Erro', 'Por favor, insira um e-mail.');
      return false;
    }

    if (!email.includes('@')) {
      Alert.alert('Erro', 'Por favor, insira um e-mail válido.');
      return false;
    }

    if (!name.trim()) {
      Alert.alert('Erro', 'Por favor, insira seu nome.');
      return false;
    }

    if (!password.trim()) {
      Alert.alert('Erro', 'Por favor, insira uma senha.');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres.');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return false;
    }

    if (!acceptTerms) {
      Alert.alert('Erro', 'Você deve aceitar os termos de uso.');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      await signUp(email, name, password);
      Alert.alert('Sucesso', 'Conta criada com sucesso! Agora faça login.');
      router.replace('/auth/login');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Falha ao registrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <RNView style={styles.header}>
          <FontAwesome name="user-plus" size={48} color={colors.tint} />
          <Text style={[styles.title, { color: colors.text }]}>Criar Conta</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Registre-se para gerenciar suas assinaturas</Text>
        </RNView>

        {/* Form */}
        <RNView style={styles.form}>
          {/* Email Input */}
          <RNView style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>E-mail</Text>
            <RNView style={[styles.inputContainer, { borderColor: colors.inputBorder, backgroundColor: colors.inputBackground }]}>
              <FontAwesome name="envelope" size={16} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="seu@email.com"
                placeholderTextColor={colors.textTertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </RNView>
          </RNView>

          {/* Name Input */}
          <RNView style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Nome</Text>
            <RNView style={[styles.inputContainer, { borderColor: colors.inputBorder, backgroundColor: colors.inputBackground }]}>
              <FontAwesome name="user" size={16} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Seu nome completo"
                placeholderTextColor={colors.textTertiary}
                value={name}
                onChangeText={setName}
                editable={!loading}
              />
            </RNView>
          </RNView>

          {/* Password Input */}
          <RNView style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Senha</Text>
            <RNView style={[styles.inputContainer, { borderColor: colors.inputBorder, backgroundColor: colors.inputBackground }]}>
              <FontAwesome name="lock" size={16} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="••••••••"
                placeholderTextColor={colors.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <FontAwesome name={showPassword ? 'eye' : 'eye-slash'} size={16} color={colors.textSecondary} />
              </Pressable>
            </RNView>
          </RNView>

          {/* Confirm Password Input */}
          <RNView style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Confirmar Senha</Text>
            <RNView style={[styles.inputContainer, { borderColor: colors.inputBorder, backgroundColor: colors.inputBackground }]}>
              <FontAwesome name="lock" size={16} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="••••••••"
                placeholderTextColor={colors.textTertiary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                editable={!loading}
              />
              <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                <FontAwesome name={showConfirmPassword ? 'eye' : 'eye-slash'} size={16} color={colors.textSecondary} />
              </Pressable>
            </RNView>
          </RNView>

          {/* Terms Checkbox */}
          <Pressable
            style={styles.checkboxContainer}
            onPress={() => setAcceptTerms(!acceptTerms)}
            disabled={loading}
          >
            <RNView
              style={[
                styles.checkbox,
                {
                  backgroundColor: acceptTerms ? colors.tint : colors.inputBackground,
                  borderColor: acceptTerms ? colors.tint : colors.inputBorder,
                },
              ]}
            >
              {acceptTerms && <FontAwesome name="check" size={12} color="#fff" />}
            </RNView>
            <Text style={[styles.checkboxLabel, { color: colors.text }]}>
              Aceito os <Text style={{ color: colors.tint, fontWeight: '600' }}>termos de uso</Text> e a{' '}
              <Text style={{ color: colors.tint, fontWeight: '600' }}>política de privacidade</Text>
            </Text>
          </Pressable>
        </RNView>

        {/* Register Button */}
        <Pressable
          style={({ pressed }) => [
            styles.registerButton,
            { backgroundColor: colors.tint, opacity: pressed || loading ? 0.85 : 1 },
          ]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.registerButtonText}>
            {loading ? 'Registrando...' : 'Registrar-se'}
          </Text>
        </Pressable>

        {/* Login Link */}
        <RNView style={styles.loginLinkContainer}>
          <Text style={[styles.loginLinkText, { color: colors.textSecondary }]}>Já tem conta?</Text>
          <Pressable onPress={() => router.replace('/auth/login')} disabled={loading}>
            <Text style={[styles.loginLink, { color: colors.tint }]}>Fazer login</Text>
          </Pressable>
        </RNView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  registerButton: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  loginLinkText: {
    fontSize: 14,
    marginRight: 4,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
