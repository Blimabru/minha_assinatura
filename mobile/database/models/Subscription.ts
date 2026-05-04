// Model base do WatermelonDB e tipo para relações com outras tabelas.
import { Model, type Relation } from '@nozbe/watermelondb';

// Decorators que mapeiam propriedades da classe para colunas SQLite.
import { date, field, readonly, relation, text } from '@nozbe/watermelondb/decorators';

// Tipos dos models relacionados (usuário e categoria).
import type User from './User';
import type Category from './Category';

// Model da tabela subscriptions (núcleo do app).
// Cada instância desta classe representa 1 linha da tabela subscriptions.
export default class Subscription extends Model {
  // Nome exato da tabela definida no schema.
  static table = 'subscriptions';

  // Relações declarativas usadas pelo WatermelonDB.
  static associations = {
    // Cada assinatura pertence a um usuário.
    users: { type: 'belongs_to' as const, key: 'user_id' },

    // Cada assinatura pertence a uma categoria.
    categories: { type: 'belongs_to' as const, key: 'category_id' },
  };

  // Colunas de chave estrangeira (FK lógica).
  // Importante: permitem setar e filtrar relações com performance.
  @text('user_id') userId!: string;
  @text('category_id') categoryId!: string;

  // Dados de negócio da assinatura.
  @text('service_name') serviceName!: string; // Ex: Netflix
  @field('value') value!: number; // Valor da assinatura
  @text('currency') currency!: string; // BRL, USD...
  @field('billing_date') billingDate!: number; // Dia da cobrança (1-31)
  @field('is_active') isActive!: boolean; // Ativa/cancelada
  @text('notification_id') notificationId!: string;

  /*
    Comentários (pt-br):
    - `notificationId` guarda o identificador retornado pelo sistema de notificações
      (ex.: Expo Notifications). Isso permite cancelar ou atualizar o agendamento
      associado a uma assinatura específica.
    - Importante: se você migrar registros existentes, considere que este campo
      pode ser vazio/null para dados antigos.
  */

  // Atalhos de relação para navegar entre tabelas.
  @relation('users', 'user_id') user!: Relation<User>;
  @relation('categories', 'category_id') category!: Relation<Category>;

  // Campos de auditoria em modo somente leitura.
  @readonly
  @date('created_at')
  createdAt!: Date;

  @readonly
  @date('updated_at')
  updatedAt!: Date;
}