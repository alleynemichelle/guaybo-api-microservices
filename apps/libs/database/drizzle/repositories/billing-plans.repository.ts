import { and, eq, inArray } from 'drizzle-orm';
import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../services/database.service';
import { Status } from 'apps/libs/common/enums/status.enum';
import { Timer } from 'apps/libs/common/api/decorators/timer.decorator';
import { billingPlan, status } from '../schemas';
import { BillingPlan, NewBillingPlan } from '../types';

@Injectable()
export class BillingPlansRepository {
    constructor(private readonly databaseService: DatabaseService) {}

    @Timer('[BILLING PLANS] create')
    public async create(data: NewBillingPlan): Promise<BillingPlan> {
        const db = this.databaseService.getDatabase();
        const [result] = await db.insert(billingPlan).values(data).returning();
        return result;
    }

    @Timer('[BILLING PLANS] getAll')
    public async getAll(): Promise<BillingPlan[]> {
        const db = this.databaseService.getDatabase();
        const activeStatusQuery = db.select({ id: status.id }).from(status).where(eq(status.name, Status.ACTIVE));
        return db.query.billingPlan.findMany({
            where: inArray(billingPlan.statusId, activeStatusQuery),
        });
    }

    @Timer('[BILLING PLANS] getByRecordId')
    public async getByRecordId(recordId: string): Promise<BillingPlan | null> {
        const db = this.databaseService.getDatabase();
        const result = await db.query.billingPlan.findFirst({
            where: eq(billingPlan.recordId, recordId),
        });
        return result || null;
    }

    @Timer('[BILLING PLANS] getActiveByKey')
    public async getActiveByKey(key: string): Promise<BillingPlan | null> {
        const db = this.databaseService.getDatabase();
        const activeStatusQuery = db.select({ id: status.id }).from(status).where(eq(status.name, Status.ACTIVE));
        const result = await db.query.billingPlan.findFirst({
            where: and(eq(billingPlan.key, key), inArray(billingPlan.statusId, activeStatusQuery)),
        });
        return result || null;
    }

    @Timer('[BILLING PLANS] updateByRecordId')
    public async updateByRecordId(recordId: string, data: Partial<NewBillingPlan>): Promise<BillingPlan | null> {
        const db = this.databaseService.getDatabase();
        const [result] = await db.update(billingPlan).set(data).where(eq(billingPlan.recordId, recordId)).returning();
        return result || null;
    }

    @Timer('[BILLING PLANS] deleteByRecordId')
    public async deleteByRecordId(recordId: string): Promise<void> {
        const db = this.databaseService.getDatabase();
        await db.delete(billingPlan).where(eq(billingPlan.recordId, recordId));
    }
}
