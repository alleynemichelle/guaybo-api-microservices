import { Injectable, NotFoundException } from '@nestjs/common';
import { HostErrorCodes } from 'apps/libs/common/constants/error-codes.constant';
import { Status } from 'apps/libs/common/enums/status.enum';
import { HostAnalyticsRepository } from 'apps/libs/database/drizzle/repositories/host-analytics.repository';
import { HostsRepository } from 'apps/libs/database/drizzle/repositories/hosts.repository';
import { StatusRepository } from 'apps/libs/database/drizzle/repositories/status.repository';
import { CreateHostAnalyticsDto } from '../dto/requests/create-host-analytics.dto';
import { HostAnalyticsDto } from '../dto/responses/create-host-analytics-response.dto';

@Injectable()
export class CreateHostAnalyticsHandler {
    constructor(
        private readonly hostsRepository: HostsRepository,
        private readonly hostAnalyticsRepository: HostAnalyticsRepository,
        private readonly statusRepository: StatusRepository,
    ) {}

    async execute(hostId: string, createDto: CreateHostAnalyticsDto): Promise<HostAnalyticsDto> {
        const host = await this.hostsRepository.findByRecordId(hostId);
        if (!host) throw new NotFoundException(HostErrorCodes.HostNotFound);

        const activeStatus = await this.statusRepository.findByName(Status.ACTIVE);
        if (!activeStatus) throw new Error('Active status not found');

        const newAnalyticsData = await this.hostAnalyticsRepository.create({
            ...createDto,
            hostId: host.id,
            statusId: activeStatus.id,
        });

        return {
            recordId: newAnalyticsData.recordId!,
            provider: newAnalyticsData.provider,
            trackerId: newAnalyticsData.trackerId,
            trackerName: newAnalyticsData.trackerName || undefined,
            status: activeStatus.name,
            createdAt: newAnalyticsData.createdAt!,
        };
    }
}
