import { and, eq } from 'drizzle-orm';
import { Injectable } from '@nestjs/common';

import { UsageType } from 'apps/libs/common/enums/usage-type.enum';
import { Timer } from 'apps/libs/common/api/decorators/timer.decorator';
import { HostErrorCodes } from 'apps/libs/common/constants/error-codes.constant';
import { DatabaseService, TransactionalExecutor } from '../services/database.service';
import { billingPlan, host, hostBillingDiscount, hostUser, multimedia, role, status } from '../schemas';

import { Host as HostType, NewHost, NewMultimedia, HostWithDetails, HostWithLogoAndStatus } from '../types';
import { Host } from 'apps/libs/domain/hosts/hosts.entity';
import { HostMapper } from '../mappers/host.mapper';

interface CreateHostWithDetailsParams {
    hostData: Omit<NewHost, 'billingPlanId' | 'statusId'>;
    userData: {
        userId: number;
        roleName: string;
        statusName: string;
    };
    billingData: {
        planName: string;
        discount?: {
            id: number;
            validFrom?: Date | undefined | null;
            validUntil?: Date | undefined | null;
        };
    };
    logoData?: Omit<NewMultimedia, 'hostId'> | undefined;
}

interface UpdateHostDetailsParams {
    hostDataToUpdate: Partial<NewHost>;
    logo?: Omit<NewMultimedia, 'hostId'>;
    deleteLogo?: boolean;
}

@Injectable()
export class HostsRepository {
    constructor(private readonly databaseService: DatabaseService) {}

    private getExecutor(tx?: TransactionalExecutor): TransactionalExecutor {
        const db = this.databaseService.getDatabase();
        return tx || db;
    }

    @Timer('[HOSTS] create host')
    public async create(data: NewHost, tx?: TransactionalExecutor): Promise<HostType> {
        const executor = this.getExecutor(tx);
        try {
            const [result] = await executor.insert(host).values(data).returning();
            return result;
        } catch (error: any) {
            if (error.code === '23505' && error.detail?.includes('(alias)')) {
                throw new Error(HostErrorCodes.AliasAlreadyExists);
            }
            throw error;
        }
    }

    @Timer('[HOSTS] findByRecordId host')
    public async findByRecordId(recordId: string, tx?: TransactionalExecutor): Promise<HostType | null> {
        const executor = this.getExecutor(tx);
        const result = await executor.query.host.findFirst({
            where: eq(host.recordId, recordId),
            with: {
                status: true,
            },
        });
        return result || null;
    }

    @Timer('[HOSTS] findByAlias host')
    public async findByAlias(alias: string, tx?: TransactionalExecutor): Promise<HostType | null> {
        const executor = this.getExecutor(tx);
        const result = await executor.query.host.findFirst({
            where: eq(host.alias, alias),
            with: {
                status: true,
            },
        });
        return result || null;
    }

    @Timer('[HOSTS] updateById host')
    public async updateById(id: number, data: Partial<NewHost>, tx?: TransactionalExecutor): Promise<HostType | null> {
        const executor = this.getExecutor(tx);
        const [result] = await executor.update(host).set(data).where(eq(host.id, id)).returning();
        return result || null;
    }

    @Timer('[HOSTS] deleteById host')
    public async deleteById(id: number, tx?: TransactionalExecutor): Promise<void> {
        const executor = this.getExecutor(tx);
        await executor.delete(host).where(eq(host.id, id));
    }

    @Timer('[HOSTS] addUserToHost')
    public async addUserToHost(
        hostId: number,
        userId: number,
        roleId: number,
        statusId: number,
        tx?: TransactionalExecutor,
    ): Promise<void> {
        const executor = this.getExecutor(tx);
        await executor.insert(hostUser).values({ hostId, userId, roleId, statusId });
    }

    @Timer('[HOSTS] removeUserFromHost')
    public async removeUserFromHost(hostId: number, userId: number, tx?: TransactionalExecutor): Promise<void> {
        const executor = this.getExecutor(tx);
        await executor.delete(hostUser).where(and(eq(hostUser.hostId, hostId), eq(hostUser.userId, userId)));
    }

    @Timer('[HOSTS] applyDiscount')
    public async applyDiscount(
        hostId: number,
        discountId: number,
        statusId: number,
        validFrom?: Date,
        validUntil?: Date,
        tx?: TransactionalExecutor,
    ): Promise<void> {
        const executor = this.getExecutor(tx);
        await executor.insert(hostBillingDiscount).values({
            hostId,
            discountId,
            statusId,
            validFrom,
            validUntil,
        });
    }

    @Timer('[HOSTS] updateHostWithDetails')
    public async updateHostWithDetails(
        hostId: number,
        { hostDataToUpdate, logo, deleteLogo }: UpdateHostDetailsParams,
    ): Promise<void> {
        await this.databaseService.getDatabase().transaction(async (tx) => {
            if (Object.keys(hostDataToUpdate).length > 0) {
                await this.updateById(hostId, hostDataToUpdate, tx);
            }

            if (deleteLogo) {
                await this.deleteLogo(hostId, tx);
            } else if (logo) {
                await this.upsertLogo(hostId, logo, tx);
            }
        });
    }

    @Timer('[HOSTS] upsertLogo')
    public async upsertLogo(
        hostId: number,
        logoData: Omit<NewMultimedia, 'hostId'>,
        tx?: TransactionalExecutor,
    ): Promise<void> {
        const executor = this.getExecutor(tx);
        await executor
            .insert(multimedia)
            .values({
                ...logoData,
                hostId,
                usageType: UsageType.LOGO,
            })
            .onConflictDoUpdate({
                target: [multimedia.hostId, multimedia.usageType],
                set: {
                    ...logoData,
                    updatedAt: new Date(),
                },
            });
    }

    @Timer('[HOSTS] deleteLogo')
    public async deleteLogo(hostId: number, tx?: TransactionalExecutor): Promise<void> {
        const executor = this.getExecutor(tx);
        await executor
            .delete(multimedia)
            .where(and(eq(multimedia.hostId, hostId), eq(multimedia.usageType, UsageType.LOGO)));
    }

    @Timer('[HOSTS] findDetailsByRecordId host')
    public async findDetailsByRecordId(recordId: string): Promise<Host | null> {
        const result = await this.databaseService.getDatabase().query.host.findFirst({
            where: eq(host.recordId, recordId),
            with: {
                status: true,
                verificationStatus: true,
                multimedia: {
                    where: eq(multimedia.usageType, UsageType.LOGO),
                    orderBy: (multimedia, { asc }) => [asc(multimedia.orderIndex)],
                    limit: 1,
                },
                billingPlan: {
                    with: {
                        planBreakdowns: true,
                    },
                },
                hostBillingDiscounts: {
                    with: {
                        discount: {
                            with: {
                                status: true,
                            },
                        },
                        status: true,
                    },
                },
            },
        });
        return result ? HostMapper.toDomain(result as HostWithDetails) : null;
    }

    @Timer('[HOSTS] findWithLogoAndStatusByRecordId host')
    public async findWithLogoAndStatusByRecordId(recordId: string): Promise<HostWithLogoAndStatus | null> {
        const result = await this.databaseService.getDatabase().query.host.findFirst({
            where: eq(host.recordId, recordId),
            with: {
                status: true,
                multimedia: {
                    where: eq(multimedia.usageType, UsageType.LOGO),
                    orderBy: (multimedia, { asc }) => [asc(multimedia.orderIndex)],
                    limit: 1,
                },
            },
        });
        return result as HostWithLogoAndStatus | null;
    }

    @Timer('[HOSTS] createHostWithDetails')
    public async createHostWithDetails({
        hostData,
        userData,
        billingData,
        logoData,
    }: CreateHostWithDetailsParams): Promise<HostType> {
        const db = this.databaseService.getDatabase();
        return db.transaction(async (tx) => {
            const hostRole = await tx.query.role.findFirst({
                where: eq(role.name, userData.roleName),
            });
            if (!hostRole) {
                throw new Error(`Role with name ${userData.roleName} not found`);
            }

            const statusData = await tx.query.status.findFirst({
                where: and(eq(status.name, userData.statusName)),
            });
            if (!statusData) {
                throw new Error(`Status with name ${userData.statusName} not found`);
            }

            const plan = await tx.query.billingPlan.findFirst({
                where: eq(billingPlan.key, billingData.planName),
            });
            if (!plan) {
                throw new Error(`Billing plan with name ${billingData.planName} not found`);
            }

            const newHost = await this.create({ ...hostData, billingPlanId: plan.id }, tx);

            await this.addUserToHost(newHost.id, userData.userId, hostRole.id, statusData.id, tx);

            if (billingData.discount) {
                await tx.insert(hostBillingDiscount).values({
                    hostId: newHost.id,
                    discountId: billingData.discount.id,
                    statusId: statusData.id,
                    validFrom: billingData.discount.validFrom,
                    validUntil: billingData.discount.validUntil,
                });
            }

            if (logoData) {
                await tx.insert(multimedia).values({
                    ...logoData,
                    hostId: newHost.id,
                });
            }

            return newHost;
        });
    }
}
