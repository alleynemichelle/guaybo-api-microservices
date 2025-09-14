import { Injectable, NotFoundException } from '@nestjs/common';
import { NewHostAnalytics } from 'apps/libs/database/drizzle/types';
import { HostAnalyticsRepository } from 'apps/libs/database/drizzle/repositories/host-analytics.repository';
import { StatusRepository } from 'apps/libs/database/drizzle/repositories/status.repository';

import { UpdateHostAnalyticsDto } from '../dto/requests/update-host-analytics.dto';

@Injectable()
export class UpdateHostAnalyticsHandler {
    constructor(
        private readonly hostAnalyticsRepository: HostAnalyticsRepository,
        private readonly statusRepository: StatusRepository,
    ) {}

    async execute(recordId: string, updateDto: UpdateHostAnalyticsDto): Promise<void> {
        const analytics = await this.hostAnalyticsRepository.findByRecordId(recordId);
        if (!analytics) throw new NotFoundException('Analytics record not found');

        const dataToUpdate: Partial<NewHostAnalytics> = {
            trackerId: updateDto.trackerId,
            trackerName: updateDto.trackerName,
        };

        if (updateDto.status) {
            const newStatus = await this.statusRepository.findByName(updateDto.status);
            if (!newStatus) {
                throw new Error(`Status ${updateDto.status} not found`);
            }
            dataToUpdate.statusId = newStatus.id;
        }

        await this.hostAnalyticsRepository.updateById(analytics.id!, dataToUpdate);
    }
}
