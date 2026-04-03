import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import { schema } from './schema';
import User from './models/User';
import Category from './models/Category';
import Subscription from './models/Subscription';

// Lista de models registrada no banco.
// Sem isso, Watermelon não consegue instanciar os registros corretamente.
const modelClasses = [User, Category, Subscription];

// Adapter conecta Watermelon com SQLite nativo.
const adapter = new SQLiteAdapter({
  schema, // Estrutura das tabelas.
  dbName: 'db-minha_assinatura', // Nome físico do arquivo local.
  jsi: true, // Melhor performance (ponte JSI).
  onSetUpError: (error) => {
    // Log útil para diagnosticar erro de schema/migração.
    console.error('Erro ao inicializar o WatermelonDB:', error);
  },
});

// Singleton do banco para ser reutilizado no app inteiro.
export const database = new Database({
  adapter,
  modelClasses,
});

export default database;