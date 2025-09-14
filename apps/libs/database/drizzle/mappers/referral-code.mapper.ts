import { ReferralCode } from 'apps/libs/domain/referrals/referral-code.entity';
import { Status } from 'apps/libs/common/enums/status.enum';
import { DatabaseKeys } from 'apps/libs/common/enums/database-keys.enum';
import { ReferralCodeWithStatus, NewReferralCode } from '../types';

export class ReferralCodeMapper {
    static toDomain(row: ReferralCodeWithStatus): ReferralCode {
        return new ReferralCode({
            id: row.id,
            recordId: row.recordId,
            referrer: {
                recordId: row.referrer.recordId,
                id: row.referrer.id,
            },
            code: row.code,
            referralRate: parseFloat(row.referralRate),
            durationDays: row.durationDays ?? undefined,
            capMinor: row.capMinor ?? undefined,
            windowDays: row.windowDays ?? undefined,
            recordStatus: (row.status?.name as Status) ?? Status.ACTIVE,
            recordType: DatabaseKeys.REFERRAL_CODE,
            createdAt: row.createdAt?.toISOString(),
            updatedAt: row.updatedAt?.toISOString(),
        });
    }

    static toPersistence(entity: ReferralCode, referrerId: number, statusId: number): NewReferralCode {
        return {
            recordId: entity.recordId,
            referrerId: referrerId,
            code: entity.code,
            referralRate: entity.referralRate.toString(),
            durationDays: entity.durationDays,
            capMinor: entity.capMinor,
            windowDays: entity.windowDays,
            statusId: statusId,
        };
    }
}
