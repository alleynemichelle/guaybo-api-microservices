import { ReferredUser } from '../types';
import { Referred } from 'apps/libs/domain/referrals/referred.entity';

export class ReferredMapper {
    static toDomain(row: ReferredUser): Referred {
        return new Referred({
            id: row.id!,
            recordId: row.recordId!,
            email: row.email!,
            isHost: row.isHost ?? false,
            utmSource: row.utmSource!,
            createdAt: row.createdAt.toISOString(),
            referralCode: row.referralCode!,
        });
    }
}
