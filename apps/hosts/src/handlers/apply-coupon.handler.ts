import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { HostErrorCodes } from 'apps/libs/common/constants/error-codes.constant';
import { OwnerType } from 'apps/libs/common/enums/owner-type.enum';
import { Status } from 'apps/libs/common/enums/status.enum';
import { getUTCDate } from 'apps/libs/common/utils/date';
import { DiscountsRepository } from 'apps/libs/database/drizzle/repositories/discounts.repository';
import { HostsRepository } from 'apps/libs/database/drizzle/repositories/hosts.repository';
import { StatusRepository } from 'apps/libs/database/drizzle/repositories/status.repository';

import { DiscountStatus } from 'apps/libs/common/enums/discount-status.enum';
import { ApplyCouponDto } from '../dto/requests/apply-coupon.dto';
import { AppliedCouponDto } from '../dto/responses/apply-coupon-response.dto';
import { calculateValidUntil } from '../utils/duration.util';

@Injectable()
export class ApplyCouponHandler {
    constructor(
        private readonly hostsRepository: HostsRepository,
        private readonly discountsRepository: DiscountsRepository,
        private readonly statusRepository: StatusRepository,
    ) {}

    async execute(hostId: string, applyCouponDto: ApplyCouponDto): Promise<AppliedCouponDto> {
        const { code } = applyCouponDto;

        const host = await this.hostsRepository.findDetailsByRecordId(hostId);
        if (!host) throw new NotFoundException(HostErrorCodes.HostNotFound);

        const hasActiveDiscount = host.billingPlan?.discounts?.some(
            (hbd) => hbd.discountStatus === DiscountStatus.ACTIVE,
        );
        if (hasActiveDiscount) throw new BadRequestException(HostErrorCodes.ActiveCouponExists);

        const availableCoupon = await this.discountsRepository.getActiveByCode(code, OwnerType.APP);
        if (!availableCoupon) throw new BadRequestException(HostErrorCodes.InvalidCoupon);

        let validFrom: Date | undefined = availableCoupon.validFrom ? new Date(availableCoupon.validFrom) : undefined;
        let validUntil: Date | undefined = availableCoupon.validUntil
            ? new Date(availableCoupon.validUntil)
            : undefined;
        const now = getUTCDate();

        if (availableCoupon.duration?.quantity) {
            const duration = availableCoupon.duration.quantity;
            const unit = availableCoupon.duration.unit;
            validFrom = now;
            validUntil = calculateValidUntil(now, duration, unit);
        }

        const activeStatus = await this.statusRepository.findByName(Status.ACTIVE);
        if (!activeStatus) {
            throw new InternalServerErrorException('Active status for HOST_BILLING_DISCOUNT not found');
        }

        await this.hostsRepository.applyDiscount(host.id!, availableCoupon.id!, activeStatus.id, validFrom, validUntil);

        return {
            recordId: availableCoupon.recordId!,
            name: availableCoupon.name,
            description: availableCoupon.description || '',
            amount: availableCoupon.amount,
            type: availableCoupon.type,
            scope: availableCoupon.scope,
            status: Status.ACTIVE,
            code: availableCoupon.code || undefined,
            validFrom,
            validUntil,
            duration: availableCoupon.duration,
        };
    }
}
