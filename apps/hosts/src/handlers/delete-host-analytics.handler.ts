import { Injectable, NotFoundException } from '@nestjs/common';
import { HostAnalyticsRepository } from 'apps/libs/database/drizzle/repositories/host-analytics.repository';

@Injectable()
export class DeleteHostAnalyticsHandler {
    constructor(private readonly hostAnalyticsRepository: HostAnalyticsRepository) {}

    async execute(recordId: string): Promise<void> {
        const analytics = await this.hostAnalyticsRepository.findByRecordId(recordId);
        if (!analytics) throw new NotFoundException('Analytics record not found');

        await this.hostAnalyticsRepository.deleteById(analytics.id!);
    }
}
