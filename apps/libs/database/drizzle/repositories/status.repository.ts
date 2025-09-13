import { eq } from 'drizzle-orm';
import { Injectable } from '@nestjs/common';
import { Timer } from 'apps/libs/common/api/decorators/timer.decorator';
import { Status } from '../types';
import { status } from '../schemas';
import { DatabaseService } from '../services/database.service';

@Injectable()
export class StatusRepository {
    constructor(private readonly databaseService: DatabaseService) {}

    @Timer('[STATUS] findAll')
    public async findAll(): Promise<Status[]> {
        const db = this.databaseService.getDatabase();
        const result = await db.select().from(status);
        return result;
    }

    @Timer('[STATUS] findById')
    public async findById(id: number): Promise<Status | null> {
        const db = this.databaseService.getDatabase();
        const [result] = await db.select().from(status).where(eq(status.id, id));
        return result || null;
    }

    @Timer('[STATUS] findByName')
    public async findByName(name: string): Promise<Status | null> {
        const db = this.databaseService.getDatabase();
        const [result] = await db.select().from(status).where(eq(status.name, name));
        return result || null;
    }
}
