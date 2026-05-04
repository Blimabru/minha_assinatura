import { schemaMigrations, addColumns } from '@nozbe/watermelondb/Schema/migrations';

/*
  migrations.ts
  Migrações do WatermelonDB.

  - Ao aumentar `schema.version` acima da versão presente no DB, o Watermelon
    aplicará os passos definidos aqui (se suportado pelo adapter).
  - Neste arquivo adicionamos a coluna `notification_id` na versão 2, `status` na versão 3 e `recurrence`/`due_date` na versão 4.
*/
export const migrations = schemaMigrations({
  migrations: [
    {
      toVersion: 2,
      steps: [
        addColumns({
          table: 'subscriptions',
          columns: [{ name: 'notification_id', type: 'string' }],
        }),
      ],
    },
    {
      toVersion: 3,
      steps: [
        addColumns({
          table: 'subscriptions',
          columns: [{ name: 'status', type: 'string' }],
        }),
      ],
    },
    {
      toVersion: 4,
      steps: [
        addColumns({
          table: 'subscriptions',
          columns: [
            { name: 'recurrence', type: 'string' },
            { name: 'due_date', type: 'string' },
          ],
        }),
      ],
    },
  ],
});

export default migrations;
