import { SQL, and, eq, inArray } from 'drizzle-orm';
import { Injectable } from '@nestjs/common';
import { Status } from 'apps/libs/common/enums/status.enum';
import { Timer } from 'apps/libs/common/api/decorators/timer.decorator';
import { discount, status } from '../schemas';
import { Discount as DiscountType, NewDiscount, DiscountWithStatus } from '../types';
import { DatabaseService } from '../services/database.service';
import { DiscountMapper } from '../mappers/discount.mapper';
import { Discount } from 'apps/libs/domain/bookings/discount.entity';

@Injectable()
export class DiscountsRepository {
    constructor(private readonly databaseService: DatabaseService) {}

    @Timer('[DISCOUNTS] create')
    public async create(data: NewDiscount): Promise<Discount> {
        const db = this.databaseService.getDatabase();
        const [result] = await db.insert(discount).values(data).returning();
        return DiscountMapper.toDomain(result as DiscountWithStatus);
    }

    @Timer('[DISCOUNTS] getAll')
    public async getAll(filters: { status?: string; ownerType?: string } = {}): Promise<Discount[]> {
        const db = this.databaseService.getDatabase();
        const conditions: (SQL | undefined)[] = [];

        if (filters.status) {
            const statusRecord = await db.query.status.findFirst({
                where: eq(status.name, filters.status),
                columns: { id: true },
            });
            if (!statusRecord) return [];
            conditions.push(eq(discount.statusId, statusRecord.id));
        }

        if (filters.ownerType) {
            conditions.push(eq(discount.ownerType, filters.ownerType));
        }

        const rows = await db.query.discount.findMany({
            where: conditions.length > 0 ? and(...conditions) : undefined,
            with: {
                status: true,
            },
        });
        return rows.map((row) => DiscountMapper.toDomain(row as DiscountWithStatus));
    }

    @Timer('[DISCOUNTS] getByRecordId')
    public async getByRecordId(recordId: string): Promise<Discount | null> {
        const db = this.databaseService.getDatabase();
        const result = await db.query.discount.findFirst({
            where: eq(discount.recordId, recordId),
            with: {
                status: true,
            },
        });
        return result ? DiscountMapper.toDomain(result as DiscountWithStatus) : null;
    }

    @Timer('[DISCOUNTS] getByCode')
    public async getByCode(code: string, ownerType: string): Promise<Discount | null> {
        const db = this.databaseService.getDatabase();
        const result = await db.query.discount.findFirst({
            where: and(eq(discount.code, code), eq(discount.ownerType, ownerType)),
            with: {
                status: true,
            },
        });
        return result ? DiscountMapper.toDomain(result as DiscountWithStatus) : null;
    }

    @Timer('[DISCOUNTS] getActiveByCode')
    public async getActiveByCode(code: string, ownerType: string): Promise<Discount | null> {
        const db = this.databaseService.getDatabase();

        const activeStatusQuery = db.select({ id: status.id }).from(status).where(eq(status.name, Status.ACTIVE));
        const result = await db.query.discount.findFirst({
            where: and(
                eq(discount.code, code),
                eq(discount.ownerType, ownerType),
                inArray(discount.statusId, activeStatusQuery),
            ),
            with: {
                status: true,
            },
        });

        return result ? DiscountMapper.toDomain(result as DiscountWithStatus) : null;
    }

    @Timer('[DISCOUNTS] updateByRecordId')
    public async updateByRecordId(recordId: string, data: Partial<NewDiscount>): Promise<DiscountType | null> {
        const db = this.databaseService.getDatabase();
        const [result] = await db.update(discount).set(data).where(eq(discount.recordId, recordId)).returning();
        return (result as DiscountType) || null;
    }

    @Timer('[DISCOUNTS] deleteByRecordId')
    public async deleteByRecordId(recordId: string): Promise<void> {
        const db = this.databaseService.getDatabase();
        await db.delete(discount).where(eq(discount.recordId, recordId));
    }
}
