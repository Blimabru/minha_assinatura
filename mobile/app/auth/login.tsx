import React, { useState } from 'react';
import { StyleSheet, TextInput, Pressable, Alert, View as RNView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useAuth } from '@/src/contexts/AuthContext';

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateInputs = () => {
    if (!email.trim()) {
      Alert.alert('Erro', 'Por favor, insira um e-mail.');
      return false;
    }

    if (!email.includes('@')) {
      Alert.alert('Erro', 'Por favor, insira um e-mail válido.');
      return false;
    }

    if (!password.trim()) {
      Alert.alert('Erro', 'Por favor, insira uma senha.');
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      await signIn(email, password, rememberMe);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Falha ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Recuperar Senha',
      'Digite seu e-mail para receber instruções de recuperação de senha.',
      [
        {
          text: 'Cancelar',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Enviar',
          onPress: () => {
            Alert.alert('Sucesso', 'Instruções de recuperação foram enviadas para seu e-mail.');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <RNView style={styles.header}>
          <FontAwesome name="sign-in" size={48} color={colors.tint} />
          <Text style={[styles.title, { color: colors.text }]}>Bem-vindo</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Entre em sua conta para continuar</Text>
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

          {/* Password Input */}
          <RNView style={styles.inputGroup}>
            <RNView style={styles.passwordHeader}>
              <Text style={[styles.label, { color: colors.text }]}>Senha</Text>
              <Pressable onPress={handleForgotPassword} disabled={loading}>
                <Text style={[styles.forgotPasswordText, { color: colors.tint }]}>Esqueceu a senha?</Text>
              </Pressable>
            </RNView>
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

          {/* Remember Me Checkbox */}
          <Pressable
            style={styles.checkboxContainer}
            onPress={() => setRememberMe(!rememberMe)}
            disabled={loading}
          >
            <RNView
              style={[
                styles.checkbox,
                {
                  backgroundColor: rememberMe ? colors.tint : colors.inputBackground,
                  borderColor: rememberMe ? colors.tint : colors.inputBorder,
                },
              ]}
            >
              {rememberMe && <FontAwesome name="check" size={12} color="#fff" />}
            </RNView>
            <Text style={[styles.checkboxLabel, { color: colors.text }]}>Lembrar de mim</Text>
          </Pressable>
        </RNView>

        {/* Login Button */}
        <Pressable
          style={({ pressed }) => [
            styles.loginButton,
            { backgroundColor: colors.tint, opacity: pressed || loading ? 0.85 : 1 },
          ]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Text>
        </Pressable>

        {/* Register Link */}
        <RNView style={styles.registerLinkContainer}>
          <Text style={[styles.registerLinkText, { color: colors.textSecondary }]}>Não tem conta?</Text>
          <Pressable onPress={() => router.replace('/auth/register')} disabled={loading}>
            <Text style={[styles.registerLink, { color: colors.tint }]}>Fazer registro</Text>
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
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  forgotPasswordText: {
    fontSize: 12,
    fontWeight: '600',
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
    marginTop: 16,
    marginBottom: 8,
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
    fontSize: 13,
  },
  loginButton: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  registerLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  registerLinkText: {
    fontSize: 14,
    marginRight: 4,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
