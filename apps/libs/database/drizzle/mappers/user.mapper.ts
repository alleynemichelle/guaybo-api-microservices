import { User } from 'apps/libs/domain/users/user.entity';
import { UserHost } from 'apps/libs/domain/users/user-host.entity';
import { PhoneNumber } from 'apps/libs/domain/common/phone-number.entity';
import { Status } from 'apps/libs/common/enums/status.enum';
import { Language } from 'apps/libs/common/enums/language.enum';
import { Role } from 'apps/libs/common/enums/role.enum';
import { AppUserWithStatus, AppUserWithHosts, NewAppUser } from '../types';

export class UserMapper {
    static toDomain(row: AppUserWithStatus | AppUserWithHosts): User {
        // Map phone number if both code and number exist
        let phoneNumber: PhoneNumber | undefined;
        if (row.phoneCode && row.phoneNumber) {
            phoneNumber = new PhoneNumber();
            phoneNumber.code = row.phoneCode;
            phoneNumber.number = row.phoneNumber;
        }

        // Map hosts if they exist (only for AppUserWithHosts)
        let hosts: Partial<UserHost>[] | undefined;
        if ('hostUsers' in row && row.hostUsers) {
            hosts = row.hostUsers.map((hostUser) => ({
                id: hostUser.host.id,
                recordId: hostUser.host.recordId, // Use host recordId as the recordId for UserHost
                hostId: hostUser.host.recordId,
                userId: row.recordId,
                role: hostUser.role.name as Role,
                status: hostUser.status?.name as Status,
                createdAt: (hostUser as any).createdAt?.toISOString(),
                updatedAt: (hostUser as any).updatedAt?.toISOString(),
            }));
        }

        return new User({
            id: row.id,
            recordId: row.recordId,
            firstName: row.firstName ?? undefined,
            lastName: row.lastName ?? undefined,
            fullName: row.fullName ?? undefined,
            email: row.email,
            hosts: hosts,
            status: row.status?.name as Status,
            defaultLanguage: row.defaultLanguage as Language,
            federated: row.federated ?? undefined,
            registered: row.registered ?? undefined,
            phoneNumber: phoneNumber,
            instagramAccount: row.instagramAccount ?? undefined,
            lastAccess: row.lastAccess?.toISOString(),
            timezone: row.timezone ?? undefined,
            verifiedEmail: row.verifiedEmail ?? undefined,
            hostId: undefined, // This field is not in the database schema
            isHost: row.isHost ?? (hosts && hosts.length > 0),
            isReferrer: row.isReferrer ?? undefined,
            createdAt: row.createdAt?.toISOString(),
            updatedAt: row.updatedAt?.toISOString(),
        });
    }

    static toPersistence(entity: User, statusId?: number): NewAppUser {
        return {
            id: entity.id,
            recordId: entity.recordId,
            firstName: entity.firstName,
            lastName: entity.lastName,
            fullName: entity.fullName,
            email: entity.email,
            instagramAccount: entity.instagramAccount,
            federated: entity.federated,
            registered: entity.registered,
            verifiedEmail: entity.verifiedEmail,
            phoneCode: entity.phoneNumber?.code,
            phoneNumber: entity.phoneNumber?.number,
            timezone: entity.timezone,
            lastAccess: entity.lastAccess ? new Date(entity.lastAccess) : undefined,
            defaultLanguage: entity.defaultLanguage,
            statusId: statusId,
            isHost: entity.isHost,
            isReferrer: entity.isReferrer,
        };
    }
}
