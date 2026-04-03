import { Model, type Relation } from '@nozbe/watermelondb';
import { date, field, readonly, relation, text } from '@nozbe/watermelondb/decorators';
import type User from './User';
import type Category from './Category';

// Model da tabela subscriptions (núcleo do app).
export default class Subscription extends Model {
  static table = 'subscriptions';

  static associations = {
    // Cada assinatura pertence a um usuário.
    users: { type: 'belongs_to' as const, key: 'user_id' },
    // Cada assinatura pertence a uma categoria.
    categories: { type: 'belongs_to' as const, key: 'category_id' },
  };

  @text('service_name') serviceName!: string;
  @field('value') value!: number;
  @text('currency') currency!: string;
  @field('billing_date') billingDate!: number;
  @field('is_active') isActive!: boolean;

  // Acesso relacional ao usuário dono da assinatura.
  @relation('users', 'user_id') user!: Relation<User>;
  // Acesso relacional à categoria da assinatura.
  @relation('categories', 'category_id') category!: Relation<Category>;

  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
}