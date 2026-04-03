// Helpers para descrever o schema do WatermelonDB.
import { appSchema, tableSchema } from '@nozbe/watermelondb';

// Schema = contrato estrutural do banco local.
// Tudo que existe no banco precisa estar definido aqui.
export const schema = appSchema({
  // Versão do schema.
  // Sempre aumente quando alterar tabelas/colunas (com migração correspondente).
  version: 1,

  // Lista de tabelas do banco.
  tables: [
    tableSchema({
      // Nome da tabela de usuários.
      name: 'users',

      // Colunas da tabela users.
      columns: [
        // O id NÃO é declarado aqui, pois o Watermelon cria automaticamente.
        { name: 'name', type: 'string' }, // Nome exibido no perfil.
        { name: 'email', type: 'string', isIndexed: true }, // Index acelera busca por email.
        { name: 'password_hash', type: 'string' }, // Hash da senha para segurança.
        { name: 'currency_preference', type: 'string' }, // Preferência de moeda (BRL/USD).
        { name: 'created_at', type: 'number' }, // Timestamp de criação.
        { name: 'updated_at', type: 'number' }, // Timestamp da última atualização.
      ],
    }),

    tableSchema({
      // Nome da tabela de categorias de assinatura.
      name: 'categories',

      // Colunas da tabela categories.
      columns: [
        { name: 'name', type: 'string' }, // Ex: Streaming, Produtividade.
        { name: 'icon', type: 'string' }, // Chave do ícone usado na UI.
        { name: 'created_at', type: 'number' }, // Controle temporal.
        { name: 'updated_at', type: 'number' }, // Controle temporal.
      ],
    }),

    tableSchema({
      // Tabela principal do produto: assinaturas do usuário.
      name: 'subscriptions',

      // Colunas da tabela subscriptions.
      columns: [
        // Chaves de relacionamento (FK lógica) para users e categories.
        { name: 'user_id', type: 'string', isIndexed: true }, // Dono da assinatura.
        { name: 'category_id', type: 'string', isIndexed: true }, // Categoria da assinatura.

        // Dados do serviço assinado.
        { name: 'service_name', type: 'string' }, // Ex: Netflix, Adobe, Spotify.
        { name: 'value', type: 'number' }, // Valor da cobrança.
        { name: 'currency', type: 'string' }, // Moeda (BRL, USD...).
        { name: 'billing_date', type: 'number' }, // Dia do mês da cobrança (1-31).
        { name: 'is_active', type: 'boolean' }, // Status ativo/cancelado.

        // Metadados para auditoria/sincronização futura.
        { name: 'created_at', type: 'number' }, // Criação local.
        { name: 'updated_at', type: 'number' }, // Última alteração local.
      ],
    }),
  ],
});