// React hooks para estado local, efeito colateral e cálculo memoizado.
import { useEffect, useMemo, useState } from 'react';

// Instância singleton do banco WatermelonDB.
// Importante: garante que toda a app usa a mesma conexão.
import database from '@/database';

// Tipo do model Subscription para dar segurança de tipos nas queries.
import Subscription from '@/database/models/Subscription';
import Category from '@/database/models/Category';

// Tipo "de saída" para a UI.
// Importante: a tela não depende do model bruto do banco.
export type SubscriptionItem = {
    id: string; // Identificador único da assinatura.
    serviceName: string; // Nome do serviço (Netflix, Adobe, etc).
    value: number; // Valor numérico da assinatura.
    currency: string; // Moeda do valor (BRL, USD...).
    billingDate: number; // Dia do ciclo de cobrança (1-31).
    isActive: boolean; // Se assinatura está ativa.
    categoryId: string; // ID da categoria.
    categoryName: string; // Nome da categoria.
    categoryIcon: string; // Ícone da categoria para renderização na UI.
};

// Hook customizado para centralizar leitura de assinaturas.
// Importante: evita duplicar lógica de banco na UI.
export function useSubscriptions() {
    // Estado com as assinaturas já mapeadas para a camada de apresentação.
    const [items, setItems] = useState<SubscriptionItem[]>([]);

    // Estado de carregamento para controlar o feedback visual da tela.
    const [loading, setLoading] = useState(true);

    // Estado para armazenar as categorias disponíveis
    const [categories, setCategories] = useState<Category[]>([]);

    // Efeito para carregar categorias
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const categoryCollection = database.get<Category>('categories');
                const categoryRows = await categoryCollection.query().fetch();
                setCategories(categoryRows);
            } catch (error) {
                console.error("Erro ao carregar categorias:", error);
            }
        };
        loadCategories();
    }, []);

    // Função para carregar assinaturas do banco e atualizar o estado.
    const loadSubscriptions = async () => {
        try {
            const collection = database.get<Subscription>('subscriptions');
            const rows = await collection.query().fetch();
            const mapped = await Promise.all(rows.map(async (row) => {
                const category = await row.category.fetch();

                return {
                    id: row.id,
                    serviceName: row.serviceName,
                    value: row.value,
                    currency: row.currency,
                    billingDate: row.billingDate,
                    isActive: row.isActive,
                    categoryId: row.categoryId,
                    categoryName: category.name,
                    categoryIcon: category.icon,
                };
            }));

            setItems(mapped);
            setLoading(false);
        } catch (error) {
            console.error("Erro ao carregar assinaturas:", error);
        }
    };

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
            .subscribe(() => {
                loadSubscriptions();
            });

        // Executa a primeira carga inicial.
        loadSubscriptions();

        // Cleanup obrigatório para evitar vazamento de memória.
        return () => subscription.unsubscribe();
    }, []);

    // Busca uma assinatura específica pelo ID
    const getSubscriptionById = async (id: string): Promise<SubscriptionItem | null> => {
        try {
            const collection = database.get<Subscription>('subscriptions');
            // 'find' busca um registro específico pelo ID no WatermelonDB
            const row = await collection.find(id);
            const category = await row.category.fetch();

            return {
                id: row.id,
                serviceName: row.serviceName,
                value: row.value,
                currency: row.currency,
                billingDate: row.billingDate,
                isActive: row.isActive,
                categoryId: row.categoryId,
                categoryName: category.name,
                categoryIcon: category.icon,
            };
        } catch (error) {
            console.error("Erro ao buscar assinatura:", error);
            return null;
        }
    };

    // Atualiza os dados de uma assinatura
    // Aceita um objeto parcial apenas com os campos que você deseja alterar
    const updateSubscription = async (id: string, dataToUpdate: { 
        serviceName?: string; 
        value?: number; 
        currency?: string; 
        billingDate?: number; 
        categoryId?: string 
    }) => {
        try {
            const collection = database.get<Subscription>('subscriptions');
            
            // Qualquer modificação no WatermelonDB DEVE estar dentro de um database.write()
            await database.write(async () => {
                const record = await collection.find(id);
                
                await record.update((subscription) => {
                    // Atualiza o nome do serviço apenas se ele foi passado
                    if (dataToUpdate.serviceName !== undefined) {
                        subscription.serviceName = dataToUpdate.serviceName;
                    }
                    // Atualiza o valor apenas se ele foi passado
                    if (dataToUpdate.value !== undefined) {
                        subscription.value = dataToUpdate.value;
                    }
                    // Atualiza a moeda apenas se ela foi passada
                    if (dataToUpdate.currency !== undefined) {
                        subscription.currency = dataToUpdate.currency;
                    }
                    // Atualiza a data apenas se ela foi passada
                    if (dataToUpdate.billingDate !== undefined) {
                        subscription.billingDate = dataToUpdate.billingDate;
                    }
                    // Atualiza a categoria apenas se ela foi passada
                    if (dataToUpdate.categoryId !== undefined) {
                        subscription.categoryId = dataToUpdate.categoryId;
                    }
                });
            });

            await loadSubscriptions();
        } catch (error) {
            console.error("Erro ao atualizar a assinatura:", error);
            throw error; // Joga o erro para a UI poder exibir um alerta
        }
    };

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
        categories, // Lista de categorias disponíveis.
        getSubscriptionById,
        updateSubscription,
    };
}