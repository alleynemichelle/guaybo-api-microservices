import { Injectable } from '@nestjs/common';
import { productDate } from '../schemas';
import { DatabaseService } from '../services/database.service';
import { NewProductDate } from '../types';

@Injectable()
export class ProductDatesRepository {
    constructor(private readonly databaseService: DatabaseService) {}

    public async createMany(data: NewProductDate[]): Promise<void> {
        const db = this.databaseService.getDatabase();
        await db.insert(productDate).values(data);
    }
}
