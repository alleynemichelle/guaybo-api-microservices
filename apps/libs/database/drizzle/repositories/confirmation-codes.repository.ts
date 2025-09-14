import { and, eq, not } from 'drizzle-orm';
import { Injectable } from '@nestjs/common';

import { ConfirmationCodeStatus } from 'apps/libs/common/enums/confirmation-code-status.enum';
import { Timer } from 'apps/libs/common/api/decorators/timer.decorator';

import { ConfirmationCode } from 'apps/libs/domain/users/confirmation-code.entity';
import { confirmationCode, status } from '../schemas';
import { DatabaseService } from '../services/database.service';
import { ConfirmationCodeWithStatus, NewConfirmationCode } from '../types';
import { ConfirmationCodeMapper } from '../mappers/confirmation-code.mapper';

@Injectable()
export class ConfirmationCodesRepository {
    constructor(private readonly databaseService: DatabaseService) {}

    @Timer('[CONFIRMATION_CODES] create')
    public async create(data: NewConfirmationCode): Promise<ConfirmationCode> {
        const db = this.databaseService.getDatabase();
        const [result] = await db.insert(confirmationCode).values(data).returning();
        return ConfirmationCodeMapper.toDomain(result as ConfirmationCodeWithStatus);
    }

    @Timer('[CONFIRMATION_CODES] find')
    public async find(userId: number, code: string, codeType: string): Promise<ConfirmationCode | null> {
        const db = this.databaseService.getDatabase();

        const [result] = await db
            .select()
            .from(confirmationCode)
            .leftJoin(status, eq(confirmationCode.statusId, status.id))
            .where(
                and(
                    eq(confirmationCode.userId, userId),
                    eq(confirmationCode.code, code),
                    eq(confirmationCode.codeType, codeType),
                    not(eq(status.name, ConfirmationCodeStatus.USED)),
                ),
            );

        return result
            ? ConfirmationCodeMapper.toDomain({
                  ...result.confirmation_code,
                  status: result.status,
              } as ConfirmationCodeWithStatus)
            : null;
    }

    @Timer('[CONFIRMATION_CODES] update')
    public async update(id: number, data: Partial<NewConfirmationCode>): Promise<ConfirmationCode | null> {
        const db = this.databaseService.getDatabase();
        const [result] = await db.update(confirmationCode).set(data).where(eq(confirmationCode.id, id)).returning();
        return result ? ConfirmationCodeMapper.toDomain(result as ConfirmationCodeWithStatus) : null;
    }
}
