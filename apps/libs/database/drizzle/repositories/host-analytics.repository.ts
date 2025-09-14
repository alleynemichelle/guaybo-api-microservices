import { and, eq } from 'drizzle-orm';
import { Injectable } from '@nestjs/common';

import { Timer } from 'apps/libs/common/api/decorators/timer.decorator';
import { hostAnalytics } from '../schemas';
import { DatabaseService, TransactionalExecutor } from '../services/database.service';
import { NewHostAnalytics, HostAnalyticsWithStatus } from '../types';
import { HostAnalyticsMapper } from '../mappers/host-analytics.mapper';
import { Analytics } from 'apps/libs/domain/hosts/analytics.entity';

@Injectable()
export class HostAnalyticsRepository {
    constructor(private readonly databaseService: DatabaseService) {}

    private getExecutor(tx?: TransactionalExecutor): TransactionalExecutor {
        return tx || this.databaseService.getDatabase();
    }

    @Timer('[HOST_ANALYTICS] create')
    public async create(data: NewHostAnalytics, tx?: TransactionalExecutor): Promise<Analytics> {
        const executor = this.getExecutor(tx);
        const [result] = await executor.insert(hostAnalytics).values(data).returning();
        return HostAnalyticsMapper.toDomain(result as HostAnalyticsWithStatus);
    }

    @Timer('[HOST_ANALYTICS] findByHostId')
    public async findByHostId(hostId: number, tx?: TransactionalExecutor): Promise<Analytics[]> {
        const executor = this.getExecutor(tx);
        const results = await executor.query.hostAnalytics.findMany({
            where: eq(hostAnalytics.hostId, hostId),
            with: {
                status: true,
            },
        });
        return results.map((result) => HostAnalyticsMapper.toDomain(result as HostAnalyticsWithStatus));
    }

    @Timer('[HOST_ANALYTICS] findByRecordId')
    public async findByRecordId(recordId: string, tx?: TransactionalExecutor): Promise<Analytics | null> {
        const executor = this.getExecutor(tx);
        const result = await executor.query.hostAnalytics.findFirst({
            where: eq(hostAnalytics.recordId, recordId),
        });
        return result ? HostAnalyticsMapper.toDomain(result as HostAnalyticsWithStatus) : null;
    }

    @Timer('[HOST_ANALYTICS] updateById')
    public async updateById(
        id: number,
        data: Partial<NewHostAnalytics>,
        tx?: TransactionalExecutor,
    ): Promise<Analytics | null> {
        const executor = this.getExecutor(tx);
        const [result] = await executor.update(hostAnalytics).set(data).where(eq(hostAnalytics.id, id)).returning();
        return result ? HostAnalyticsMapper.toDomain(result as HostAnalyticsWithStatus) : null;
    }

    @Timer('[HOST_ANALYTICS] deleteById')
    public async deleteById(id: number, tx?: TransactionalExecutor): Promise<void> {
        const executor = this.getExecutor(tx);
        await executor.delete(hostAnalytics).where(eq(hostAnalytics.id, id));
    }
}
