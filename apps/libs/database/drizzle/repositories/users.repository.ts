import { eq } from 'drizzle-orm';
import { Injectable } from '@nestjs/common';
import { Timer } from 'apps/libs/common/api/decorators/timer.decorator';
import { User } from 'apps/libs/domain/users/user.entity';
import { UserMapper } from '../mappers/user.mapper';
import { DatabaseService } from '../services/database.service';
import { appUser, status } from '../schemas';
import { AppUserWithHosts, AppUserWithStatus, NewAppUser } from '../types';

@Injectable()
export class UsersRepository {
    constructor(private readonly databaseService: DatabaseService) {}

    @Timer('[USERS] create user')
    public async create(data: NewAppUser): Promise<User> {
        const db = this.databaseService.getDatabase();
        const [result] = await db.insert(appUser).values(data).returning();
        return UserMapper.toDomain(result as AppUserWithStatus) as User;
    }

    @Timer('[USERS] findByRecordId user')
    public async findByRecordId(recordId: string): Promise<User | null> {
        const db = this.databaseService.getDatabase();

        const result = await db.query.appUser.findFirst({
            where: eq(appUser.recordId, recordId),
            with: {
                status: true,
            },
        });
        return result ? (UserMapper.toDomain(result as AppUserWithStatus) as User) : null;
    }

    @Timer('[USERS] findWithHostsByRecordId user')
    public async findWithHostsByRecordId(recordId: string): Promise<User | null> {
        const db = this.databaseService.getDatabase();
        const result = await db.query.appUser.findFirst({
            where: eq(appUser.recordId, recordId),
            with: {
                status: true,
                hostUsers: {
                    with: {
                        host: {
                            columns: {
                                id: true,
                                recordId: true,
                                name: true,
                                alias: true,
                                collectionId: true,
                                createdAt: true,
                            },
                            with: {
                                status: true,
                            },
                        },
                        status: true,
                        role: true,
                    },
                },
            },
        });
        return result ? (UserMapper.toDomain(result as AppUserWithHosts) as User) : null;
    }

    @Timer('[USERS] findByEmail user')
    public async findByEmail(email: string): Promise<User | null> {
        const db = this.databaseService.getDatabase();

        const [result] = await db
            .select({
                id: appUser.id,
                recordId: appUser.recordId,
                firstName: appUser.firstName,
                lastName: appUser.lastName,
                fullName: appUser.fullName,
                email: appUser.email,
                federated: appUser.federated,
                registered: appUser.registered,
                verifiedEmail: appUser.verifiedEmail,
                phoneCode: appUser.phoneCode,
                phoneNumber: appUser.phoneNumber,
                timezone: appUser.timezone,
                defaultLanguage: appUser.defaultLanguage,
                isHost: appUser.isHost,
                isReferrer: appUser.isReferrer,
                createdAt: appUser.createdAt,
                updatedAt: appUser.updatedAt,
                lastAccess: appUser.lastAccess,
                status: {
                    id: status.id,
                    name: status.name,
                    description: status.description,
                },
            })
            .from(appUser)
            .leftJoin(status, eq(appUser.statusId, status.id))
            .where(eq(appUser.email, email))
            .limit(1);

        return result ? (UserMapper.toDomain(result as AppUserWithStatus) as User) : null;
    }

    @Timer('[USERS] findWithHostsByEmail user')
    public async findWithHostsByEmail(email: string): Promise<User | null> {
        const db = this.databaseService.getDatabase();
        const result = await db.query.appUser.findFirst({
            where: eq(appUser.email, email),
            with: {
                status: true,
                hostUsers: {
                    with: {
                        host: true,
                        status: true,
                        role: true,
                    },
                },
            },
        });

        return result ? (UserMapper.toDomain(result as AppUserWithHosts) as User) : null;
    }

    @Timer('[USERS] updateByRecordId user')
    public async updateById(id: number, data: Partial<NewAppUser>): Promise<User | null> {
        const db = this.databaseService.getDatabase();
        const [result] = await db.update(appUser).set(data).where(eq(appUser.id, id)).returning();
        return result ? (UserMapper.toDomain(result as AppUserWithStatus) as User) : null;
    }

    @Timer('[USERS] deleteByRecordId user')
    public async deleteById(id: number): Promise<void> {
        const db = this.databaseService.getDatabase();
        await db.delete(appUser).where(eq(appUser.id, id));
    }
}
