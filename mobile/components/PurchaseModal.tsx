import React, { useState } from 'react';
import { Modal, View, StyleSheet, Pressable, TextInput, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Text } from '@/components/Themed';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuth } from '@/src/contexts/AuthContext';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

interface PurchaseModalProps {
  visible: boolean;
  onClose: () => void;
}

type PaymentMethod = 'pix' | 'card';

export default function PurchaseModal({ visible, onClose }: PurchaseModalProps) {
  const { purchasePremium } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [loading, setLoading] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);

  // Card form states
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const handlePixCopy = () => {
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2000);
  };

  const handleCheckout = async () => {
    if (paymentMethod === 'card') {
      if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
        Alert.alert('Erro', 'Por favor, preencha todos os campos do cartão.');
        return;
      }
    }

    setLoading(true);

    // Simula processamento do pagamento
    setTimeout(async () => {
      try {
        await purchasePremium();
        setLoading(false);
        Alert.alert(
          'Sucesso!',
          'Pagamento recebido. Você agora é Premium! Todos os anúncios foram removidos.',
          [{ text: 'Maravilha!', onPress: onClose }]
        );
      } catch (error) {
        setLoading(false);
        Alert.alert('Erro', 'Ocorreu um erro ao processar o pagamento. Tente novamente.');
      }
    }, 1800);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleContainer}>
              <FontAwesome name="star" size={24} color="#F5A623" style={styles.starIcon} />
              <Text style={[styles.title, { color: colors.text }]}>Seja Premium!</Text>
            </View>
            <Pressable onPress={onClose} disabled={loading} style={styles.closeBtn}>
              <FontAwesome name="times" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Value Proposition */}
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Apoie o desenvolvimento e livre-se de todos os anúncios por uma taxa única de apenas:
            </Text>
            
            <View style={[styles.priceTag, { backgroundColor: colors.tint }]}>
              <Text style={styles.priceLabel}>R$ 5,00</Text>
              <Text style={styles.pricePeriod}>Taxa Única / Sem mensalidade</Text>
            </View>

            <View style={styles.benefits}>
              <View style={styles.benefitRow}>
                <FontAwesome name="check-circle" size={18} color="#10B981" />
                <Text style={[styles.benefitText, { color: colors.text }]}>Remoção instantânea de anúncios</Text>
              </View>
              <View style={styles.benefitRow}>
                <FontAwesome name="check-circle" size={18} color="#10B981" />
                <Text style={[styles.benefitText, { color: colors.text }]}>Dashboard totalmente limpo</Text>
              </View>
              <View style={styles.benefitRow}>
                <FontAwesome name="check-circle" size={18} color="#10B981" />
                <Text style={[styles.benefitText, { color: colors.text }]}>Apoie criadores independentes</Text>
              </View>
            </View>

            {/* Payment Method Selector */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Forma de Pagamento</Text>
            <View style={styles.tabRow}>
              <Pressable
                onPress={() => setPaymentMethod('pix')}
                disabled={loading}
                style={[
                  styles.tabButton,
                  { borderColor: colors.cardBorder },
                  paymentMethod === 'pix' && { backgroundColor: colors.tint, borderColor: colors.tint }
                ]}
              >
                <FontAwesome name="qrcode" size={16} color={paymentMethod === 'pix' ? '#FFF' : colors.textSecondary} />
                <Text style={[styles.tabText, { color: paymentMethod === 'pix' ? '#FFF' : colors.textSecondary }]}>Pagar com PIX</Text>
              </Pressable>

              <Pressable
                onPress={() => setPaymentMethod('card')}
                disabled={loading}
                style={[
                  styles.tabButton,
                  { borderColor: colors.cardBorder },
                  paymentMethod === 'card' && { backgroundColor: colors.tint, borderColor: colors.tint }
                ]}
              >
                <FontAwesome name="credit-card" size={16} color={paymentMethod === 'card' ? '#FFF' : colors.textSecondary} />
                <Text style={[styles.tabText, { color: paymentMethod === 'card' ? '#FFF' : colors.textSecondary }]}>Cartão de Crédito</Text>
              </Pressable>
            </View>

            {/* Payment Forms */}
            {paymentMethod === 'pix' ? (
              <View style={[styles.pixContainer, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
                {/* Simulated QR Code */}
                <View style={styles.qrCodeBox}>
                  <FontAwesome name="qrcode" size={120} color={colors.text} />
                  <View style={[styles.qrDot, { backgroundColor: colors.tint }]} />
                </View>
                
                <Text style={[styles.pixInstructions, { color: colors.textSecondary }]}>
                  Copie o código abaixo e utilize o Pix Copia e Cola no app do seu banco:
                </Text>

                <Pressable 
                  onPress={handlePixCopy}
                  style={[styles.pixCodeContainer, { backgroundColor: colors.backgroundTertiary, borderColor: colors.cardBorder }]}
                >
                  <Text numberOfLines={1} style={[styles.pixCode, { color: colors.text }]}>
                    00020101021126580014br.gov.bcb.pix0136minhaassinaturapix@cloudflare.com52040000530398654045.005802BR5918Minha Assinatura App6009Sao Paulo62070503***6304CA2C
                  </Text>
                  <FontAwesome name={pixCopied ? 'check' : 'copy'} size={14} color={pixCopied ? '#10B981' : colors.tint} />
                </Pressable>
                {pixCopied && <Text style={styles.copiedText}>Código PIX copiado!</Text>}
              </View>
            ) : (
              <View style={[styles.cardContainer, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Número do Cartão</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
                    placeholder="4444 5555 6666 7777"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="numeric"
                    value={cardNumber}
                    onChangeText={setCardNumber}
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Nome Impresso no Cartão</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
                    placeholder="BRUNO LIMA"
                    placeholderTextColor={colors.textTertiary}
                    value={cardName}
                    onChangeText={setCardName}
                    editable={!loading}
                  />
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1.5 }]}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>Validade</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
                      placeholder="MM/AA"
                      placeholderTextColor={colors.textTertiary}
                      value={cardExpiry}
                      onChangeText={setCardExpiry}
                      editable={!loading}
                    />
                  </View>

                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>CVV</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
                      placeholder="123"
                      placeholderTextColor={colors.textTertiary}
                      keyboardType="numeric"
                      value={cardCvv}
                      onChangeText={setCardCvv}
                      secureTextEntry
                      editable={!loading}
                    />
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Checkout Trigger */}
          <View style={styles.footer}>
            <Pressable
              onPress={handleCheckout}
              disabled={loading}
              style={({ pressed }) => [
                styles.payButton,
                { backgroundColor: colors.tint, opacity: pressed || loading ? 0.85 : 1 }
              ]}
            >
              {loading ? (
                <View style={styles.loaderContent}>
                  <ActivityIndicator size="small" color="#FFF" style={{ marginRight: 8 }} />
                  <Text style={styles.payButtonText}>Processando...</Text>
                </View>
              ) : (
                <Text style={styles.payButtonText}>Finalizar Pagamento (R$ 5,00)</Text>
              )}
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
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '90%',
    padding: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    marginRight: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 6,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  priceTag: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  priceLabel: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '900',
  },
  pricePeriod: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  benefits: {
    marginBottom: 20,
    gap: 10,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  benefitText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  pixContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
  },
  qrCodeBox: {
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  qrDot: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 6,
  },
  pixInstructions: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 12,
  },
  pixCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    width: '100%',
  },
  pixCode: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'monospace',
    marginRight: 10,
  },
  copiedText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 8,
  },
  cardContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  footer: {
    paddingTop: 12,
  },
  payButton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  loaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
