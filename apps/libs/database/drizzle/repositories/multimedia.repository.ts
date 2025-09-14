import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { multimedia } from '../database/schemas';
import { DatabaseService, TransactionalExecutor } from '../database/services/database.service';
import { Multimedia, NewMultimedia } from '../domain';
import { Timer } from '../api/decorators';

@Injectable()
export class MultimediaRepository {
    constructor(private readonly databaseService: DatabaseService) {}

    private getExecutor(tx?: TransactionalExecutor) {
        return tx || this.databaseService.getDatabase();
    }

    @Timer('[MULTIMEDIA] create')
    public async create(data: NewMultimedia, tx?: TransactionalExecutor): Promise<Multimedia> {
        const executor = this.getExecutor(tx);
        const [result] = await executor.insert(multimedia).values(data).returning();
        return result;
    }

    @Timer('[MULTIMEDIA] createMany')
    public async createMany(data: NewMultimedia[], tx?: TransactionalExecutor): Promise<Multimedia[]> {
        if (data.length === 0) {
            return [];
        }
        const executor = this.getExecutor(tx);
        const result = await executor.insert(multimedia).values(data).returning();
        return result;
    }

    @Timer('[MULTIMEDIA] findById')
    public async findById(id: number, tx?: TransactionalExecutor): Promise<Multimedia | null> {
        const executor = this.getExecutor(tx);
        const result = await executor.query.multimedia.findFirst({
            where: eq(multimedia.id, id),
        });
        return result || null;
    }

    @Timer('[MULTIMEDIA] updateById')
    public async updateById(
        id: number,
        data: Partial<NewMultimedia>,
        tx?: TransactionalExecutor,
    ): Promise<Multimedia | null> {
        const executor = this.getExecutor(tx);
        const [result] = await executor.update(multimedia).set(data).where(eq(multimedia.id, id)).returning();
        return result || null;
    }

    @Timer('[MULTIMEDIA] deleteById')
    public async deleteById(id: number, tx?: TransactionalExecutor): Promise<void> {
        const executor = this.getExecutor(tx);
        await executor.delete(multimedia).where(eq(multimedia.id, id));
    }
}
