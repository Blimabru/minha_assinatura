// React hooks para estado local, efeito colateral e cálculo memoizado.
import { useEffect, useMemo, useState } from 'react';

// Instância singleton do banco WatermelonDB.
// Importante: garante que toda a app usa a mesma conexão.
import database from '@/database';

// Tipo do model Subscription para dar segurança de tipos nas queries.
import type Subscription from '@/database/models/Subscription';

// Tipo "de saída" para a UI.
// Importante: a tela não depende do model bruto do banco.
type SubscriptionItem = {
    id: string; // Identificador único da assinatura.
    serviceName: string; // Nome do serviço (Netflix, Adobe, etc).
    value: number; // Valor numérico da assinatura.
    currency: string; // Moeda do valor (BRL, USD...).
    billingDate: number; // Dia do ciclo de cobrança (1-31).
    isActive: boolean; // Se assinatura está ativa.
};

// Hook customizado para centralizar leitura de assinaturas.
// Importante: evita duplicar lógica de banco na UI.
export function useSubscriptions() {
    // Estado com as assinaturas já mapeadas para a camada de apresentação.
    const [items, setItems] = useState<SubscriptionItem[]>([]);

    // Estado de carregamento para controlar o feedback visual da tela.
    const [loading, setLoading] = useState(true);

    // Efeito executado ao montar o componente.
    // Importante: cria assinatura reativa no banco e limpa ao desmontar.
    useEffect(() => {
        // Obtém a coleção "subscriptions" tipada.
        const collection = database.get<Subscription>('subscriptions');

        // Observa mudanças no resultado da query em tempo real.
        // Importante: qualquer insert/update/delete atualiza a tela automaticamente.
        const subscription = collection
            .query()
            .observe()
            .subscribe((rows) => {
                // Mapeia do model do banco para o formato da UI.
                // Importante: desacopla banco de dados da camada visual.
                const mapped = rows.map((row) => ({
                    id: row.id,
                    serviceName: row.serviceName,
                    value: row.value,
                    currency: row.currency,
                    billingDate: row.billingDate,
                    isActive: row.isActive,
                }));

                // Atualiza estado com dados mais recentes.
                setItems(mapped);

                // Marca que terminou a primeira carga.
                setLoading(false);
            });

        // Cleanup obrigatório para evitar vazamento de memória.
        return () => subscription.unsubscribe();
    }, []);

    // Derivação memoizada: só assinaturas ativas.
    // Importante: evita recalcular em toda render sem necessidade.
    const activeSubscriptions = useMemo(
        () => items.filter((item) => item.isActive),
        [items]
    );

    // Soma memoizada do custo mensal das assinaturas ativas.
    // Importante: já entrega dado pronto para o dashboard.
    const monthlyTotal = useMemo(
        () =>
            activeSubscriptions.reduce((acc, item) => acc + Number(item.value || 0), 0),
        [activeSubscriptions]
    );

    // Retorno do hook para consumo da tela.
    return {
        loading, // Permite mostrar "carregando" no início.
        items, // Lista completa.
        activeSubscriptions, // Lista filtrada para o dashboard.
        monthlyTotal, // Total mensal consolidado.
    };
}