import { eq } from 'drizzle-orm';
import { Injectable } from '@nestjs/common';
import { productType } from '../schemas';
import { DatabaseService } from '../services/database.service';
import { ProductType } from '../types';

@Injectable()
export class ProductTypesRepository {
    constructor(private readonly databaseService: DatabaseService) {}

    public async findByKey(key: string): Promise<ProductType | null> {
        const db = this.databaseService.getDatabase();
        const result = await db.query.productType.findFirst({
            where: eq(productType.key, key),
        });
        return result || null;
    }
}
