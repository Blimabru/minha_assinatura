import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'users',
      columns: [
        { name: 'id', type: 'string', isIndexed: true },
        { name: 'name', type: 'string' },
        { name: 'email', type: 'string', isIndexed: true },
        { name: 'password_hash', type: 'string' },
        { name: 'currency_preference', type: 'string' }, // BRL, USD, etc
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'categories', // nome da tabela no SQLite
      columns: [
        { name: 'id', type: 'string', isIndexed: true }, // ID único
        { name: 'name', type: 'string' }, // nome da categoria (ex: Streaming)
        { name: 'icon', type: 'string' }, // ícone (ex: 'netflix')
        { name: 'created_at', type: 'number' }, // timestamp de criação
        { name: 'updated_at', type: 'number' }, // timestamp de atualização
      ],
    }),
    tableSchema({
      name: 'subscriptions', // nome da tabela no SQLite
      columns: [
        { name: 'id', type: 'string', isIndexed: true }, // ID único
        { name: 'user_id', type: 'string', isIndexed: true }, // relação com usuário (para depois sincronizar)
        { name: 'category_id', type: 'string', isIndexed: true }, // relação com categoria
        { name: 'service_name', type: 'string' }, // nome do serviço (ex: Netflix)
        { name: 'value', type: 'number' }, // valor em número (ex: 19.90)
        { name: 'currency', type: 'string' }, // moeda (ex: BRL, USD)
        { name: 'billing_date', type: 'number' }, // dia do mês que é cobrado (1-31)
        { name: 'is_active', type: 'boolean' }, // se está ativa ou cancelada
        { name: 'created_at', type: 'number' }, // timestamp de criação
        { name: 'updated_at', type: 'number' }, // timestamp de atualização
      ],
    }),
  ],
});