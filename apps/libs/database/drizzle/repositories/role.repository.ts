import { eq } from 'drizzle-orm';
import { Injectable } from '@nestjs/common';
import { Timer } from 'apps/libs/common/api/decorators/timer.decorator';
import { DatabaseService } from '../services/database.service';

import { Role } from '../types';
import { role } from '../schemas';

@Injectable()
export class RoleRepository {
    constructor(private readonly databaseService: DatabaseService) {}

    @Timer('[ROLE] findById')
    public async findById(id: number): Promise<Role | null> {
        const db = this.databaseService.getDatabase();
        const [result] = await db.select().from(role).where(eq(role.id, id));
        return result || null;
    }

    @Timer('[ROLE] findByName')
    public async findByName(name: string): Promise<Role | null> {
        const db = this.databaseService.getDatabase();
        const [result] = await db.select().from(role).where(eq(role.name, name));
        return result || null;
    }
}
