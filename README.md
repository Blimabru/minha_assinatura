# 📱 Minha Assinatura

> Aplicativo mobile para gestão centralizada de assinaturas, controle financeiro e prevenção de churn involuntário (esquecimento de cancelamento).

O **Minha Assinatura** resolve a dor financeira de usuários que perdem dinheiro por esquecerem de cancelar assinaturas não utilizadas ou que perdem o acesso a serviços importantes por esquecimento na renovação. Através de uma abordagem *Offline-First*, o app garante acesso instantâneo aos dados e alertas locais precisos.

---

## 👥 Equipe de Desenvolvimento

Projeto desenvolvido como parte dos requisitos acadêmicos do curso de Sistemas de Informação.

*   **Bruno Moreira Lima** (Infraestrutura, Dados e Sincronização)
*   **Claudio Pales Costa** (Mobile Setup e Lógica de Formulários)
*   **Gabriel Honorato Santos Ferraz** (Motor de Notificações Nativas)
*   **Tiago Ferraz de Novais** (Dashboard e Visualização de Dados)
*   **Kéven Moraes Patrício** (UI/UX e Protótipos de Alta Fidelidade)

---

## 🛠️ Stack Tecnológica

Este projeto utiliza a arquitetura de **Monorepo**, dividindo o código entre o aplicativo mobile e a API de retaguarda.

**Frontend Mobile (`/mobile`)**
*   **Framework:** React Native (TypeScript)
*   **Arquitetura:** MVVM (Model-View-ViewModel)
*   **Banco de Dados Local:** WatermelonDB (SQLite) - *Abordagem Offline-First*
*   **Navegação:** React Navigation

**Backend e API (`/api`)** *[A partir da Fase 2]*
*   **Linguagem/Framework:** Node.js com NestJS
*   **Banco de Dados:** PostgreSQL (Nuvem)
*   **Autenticação:** JWT (JSON Web Token)

**Infraestrutura e DevOps**
*   **CI/CD:** GitHub Actions (Linting e Testes)
*   **Conteinização:** Docker (Backend)

---

## 🚀 Fases de Desenvolvimento

O projeto está dividido em etapas incrementais de entrega de valor:

- [x] **Setup:** Configuração de repositório, CI/CD e protótipos (Figma).
- [ ] **Fase 1 (MVP Local):** App funcionando 100% offline, cadastro básico, dashboard de gastos e banco de dados local (WatermelonDB).
- [ ] **Fase 1.5 (Notificações):** Motor de agendamento de alertas de vencimento locais (Push Notifications) com mitigação de economia de bateria no Android.
- [ ] **Fase 2 (Nuvem):** Implementação da API NestJS, autenticação de usuários (JWT) e sincronização bidirecional de dados (WatermelonDB ↔ PostgreSQL).
- [ ] **Fase 3 (Integrações):** Consumo de API externa para conversão automática de moedas e sistema de links de afiliados.

---

## 📂 Estrutura do Monorepo

```plaintext
minha-assinatura/
├── .github/workflows/       # Pipelines de CI/CD (GitHub Actions)
├── mobile/                  # Código fonte do aplicativo React Native
│   ├── src/
│   │   ├── components/      # Componentes visuais reaproveitáveis
│   │   ├── database/        # Schemas e Models do WatermelonDB
│   │   ├── screens/         # Telas da aplicação
│   │   └── utils/           # Funções auxiliares (formatação, etc)
│   └── package.json
├── api/                     # Código fonte do backend NestJS (Fase 2)
│   ├── src/
│   │   ├── auth/            # Módulo de Autenticação
│   │   ├── subscriptions/   # CRUD e Sincronização de Assinaturas
│   │   └── sync/            # Resolução de conflitos offline-online
│   └── package.json
└── README.md
```

---

## 💻 Como Rodar o Projeto (Ambiente de Desenvolvimento)

### Pré-requisitos
*   [Node.js](https://nodejs.org/) (versão 20 LTS recomendada)
*   Gerenciador de pacotes (npm ou yarn)
*   Ambiente React Native configurado (Android Studio / Xcode)

### Executando o Mobile (Fase 1)

1. Clone o repositório:
   ```bash
   git clone [https://github.com/SEU_USUARIO/minha-assinatura.git](https://github.com/SEU_USUARIO/minha-assinatura.git)
   ```
2. Acesse a pasta do aplicativo mobile:
   ```bash
   cd minha-assinatura/mobile
   ```
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Inicie o Metro Bundler:
   ```bash
   npm start
   ```
5. Em outro terminal, rode o app no emulador:
   ```bash
   npm run android  # ou npm run ios
   ```

---
*Documentação mantida pela equipe Minha Assinatura.*