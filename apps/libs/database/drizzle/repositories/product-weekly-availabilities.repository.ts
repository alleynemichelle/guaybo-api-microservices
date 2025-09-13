import { Injectable } from '@nestjs/common';
import { productWeeklyAvailability } from '../schemas';
import { DatabaseService } from '../services/database.service';
import { NewProductWeeklyAvailability } from '../types';

@Injectable()
export class ProductWeeklyAvailabilitiesRepository {
    constructor(private readonly databaseService: DatabaseService) {}

    public async createMany(data: NewProductWeeklyAvailability[]): Promise<void> {
        const db = this.databaseService.getDatabase();
        await db.insert(productWeeklyAvailability).values(data);
    }
}
