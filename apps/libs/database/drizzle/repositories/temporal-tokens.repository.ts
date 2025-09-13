import { eq } from 'drizzle-orm';

import { Injectable } from '@nestjs/common';
import { Timer } from 'apps/libs/common/api/decorators/timer.decorator';
import { NewTemporalToken, TemporalToken, TemporalTokenWithUser } from '../types';
import { appUser, temporalToken } from '../schemas';
import { DatabaseService } from '../services/database.service';

@Injectable()
export class TemporalTokensRepository {
    constructor(private readonly databaseService: DatabaseService) {}

    @Timer('[TEMPORAL_TOKENS] create')
    public async create(data: NewTemporalToken): Promise<TemporalToken> {
        const db = this.databaseService.getDatabase();
        const [result] = await db.insert(temporalToken).values(data).returning();
        return result;
    }

    @Timer('[TEMPORAL_TOKENS] findByRecordId')
    public async findByRecordId(recordId: string): Promise<TemporalTokenWithUser | null> {
        const db = this.databaseService.getDatabase();
        const [result] = await db
            .select({
                temporalToken,
                user: {
                    id: appUser.id,
                    recordId: appUser.recordId,
                    email: appUser.email,
                },
            })
            .from(temporalToken)
            .leftJoin(appUser, eq(temporalToken.userId, appUser.id))
            .where(eq(temporalToken.recordId, recordId));

        if (!result) {
            return null;
        }

        return { ...result.temporalToken, user: result.user } as TemporalTokenWithUser;
    }

    @Timer('[TEMPORAL_TOKENS] update')
    public async update(id: number, data: Partial<NewTemporalToken>): Promise<TemporalToken | null> {
        const db = this.databaseService.getDatabase();
        const [result] = await db.update(temporalToken).set(data).where(eq(temporalToken.id, id)).returning();
        return result || null;
    }
}
