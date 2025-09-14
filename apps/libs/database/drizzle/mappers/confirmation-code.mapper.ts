import { ConfirmationCode } from 'apps/libs/domain/users/confirmation-code.entity';
import { ConfirmationCodeStatus } from 'apps/libs/common/enums/confirmation-code-status.enum';
import { Status } from 'apps/libs/common/enums/status.enum';
import { DatabaseKeys } from 'apps/libs/common/enums/database-keys.enum';
import { ConfirmationCodeWithStatus, NewConfirmationCode } from '../types';
import { AuthRedirectType, CodeEnum } from 'apps/libs/common/enums/auth.enum';

export class ConfirmationCodeMapper {
    static toDomain(row: ConfirmationCodeWithStatus): ConfirmationCode {
        return new ConfirmationCode({
            id: row.id,
            recordId: row.recordId,
            email: '', // Email not available in database schema, will be set separately
            code: row.code,
            ttl: row.ttl,
            codeStatus: (row.status?.name as ConfirmationCodeStatus) ?? ConfirmationCodeStatus.ACTIVE,
            codeType: row.codeType as CodeEnum,
            redirectType: row.redirectType as AuthRedirectType,
            recordStatus: (row.status?.name as Status) ?? Status.ACTIVE,
            recordType: DatabaseKeys.CONFIRMATION_CODE,
            createdAt: row.createdAt?.toISOString(),
            updatedAt: row.updatedAt?.toISOString(),
        });
    }

    static toPersistence(entity: ConfirmationCode, userId: number, statusId: number): NewConfirmationCode {
        return {
            recordId: entity.recordId,
            userId: userId,
            code: entity.code,
            codeType: entity.codeType,
            ttl: entity.ttl,
            redirectType: entity.redirectType,
            statusId: statusId,
        };
    }
}
