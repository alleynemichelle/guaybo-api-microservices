import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersErrorCodes } from 'apps/libs/common/constants/error-codes.constant';
import { ReferralsRepository } from 'apps/libs/database/drizzle/repositories/referrals.repository';
import { UsersRepository } from 'apps/libs/database/drizzle/repositories/users.repository';
import {
    GetReferralsResponseDataDto,
    ReferralsMetricsDto,
    ReferralsUserDto,
} from '../dto/responses/get-referrals.response.dto';
import { Referred } from 'apps/libs/domain/referrals/referred.entity';

@Injectable()
export class GetReferralsHandler {
    constructor(
        private readonly referralsRepository: ReferralsRepository,
        private readonly usersRepository: UsersRepository,
    ) {}

    async execute(referrerId: string): Promise<GetReferralsResponseDataDto> {
        const user = await this.usersRepository.findWithHostsByRecordId(referrerId);
        if (!user) throw new NotFoundException(UsersErrorCodes.UserNotFoundException);

        const referrals = await this.referralsRepository.findReferredUsersByReferrerId(user.id!);

        const metrics = this.calculateMetrics(referrals);
        const users = this.mapUsers(referrals);

        return {
            metrics,
            users,
        };
    }

    private calculateMetrics(referrals: Referred[]): ReferralsMetricsDto {
        const sources = referrals.reduce(
            (acc, referral) => {
                if (referral.utmSource) {
                    acc[referral.utmSource] = (acc[referral.utmSource] || 0) + 1;
                }
                return acc;
            },
            {} as Record<string, number>,
        );

        return {
            totalUsers: referrals.length,
            usersWithHost: referrals.filter((r) => r.isHost).length,
            sources,
        };
    }

    private mapUsers(referrals: Referred[]): ReferralsUserDto[] {
        return referrals.map((r) => ({
            recordId: r.recordId!,
            email: this.maskEmail(r.email),
            createdAt: r.createdAt,
            referralCode: r.referralCode,
            utmSource: r.utmSource,
        }));
    }

    private maskEmail(email: string | null): string {
        if (!email) {
            return '';
        }

        const [user, domain] = email.split('@');

        if (!domain) {
            return email;
        }

        const maskedUser = `${user.substring(0, 4)}****`;

        return `${maskedUser}@${domain}`;
    }
}
