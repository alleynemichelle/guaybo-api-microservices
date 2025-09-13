import { eq } from 'drizzle-orm';
import { Injectable } from '@nestjs/common';
import { Timer } from 'apps/libs/common/api/decorators/timer.decorator';
import { DatabaseService } from '../services/database.service';
import { appUser, status } from '../schemas';
import { AppUserWithHosts, AppUserWithStatus, NewAppUser, AppUser } from '../types';

@Injectable()
export class UsersRepository {
    constructor(private readonly databaseService: DatabaseService) {}

    @Timer('[USERS] create user')
    public async create(data: NewAppUser): Promise<AppUserWithStatus> {
        const db = this.databaseService.getDatabase();
        const [result] = await db.insert(appUser).values(data).returning();
        return result as AppUserWithStatus;
    }

    @Timer('[USERS] findByRecordId user')
    public async findByRecordId(recordId: string): Promise<AppUserWithStatus | null> {
        const db = this.databaseService.getDatabase();

        const result = await db.query.appUser.findFirst({
            where: eq(appUser.recordId, recordId),
            with: {
                status: true,
            },
        });
        return (result as AppUserWithStatus) || null;
    }

    @Timer('[USERS] findWithHostsByRecordId user')
    public async findWithHostsByRecordId(recordId: string): Promise<AppUserWithHosts | null> {
        const db = this.databaseService.getDatabase();
        const result = await db.query.appUser.findFirst({
            where: eq(appUser.recordId, recordId),
            with: {
                status: true,
                hostUsers: {
                    with: {
                        host: {
                            columns: {
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
        return (result as AppUserWithHosts) || null;
    }

    @Timer('[USERS] findByEmail user')
    public async findByEmail(email: string): Promise<AppUserWithStatus | null> {
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

        return (result as AppUserWithStatus) || null;
    }

    @Timer('[USERS] findWithHostsByEmail user')
    public async findWithHostsByEmail(email: string): Promise<AppUserWithHosts | null> {
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
        return (result as AppUserWithHosts) || null;
    }

    @Timer('[USERS] updateByRecordId user')
    public async updateById(id: number, data: Partial<NewAppUser>): Promise<AppUser | null> {
        const db = this.databaseService.getDatabase();
        const [result] = await db.update(appUser).set(data).where(eq(appUser.id, id)).returning();
        return result || null;
    }

    @Timer('[USERS] deleteByRecordId user')
    public async deleteById(id: number): Promise<void> {
        const db = this.databaseService.getDatabase();
        await db.delete(appUser).where(eq(appUser.id, id));
    }
}
