import { Injectable, NotFoundException } from '@nestjs/common';

import { ReferralsRepository } from 'apps/libs/database/drizzle/repositories/referrals.repository';
import { UsersRepository } from 'apps/libs/database/drizzle/repositories/users.repository';
import { UsersErrorCodes } from 'apps/libs/common/constants/error-codes.constant';
import { ReferralCode } from 'apps/libs/domain/referrals/referral-code.entity';
import { ReferrerCodeDataDto } from '../dto/responses/get-referrer-codes-response.dto';

@Injectable()
export class GetReferrerCodesHandler {
    constructor(
        private readonly referralsRepository: ReferralsRepository,
        private readonly usersRepository: UsersRepository,
    ) {}

    async execute(referrerRecordId: string): Promise<ReferrerCodeDataDto[]> {
        const user = await this.usersRepository.findByRecordId(referrerRecordId);
        if (!user) throw new NotFoundException(UsersErrorCodes.UserNotFoundException);

        const codes = await this.referralsRepository.findReferralCodesByReferrerId(user.id!);

        return this.mapToResponse(codes, referrerRecordId);
    }

    private mapToResponse(codes: ReferralCode[], referrerId: string): ReferrerCodeDataDto[] {
        return codes.map((code) => ({
            durationDays: code.durationDays ?? null,
            code: code.code,
            recordStatus: code.recordStatus || null,
            createdAt: code.createdAt,
            windowDays: code.windowDays ?? null,
            recordId: code.recordId!,
            referrerId: referrerId,
        }));
    }
}
