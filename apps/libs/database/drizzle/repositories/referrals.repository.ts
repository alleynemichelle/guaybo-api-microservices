import { and, eq } from 'drizzle-orm';
import { Injectable } from '@nestjs/common';
import { Timer } from 'apps/libs/common/api/decorators/timer.decorator';
import { Status } from 'apps/libs/common/enums/status.enum';
import { DatabaseService } from '../services/database.service';
import { appUser, referralAssociation, referralCode, status } from '../schemas';
import { ReferralCodeWithStatus, ReferredUser } from '../types';
import { ReferralAssociation } from '../types';

@Injectable()
export class ReferralsRepository {
    constructor(private readonly databaseService: DatabaseService) {}

    @Timer('[REFERRALS] findReferralCodeByCode')
    public async findReferralCodeByCode(code: string): Promise<ReferralCodeWithStatus | null> {
        const db = this.databaseService.getDatabase();
        const [result] = await db
            .select()
            .from(referralCode)
            .leftJoin(status, eq(referralCode.statusId, status.id))
            .where(and(eq(referralCode.code, code), eq(status.name, Status.ACTIVE)));

        if (!result) {
            return null;
        }

        return { ...result.referral_code, status: result.status } as ReferralCodeWithStatus;
    }

    @Timer('[REFERRALS] assignReferralToUser')
    public async assignReferralToUser(data: {
        referredId: number;
        codeId: number;
        referrerId: number;
        utmSource?: string;
    }): Promise<ReferralAssociation> {
        const { referredId, codeId, referrerId, utmSource } = data;
        const db = this.databaseService.getDatabase();

        const [result] = await db
            .insert(referralAssociation)
            .values({
                referredId,
                referrerId,
                referralCodeId: codeId,
                utmSource,
            })
            .returning();

        return result as ReferralAssociation;
    }

    @Timer('[REFERRALS] findReferredUsersByReferrerId')
    public async findReferredUsersByReferrerId(referrerId: number): Promise<ReferredUser[]> {
        const db = this.databaseService.getDatabase();
        const results = await db
            .select({
                id: appUser.id,
                recordId: appUser.recordId,
                email: appUser.email,
                isHost: appUser.isHost,
                utmSource: referralAssociation.utmSource,
                createdAt: referralAssociation.createdAt,
                referralCode: referralCode.code,
            })
            .from(referralAssociation)
            .leftJoin(appUser, eq(referralAssociation.referredId, appUser.id))
            .leftJoin(referralCode, eq(referralAssociation.referralCodeId, referralCode.id))
            .where(eq(referralAssociation.referrerId, referrerId));

        return results as ReferredUser[];
    }

    @Timer('[REFERRALS] findReferralCodesByReferrerId')
    public async findReferralCodesByReferrerId(referrerId: number): Promise<ReferralCodeWithStatus[]> {
        const db = this.databaseService.getDatabase();
        const results = await db
            .select()
            .from(referralCode)
            .leftJoin(status, eq(referralCode.statusId, status.id))
            .where(and(eq(referralCode.referrerId, referrerId), eq(status.name, Status.ACTIVE)));

        return results.map((r) => ({ ...r.referral_code, status: r.status })) as ReferralCodeWithStatus[];
    }
}
