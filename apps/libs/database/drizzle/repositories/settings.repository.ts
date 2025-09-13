import { eq } from 'drizzle-orm';
import { Injectable } from '@nestjs/common';
import { Timer } from 'apps/libs/common/api/decorators/timer.decorator';
import { DatabaseService } from '../services/database.service';
import { appSettings } from '../schemas';
import { AppSettings, NewAppSettings } from '../types';

@Injectable()
export class SettingsRepository {
    constructor(private readonly databaseService: DatabaseService) {}

    @Timer('[SETTINGS] create')
    public async create(data: NewAppSettings): Promise<AppSettings> {
        const db = this.databaseService.getDatabase();
        const [result] = await db.insert(appSettings).values(data).returning();
        return result;
    }

    @Timer('[SETTINGS] findByKey')
    public async findByKey(key: string): Promise<AppSettings | null> {
        const db = this.databaseService.getDatabase();
        const result = await db.query.appSettings.findFirst({
            where: eq(appSettings.key, key),
        });
        return result || null;
    }

    @Timer('[SETTINGS] updateByKey')
    public async updateByKey(key: string, data: Partial<NewAppSettings>): Promise<AppSettings | null> {
        const db = this.databaseService.getDatabase();
        const [result] = await db.update(appSettings).set(data).where(eq(appSettings.key, key)).returning();
        return result || null;
    }
}
