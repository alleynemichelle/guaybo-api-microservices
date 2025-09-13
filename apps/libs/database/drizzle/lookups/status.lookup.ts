import { Injectable } from '@nestjs/common';
import { Status } from 'apps/libs/common/enums/status.enum';
import { StatusRepository } from '../repositories/status.repository';

@Injectable()
export class StatusLookup {
    private keyToId = new Map<Status, number>();
    private idToKey = new Map<number, Status>();

    constructor(private readonly repo: StatusRepository) {}

    async setData() {
        const rows = await this.repo.findAll();
        for (const row of rows) {
            const enumKey = row.name as Status;
            this.keyToId.set(enumKey, row.id);
            this.idToKey.set(row.id, enumKey);
        }
    }

    async toId(method: Status): Promise<number> {
        let id = this.keyToId.get(method);
        if (!id) {
            await this.setData();
            id = this.keyToId.get(method);
            if (!id) throw new Error(`No id found for PaymentMethod ${method}`);
        }
        return id;
    }

    async toEnum(id: number): Promise<Status> {
        let key = this.idToKey.get(id);
        if (!key) {
            await this.setData();
            key = this.idToKey.get(id);
            if (!key) throw new Error(`No PaymentMethod found for id ${id}`);
        }
        return key;
    }
}
