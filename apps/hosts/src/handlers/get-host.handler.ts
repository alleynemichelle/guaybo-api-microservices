import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HostErrorCodes } from 'apps/libs/common/constants/error-codes.constant';
import { BunnyCdnService } from 'apps/libs/integrations/cdn/bunny-cdn.service';
import { HostsRepository } from 'apps/libs/database/drizzle/repositories/hosts.repository';
import { MultimediaSource } from 'apps/libs/common/enums/multimedia-source.enum';
import { MultimediaType } from 'apps/libs/common/enums/multimedia-type.enum';
import { DiscountStatus } from 'apps/libs/common/enums/discount-status.enum';
import { DiscountScope } from 'apps/libs/common/enums/discount-scope.enum';
import { AmountType } from 'apps/libs/common/enums/amount-type.enum';
import { HostDetailsDto } from '../dto/responses/get-host-response.dto';

@Injectable()
export class GetHostHandler {
    private cfDomain: string = this.configService.get('CLOUDFRONT_DOMAIN') as string;

    constructor(
        private readonly hostsRepository: HostsRepository,
        private readonly bunnyCdnService: BunnyCdnService,
        private readonly configService: ConfigService,
    ) {}

    async execute(hostId: string, isPublicView = false): Promise<Partial<HostDetailsDto>> {
        const host = await this.hostsRepository.findDetailsByRecordId(hostId);
        if (!host) throw new BadRequestException(HostErrorCodes.HostNotFound);

        let collectionId = host.collectionId;
        if (!collectionId) {
            const collection = await this.bunnyCdnService.createCollection({ name: `host-${host.recordId}` });
            if (!collection) throw new BadRequestException(HostErrorCodes.FailedToCreateHost);

            collectionId = collection.guid || '';
            await this.hostsRepository.updateById(host.id!, { collectionId });
        }

        const response: Partial<HostDetailsDto> = {
            recordId: host.recordId!,
            email: host.email,
            collectionId: host.collectionId,
            alias: host.alias,
            name: host.name,
            timezone: host.timezone || 'America/Caracas',
            status: host.recordStatus,
            description: host.description!,
            tags: host.tags,
            ...(host.phoneNumber && { phoneNumber: host.phoneNumber }),
            ...(host.logo && {
                logo: {
                    ...host.logo,
                    source: host.logo.source as MultimediaSource,
                    recordId: host.logo.recordId || '',
                    path: `https://${this.cfDomain}/${host.logo.path}`,
                    order: host.logo.order || 1,
                    type: host.logo.type as MultimediaType,
                },
            }),
            ...(host.billingPlan && {
                billingPlan: {
                    ...host.billingPlan,
                    discounts: (host.billingPlan.discounts || []).map((discount) => ({
                        recordId: discount.recordId || '',
                        duration: discount.duration,
                        amount: discount.amount,
                        discountStatus: discount.discountStatus as DiscountStatus,
                        scope: discount.scope as DiscountScope,
                        description: discount.description!,
                        validUntil: discount.validUntil!,
                        validFrom: discount.validFrom!,
                        type: discount.type as AmountType,
                        code: discount.code!,
                    })),
                },
            }),
            verificationStatus: host.verificationStatus,
        };

        if (isPublicView) {
            delete response.billingPlan;
            delete response.verificationStatus;
            delete response.status;
        }

        return response;
    }
}
