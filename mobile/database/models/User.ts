import { Model, type Query } from '@nozbe/watermelondb';
import { children, date, readonly, text } from '@nozbe/watermelondb/decorators';
import type Subscription from './Subscription';

// Model representa uma linha da tabela users.
export default class User extends Model {
  // Nome exato da tabela no schema.
  static table = 'users';

  // Associações para navegação entre tabelas.
  static associations = {
    // Um usuário possui várias assinaturas.
    subscriptions: { type: 'has_many' as const, foreignKey: 'user_id' },
  };

  // Mapeamento coluna -> propriedade da classe.
  @text('name') name!: string;
  @text('email') email!: string;
  @text('password_hash') passwordHash!: string;
  @text('currency_preference') currencyPreference!: string;

  // Consulta reativa das assinaturas desse usuário.
  @children('subscriptions') subscriptions!: Query<Subscription>;

  // Campos de auditoria (somente leitura no model).
  @readonly
  @date('created_at')
  createdAt!: Date;

  @readonly
  @date('updated_at')
  updatedAt!: Date;
}