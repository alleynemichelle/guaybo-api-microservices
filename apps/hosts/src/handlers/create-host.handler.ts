import { v4 as uuidv4 } from 'uuid';

import { BadRequestException } from '@nestjs/common';

import { DiscountsRepository } from 'apps/libs/database/drizzle/repositories/discounts.repository';
import { OwnerType } from 'apps/libs/common/enums/owner-type.enum';
import { getUTCDate } from 'apps/libs/common/utils/date';
import { Status } from 'apps/libs/common/enums/status.enum';
import { HostErrorCodes } from 'apps/libs/common/constants/error-codes.constant';
import { UsageType } from 'apps/libs/common/enums/usage-type.enum';
import { BunnyCdnService } from 'apps/libs/integrations/cdn/bunny-cdn.service';
import { HostsRepository } from 'apps/libs/database/drizzle/repositories/hosts.repository';
import { CreateHostDto } from '../dto/requests/create-host.dto';
import { HostDetailsDto } from '../dto/responses/get-host-response.dto';
import { calculateValidUntil } from '../utils/duration.util';

type HostCoupon = {
    id: number;
    recordId: string;
    validFrom?: string;
    validUntil?: string;
};

export class CreateHostHandler {
    constructor(
        private hostsRepository: HostsRepository,
        private discountsRepository: DiscountsRepository,
        private bunnyCdnService: BunnyCdnService,
    ) {}

    async execute(userId: number, createHostDto: CreateHostDto): Promise<Partial<HostDetailsDto>> {
        try {
            const { coupon, plan, user, logo, phoneNumber, ...hostData } = createHostDto;
            let recordId: string = uuidv4();
            let processedCoupon: HostCoupon | undefined;

            if (coupon) processedCoupon = await this.processCoupon(coupon);

            // create collection in bunny.net for cdn storage
            const collection = await this.bunnyCdnService.createCollection({
                name: `host-${recordId}`,
            });

            const host = await this.hostsRepository.createHostWithDetails({
                hostData: {
                    ...hostData,
                    ...(phoneNumber && {
                        phoneNumber: phoneNumber.number,
                        phoneCode: phoneNumber.code,
                    }),
                    recordId,
                    rating: hostData.rating?.toString(),
                    collectionId: collection?.guid || '',
                },
                userData: {
                    userId,
                    roleName: user.role,
                    statusName: Status.ACTIVE,
                },
                billingData: {
                    planName: plan,
                    discount: processedCoupon
                        ? {
                              id: processedCoupon.id,
                              validFrom: processedCoupon.validFrom ? new Date(processedCoupon.validFrom) : undefined,
                              validUntil: processedCoupon.validUntil ? new Date(processedCoupon.validUntil) : undefined,
                          }
                        : undefined,
                },
                logoData: logo
                    ? {
                          description: logo.description,
                          path: logo.path,
                          type: logo.type,
                          source: logo.source,
                          usageType: UsageType.LOGO,
                      }
                    : undefined,
            });
            return {
                recordId,
                alias: host.alias,
                name: host.name,
                email: host.email,
                status: Status.ACTIVE,
                timezone: host.timezone || 'America/Caracas',
            };
        } catch (error: any) {
            console.log(error.message);
            if (error.message === HostErrorCodes.AliasAlreadyExists) {
                throw new BadRequestException(HostErrorCodes.AliasAlreadyExists);
            }
            throw error;
        }
    }

    private async processCoupon(couponCode: string): Promise<{
        id: number;
        recordId: string;
        validFrom?: string;
        validUntil?: string;
    }> {
        const availableCoupon = await this.discountsRepository.getActiveByCode(couponCode, OwnerType.APP);
        if (!availableCoupon) throw new BadRequestException(HostErrorCodes.InvalidCoupon);

        if (availableCoupon.duration) {
            const now = getUTCDate();
            const duration = availableCoupon.duration.quantity;
            const unit = availableCoupon.duration.unit;

            const validUntil = calculateValidUntil(now, duration, unit);

            availableCoupon.validFrom = now.toISOString();
            availableCoupon.validUntil = validUntil.toISOString();
        }

        return {
            recordId: availableCoupon.recordId!,
            id: availableCoupon.id!,
            validFrom: availableCoupon.validFrom ? availableCoupon.validFrom : undefined,
            validUntil: availableCoupon.validUntil ? availableCoupon.validUntil : undefined,
        };
    }
}
