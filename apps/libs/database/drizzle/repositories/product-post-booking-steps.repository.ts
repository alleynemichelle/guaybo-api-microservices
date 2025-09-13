import { Injectable } from '@nestjs/common';
import { productPostBookingStep } from '../schemas';
import { DatabaseService } from '../services/database.service';
import { NewProductPostBookingStep } from '../types';

@Injectable()
export class ProductPostBookingStepsRepository {
    constructor(private readonly databaseService: DatabaseService) {}

    public async create(data: NewProductPostBookingStep): Promise<void> {
        const db = this.databaseService.getDatabase();
        await db.insert(productPostBookingStep).values(data);
    }
}
