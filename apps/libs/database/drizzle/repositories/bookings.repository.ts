import { DatabaseService } from '../services/database.service';

export class BookingsRepository {
    constructor(private readonly databaseService: DatabaseService) {}
}
import { and, eq, inArray } from 'drizzle-orm';
import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../services/database.service';
import { Status } from 'apps/libs/common/enums/status.enum';
import { Timer } from 'apps/libs/common/api/decorators/timer.decorator';
import { billingPlan, booking, status } from '../schemas';
import { BillingPlan, NewBillingPlan } from '../types';

@Injectable()
export class BillingPlansRepository {
    constructor(private readonly databaseService: DatabaseService) {}

    @Timer('[BILLING PLANS] getByRecordId')
    public async getByProductId(productId: string): Promise<> {
        const db = this.databaseService.getDatabase();
        const result = await db.query.billingPlan.findFirst({
            where: eq(booking.productId, productId),
        });
        return result || null;
    }
}
