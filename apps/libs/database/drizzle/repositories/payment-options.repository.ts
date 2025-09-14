import { eq } from 'drizzle-orm';
import { Injectable } from '@nestjs/common';

import { Timer } from 'apps/libs/common/api/decorators/timer.decorator';
import { PaymentOption } from 'apps/libs/domain/bookings/payment-option.entity';
import { OwnerType } from 'apps/libs/common/enums/owner-type.enum';
import { DatabaseService, TransactionalExecutor } from '../services/database.service';
import { PaymentOptionWithMethod, NewPaymentOption } from '../types';
import { paymentOption } from '../schemas';
import { PaymentOptionMapper } from '../mappers/payment-option.mapper';

@Injectable()
export class PaymentOptionsRepository {
    constructor(private readonly databaseService: DatabaseService) {}

    private getExecutor(tx?: TransactionalExecutor): TransactionalExecutor {
        return tx || this.databaseService.getDatabase();
    }

    @Timer('[PAYMENT_OPTIONS] findByUserId')
    public async findByUserId(userId: number): Promise<PaymentOption[]> {
        const executor = this.getExecutor();
        const rows = await executor.query.paymentOption.findMany({
            where: eq(paymentOption.userId, userId),
            with: {
                paymentMethod: true,
                status: true,
            },
        });

        return rows.map((row) => PaymentOptionMapper.toDomain(row as PaymentOptionWithMethod));
    }

    @Timer('[PAYMENT_OPTIONS] findByRecordId')
    public async findByRecordId(recordId: string): Promise<PaymentOption | null> {
        const executor = this.getExecutor();

        const row = (await executor.query.paymentOption.findFirst({
            where: eq(paymentOption.recordId, recordId),
            with: {
                paymentMethod: {
                    with: {
                        currency: true,
                    },
                },
                status: true,
            },
        })) as PaymentOptionWithMethod | null;

        return row ? PaymentOptionMapper.toDomain(row as PaymentOptionWithMethod) : null;
    }

    @Timer('[PAYMENT_OPTIONS] replaceForUser')
    public async replaceForUser(userId: number, options: NewPaymentOption[]): Promise<any[]> {
        const executor = this.getExecutor();
        return executor.transaction(async (tx) => {
            await tx.delete(paymentOption).where(eq(paymentOption.userId, userId));
            if (options.length === 0) {
                return [];
            }
            return tx.insert(paymentOption).values(options).returning();
        });
    }

    @Timer('[PAYMENT_OPTIONS] deleteByRecordId')
    public async deleteByRecordId(recordId: string): Promise<void> {
        const executor = this.getExecutor();
        await executor.delete(paymentOption).where(eq(paymentOption.recordId, recordId));
    }

    @Timer('[PAYMENT_OPTIONS] getAll')
    public async getAll(filters?: { ownerType?: OwnerType }): Promise<PaymentOption[]> {
        const executor = this.getExecutor();

        const whereCondition = filters?.ownerType ? eq(paymentOption.ownerType, filters.ownerType) : undefined;
        const rows = (await executor.query.paymentOption.findMany({
            where: whereCondition,
            with: {
                paymentMethod: {
                    with: {
                        currency: true,
                    },
                },
                status: true,
            },
        })) as PaymentOptionWithMethod[];

        return rows.map((row) => PaymentOptionMapper.toDomain(row as PaymentOptionWithMethod));
    }

    @Timer('[PAYMENT_OPTIONS] getByRecordId')
    public async getByRecordId(recordId: string): Promise<PaymentOptionWithMethod | null> {
        const executor = this.getExecutor();
        return (await executor.query.paymentOption.findFirst({
            where: eq(paymentOption.recordId, recordId),
            with: {
                paymentMethod: {
                    with: {
                        currency: true,
                    },
                },
                status: true,
            },
        })) as PaymentOptionWithMethod | null;
    }

    @Timer('[PAYMENT_OPTIONS] create')
    public async create(data: NewPaymentOption): Promise<PaymentOptionWithMethod> {
        const executor = this.getExecutor();
        const [result] = await executor.insert(paymentOption).values(data).returning();
        return result as PaymentOptionWithMethod;
    }

    @Timer('[PAYMENT_OPTIONS] updateByRecordId')
    public async updateByRecordId(
        recordId: string,
        data: Partial<NewPaymentOption>,
    ): Promise<PaymentOptionWithMethod | null> {
        const executor = this.getExecutor();
        const [result] = await executor
            .update(paymentOption)
            .set(data)
            .where(eq(paymentOption.recordId, recordId))
            .returning();
        return result as PaymentOptionWithMethod | null;
    }
}
