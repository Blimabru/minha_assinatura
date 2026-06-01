import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SyncService {
  constructor(private prisma: PrismaService) {}

  async pullChanges(userId: string, lastPulledAt: number) {
    // Se lastPulledAt for nulo, indefinido ou 0, trata como sincronização inicial (traz tudo)
    const isInitialSync = !lastPulledAt || lastPulledAt === 0;
    const filterTimestamp = isInitialSync ? 0 : lastPulledAt;

    // --- CATEGORIAS ---
    // Criadas desde o último pull
    const createdCategories = await this.prisma.category.findMany({
      where: {
        userId,
        createdAt: { gt: filterTimestamp },
        deletedAt: null,
      },
    });

    // Atualizadas desde o último pull (excluindo as recém-criadas)
    const updatedCategories = isInitialSync
      ? []
      : await this.prisma.category.findMany({
          where: {
            userId,
            updatedAt: { gt: filterTimestamp },
            createdAt: { lte: filterTimestamp },
            deletedAt: null,
          },
        });

    // Deletadas desde o último pull
    const deletedCategories = isInitialSync
      ? []
      : await this.prisma.category.findMany({
          where: {
            userId,
            deletedAt: { gt: filterTimestamp },
          },
          select: { id: true },
        });

    // --- ASSINATURAS ---
    // Criadas desde o último pull
    const createdSubscriptions = await this.prisma.subscription.findMany({
      where: {
        userId,
        createdAt: { gt: filterTimestamp },
        deletedAt: null,
      },
    });

    // Atualizadas desde o último pull
    const updatedSubscriptions = isInitialSync
      ? []
      : await this.prisma.subscription.findMany({
          where: {
            userId,
            updatedAt: { gt: filterTimestamp },
            createdAt: { lte: filterTimestamp },
            deletedAt: null,
          },
        });

    // Deletadas desde o último pull
    const deletedSubscriptions = isInitialSync
      ? []
      : await this.prisma.subscription.findMany({
          where: {
            userId,
            deletedAt: { gt: filterTimestamp },
          },
          select: { id: true },
        });

    // Mapeia os dados no formato exato exigido pelo WatermelonDB
    return {
      changes: {
        categories: {
          created: createdCategories.map((c) => ({
            id: c.id,
            name: c.name,
            icon: c.icon,
            created_at: c.createdAt,
            updated_at: c.updatedAt,
          })),
          updated: updatedCategories.map((c) => ({
            id: c.id,
            name: c.name,
            icon: c.icon,
            created_at: c.createdAt,
            updated_at: c.updatedAt,
          })),
          deleted: deletedCategories.map((c) => c.id),
        },
        subscriptions: {
          created: createdSubscriptions.map((s) => ({
            id: s.id,
            user_id: s.userId,
            category_id: s.categoryId,
            service_name: s.serviceName,
            value: s.value,
            currency: s.currency,
            billing_date: s.billingDate,
            is_active: s.isActive,
            status: s.status,
            recurrence: s.recurrence,
            due_date: s.dueDate,
            notification_id: s.notificationId,
            created_at: s.createdAt,
            updated_at: s.updatedAt,
          })),
          updated: updatedSubscriptions.map((s) => ({
            id: s.id,
            user_id: s.userId,
            category_id: s.categoryId,
            service_name: s.serviceName,
            value: s.value,
            currency: s.currency,
            billing_date: s.billingDate,
            is_active: s.isActive,
            status: s.status,
            recurrence: s.recurrence,
            due_date: s.dueDate,
            notification_id: s.notificationId,
            created_at: s.createdAt,
            updated_at: s.updatedAt,
          })),
          deleted: deletedSubscriptions.map((s) => s.id),
        },
      },
      timestamp: Date.now(),
    };
  }

  async pushChanges(userId: string, changes: any) {
    if (!changes) {
      throw new BadRequestException('Nenhuma mudança enviada');
    }

    const now = Date.now();

    // Executa tudo dentro de uma transação Prisma para consistência
    await this.prisma.$transaction(async (tx) => {
      // ==========================================
      // 1. PROCESSAR CATEGORIAS
      // ==========================================
      const { categories } = changes;
      if (categories) {
        // Criados
        if (Array.isArray(categories.created)) {
          for (const cat of categories.created) {
            await tx.category.upsert({
              where: { id: cat.id },
              update: {
                name: cat.name,
                icon: cat.icon,
                updatedAt: cat.updated_at || now,
                deletedAt: null, // Restaura se estivesse deletado
              },
              create: {
                id: cat.id,
                name: cat.name,
                icon: cat.icon,
                createdAt: cat.created_at || now,
                updatedAt: cat.updated_at || now,
                userId,
              },
            });
          }
        }

        // Atualizados (Resolução de conflitos Last Write Wins)
        if (Array.isArray(categories.updated)) {
          for (const cat of categories.updated) {
            const existing = await tx.category.findUnique({
              where: { id: cat.id },
            });

            // Só atualiza se a mudança do cliente for mais recente
            if (!existing || existing.updatedAt < (cat.updated_at || now)) {
              await tx.category.upsert({
                where: { id: cat.id },
                update: {
                  name: cat.name,
                  icon: cat.icon,
                  updatedAt: cat.updated_at || now,
                  deletedAt: null,
                },
                create: {
                  id: cat.id,
                  name: cat.name,
                  icon: cat.icon,
                  createdAt: cat.created_at || now,
                  updatedAt: cat.updated_at || now,
                  userId,
                },
              });
            }
          }
        }

        // Excluídos (Soft Delete)
        if (Array.isArray(categories.deleted) && categories.deleted.length > 0) {
          await tx.category.updateMany({
            where: {
              id: { in: categories.deleted },
              userId,
            },
            data: {
              deletedAt: now,
            },
          });
        }
      }

      // ==========================================
      // 2. PROCESSAR ASSINATURAS
      // ==========================================
      const { subscriptions } = changes;
      if (subscriptions) {
        // Criados
        if (Array.isArray(subscriptions.created)) {
          for (const sub of subscriptions.created) {
            await tx.subscription.upsert({
              where: { id: sub.id },
              update: {
                categoryId: sub.category_id,
                serviceName: sub.service_name,
                value: Number(sub.value),
                currency: sub.currency,
                billingDate: Number(sub.billing_date),
                isActive: Boolean(sub.is_active),
                status: sub.status,
                recurrence: sub.recurrence,
                dueDate: sub.due_date,
                notificationId: sub.notification_id || null,
                updatedAt: sub.updated_at || now,
                deletedAt: null,
              },
              create: {
                id: sub.id,
                userId,
                categoryId: sub.category_id,
                serviceName: sub.service_name,
                value: Number(sub.value),
                currency: sub.currency,
                billingDate: Number(sub.billing_date),
                isActive: Boolean(sub.is_active),
                status: sub.status,
                recurrence: sub.recurrence,
                dueDate: sub.due_date,
                notificationId: sub.notification_id || null,
                createdAt: sub.created_at || now,
                updatedAt: sub.updated_at || now,
              },
            });
          }
        }

        // Atualizados (Resolução de conflitos Last Write Wins)
        if (Array.isArray(subscriptions.updated)) {
          for (const sub of subscriptions.updated) {
            const existing = await tx.subscription.findUnique({
              where: { id: sub.id },
            });

            if (!existing || existing.updatedAt < (sub.updated_at || now)) {
              await tx.subscription.upsert({
                where: { id: sub.id },
                update: {
                  categoryId: sub.category_id,
                  serviceName: sub.service_name,
                  value: Number(sub.value),
                  currency: sub.currency,
                  billingDate: Number(sub.billing_date),
                  isActive: Boolean(sub.is_active),
                  status: sub.status,
                  recurrence: sub.recurrence,
                  dueDate: sub.due_date,
                  notificationId: sub.notification_id || null,
                  updatedAt: sub.updated_at || now,
                  deletedAt: null,
                },
                create: {
                  id: sub.id,
                  userId,
                  categoryId: sub.category_id,
                  serviceName: sub.service_name,
                  value: Number(sub.value),
                  currency: sub.currency,
                  billingDate: Number(sub.billing_date),
                  isActive: Boolean(sub.is_active),
                  status: sub.status,
                  recurrence: sub.recurrence,
                  dueDate: sub.due_date,
                  notificationId: sub.notification_id || null,
                  createdAt: sub.created_at || now,
                  updatedAt: sub.updated_at || now,
                },
              });
            }
          }
        }

        // Excluídos (Soft Delete)
        if (Array.isArray(subscriptions.deleted) && subscriptions.deleted.length > 0) {
          await tx.subscription.updateMany({
            where: {
              id: { in: subscriptions.deleted },
              userId,
            },
            data: {
              deletedAt: now,
            },
          });
        }
      }
    });

    return { success: true };
  }

  async getAds() {
    return this.prisma.ad.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createAd(title: string, description: string, icon: string, color: string) {
    return this.prisma.ad.create({
      data: {
        id: Math.random().toString(36).substring(2, 15),
        title,
        description,
        icon,
        color,
        createdAt: Date.now(),
      },
    });
  }

  async getCoupons() {
    return this.prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createCoupon(data: {
    serviceName: string;
    description: string;
    discountCode: string;
    discountPercentage: number;
    externalLink: string;
    affiliateLink: string;
    category: string;
  }) {
    return this.prisma.coupon.create({
      data: {
        id: Math.random().toString(36).substring(2, 15),
        serviceName: data.serviceName,
        description: data.description,
        discountCode: data.discountCode,
        discountPercentage: Number(data.discountPercentage),
        externalLink: data.externalLink,
        affiliateLink: data.affiliateLink,
        category: data.category,
        createdAt: Date.now(),
      },
    });
  }
}
