// Classe principal do WatermelonDB.
// Responsável por orquestrar adapter + models + operações de banco.
import { Database } from '@nozbe/watermelondb';

// Adapter SQLite para React Native.
// Ele faz a ponte entre WatermelonDB e o SQLite nativo do dispositivo.
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { migrations } from './migrations';

// Schema define estrutura física das tabelas e colunas.
import { schema } from './schema';

// Models representam o "mapa objeto" das tabelas.
// Importante: sem registrar models, não há tipagem nem relações.
import User from './models/User';
import Category from './models/Category';
import Subscription from './models/Subscription';

// Lista de models registrada no banco.
// Ordem não é obrigatória, mas manter consistente ajuda manutenção.
const modelClasses = [User, Category, Subscription];

// Cria o adapter do SQLite.
// Importante: adapter é a camada que realmente conversa com o banco local.
const adapter = new SQLiteAdapter({
  // Contrato das tabelas/colunas usado na criação e validação do banco.
  schema,
  // Migrações para evoluir o schema existente sem perder dados.
  migrations,

  // Nome físico do banco no storage do app.
  // Se mudar este nome, você cria outro banco (vazio) em paralelo.
  dbName: 'db-minha_assinatura',

  // JSI melhora performance por reduzir overhead da bridge.
  // Em RN moderno, é a opção recomendada.
  jsi: true,

  // Callback para capturar erro de setup (schema inválido, migração, etc).
  onSetUpError: (error) => {
    console.error('Erro ao inicializar o WatermelonDB:', error);
  },
});

// Instância única (singleton) do banco.
// Importante: evita múltiplas conexões e garante consistência global.
export const database = new Database({
  adapter, // Canal de comunicação com SQLite.
  modelClasses, // Entidades registradas para uso no app.
});

// Export default para facilitar imports no restante da app.
export default database;