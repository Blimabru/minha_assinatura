import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Switch, Pressable, ActivityIndicator, Modal, TextInput, ScrollView, Alert, Platform } from 'react-native';
import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useSync } from '@/src/contexts/SyncContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuth } from '@/src/contexts/AuthContext';
import PurchaseModal from '@/components/PurchaseModal';
import Constants from 'expo-constants';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getApiUrl = () => {
  const hostUri = Constants.expoConfig?.hostUri; // Ex: "192.168.1.100:8081"
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:3000`;
  }
  return Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
};

const API_URL = getApiUrl();

/*
  settings.tsx
  App settings screen (Configurações)

  Comentários (pt-br):
  - Contém toggles e preferências do usuário.
  - Integra informações de status e logs visuais da sincronização automática em segundo plano.
*/

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { syncStatus, lastSyncedAt, syncInBackground } = useSync();
  const { isPremium, user } = useAuth();
  const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);

  // Admin visibility
  const isAdmin = user && (user.isAdmin || user.email === 'bru.no@outlook.com.br' || user.email.includes('admin'));

  // Admin panel sub-modals
  const [adModalVisible, setAdModalVisible] = useState(false);
  const [couponModalVisible, setCouponModalVisible] = useState(false);

  // Form: Ad
  const [adTitle, setAdTitle] = useState('');
  const [adDesc, setAdDesc] = useState('');
  const [adIcon, setAdIcon] = useState('gift');
  const [adColor, setAdColor] = useState('#3B82F6');
  const [adLoading, setAdLoading] = useState(false);

  // Form: Coupon
  const [serviceName, setServiceName] = useState('');
  const [couponDesc, setCouponDesc] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponPercentage, setCouponPercentage] = useState('');
  const [externalLink, setExternalLink] = useState('');
  const [affiliateLink, setAffiliateLink] = useState('');
  const [category, setCategory] = useState('Streaming');
  const [couponLoading, setCouponLoading] = useState(false);

  // Dynamic admin lists
  const [serverAds, setServerAds] = useState<any[]>([]);
  const [serverCoupons, setServerCoupons] = useState<any[]>([]);
  const [loadingServerData, setLoadingServerData] = useState(false);
  const [editingAd, setEditingAd] = useState<any | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<any | null>(null);

  const loadServerData = async () => {
    if (!isAdmin) return;
    setLoadingServerData(true);
    try {
      const token = await AsyncStorage.getItem(`user_${user?.email}_token`);
      const [adsRes, couponsRes] = await Promise.all([
        fetch(`${API_URL}/sync/ads`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/sync/coupons`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (adsRes.ok) {
        const adsData = await adsRes.json();
        setServerAds(adsData);
      }
      if (couponsRes.ok) {
        const couponsData = await couponsRes.json();
        setServerCoupons(couponsData);
      }
    } catch (e) {
      console.warn('Erro ao carregar dados do servidor:', e);
    } finally {
      setLoadingServerData(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadServerData();
    }
  }, [isAdmin]);

  const handleNewAd = () => {
    setEditingAd(null);
    setAdTitle('');
    setAdDesc('');
    setAdIcon('gift');
    setAdColor('#3B82F6');
    setAdModalVisible(true);
  };

  const handleEditAd = (ad: any) => {
    setEditingAd(ad);
    setAdTitle(ad.title);
    setAdDesc(ad.description);
    setAdIcon(ad.icon);
    setAdColor(ad.color);
    setAdModalVisible(true);
  };

  const handleDeleteAd = async (id: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza de que deseja excluir este anúncio?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem(`user_${user?.email}_token`);
              const response = await fetch(`${API_URL}/sync/ads/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (response.ok) {
                Alert.alert('Sucesso', 'Anúncio excluído com sucesso.');
                loadServerData();
              } else {
                throw new Error();
              }
            } catch (e) {
              Alert.alert('Erro', 'Não foi possível excluir o anúncio.');
            }
          }
        }
      ]
    );
  };

  const handleSaveAd = async () => {
    if (!adTitle.trim() || !adDesc.trim()) {
      Alert.alert('Erro', 'Por favor, preencha o título e a descrição.');
      return;
    }

    setAdLoading(true);

    try {
      const token = await AsyncStorage.getItem(`user_${user?.email}_token`);
      const method = editingAd ? 'PUT' : 'POST';
      const endpoint = editingAd ? `${API_URL}/sync/ads/${editingAd.id}` : `${API_URL}/sync/ads`;

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: adTitle.trim(),
          description: adDesc.trim(),
          icon: adIcon,
          color: adColor,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao salvar anúncio.');
      }

      Alert.alert('Sucesso', editingAd ? 'Anúncio atualizado com sucesso!' : 'Novo anúncio salvo com sucesso!');
      setAdTitle('');
      setAdDesc('');
      setAdModalVisible(false);
      setEditingAd(null);
      loadServerData();
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível salvar o anúncio no servidor.');
    } finally {
      setAdLoading(false);
    }
  };

  const handleNewCoupon = () => {
    setEditingCoupon(null);
    setServiceName('');
    setCouponDesc('');
    setCouponCode('');
    setCouponPercentage('');
    setExternalLink('');
    setAffiliateLink('');
    setCategory('Streaming');
    setCouponModalVisible(true);
  };

  const handleEditCoupon = (coupon: any) => {
    setEditingCoupon(coupon);
    setServiceName(coupon.serviceName);
    setCouponDesc(coupon.description);
    setCouponCode(coupon.discountCode);
    setCouponPercentage(String(coupon.discountPercentage));
    setExternalLink(coupon.externalLink);
    setAffiliateLink(coupon.affiliateLink);
    setCategory(coupon.category);
    setCouponModalVisible(true);
  };

  const handleDeleteCoupon = async (id: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza de que deseja excluir este cupom?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem(`user_${user?.email}_token`);
              const response = await fetch(`${API_URL}/sync/coupons/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (response.ok) {
                Alert.alert('Sucesso', 'Cupom excluído com sucesso.');
                loadServerData();
              } else {
                throw new Error();
              }
            } catch (e) {
              Alert.alert('Erro', 'Não foi possível excluir o cupom.');
            }
          }
        }
      ]
    );
  };

  const handleSaveCoupon = async () => {
    if (!serviceName.trim() || !couponDesc.trim() || !couponCode.trim() || !couponPercentage.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setCouponLoading(true);

    try {
      const token = await AsyncStorage.getItem(`user_${user?.email}_token`);
      const method = editingCoupon ? 'PUT' : 'POST';
      const endpoint = editingCoupon ? `${API_URL}/sync/coupons/${editingCoupon.id}` : `${API_URL}/sync/coupons`;

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceName: serviceName.trim(),
          description: couponDesc.trim(),
          discountCode: couponCode.trim(),
          discountPercentage: parseFloat(couponPercentage),
          externalLink: externalLink.trim() || `https://www.${serviceName.toLowerCase()}.com`,
          affiliateLink: affiliateLink.trim() || `https://www.${serviceName.toLowerCase()}.com/affiliate`,
          category,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao salvar cupom.');
      }

      Alert.alert('Sucesso', editingCoupon ? 'Cupom atualizado com sucesso!' : 'Novo cupom salvo com sucesso!');
      setServiceName('');
      setCouponDesc('');
      setCouponCode('');
      setCouponPercentage('');
      setExternalLink('');
      setAffiliateLink('');
      setCouponModalVisible(false);
      setEditingCoupon(null);
      loadServerData();
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível salvar o cupom no servidor.');
    } finally {
      setCouponLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'syncing': return 'Sincronizando...';
      case 'synced': return 'Sincronizado';
      case 'offline': return 'Sem Conexão';
      case 'error': return 'Erro no Sync';
      default: return 'Ativa';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'syncing': return '#F59E0B'; // Laranja / Âmbar
      case 'synced': return '#10B981'; // Verde Esmeralda
      case 'offline': return '#6B7280'; // Cinza
      case 'error': return '#EF4444'; // Vermelho
      default: return colors.tint; // Roxo Padrão da App
    }
  };

  const getSyncDescription = (status: string, lastSync: string | null) => {
    switch (status) {
      case 'syncing':
        return 'Sincronizando e atualizando seus dados na nuvem em segundo plano...';
      case 'synced':
        return 'Seus dados locais estão idênticos aos salvos no banco de dados remoto.';
      case 'offline':
        return 'Dispositivo sem rede. As alterações locais serão enviadas quando a conexão voltar.';
      case 'error':
        return 'Conexão rejeitada pela API. Verifique se o servidor NestJS está ativo.';
      default:
        return lastSync 
          ? 'Seus dados estão protegidos e sincronizados de forma totalmente automática na nuvem.'
          : 'Sincronização ativa. O primeiro ciclo iniciará em segundo plano a qualquer momento.';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={styles.headerConf}>
        <Text style={[styles.title, { color: colors.text }]}>Configurações</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Bloco de Status da Sincronização Automática */}
      <View style={[styles.syncCard, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
        <View style={styles.syncHeader}>
          <View style={styles.syncTitleContainer}>
            <FontAwesome 
              name={
                syncStatus === 'syncing' ? 'refresh' :
                syncStatus === 'synced' ? 'check-circle' :
                syncStatus === 'offline' ? 'exclamation-circle' :
                syncStatus === 'error' ? 'exclamation-triangle' : 'cloud'
              } 
              size={18} 
              color={getStatusColor(syncStatus)} 
              style={styles.syncHeaderIcon} 
            />
            <Text style={[styles.syncTitle, { color: colors.text }]}>Sincronização na Nuvem</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(syncStatus) }]}>
            <Text style={styles.statusBadgeText}>{getStatusLabel(syncStatus)}</Text>
          </View>
        </View>
        
        <Text style={[styles.syncText, { color: colors.textSecondary }]}>
          {getSyncDescription(syncStatus, lastSyncedAt)}
        </Text>
        
        <View style={[styles.syncFooter, { borderTopColor: colors.cardBorder }]}>
          {lastSyncedAt ? (
            <Text style={[styles.lastSyncText, { color: colors.textTertiary }]}>
              Último: {lastSyncedAt}
            </Text>
          ) : (
            <Text style={[styles.lastSyncText, { color: colors.textTertiary }]}>
              Nunca sincronizado
            </Text>
          )}
          
          <Pressable
            onPress={syncInBackground}
            disabled={syncStatus === 'syncing'}
            style={({ pressed }) => [
              styles.syncButton,
              { 
                backgroundColor: syncStatus === 'syncing' ? colors.inputBackground : colors.tint,
                borderColor: colors.cardBorder,
                opacity: pressed && syncStatus !== 'syncing' ? 0.8 : 1,
              }
            ]}
          >
            {syncStatus === 'syncing' ? (
              <View style={styles.syncButtonContent}>
                <ActivityIndicator size="small" color={colors.textSecondary} style={{ marginRight: 6 }} />
                <Text style={[styles.syncButtonText, { color: colors.textSecondary }]}>Sincronizando...</Text>
              </View>
            ) : (
              <View style={styles.syncButtonContent}>
                <FontAwesome name="refresh" size={12} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={[styles.syncButtonText, { color: '#FFF' }]}>Sincronizar</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {/* Bloco Premium / Remover Anúncios */}
      <View style={[styles.syncCard, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
        <View style={styles.syncHeader}>
          <View style={styles.syncTitleContainer}>
            <FontAwesome name="star" size={18} color="#F5A623" style={styles.syncHeaderIcon} />
            <Text style={[styles.syncTitle, { color: colors.text }]}>Versão do Aplicativo</Text>
          </View>
          {isPremium ? (
            <View style={[styles.statusBadge, { backgroundColor: '#F5A623' }]}>
              <Text style={styles.statusBadgeText}>Premium</Text>
            </View>
          ) : (
            <View style={[styles.statusBadge, { backgroundColor: colors.tint }]}>
              <Text style={styles.statusBadgeText}>Gratuito</Text>
            </View>
          )}
        </View>

        {isPremium ? (
          <Text style={[styles.syncText, { color: colors.textSecondary }]}>
            Parabéns! Você tem acesso vitalício à versão Premium. Todos os anúncios foram permanentemente desativados.
          </Text>
        ) : (
          <>
            <Text style={[styles.syncText, { color: colors.textSecondary }]}>
              Você está utilizando a versão gratuita com suporte a anúncios. Remova-os agora mesmo!
            </Text>
            <View style={[styles.syncFooter, { borderTopColor: colors.cardBorder }]}>
              <Text style={[styles.lastSyncText, { color: colors.textTertiary }]}>
                Apenas R$ 5,00 (Taxa única)
              </Text>
              
              <Pressable
                onPress={() => setPurchaseModalVisible(true)}
                style={({ pressed }) => [
                  styles.syncButton,
                  { 
                    backgroundColor: '#F5A623',
                    borderColor: '#F5A623',
                    opacity: pressed ? 0.8 : 1,
                  }
                ]}
              >
                <View style={styles.syncButtonContent}>
                  <FontAwesome name="star" size={12} color="#FFF" style={{ marginRight: 6 }} />
                  <Text style={[styles.syncButtonText, { color: '#FFF' }]}>Remover Anúncios</Text>
                </View>
              </Pressable>
            </View>
          </>
        )}
      </View>

      {/* Bloco Administrador (Adicionar Anúncios/Cupons) */}
      {isAdmin && (
        <View style={[styles.syncCard, { backgroundColor: colors.cardBackground, borderColor: '#F5A623', borderStyle: 'dashed' }]}>
          <View style={styles.syncHeader}>
            <View style={styles.syncTitleContainer}>
              <FontAwesome name="shield" size={18} color="#F5A623" style={styles.syncHeaderIcon} />
              <Text style={[styles.syncTitle, { color: colors.text }]}>Painel do Administrador</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: '#F5A623' }]}>
              <Text style={styles.statusBadgeText}>Admin</Text>
            </View>
          </View>

          <Text style={[styles.syncText, { color: colors.textSecondary }]}>
            Como administrador, você pode gerenciar campanhas e ofertas visíveis globalmente para todos os usuários comuns.
          </Text>

          <View style={[styles.syncFooter, { borderTopColor: colors.cardBorder }]}>
            <Pressable
              onPress={handleNewAd}
              style={({ pressed }) => [
                styles.syncButton,
                { 
                  backgroundColor: colors.tint,
                  borderColor: colors.cardBorder,
                  opacity: pressed ? 0.85 : 1,
                }
              ]}
            >
              <View style={styles.syncButtonContent}>
                <FontAwesome name="bullhorn" size={12} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={[styles.syncButtonText, { color: '#FFF' }]}>Novo Anúncio</Text>
              </View>
            </Pressable>

            <Pressable
              onPress={handleNewCoupon}
              style={({ pressed }) => [
                styles.syncButton,
                { 
                  backgroundColor: colors.tint,
                  borderColor: colors.cardBorder,
                  opacity: pressed ? 0.85 : 1,
                }
              ]}
            >
              <View style={styles.syncButtonContent}>
                <FontAwesome name="tag" size={12} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={[styles.syncButtonText, { color: '#FFF' }]}>Novo Cupom</Text>
              </View>
            </Pressable>
          </View>

          {/* List parameters: Dynamic active Ads */}
          {serverAds.length > 0 && (
            <View style={{ marginTop: 16 }}>
              <Text style={[styles.adminSectionTitle, { color: colors.text }]}>Anúncios Ativos ({serverAds.length})</Text>
              {serverAds.map((ad) => (
                <View key={ad.id} style={[styles.adminListItem, { borderColor: colors.cardBorder }]}>
                  <View style={styles.adminListContent}>
                    <FontAwesome name={ad.icon} size={14} color={ad.color} style={{ marginRight: 8 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.adminListTitle, { color: colors.text }]} numberOfLines={1}>{ad.title}</Text>
                      <Text style={[styles.adminListDesc, { color: colors.textSecondary }]} numberOfLines={1}>{ad.description}</Text>
                    </View>
                  </View>
                  <View style={styles.adminListActions}>
                    <Pressable onPress={() => handleEditAd(ad)} style={styles.adminActionButton}>
                      <FontAwesome name="pencil" size={14} color={colors.tint} />
                    </Pressable>
                    <Pressable onPress={() => handleDeleteAd(ad.id)} style={styles.adminActionButton}>
                      <FontAwesome name="trash" size={14} color="#EF4444" />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* List parameters: Dynamic active Coupons */}
          {serverCoupons.length > 0 && (
            <View style={{ marginTop: 16 }}>
              <Text style={[styles.adminSectionTitle, { color: colors.text }]}>Cupons Ativos ({serverCoupons.length})</Text>
              {serverCoupons.map((coupon) => (
                <View key={coupon.id} style={[styles.adminListItem, { borderColor: colors.cardBorder }]}>
                  <View style={styles.adminListContent}>
                    <FontAwesome name="tag" size={14} color={colors.tint} style={{ marginRight: 8 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.adminListTitle, { color: colors.text }]} numberOfLines={1}>{coupon.serviceName} ({coupon.discountCode})</Text>
                      <Text style={[styles.adminListDesc, { color: colors.textSecondary }]} numberOfLines={1}>{coupon.description}</Text>
                    </View>
                  </View>
                  <View style={styles.adminListActions}>
                    <Pressable onPress={() => handleEditCoupon(coupon)} style={styles.adminActionButton}>
                      <FontAwesome name="pencil" size={14} color={colors.tint} />
                    </Pressable>
                    <Pressable onPress={() => handleDeleteCoupon(coupon.id)} style={styles.adminActionButton}>
                      <FontAwesome name="trash" size={14} color="#EF4444" />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      <View style={[styles.row, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
        <Text style={[styles.label, { color: colors.text }]}>Otimização de Bateria</Text>
        <Switch value={true} onValueChange={() => {}} trackColor={{ false: colors.inputBackground, true: colors.tint }} thumbColor={colors.textInverse} />
      </View>

      <View style={[styles.row, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
        <Text style={[styles.label, { color: colors.text }]}>Notificações</Text>
        <Switch value={true} onValueChange={() => {}} trackColor={{ false: colors.inputBackground, true: colors.tint }} thumbColor={colors.textInverse} />
      </View>

      </ScrollView>

      <PurchaseModal visible={purchaseModalVisible} onClose={() => setPurchaseModalVisible(false)} />

      {/* MODAL ADMIN: ADICIONAR ANÚNCIO */}
      <Modal visible={adModalVisible} animationType="slide" onRequestClose={() => setAdModalVisible(false)}>
        <ScrollView contentContainerStyle={styles.adminModalContainer} style={{ backgroundColor: colors.background }}>
          <Text style={[styles.adminModalTitle, { color: colors.text }]}>{editingAd ? 'Editar Anúncio' : 'Adicionar Novo Anúncio'}</Text>
          
          <Text style={[styles.adminModalLabel, { color: colors.text }]}>Título:</Text>
          <TextInput
            style={[styles.adminInput, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.inputBorder }]}
            value={adTitle}
            onChangeText={setAdTitle}
            placeholder="Ex: Assine HostCloud Premium"
            placeholderTextColor={colors.textTertiary}
          />

          <Text style={[styles.adminModalLabel, { color: colors.text }]}>Descrição / Oferta:</Text>
          <TextInput
            style={[styles.adminInput, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.inputBorder }]}
            value={adDesc}
            onChangeText={setAdDesc}
            placeholder="Ex: 30% de desconto usando o cupom CLOUD30!"
            placeholderTextColor={colors.textTertiary}
          />

          <Text style={[styles.adminModalLabel, { color: colors.text }]}>Ícone:</Text>
          <View style={[styles.adminPickerContainer, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}>
            <Picker
              selectedValue={adIcon}
              onValueChange={setAdIcon}
              style={{ color: colors.text }}
            >
              <Picker.Item label="Gift / Presente" value="gift" />
              <Picker.Item label="Cloud / Nuvem" value="cloud" />
              <Picker.Item label="Pie Chart / Finanças" value="pie-chart" />
              <Picker.Item label="Plane / Avião / Milhas" value="plane" />
              <Picker.Item label="Star / Estrela" value="star" />
              <Picker.Item label="Tag / Cupom" value="tag" />
            </Picker>
          </View>

          <Text style={[styles.adminModalLabel, { color: colors.text }]}>Cor de Destaque:</Text>
          <View style={[styles.adminPickerContainer, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}>
            <Picker
              selectedValue={adColor}
              onValueChange={setAdColor}
              style={{ color: colors.text }}
            >
              <Picker.Item label="Azul (HostCloud)" value="#3B82F6" />
              <Picker.Item label="Verde (Finanças)" value="#10B981" />
              <Picker.Item label="Amarelo / Laranja (Milhas)" value="#F59E0B" />
              <Picker.Item label="Roxo Padrão" value={colors.tint} />
              <Picker.Item label="Vermelho" value="#EF4444" />
            </Picker>
          </View>

          <Pressable 
            style={[styles.adminSaveButton, { backgroundColor: colors.tint, opacity: adLoading ? 0.7 : 1 }]} 
            onPress={handleSaveAd}
            disabled={adLoading}
          >
            <Text style={styles.adminSaveButtonText}>{adLoading ? 'Salvando...' : 'Salvar no Servidor'}</Text>
          </Pressable>

          <Pressable style={[styles.adminCancelButton, { backgroundColor: colors.backgroundTertiary }]} onPress={() => setAdModalVisible(false)}>
            <Text style={[styles.adminCancelButtonText, { color: colors.text }]}>Voltar</Text>
          </Pressable>
        </ScrollView>
      </Modal>

      {/* MODAL ADMIN: ADICIONAR CUPOM */}
      <Modal visible={couponModalVisible} animationType="slide" onRequestClose={() => setCouponModalVisible(false)}>
        <ScrollView contentContainerStyle={styles.adminModalContainer} style={{ backgroundColor: colors.background }}>
          <Text style={[styles.adminModalTitle, { color: colors.text }]}>{editingCoupon ? 'Editar Cupom' : 'Adicionar Novo Cupom'}</Text>
          
          <Text style={[styles.adminModalLabel, { color: colors.text }]}>Nome do Serviço:</Text>
          <TextInput
            style={[styles.adminInput, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.inputBorder }]}
            value={serviceName}
            onChangeText={setServiceName}
            placeholder="Ex: Netflix, Adobe CC, etc."
            placeholderTextColor={colors.textTertiary}
          />

          <Text style={[styles.adminModalLabel, { color: colors.text }]}>Descrição do Serviço:</Text>
          <TextInput
            style={[styles.adminInput, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.inputBorder }]}
            value={couponDesc}
            onChangeText={setCouponDesc}
            placeholder="Ex: Streaming de filmes e séries ilimitado"
            placeholderTextColor={colors.textTertiary}
          />

          <Text style={[styles.adminModalLabel, { color: colors.text }]}>Código do Cupom:</Text>
          <TextInput
            style={[styles.adminInput, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.inputBorder }]}
            value={couponCode}
            onChangeText={setCouponCode}
            placeholder="Ex: SAVE20"
            placeholderTextColor={colors.textTertiary}
            autoCapitalize="characters"
          />

          <Text style={[styles.adminModalLabel, { color: colors.text }]}>Porcentagem de Desconto:</Text>
          <TextInput
            style={[styles.adminInput, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.inputBorder }]}
            value={couponPercentage}
            onChangeText={setCouponPercentage}
            placeholder="Ex: 20"
            placeholderTextColor={colors.textTertiary}
            keyboardType="numeric"
          />

          <Text style={[styles.adminModalLabel, { color: colors.text }]}>Link do Afiliado (Opcional):</Text>
          <TextInput
            style={[styles.adminInput, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.inputBorder }]}
            value={affiliateLink}
            onChangeText={setAffiliateLink}
            placeholder="Ex: https://www.servico.com/affiliate"
            placeholderTextColor={colors.textTertiary}
            autoCapitalize="none"
          />

          <Text style={[styles.adminModalLabel, { color: colors.text }]}>Categoria:</Text>
          <View style={[styles.adminPickerContainer, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}>
            <Picker
              selectedValue={category}
              onValueChange={setCategory}
              style={{ color: colors.text }}
            >
              <Picker.Item label="Entretenimento" value="Entretenimento" />
              <Picker.Item label="Produtividade" value="Produtividade" />
              <Picker.Item label="Música" value="Música" />
              <Picker.Item label="Desenvolvimento" value="Desenvolvimento" />
              <Picker.Item label="Financeiro" value="Financeiro" />
              <Picker.Item label="Outros" value="Outros" />
            </Picker>
          </View>

          <Pressable 
            style={[styles.adminSaveButton, { backgroundColor: colors.tint, opacity: couponLoading ? 0.7 : 1 }]} 
            onPress={handleSaveCoupon}
            disabled={couponLoading}
          >
            <Text style={styles.adminSaveButtonText}>{couponLoading ? 'Salvando...' : 'Salvar no Servidor'}</Text>
          </Pressable>

          <Pressable style={[styles.adminCancelButton, { backgroundColor: colors.backgroundTertiary }]} onPress={() => setCouponModalVisible(false)}>
            <Text style={[styles.adminCancelButtonText, { color: colors.text }]}>Voltar</Text>
          </Pressable>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  headerConf: {
    marginTop: 30,
  },
  container: {
    flex: 1, padding: 16
  },
  scrollContent: {
    paddingBottom: 40,
  },
  adminSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 16,
  },
  adminListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  adminListContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  adminListTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  adminListDesc: {
    fontSize: 10,
    marginTop: 2,
  },
  adminListActions: {
    flexDirection: 'row',
    gap: 12,
  },
  adminActionButton: {
    padding: 6,
    borderRadius: 6,
  },
  title: {
    fontSize: 26, fontWeight: '800', marginBottom: 12
  },
  syncCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  syncHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  syncTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  syncText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.85,
    marginBottom: 10,
  },
  lastSyncText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  syncTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncHeaderIcon: {
    marginRight: 6,
  },
  syncFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
  },
  syncButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  syncButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 12, 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    marginBottom: 12,
    borderWidth: 1,
  },
  label: {
    fontSize: 16, fontWeight: '600',
  },
  adminModalContainer: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  adminModalTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center',
  },
  adminModalLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  adminInput: {
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
    borderRadius: 12,
    fontSize: 15,
  },
  adminPickerContainer: {
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  adminSaveButton: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 10,
  },
  adminSaveButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  adminCancelButton: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  adminCancelButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
