// libs/database/postgres/lookups/payment-method.lookup.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PaymentMethod } from 'apps/libs/common/enums/payment-method.enum';
import { PaymentMethodsRepository } from '../repositories/payment-methods.repository';

@Injectable()
export class PaymentMethodLookup {
    private keyToId = new Map<PaymentMethod, number>();
    private idToKey = new Map<number, PaymentMethod>();

    constructor(private readonly repo: PaymentMethodsRepository) {}

    async setData() {
        const rows = await this.repo.findAll();
        for (const row of rows) {
            const enumKey = row.key as PaymentMethod;
            this.keyToId.set(enumKey, row.id);
            this.idToKey.set(row.id, enumKey);
        }
    }

    async toId(method: PaymentMethod): Promise<number> {
        let id = this.keyToId.get(method);
        if (!id) {
            await this.setData();
            id = this.keyToId.get(method);
            if (!id) throw new Error(`No id found for PaymentMethod ${method}`);
        }
        return id;
    }

    async toEnum(id: number): Promise<PaymentMethod> {
        let key = this.idToKey.get(id);
        if (!key) {
            await this.setData();
            key = this.idToKey.get(id);
            if (!key) throw new Error(`No PaymentMethod found for id ${id}`);
        }
        return key;
    }
}
