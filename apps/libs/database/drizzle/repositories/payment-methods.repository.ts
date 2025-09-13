import { inArray } from 'drizzle-orm';
import { Injectable } from '@nestjs/common';
import { paymentMethod } from '../schemas';
import { DatabaseService } from '../services/database.service';
import { Timer } from 'apps/libs/common/api/decorators/timer.decorator';

@Injectable()
export class PaymentMethodsRepository {
    constructor(private readonly databaseService: DatabaseService) {}

    @Timer('[PAYMENT_METHODS] findAll')
    public async findAll(): Promise<{ id: number; key: string }[]> {
        return this.databaseService.getDatabase().select().from(paymentMethod);
    }

    @Timer('[PAYMENT_METHODS] findByKeys')
    public async findByKeys(keys: string[]): Promise<{ id: number; key: string }[]> {
        if (keys.length === 0) {
            return [];
        }

        return this.databaseService
            .getDatabase()
            .select({
                id: paymentMethod.id,
                key: paymentMethod.key,
            })
            .from(paymentMethod)
            .where(inArray(paymentMethod.key, keys));
    }
}
