# 🔋 Sistema de Otimização de Bateria

> Gerenciar e solicitar isenção de otimização de bateria do Android

## 📋 Visão Geral

O Android 6.0+ implementa o "Doze Mode" que desativa background services para economizar bateria. Este sistema gerencia e solicita isenção dessa otimização, garantindo que notificações funcionem mesmo em background.

### ✨ Características

- ✅ **Detecção Automática** - Verifica se otimização está ativa
- ✅ **Solicitação de Isenção** - Pede permissão ao usuário
- ✅ **Multiplataforma** - Funciona em iOS e Android
- ✅ **Graceful Fallback** - No iOS, retorna false sem erro
- ✅ **TypeScript** - Totalmente tipado
- ✅ **Seguro** - Não trava o app

---

## 🏗️ Arquitetura

### Arquivos do Sistema

```
mobile/src/
├── services/
│   └── BatteryOptimizationService.ts   # Interface com módulo nativo
├── hooks/
│   └── useBatteryOptimization.ts        # Hook React para UI
└── components/
    └── BatteryOptimizationAlert.tsx     # Modal de solicitação
```

### Fluxo de Funcionamento

```
1. App inicia
    ↓
2. useBatteryOptimization hook verifica status
    ↓
3. Se otimização está ATIVA
    ↓
4. Exibe BatteryOptimizationAlert
    ↓
5. Usuário aceita → Abre settings
    ↓
6. Usuário configura → Volta ao app
    ↓
7. App reconstrói e valida nova permissão
```

---

## 🚀 Como Usar

### 1. **Verificar Status (Simples)**

```typescript
import { batteryOptimizationService } from '@/src/services/BatteryOptimizationService';

async function checkBattery() {
  try {
    const isOptimized = await batteryOptimizationService.isBatteryOptimizationEnabled();
    
    if (isOptimized) {
      console.log('⚠️ Otimização de bateria ATIVA - notificações podem não funcionar');
    } else {
      console.log('✅ Otimização desativada - notificações OK');
    }
  } catch (error) {
    console.error('Erro ao verificar bateria:', error);
  }
}
```

### 2. **Usar o Hook React (Recomendado)**

```typescript
import { useBatteryOptimization } from '@/src/hooks/useBatteryOptimization';

function MyComponent() {
  const {
    isBatteryOptimizationEnabled,  // boolean | null
    isLoading,                      // boolean
    error,                          // Error | null
    checkPermission                 // () => Promise<void>
  } = useBatteryOptimization();

  // Verifica automaticamente ao montar
  // isBatteryOptimizationEnabled é null enquanto carrega

  if (isLoading) {
    return <Text>Verificando permissão de bateria...</Text>;
  }

  if (isBatteryOptimizationEnabled) {
    return <Text style={styles.warning}>⚠️ Bateria otimizada</Text>;
  }

  return <Text style={styles.success}>✅ Pronto para notificações</Text>;
}
```

### 3. **Modal de Solicitação (Pronto para Usar)**

```typescript
import { BatteryOptimizationAlert } from '@/src/components/BatteryOptimizationAlert';

function App() {
  const { isBatteryOptimizationEnabled, checkPermission } = useBatteryOptimization();
  const [showAlert, setShowAlert] = useState(false);

  // Mostrar alerta se otimização está ativa
  useEffect(() => {
    if (isBatteryOptimizationEnabled === true) {
      setShowAlert(true);
    }
  }, [isBatteryOptimizationEnabled]);

  // Quando usuário volta das configurações
  const handlePermissionGranted = async () => {
    // Aguardar volta do usuário
    setTimeout(() => {
      checkPermission();  // Verificar novamente
      setShowAlert(false);
    }, 1000);
  };

  return (
    <>
      <MainApp />
      <BatteryOptimizationAlert
        visible={showAlert}
        onDismiss={() => setShowAlert(false)}
        onPermissionGranted={handlePermissionGranted}
      />
    </>
  );
}
```

---

## 📋 Referência da API

### BatteryOptimizationService

#### `isBatteryOptimizationEnabled()`
Verifica se otimização de bateria está ativa.

```typescript
async isBatteryOptimizationEnabled(): Promise<boolean>
```

**Retorna:**
- `true` - Otimização ATIVA (notificações podem falhar)
- `false` - Otimização DESATIVADA (notificações OK)

**Exemplo:**
```typescript
const isOptimized = await batteryOptimizationService.isBatteryOptimizationEnabled();
if (isOptimized) {
  console.log('Solicitar isenção');
}
```

#### `requestBatteryOptimizationExemption()`
Solicita isenção ao usuário.

```typescript
async requestBatteryOptimizationExemption(): Promise<boolean>
```

**Nota:** Abre as configurações do Android para o usuário permitir manualmente.

**Exemplo:**
```typescript
const success = await batteryOptimizationService.requestBatteryOptimizationExemption();
if (success) {
  console.log('Usuário abriu settings');
}
```

#### `openBatterySettings()`
Abre configurações de bateria do dispositivo.

```typescript
async openBatterySettings(): Promise<boolean>
```

#### `openAppBatterySettings()`
Abre configurações de bateria específicas do app.

```typescript
async openAppBatterySettings(): Promise<boolean>
```

---

## 🎯 Casos de Uso

### Cenário 1: Verificação ao Iniciar App

```typescript
// app.tsx ou _layout.tsx
function RootLayout() {
  const { isBatteryOptimizationEnabled, checkPermission } = useBatteryOptimization();
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    // Verifica automaticamente ao iniciar
    if (isBatteryOptimizationEnabled === true) {
      setShowAlert(true);
    }
  }, [isBatteryOptimizationEnabled]);

  return (
    <>
      <Stack />
      <BatteryOptimizationAlert
        visible={showAlert}
        onDismiss={() => setShowAlert(false)}
        onPermissionGranted={async () => {
          await checkPermission();
          setShowAlert(false);
        }}
      />
    </>
  );
}
```

### Cenário 2: Validar Antes de Criar Notificação

```typescript
const { scheduleAlert } = useSubscriptionNotifications();
const { isBatteryOptimizationEnabled } = useBatteryOptimization();

async function handleCreateSubscription(data) {
  // Avisar usuário se bateria está otimizada
  if (isBatteryOptimizationEnabled === true) {
    Alert.alert(
      'Atenção',
      'A otimização de bateria pode impedir notificações. Desative nas configurações.',
      [
        { text: 'Abrir Configurações', onPress: openBatterySettings },
        { text: 'Continuar', onPress: () => scheduleAlert(...) }
      ]
    );
  } else {
    await scheduleAlert(...);
  }
}
```

### Cenário 3: Re-verificar Após Retornar de Settings

```typescript
const { isBatteryOptimizationEnabled, checkPermission } = useBatteryOptimization();

// Usar useFocusEffect para verificar quando tela fica visível
useFocusEffect(
  useCallback(() => {
    // Verificar novamente quando volta
    checkPermission();
  }, [])
);
```

---

## 🔍 Android Doze Mode - O que é?

### Problema Original

```
Antes do Android 6.0:
├─ Apps agendavam tasks em background
├─ WiFi/GPS/Bluetooth ficavam sempre ativos
├─ Bateria descarregava rápido
└─ Usuários ficavam insatisfeitos
```

### Solução - Doze Mode (Android 6.0+)

```
Doze Mode (Inativo):
├─ App em background sem interação
├─ Sistema desativa background jobs
├─ WiFi/GPS reduzem atividade
├─ Bateria dura mais
└─ Mas... notificações podem atrasar!
```

### O Que Seu App Precisa

Para que notificações funcionem no Doze:
1. ✅ Adicionar app à whitelist (o que você está fazendo)
2. ✅ Usar Google Cloud Messaging (nós usamos local)
3. ✅ Solicitar isenção ao usuário

---

## 📊 Plataformas Suportadas

### Android
✅ **Totalmente Suportado**
- Android 6.0+ (API 23+)
- Verifica Doze Mode
- Solicita isenção com UI nativa
- Abre configurações do dispositivo

### iOS
✅ **Compatível (Sem Fazer Nada)**
- Sem equivalente a Doze Mode
- Método retorna `false` automaticamente
- Notificações funcionam normalmente

---

## 🔧 Configuração Nativa

### Android (build.gradle)

```gradle
android {
    compileSdkVersion 33
    
    defaultConfig {
        minSdkVersion 21
        targetSdkVersion 33
    }
}

dependencies {
    // Expo Notifications já inclui tudo
    implementation 'expo-notifications'
}
```

### Permissões (AndroidManifest.xml)

```xml
<!-- Verificar status de bateria -->
<uses-permission android:name="android.permission.BATTERY_STATS" />

<!-- Acessar PowerManager -->
<uses-permission android:name="android.permission.DEVICE_POWER" />

<!-- Solicitar isenção de Doze (Android 12+) -->
<uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />
```

---

## ⚠️ Considerações Importantes

### 1. **Não é Garantido**

```typescript
// Mesmo com isenção, pode falhar:
// - Modo Avião ativo
// - WiFi desativado
// - Armazenamento cheio
// - Bug do fabricante

// Sempre tenha fallback
```

### 2. **Usuário Controla Tudo**

```
O usuário pode a qualquer momento:
├─ Desabilitar a isenção
├─ Desabilitar notificações
├─ Desabilitar o app
└─ E o sistema respeitará
```

### 3. **Nem Sempre Necessário**

```typescript
// Se usar Cloud Messaging (Firebase):
// Não precisa de isenção
// Google gerencia entrega garantida

// Se usar Notificações Locais:
// Precisa de isenção para funcionar em Doze
```

---

## 🐛 Troubleshooting

### "Notificações Não Chegam"

**Checklist:**
1. ✅ `isBatteryOptimizationEnabled === true`?
2. ✅ Solicitou isenção ao usuário?
3. ✅ Usuário aceitou na tela de settings?
4. ✅ App foi reiniciado após mudança?

**Solução:**
```typescript
// Verificar status
const isOptimized = await batteryOptimizationService.isBatteryOptimizationEnabled();
console.log('Otimização ativa?', isOptimized);

// Se sim, solicitar
if (isOptimized) {
  await batteryOptimizationService.requestBatteryOptimizationExemption();
}

// Verificar novamente
const afterRequest = await batteryOptimizationService.isBatteryOptimizationEnabled();
console.log('Depois de solicitar:', afterRequest);
```

### "Usuário Recusou"

```typescript
// Isso é normal - respeite a decisão
// Você pode:
// 1. Avisar que notificações podem não funcionar
// 2. Oferecer alternativa (email, SMS)
// 3. Perguntar novamente depois

// Não force - prejudica UX
```

### "Em iOS não funciona"

```typescript
// iOS não tem Doze Mode
// O método retorna false automaticamente
// Notificações funcionam normalmente
// Nada a fazer!
```

---

## 📊 Tipos e Interfaces

```typescript
interface UseBatteryOptimizationReturn {
  isBatteryOptimizationEnabled: boolean | null;  // null enquanto carrega
  isLoading: boolean;
  error: Error | null;
  checkPermission: () => Promise<void>;
}

interface BatteryOptimizationService {
  isBatteryOptimizationEnabled(): Promise<boolean>;
  requestBatteryOptimizationExemption(): Promise<boolean>;
  openBatterySettings(): Promise<boolean>;
  openAppBatterySettings(): Promise<boolean>;
}
```

---

## 🎓 Boas Práticas

### ✅ Faça

```typescript
// ✅ Verificar na inicialização
useEffect(() => {
  checkPermission();
}, []);

// ✅ Solicitar com contexto
if (isBatteryOptimizationEnabled === true) {
  showAlert('Notificações podem falhar');
}

// ✅ Respeitar escolha do usuário
// Se recusar, não insista

// ✅ Oferecer alternativas
// Email, SMS, push via servidor
```

### ❌ Não Faça

```typescript
// ❌ Não forçar constantemente
// Causa frustração

// ❌ Não ignorar o status
if (isBatteryOptimizationEnabled === true) {
  // AVISE o usuário
}

// ❌ Não assumir que funciona
// Sempre valide notificações

// ❌ Não usar para coisas ruins
// Respeite a privacidade do usuário
```

---

## 📞 Relação com Notificações

Este sistema trabalha com [NOTIFICATION_SYSTEM.md](NOTIFICATION_SYSTEM.md).

```
Notificações não funcionam?
├─ 1. Verificar BATTERY_OPTIMIZATION (este doc)
├─ 2. Depois verificar NOTIFICATION_SYSTEM (outro doc)
└─ 3. Ambos precisam estar OK
```

**Checklist Combinado:**
- [ ] Otimização de bateria? `isBatteryOptimizationEnabled === false`
- [ ] Notificações agendadas? `scheduledAlerts.length > 0`
- [ ] Permissões? `Notifications.requestPermissionsAsync()`
- [ ] Data futura? `alertDate > new Date()`
- [ ] App em background? Feche completamente
- [ ] Esperar tempo passar? Não antecipe
