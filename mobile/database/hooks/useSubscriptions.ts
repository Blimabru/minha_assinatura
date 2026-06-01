// React hooks para estado local, efeito colateral e cálculo memoizado.
import { useEffect, useMemo, useState } from 'react';

// Instância singleton do banco WatermelonDB.
// Importante: garante que toda a app usa a mesma conexão.
import database from '@/database';

// Tipo do model Subscription para dar segurança de tipos nas queries.
import Subscription from '@/database/models/Subscription';
import Category from '@/database/models/Category';
import { subscriptionNotificationService } from '@/src/services/SubscriptionNotificationService';
import { currencyConversionService } from '@/src/services/CurrencyConversionService';
import type { SupportedCurrency } from '@/src/services/CurrencyConversionService';
import type { SubscriptionRecurrence } from '@/src/utils/subscriptionSchedule';
import { useAuth } from '@/src/contexts/AuthContext';

export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled';

// Tipo "de saída" para a UI.
// Importante: a tela não depende do model bruto do banco.
export type SubscriptionItem = {
    id: string; // Identificador único da assinatura.
    serviceName: string; // Nome do serviço (Netflix, Adobe, etc).
    value: number; // Valor numérico da assinatura.
    currency: string; // Moeda do valor (BRL, USD...).
    billingDate: number; // Dia do ciclo de cobrança (1-31).
    isActive: boolean; // Se assinatura está ativa.
    status: SubscriptionStatus; // Status detalhado da assinatura.
    recurrence: SubscriptionRecurrence; // Recorrência da assinatura.
    dueDate: string; // Vencimento completo em formato YYYY-MM-DD.
    categoryId: string; // ID da categoria.
    categoryName: string; // Nome da categoria.
    categoryIcon: string; // Ícone da categoria para renderização na UI.
};

function normalizeStatus(rowStatus: string | null | undefined, isActive: boolean): SubscriptionStatus {
    if (typeof rowStatus === 'string') {
        const normalized = rowStatus.trim().toLowerCase();
        if (normalized === 'active' || normalized === 'inactive' || normalized === 'cancelled') {
            return normalized as SubscriptionStatus;
        }
    }

    return isActive ? 'active' : 'cancelled';
}

function normalizeRecurrence(recurrence: string | null | undefined): SubscriptionRecurrence {
    if (recurrence === 'mensal' || recurrence === 'trimestral' || recurrence === 'semestral' || recurrence === 'anual') {
        return recurrence;
    }

    return 'mensal';
}

// Hook customizado para centralizar leitura de assinaturas.
// Importante: evita duplicar lógica de banco na UI.
export function useSubscriptions() {
    const { user } = useAuth();
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
            const filteredRows = user ? rows.filter(row => row.userId === user.id) : [];
            const mapped = await Promise.all(filteredRows.map(async (row) => {
                const category = await row.category.fetch();

                return {
                    id: row.id,
                    serviceName: row.serviceName,
                    value: row.value,
                    currency: row.currency,
                    billingDate: row.billingDate,
                    isActive: row.isActive,
                    status: normalizeStatus((row as any).status, row.isActive),
                    recurrence: normalizeRecurrence((row as any).recurrence),
                    dueDate: (row as any).dueDate || '',
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
    }, [user]);

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
                status: normalizeStatus((row as any).status, row.isActive),
                recurrence: normalizeRecurrence((row as any).recurrence),
                dueDate: (row as any).dueDate || '',
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
        categoryId?: string;
        isActive?: boolean;
        status?: SubscriptionStatus;
        recurrence?: SubscriptionRecurrence;
        dueDate?: string;
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
                    if (dataToUpdate.status !== undefined) {
                        subscription.status = dataToUpdate.status;
                        subscription.isActive = dataToUpdate.status === 'active';
                    } else if (dataToUpdate.isActive !== undefined) {
                        subscription.isActive = dataToUpdate.isActive;
                        subscription.status = dataToUpdate.isActive ? 'active' : 'inactive';
                    }
                    if (dataToUpdate.recurrence !== undefined) {
                        subscription.recurrence = dataToUpdate.recurrence;
                    }
                    if (dataToUpdate.dueDate !== undefined) {
                        subscription.dueDate = dataToUpdate.dueDate;
                    }
                });
            });

            await loadSubscriptions();
        } catch (error) {
            console.error("Erro ao atualizar a assinatura:", error);
            throw error; // Joga o erro para a UI poder exibir um alerta
        }
    };

    const deleteSubscription = async (id: string) => {
        try {
            const collection = database.get<Subscription>('subscriptions');
            const record = await collection.find(id);

            if (record.notificationId) {
                await subscriptionNotificationService.cancelNotification(record.notificationId);
            }

            await database.write(async () => {
                await record.destroyPermanently();
            });

            await loadSubscriptions();
        } catch (error) {
            console.error('Erro ao excluir a assinatura:', error);
            throw error;
        }
    };

    const setSubscriptionStatus = async (id: string, status: SubscriptionStatus) => {
        await updateSubscription(id, {
            status,
        });
    };

    // Derivação memoizada: só assinaturas ativas.
    // Importante: evita recalcular em toda render sem necessidade.
    const activeSubscriptions = useMemo(
        () => items.filter((item) => item.status === 'active'),
        [items]
    );

    // Soma memoizada do custo mensal das assinaturas ativas.
    // Importante: já entrega dado pronto para o dashboard.
    // ATUALIZADO: Agora considera conversão de moedas para BRL
    const monthlyTotal = useMemo(
        () =>
            activeSubscriptions.reduce((acc, item) => {
                const currencyUpper = (item.currency || 'BRL').toUpperCase();
                let normalizedCurrency: SupportedCurrency = 'BRL';
                
                if (currencyUpper === 'USD' || currencyUpper === 'EUR' || currencyUpper === 'BRL') {
                    normalizedCurrency = currencyUpper as SupportedCurrency;
                }
                
                const valueInBRL = currencyConversionService.convertToBRL(Number(item.value || 0), normalizedCurrency);
                return acc + valueInBRL;
            }, 0),
        [activeSubscriptions]
    );

    // Soma de todos os gastos cadastrados, independentemente do status.
    // ATUALIZADO: Agora considera conversão de moedas para BRL
    const totalExpenses = useMemo(
        () => items.reduce((acc, item) => {
            const currencyUpper = (item.currency || 'BRL').toUpperCase();
            let normalizedCurrency: SupportedCurrency = 'BRL';
            
            if (currencyUpper === 'USD' || currencyUpper === 'EUR' || currencyUpper === 'BRL') {
                normalizedCurrency = currencyUpper as SupportedCurrency;
            }
            
            const valueInBRL = currencyConversionService.convertToBRL(Number(item.value || 0), normalizedCurrency);
            return acc + valueInBRL;
        }, 0),
        [items]
    );

    // Retorno do hook para consumo da tela.
    return {
        loading, // Permite mostrar "carregando" no início.
        items, // Lista completa.
        activeSubscriptions, // Lista filtrada para o dashboard.
        monthlyTotal, // Total mensal consolidado.
        totalExpenses, // Soma geral de todos os gastos.
        categories, // Lista de categorias disponíveis.
        getSubscriptionById,
        updateSubscription,
        deleteSubscription,
        setSubscriptionStatus,
    };
}