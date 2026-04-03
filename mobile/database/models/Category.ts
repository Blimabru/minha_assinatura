import { Model, type Query } from '@nozbe/watermelondb';
import { children, date, readonly, text } from '@nozbe/watermelondb/decorators';
import type Subscription from './Subscription';

// Model da tabela categories.
export default class Category extends Model {
  static table = 'categories';

  static associations = {
    // Uma categoria possui várias assinaturas.
    subscriptions: { type: 'has_many' as const, foreignKey: 'category_id' },
  };

  @text('name') name!: string;
  @text('icon') icon!: string;

  // Permite listar assinaturas da categoria.
  @children('subscriptions') subscriptions!: Query<Subscription>;

  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
}