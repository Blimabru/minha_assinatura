# 📬 Sistema de Notificações de Assinatura

> Notificações locais automáticas para alertar usuários sobre vencimentos de assinatura

## 📋 Visão Geral

O sistema de notificações gerencia alertas locais sobre vencimentos de assinatura. As notificações são agendadas no dispositivo e funcionam mesmo com o app fechado, oferecendo uma experiência perfeita para o usuário.

### ✨ Características

- ✅ **Notificações Agendadas** - Alertas automáticos configuráveis
- ✅ **Sem Servidor** - Tudo roda localmente no dispositivo
- ✅ **Multiplataforma** - iOS e Android totalmente suportados
- ✅ **Persistente** - Funciona com app fechado
- ✅ **Gerenciável** - Criar, atualizar, cancelar alertas facilmente
- ✅ **TypeScript** - Código totalmente tipado

---

## 🏗️ Arquitetura

### Arquivos do Sistema

```
mobile/src/
├── services/
│   └── SubscriptionNotificationService.ts    # Gerenciador principal
├── hooks/
│   └── useSubscriptionNotifications.ts       # Hook React para UI
├── types/
│   └── subscription.ts                       # Tipos e interfaces
└── components/
    ├── SubscriptionExpirationAlert.tsx       # Modal de gerenciamento
    └── SubscriptionFormExample.tsx           # Exemplo de uso
```

### Fluxo de Funcionamento

```
1. Usuário cria/edita assinatura
    ↓
2. SubscriptionFormExample captura dados
    ↓
3. useSubscriptionNotifications.scheduleAlert() é chamado
    ↓
4. SubscriptionNotificationService agenda no Expo Notifications
    ↓
5. Sistema do dispositivo agenda para data/hora específica
    ↓
6. No dia do alerta → Notificação exibida
    ↓
7. Usuário clica → App abre (opcional)
```

---

## 🚀 Como Usar

### 1. **Agendar uma Notificação (Forma Simples)**

```typescript
import { subscriptionNotificationService } from '@/src/services/SubscriptionNotificationService';

// Agendar alerta para 7 dias antes do vencimento
const expirationDate = new Date('2026-05-18');
const notificationId = await subscriptionNotificationService.scheduleExpirationAlert(
  'Netflix',          // Nome da assinatura
  expirationDate,     // Data de vencimento
  7                   // Dias antes para alertar
);

console.log('Notificação agendada:', notificationId);
```

### 2. **Usar o Hook React (Recomendado)**

```typescript
import { useSubscriptionNotifications } from '@/src/hooks/useSubscriptionNotifications';

function MyComponent() {
  const { 
    scheduleAlert,      // Agendar nova notificação
    cancelAlert,        // Cancelar notificação
    scheduledAlerts,    // Lista de alertas agendados
    isLoading,          // Estado de carregamento
    error               // Erros
  } = useSubscriptionNotifications();

  // Agendar
  const handleSchedule = async () => {
    try {
      await scheduleAlert('Spotify', new Date('2026-06-15'), 3);
    } catch (err) {
      console.error('Erro ao agendar:', err);
    }
  };

  // Cancelar
  const handleCancel = async (notificationId: string) => {
    await cancelAlert(notificationId);
  };

  return (
    <View>
      <Text>Alertas: {scheduledAlerts.length}</Text>
      {scheduledAlerts.map(alert => (
        <Text key={alert.notificationId}>
          {alert.subscriptionName} - {alert.daysBeforeExpiration} dias
        </Text>
      ))}
    </View>
  );
}
```

### 3. **Modal de Gerenciamento (Pronto para Usar)**

```typescript
import { SubscriptionExpirationAlert } from '@/src/components/SubscriptionExpirationAlert';

function App() {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Button 
        title="Gerenciar Alertas"
        onPress={() => setVisible(true)}
      />
      
      <SubscriptionExpirationAlert
        visible={visible}
        onDismiss={() => setVisible(false)}
      />
    </>
  );
}
```

---

## 📋 Referência da API

### SubscriptionNotificationService

#### `scheduleExpirationAlert()`
Agenda uma notificação de vencimento.

```typescript
async scheduleExpirationAlert(
  subscriptionName: string,
  expirationDate: Date,
  daysBeforeExpiration?: number  // padrão: 7
): Promise<string>  // Retorna ID da notificação
```

**Exemplo:**
```typescript
const id = await service.scheduleExpirationAlert(
  'Netflix',
  new Date('2026-05-20'),
  7
);
```

#### `cancelAlert()`
Cancela uma notificação agendada.

```typescript
async cancelAlert(notificationId: string): Promise<boolean>
```

#### `getScheduledNotifications()`
Retorna todas as notificações agendadas.

```typescript
async getScheduledNotifications(): Promise<ScheduledNotification[]>
```

#### `setupNotificationReceivedListener()`
Configura listener para quando notificação chega.

```typescript
setupNotificationReceivedListener(
  callback: (notification: Notification) => void
): () => void  // Função para remover listener
```

#### `setupNotificationResponseListener()`
Configura listener para quando usuário clica na notificação.

```typescript
setupNotificationResponseListener(
  callback: (response: NotificationResponse) => void
): () => void
```

---

## 🎯 Casos de Uso

### Cenário 1: Novo Usuário Criando Assinatura

```typescript
// SubscriptionFormExample.tsx
const { scheduleAlert } = useSubscriptionNotifications();

async function handleCreateSubscription(data) {
  // Salvar assinatura no banco de dados
  const subscription = await saveSubscription(data);
  
  // Agendar notificação automática
  await scheduleAlert(
    subscription.name,
    new Date(subscription.expirationDate),
    subscription.alertDaysBefore || 7
  );
  
  showSuccess('Assinatura criada e alerta agendado!');
}
```

### Cenário 2: Renovar Assinatura

```typescript
async function handleRenewSubscription(subscriptionId) {
  // Cancelar notificação antiga
  const old = await getOldNotification(subscriptionId);
  if (old) {
    await cancelAlert(old.notificationId);
  }
  
  // Agendar nova notificação
  const newDate = new Date();
  newDate.setFullYear(newDate.getFullYear() + 1);
  
  await scheduleAlert(
    subscription.name,
    newDate,
    7
  );
}
```

### Cenário 3: Monitorar Notificações Recebidas

```typescript
useEffect(() => {
  const unsubscribe = subscriptionNotificationService
    .setupNotificationReceivedListener((notification) => {
      console.log('📬 Nova notificação:', notification);
      
      // Atualizar UI, analytics, etc
      updateNotificationLog(notification);
    });

  return () => unsubscribe?.();
}, []);
```

---

## 🔧 Configurações

### Permissões Necessárias

#### iOS (Info.plist)
```xml
<key>NSUserNotificationUsageDescription</key>
<string>Notificações de vencimento de assinatura</string>
```

#### Android (AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

### Comportamento das Notificações

As notificações exibem:
- 🔔 Som
- 🎯 Badge com número
- 📢 Alert (alert visual)
- 📝 Título e mensagem customizável

---

## ⚠️ Considerações Importantes

### 1. **Permissões**
- iOS: Solicita permissão ao inicializar
- Android 12+: Solicita permissão `POST_NOTIFICATIONS`
- Sem permissão: Notificações não são exibidas

### 2. **Datas Passadas**
- Se `alertDate < agora`, a notificação não é agendada
- O sistema valida automaticamente

### 3. **Memory Leaks**
- Use o hook, não o serviço diretamente em componentes
- O hook limpa listeners automaticamente

### 4. **App Fechado**
- Notificações funcionam com app fechado
- Sistema operacional gerencia a entrega
- Clique na notificação abre o app

---

## 🐛 Troubleshooting

### Notificação Não Aparece

**Checklist:**
1. ✅ App tem permissões de notificação?
2. ✅ Data é no futuro?
3. ✅ Dispositivo tem bateria suficiente?
4. ✅ App fechado completamente?
5. ✅ Esperar o tempo correto passar?

**Solução:**
```typescript
// Verificar permissões
const { status } = await Notifications.requestPermissionsAsync();
console.log('Status de permissão:', status);

// Verificar notificações agendadas
const scheduled = await Notifications.getAllScheduledNotificationsAsync();
console.log('Agendadas:', scheduled.length);
```

### Erro de Permissão

```typescript
// Isso é normal em desenvolvimento
// A permissão é pedida automaticamente
// Verifique as configurações de permissão do dispositivo
```

### Muitas Notificações Agendadas

```typescript
// Limpar antigas antes de agendar novas
const old = await subscriptionNotificationService.getScheduledNotifications();
for (const notif of old) {
  await subscriptionNotificationService.cancelAlert(notif.identifier);
}
```

---

## 📊 Tipos e Interfaces

```typescript
interface SubscriptionExpirationAlert {
  id: string;
  subscriptionId: string;
  subscriptionName: string;
  expirationDate: Date;
  notificationDate: Date;
  notificationId?: string;
  isScheduled: boolean;
  createdAt: Date;
}

interface ScheduledAlert {
  subscriptionName: string;
  expirationDate: Date;
  notificationId: string;
  daysBeforeExpiration: number;
}
```

---

## 🎓 Boas Práticas

### ✅ Faça

```typescript
// ✅ Use o hook em componentes
const { scheduleAlert } = useSubscriptionNotifications();

// ✅ Trate erros
try {
  await scheduleAlert('Netflix', date, 7);
} catch (error) {
  showError('Falha ao agendar alerta');
}

// ✅ Valide datas
if (alertDate > new Date()) {
  await scheduleAlert(name, date, days);
}
```

### ❌ Não Faça

```typescript
// ❌ Não use o serviço diretamente em componentes
subscriptionNotificationService.scheduleExpirationAlert(...);

// ❌ Não ignore erros
await scheduleAlert(...);  // Sem tratamento

// ❌ Não agende datas passadas
await scheduleAlert(name, pastDate, 7);
```

---

## 📞 Suporte

Para questões sobre o sistema:
1. Consulte a documentação [BATTERY_OPTIMIZATION.md](BATTERY_OPTIMIZATION.md) para otimizações
2. Verifique os tipos em `mobile/src/types/subscription.ts`
3. Analise o exemplo completo em `SubscriptionFormExample.tsx`
