import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { HostErrorCodes } from 'apps/libs/common/constants/error-codes.constant';
import { HostsRepository } from 'apps/libs/database/drizzle/repositories/hosts.repository';
import { NewHost } from 'apps/libs/database/drizzle/types';
import { UpdateHostDto } from '../dto/requests/update-host.dto';

@Injectable()
export class UpdateHostHandler {
    constructor(private readonly hostsRepository: HostsRepository) {}

    async execute(hostId: string, updateHostDto: UpdateHostDto): Promise<void> {
        const { tags, logo, deleteLogo, commissionPayer, phoneNumber, ...dataToUpdate } = updateHostDto;

        const host = await this.hostsRepository.findDetailsByRecordId(hostId);
        if (!host) throw new NotFoundException(HostErrorCodes.HostNotFound);

        if (dataToUpdate.alias && dataToUpdate.alias !== host.alias) {
            const existingHost = await this.hostsRepository.findByAlias(dataToUpdate.alias);
            if (existingHost) throw new BadRequestException(HostErrorCodes.AliasAlreadyExists);
        }

        const hostDataToUpdate: Partial<NewHost> = {
            ...dataToUpdate,
            ...(commissionPayer && { commissionPayer }),
            ...(phoneNumber && {
                phoneNumber: phoneNumber.number,
                phoneCode: phoneNumber.code,
            }),
            ...(tags && {
                tags: tags.map((tag) => ({
                    icon: tag.icon,
                    value: tag.value,
                    key: tag.color ? `${tag.value}_${tag.color}` : tag.value,
                    color: tag.color,
                })),
            }),
            rating: dataToUpdate.rating?.toString(),
        };

        await this.hostsRepository.updateHostWithDetails(host.id!, {
            hostDataToUpdate,
            logo: logo
                ? {
                      ...logo,
                      path: `public/hosts/${hostId}/${logo.filename}`,
                  }
                : undefined,
            deleteLogo,
        });
    }
}
