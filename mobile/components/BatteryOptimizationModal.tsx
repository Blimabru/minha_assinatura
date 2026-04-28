/**
 * Modal educacional para informar sobre otimização de bateria.
 * 
 * Exibe um alerta explicando o problema e oferecendo dois botões:
 * - "Abrir Configurações": Leva o usuário para as configurações de bateria
 * - "Não mostrar novamente": Dismissa o alerta por 7 dias
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface BatteryOptimizationModalProps {
  /**
   * Controla se o modal está visível
   */
  visible: boolean;

  /**
   * Callback disparado quando usuário clica em "Não mostrar novamente"
   */
  onDismiss: () => void;

  /**
   * Callback disparado quando usuário clica em "Abrir Configurações"
   */
  onOpenSettings: () => void;

  /**
   * Estado de carregamento (para desabilitar botões enquanto processa)
   */
  isLoading?: boolean;
}

/**
 * Modal educacional que explica a importância de excluir a app
 * da otimização de bateria para que os lembretes funcionem corretamente.
 */
export default function BatteryOptimizationModal({
  visible,
  onDismiss,
  onOpenSettings,
  isLoading = false,
}: BatteryOptimizationModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      {/* Overlay semitransparente */}
      <View style={styles.overlay}>
        {/* Card do modal */}
        <View style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Ícone de alerta */}
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name="battery-alert-variant-outline"
                size={64}
                color="#FF6B6B"
              />
            </View>

            {/* Título */}
            <Text style={styles.title}>
              Otimização de Bateria Detectada
            </Text>

            {/* Descrição do problema */}
            <Text style={styles.description}>
              Detectamos que a otimização de bateria está <Text style={{ fontWeight: '600' }}>ativa</Text> no seu dispositivo.
            </Text>

            {/* Explicação */}
            <View style={styles.explanationBox}>
              <Text style={styles.explanationText}>
                Isso pode fazer com que os lembretes de assinaturas vencendo sejam silenciosos ou não disparem no horário correto.
              </Text>
            </View>

            {/* O que fazer */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Como resolver:</Text>
              <View style={styles.stepContainer}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.stepText}>
                  Abra as Configurações de Bateria
                </Text>
              </View>
              <View style={styles.stepContainer}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.stepText}>
                  Procure por &#39;Minha Assinatura&#39; na lista de apps
                </Text>
              </View>
              <View style={styles.stepContainer}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.stepText}>
                  Selecione &#39;Sem restrições&#39; ou &#39;Exceção de otimização&#39;
                </Text>
              </View>
            </View>

            {/* Nota importante */}
            <View style={styles.noteBox}>
              <MaterialCommunityIcons
                name="information-outline"
                size={16}
                color="#0066CC"
                style={styles.noteIcon}
              />
              <Text style={styles.noteText}>
                Isso garante que seus lembretes funcionem perfeitamente mesmo quando o telefone está em repouso.
              </Text>
            </View>
          </ScrollView>

          {/* Botões */}
          <View style={styles.buttonContainer}>
            <Pressable
              style={[
                styles.button,
                styles.buttonSecondary,
                isLoading && styles.buttonDisabled,
              ]}
              onPress={onDismiss}
              disabled={isLoading}
            >
              <Text style={styles.buttonSecondaryText}>
                Não mostrar novamente
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.button,
                styles.buttonPrimary,
                isLoading && styles.buttonDisabled,
              ]}
              onPress={onOpenSettings}
              disabled={isLoading}
            >
              <MaterialCommunityIcons
                name="cog-outline"
                size={18}
                color="white"
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonPrimaryText}>
                Abrir Configurações
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },

  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    maxHeight: '85%',
    width: '100%',
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 20,
  },

  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
    marginBottom: 12,
  },

  description: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },

  explanationBox: {
    backgroundColor: '#FFF4F4',
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },

  explanationText: {
    fontSize: 13,
    color: '#D32F2F',
    lineHeight: 18,
  },

  section: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
    marginBottom: 12,
  },

  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },

  stepNumberText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },

  stepText: {
    flex: 1,
    fontSize: 13,
    color: '#444',
    lineHeight: 18,
    paddingTop: 5,
  },

  noteBox: {
    flexDirection: 'row',
    backgroundColor: '#F0F4FF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },

  noteIcon: {
    marginRight: 10,
    marginTop: 2,
  },

  noteText: {
    flex: 1,
    fontSize: 12,
    color: '#0066CC',
    lineHeight: 16,
  },

  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingBottom: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
  },

  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },

  buttonPrimary: {
    backgroundColor: '#0066CC',
  },

  buttonSecondary: {
    backgroundColor: '#F5F5F5',
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  buttonIcon: {
    marginRight: 6,
  },

  buttonPrimaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },

  buttonSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});
