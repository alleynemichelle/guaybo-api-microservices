import { Injectable, NotFoundException } from '@nestjs/common';
import { HostErrorCodes } from 'apps/libs/common/constants/error-codes.constant';
import { HostsRepository } from 'apps/libs/database/drizzle/repositories/hosts.repository';
import { HostAnalyticsRepository } from 'apps/libs/database/drizzle/repositories/host-analytics.repository';
import { HostAnalyticsDto } from '../dto/responses/create-host-analytics-response.dto';

@Injectable()
export class GetHostAnalyticsHandler {
    constructor(
        private readonly hostsRepository: HostsRepository,
        private readonly hostAnalyticsRepository: HostAnalyticsRepository,
    ) {}

    async execute(hostId: string): Promise<HostAnalyticsDto[]> {
        const host = await this.hostsRepository.findByRecordId(hostId);
        if (!host) throw new NotFoundException(HostErrorCodes.HostNotFound);

        const analytics = await this.hostAnalyticsRepository.findByHostId(host.id);

        return analytics.map((analytic) => ({
            recordId: analytic.recordId!,
            provider: analytic.provider,
            trackerId: analytic.trackerId,
            trackerName: analytic.trackerName || undefined,
            status: analytic.status,
            createdAt: analytic.createdAt!,
        }));
    }
}
