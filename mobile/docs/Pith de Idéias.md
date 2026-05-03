# 📱 Pitch de Aplicação Mobile: Minha Assinatura

**Equipe:**
* **Bruno Moreira Lima**
* **Claudio Pales Costa**
* **Gabriel Honorato Santos Ferraz**
* **Tiago Ferraz de Novais**
* **Kéven Moraes Patrício**

---

## 📌 Sumário
1. [Contexto e Problema](#1-contexto-e-problema)
2. [Solução Proposta](#2-solução-proposta)
3. [Stack Tecnológica](#3-stack-tecnológica)
4. [Arquitetura de Software](#4-arquitetura-de-software)
5. [Modelagem de Dados](#5-modelagem-de-dados)
6. [Planejamento e Viabilidade](#6-planejamento-e-viabilidade)

---

## 1. Contexto e Problema

### Qual problema sua aplicação resolve?
Resolve a dor financeira e organizacional de usuários que perdem dinheiro por esquecerem de cancelar assinaturas não utilizadas, ou que perdem o acesso a serviços importantes por esquecimento na renovação (**churn involuntário**).

### Qual é a oportunidade de mercado?
O mercado de streaming e serviços digitais cresce cerca de 20% ao ano no Brasil. Com mais de 150 milhões de smartphones ativos, há uma demanda crescente por ferramentas de gestão financeira pessoal. Aplicativos dessa categoria movimentam cerca de R$ 2 bilhões anualmente, com projeção de crescimento próxima a 40% nos próximos 2 anos.

### Público-alvo e personas
Pessoas de 16-80 anos, classe média a alta, profissionais urbanos com múltiplas responsabilidades diárias. Utilizam 3+ apps financeiros, possuem mais de 5 assinaturas ativas e consomem frequentemente serviços de streaming, SaaS e plataformas digitais.

---

## 2. Solução Proposta

### Descrição da aplicação e principais funcionalidades
Aplicativo mobile para gestão centralizada de assinaturas.
* **Cadastro de serviços:** Valor, periodicidade e conversor automático de moedas para assinaturas internacionais.
* **Alertas Push:** Notificações programáveis para datas de expiração/renovação.
* **Sincronização em Nuvem:** Estratégia *offline-first* para garantir acesso constante.

### Proposta de valor diferenciada
* **Redução de Desperdícios:** Identificação e alerta prévio para cancelamento de assinaturas ociosas.
* **Visibilidade Total:** Dashboard centralizando o custo mensal/anual de todos os serviços.
* **Privacidade:** Arquitetura que não exige dados bancários ou integrações sensíveis.
* **Economia Integrada:** Curadoria de links de afiliados e cupons de desconto.
* **Modelo Freemium:** Sistema de assinatura opcional (R$ 5,00) com personalizações exclusivas.

### Fluxo principal de uso
1. Cadastro/Login do usuário.
2. Tela inicial (**Dashboard**) exibindo o gasto total mensal e as próximas assinaturas a vencer.
3. Usuário clica em **"Adicionar"**, seleciona o serviço (ex: Netflix, Adobe), insere o valor e a data de cobrança.
4. O app agenda notificações locais para X dias antes da cobrança.
5. O usuário recebe o alerta e decide se mantém ou cancela o serviço.

---

## 3. Stack Tecnológica

| Camada | Tecnologia |
| :--- | :--- |
| **Frontend Mobile** | React Native (TypeScript) |
| **Backend** | Node.js com NestJS |
| **Banco de Dados (Nuvem)** | PostgreSQL |
| **Banco de Dados (Local)** | WatermelonDB / SQLite |
| **Infraestrutura** | Docker |
| **CI/CD** | GitHub Actions |

### Justificativa das escolhas
* **React Native:** Permite código único para Android e iOS, acelerando o desenvolvimento.
* **Node.js/NestJS:** Padronização da linguagem (JS/TS) em todo o ecossistema, facilitando a manutenção pela equipe.
* **WatermelonDB:** Uso de *lazy loading* sobre SQLite, garantindo alta performance mesmo com grandes volumes de dados e funcionamento 100% offline.
* **PostgreSQL:** Garantia de integridade e robustez para os dados persistidos na nuvem.

---

## 4. Arquitetura de Software

### Padrão Arquitetural
**MVVM (Model-View-ViewModel)** no Frontend integrado com uma arquitetura **Offline-First**.

### Diagrama de Arquitetura

```mermaid
graph TD
    A[UI - React Native] <--> B[(WatermelonDB - SQLite Local)]
    B <--> C[Motor de Sincronização]
    C <--> D[API REST - NestJS]
    D <--> E[(PostgreSQL - Nuvem)]