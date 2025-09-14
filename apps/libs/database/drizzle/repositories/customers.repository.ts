import { and, eq } from 'drizzle-orm';
import { Injectable } from '@nestjs/common';
import { Timer } from 'apps/libs/common/api/decorators/timer.decorator';

import { DatabaseService } from '../services/database.service';
import { CustomerWithDetails, NewCustomer, Customer as CustomerType } from '../types';
import { appUser, customer, host } from '../schemas';
import { CustomerMapper } from '../mappers/customer.mapper';
import { Customer } from 'apps/libs/domain/users/customer.entity';

@Injectable()
export class CustomersRepository {
    constructor(private readonly databaseService: DatabaseService) {}

    @Timer('[CUSTOMERS] findDetailsByUserAndHostRecordIds')
    public async findDetailsByUserAndHostRecordIds(
        hostRecordId: string,
        userRecordId: string,
    ): Promise<Customer | null> {
        const result = await this.databaseService.getDatabase().query.customer.findFirst({
            where: and(eq(host.recordId, hostRecordId), eq(appUser.recordId, userRecordId)),
            with: {
                user: true,
                host: true,
            },
        });

        return result ? CustomerMapper.toDomain(result as CustomerWithDetails) : null;
    }

    @Timer('[CUSTOMERS] updateById')
    public async updateById(id: number, data: Partial<NewCustomer>): Promise<CustomerType | null> {
        const [result] = await this.databaseService
            .getDatabase()
            .update(customer)
            .set(data)
            .where(eq(customer.id, id))
            .returning();
        return result || null;
    }
}
