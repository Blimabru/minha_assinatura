import { appSchema, tableSchema } from '@nozbe/watermelondb';

// Schema = contrato do banco local.
// Define tabelas, colunas e versão do banco.
export const schema = appSchema({
  // Sempre aumente quando mudar estrutura de tabela no futuro (migrações).
  version: 1,
  tables: [
    tableSchema({
      // Tabela de usuários locais.
      name: 'users',
      columns: [
        // Obs importante: o Watermelon já cria id automaticamente.
        // Não declare coluna id manualmente.
        { name: 'name', type: 'string' }, // Nome exibido no app.
        { name: 'email', type: 'string', isIndexed: true }, // Index melhora busca por email.
        { name: 'password_hash', type: 'string' }, // Hash da senha, nunca senha em texto puro.
        { name: 'currency_preference', type: 'string' }, // Moeda preferida: BRL, USD etc.
        { name: 'created_at', type: 'number' }, // Timestamp de criação.
        { name: 'updated_at', type: 'number' }, // Timestamp de atualização.
      ],
    }),
    tableSchema({
      // Tabela de categorias (Streaming, SaaS, etc).
      name: 'categories',
      columns: [
        { name: 'name', type: 'string' }, // Nome da categoria.
        { name: 'icon', type: 'string' }, // Nome/identificador do ícone.
        { name: 'created_at', type: 'number' }, // Controle de criação.
        { name: 'updated_at', type: 'number' }, // Controle de atualização.
      ],
    }),
    tableSchema({
      // Tabela principal do app: assinaturas.
      name: 'subscriptions',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true }, // Relação com users.
        { name: 'category_id', type: 'string', isIndexed: true }, // Relação com categories.
        { name: 'service_name', type: 'string' }, // Ex: Netflix, Adobe.
        { name: 'value', type: 'number' }, // Valor da assinatura.
        { name: 'currency', type: 'string' }, // Moeda do valor.
        { name: 'billing_date', type: 'number' }, // Dia do ciclo de cobrança (1-31).
        { name: 'is_active', type: 'boolean' }, // Assinatura ativa ou cancelada.
        { name: 'created_at', type: 'number' }, // Data de criação local.
        { name: 'updated_at', type: 'number' }, // Data de atualização local.
      ],
    }),
  ],
});