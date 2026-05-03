# SCRUM-62: Receber Alerta de Vencimento (Push Local)

## ✅ Requisito Implementado

**Descrição:** Como usuário, quero receber uma notificação no meu celular dias antes da data de cobrança, para que eu tenha tempo de cancelar se desejar.

**Critério de Aceite:** No momento do cadastro da assinatura, agendar uma notificação local (usando bibliotecas como NotifFee). A notificação deve disparar no dia/hora configurado informando o nome do serviço.

---

## 🎯 Solução Implementada

### Arquitetura de 3 Camadas

```
┌─────────────────────────────────────────────────────────┐
│ Componente (SubscriptionNotificationExample)            │
│ - Interface de cadastro de assinatura                   │
│ - Chama hook ao criar assinatura                        │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│ Hook (useAutoScheduleNotifications)                     │
│ - Orquestra agendamento automático                      │
│ - Chama scheduleForSubscription ao criar               │
│ - Chama cancelForSubscription ao deletar               │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│ Service (SubscriptionNotificationService)              │
│ - Agenda/cancela notificações no sistema               │
│ - Valida datas e horários                              │
│ - Retorna IDs válidos das notificações                 │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Componentes

### 1. **SubscriptionNotificationService.ts** ✅
**Responsabilidade:** Comunicação com o sistema de notificações do Expo

**Métodos principais:**
- `scheduleExpirationAlert()` - Agenda notificação para data específica
  - ✅ Valida inputs
  - ✅ Calcula data correta (vencimento - dias de aviso)
  - ✅ Lança erro se data passou
  - ✅ Retorna ID válido da notificação
- `cancelNotification()` - Cancela notificação agendada
- `rescheduleExpirationAlert()` - Atualiza notificação existente

**Correções implementadas:**
- ✅ Async/await correto no constructor
- ✅ Validação de inputs obrigatórios
- ✅ Erros claros em vez de valores vazios
- ✅ Cálculo correto de segundos até alerta

---

### 2. **useSubscriptionNotifications.ts** ✅
**Responsabilidade:** Hook que gerencia estado de notificações

**Métodos principais:**
- `scheduleAlert()` - Agenda alerta com tratamento de erro
  - ✅ Valida que notificationId não é vazio
  - ✅ Atualiza estado local
  - ✅ Loga sucesso
- `cancelAlert()` - Cancela alerta
- `updateAlert()` - Atualiza alerta existente
- `loadScheduledNotifications()` - Recarrega lista real

**Correções implementadas:**
- ✅ Valida notificationId antes de adicionar à lista
- ✅ Sincronização com sistema de notificações real

---

### 3. **useAutoScheduleNotifications.ts** ✅ [NOVO]
**Responsabilidade:** Hook que integra cadastro com agendamento automático

**Métodos principais:**
- `scheduleForSubscription(subscription)` - Agenda ou atualiza notificação
  - ✅ Valida se assinatura está ativa
  - ✅ Usa reminderDaysBefore padrão (7 dias)
  - ✅ Atualiza se já existe notificação
  - ✅ Cria nova se não existe
  - ✅ Loga resultado para debug
- `cancelForSubscription(subscription)` - Cancela notificação

**Como usar:**
```typescript
// No componente de cadastro
const { scheduleForSubscription } = useAutoScheduleNotifications();

// Ao criar assinatura
const notificationId = await scheduleForSubscription({
  id: 'sub-123',
  serviceName: 'Netflix',
  expirationDate: new Date('2026-05-29'),
  reminderDaysBefore: 7,
  isActive: true,
});

// Salvar notificationId junto com assinatura no banco
```

---

### 4. **SubscriptionNotificationExample.tsx** ✅ [NOVO]
**Responsabilidade:** Demonstra fluxo completo de uso

**Funcionalidades:**
- ✅ Formulário para cadastrar assinatura
- ✅ Integração com `useAutoScheduleNotifications`
- ✅ Feedback visual durante agendamento
- ✅ Exemplo prático do fluxo

---

## 🔄 Fluxo Completo (Requisito Cumprido)

### 1. Usuário Cadastra Assinatura
```javascript
{
  serviceName: "Netflix",
  price: 34.90,
  expirationDate: 2026-05-29,  // 30 dias a partir de hoje
  reminderDaysBefore: 7         // Avisar 7 dias antes
}
```

### 2. Sistema Calcula Data do Alerta
```javascript
alertDate = expirationDate - reminderDaysBefore
alertDate = 2026-05-29 - 7 dias = 2026-05-22
```

### 3. Sistema Agenda Notificação
```javascript
Notifications.scheduleNotificationAsync({
  content: {
    title: "Lembrete de Vencimento",
    body: "Sua assinatura \"Netflix\" vence em 7 dias",
    data: { subscriptionName: "Netflix", ... }
  },
  trigger: {
    type: "timeInterval",
    seconds: // segundos até 2026-05-22 00:00
  }
})
```

### 4. Notificação Retorna ID
```javascript
notificationId = "12345-abc-67890"
```

### 5. Notificação Disparada no Dia/Hora
```
[Notificação no dispositivo]
┌──────────────────────────────────┐
│ Lembrete de Vencimento           │
│ Sua assinatura "Netflix"         │
│ vence em 7 dias                  │
│                                  │
│ [Tocar para abrir app]           │
└──────────────────────────────────┘
```

---

## ✅ Requisito Checklist

- ✅ **Cadastro de assinatura** → Hook `useAutoScheduleNotifications` pronto
- ✅ **Detecta data de vencimento** → Calcula `expirationDate`
- ✅ **Calcula dias de aviso** → `reminderDaysBefore` (padrão 7 dias)
- ✅ **Agenda notificação local** → Usando `expo-notifications`
- ✅ **Dispara no dia/hora** → `trigger.type: 'timeInterval'`
- ✅ **Mostra nome do serviço** → `body: "...\"${serviceName}\"..."`
- ✅ **Validação de datas** → Rejeita datas que já passaram
- ✅ **Tratamento de erros** → Mensagens claras e logging

---

## 🚀 Como Usar

### Integrar com Seu Sistema de Cadastro

```typescript
import { useAutoScheduleNotifications } from '@/src/hooks/useAutoScheduleNotifications';

export function MeuComponenteDeCadastro() {
  const { scheduleForSubscription } = useAutoScheduleNotifications();

  const handleSaveSubscription = async (formData) => {
    // 1. Salvar assinatura no banco
    const subscription = await createSubscriptionInDB(formData);

    // 2. IMPORTANTE: Agendar notificação
    try {
      const notificationId = await scheduleForSubscription({
        id: subscription.id,
        serviceName: subscription.serviceName,
        expirationDate: subscription.expirationDate,
        reminderDaysBefore: subscription.reminderDaysBefore ?? 7,
        isActive: subscription.isActive,
      });

      // 3. Atualizar banco com notificationId
      await updateSubscriptionWithNotificationId(subscription.id, notificationId);

    } catch (error) {
      Alert.alert('Erro', `Falha ao agendar notificação: ${error.message}`);
    }
  };
}
```

### Ao Editar Assinatura

```typescript
const handleUpdateSubscription = async (subscriptionId, updatedData) => {
  const subscription = await updateSubscriptionInDB(subscriptionId, updatedData);

  // Se data de vencimento ou reminder mudou, atualizar notificação
  await scheduleForSubscription({
    ...subscription,
    notificationId: subscription.notificationId, // Existente
  });
};
```

### Ao Deletar Assinatura

```typescript
const handleDeleteSubscription = async (subscriptionId) => {
  const subscription = await getSubscription(subscriptionId);

  // Cancelar notificação
  await cancelForSubscription(subscription);

  // Deletar do banco
  await deleteSubscriptionFromDB(subscriptionId);
};
```

---

## 🧪 Teste do Sistema

Para testar sem esperar pela data real:

```typescript
// Agenda notificação para 10 segundos
const expirationDate = new Date();
expirationDate.setSeconds(expirationDate.getSeconds() + 10);

await scheduleForSubscription({
  id: 'test-1',
  serviceName: 'Netflix Teste',
  expirationDate,
  reminderDaysBefore: 0, // Notifica imediatamente
  isActive: true,
});

// Feche o app e aguarde 10 segundos
// Você receberá uma notificação no topo da tela
```

---

## 🎯 Status Final

✅ **Requisito SCRUM-62 Implementado com Sucesso**

- Sistema de notificações funcional
- Integração com cadastro de assinaturas
- Validação e tratamento de erros
- Pronto para ser integrado ao banco de dados
- Exemplos de uso fornecidos
