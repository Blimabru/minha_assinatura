import React, { type PropsWithChildren } from 'react';
import { DatabaseProvider as WatermelonProvider } from '@nozbe/watermelondb/react';
import database from '../index';

// Provider global do WatermelonDB.
// Ele disponibiliza a instância singleton do banco para toda a árvore React.
export default function AppDatabaseProvider({ children }: PropsWithChildren) {
    return <WatermelonProvider database={database}>{children}</WatermelonProvider>;
}