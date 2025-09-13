import { and, count, eq, like, sql } from 'drizzle-orm';
import { Injectable } from '@nestjs/common';

import { Status } from 'apps/libs/common/enums/status.enum';
import { ProductType } from 'apps/libs/common/enums/product-type.enum';
import { ProductStatus } from 'apps/libs/common/enums/product-status.enum';

import { StatusRepository } from './status.repository';
import { ProductTypesRepository } from './product-types.repository';
import { DatabaseService } from '../services/database.service';
import { ProductWithTotalBookings, NewProduct, Product } from '../types';
import { booking, product } from '../schemas';

@Injectable()
export class ProductsRepository {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly statusRepository: StatusRepository,
        private readonly productTypesRepository: ProductTypesRepository,
    ) {}

    public async create(
        data: Omit<NewProduct, 'statusId' | 'productTypeId'>,
        statusName: ProductStatus,
        productTypeName: ProductType,
    ): Promise<Product> {
        const db = this.databaseService.getDatabase();

        const status = await this.statusRepository.findByName(statusName);
        const recordStatus = await this.statusRepository.findByName(Status.ACTIVE);
        const productType = await this.productTypesRepository.findByKey(productTypeName);

        const [result] = await db
            .insert(product)
            .values({
                ...data,
                statusId: status?.id!,
                productTypeId: productType?.id!,
                recordStatusId: recordStatus?.id!,
            })
            .returning();
        return result as Product;
    }

    public async findByAlias(hostId: number, alias: string): Promise<Product[]> {
        const db = this.databaseService.getDatabase();
        const result = await db.query.product.findMany({
            where: (product, { eq, and, like }) => and(eq(product.hostId, hostId), like(product.alias, `${alias}%`)),
        });
        return result as Product[];
    }

    public async findByRecordId(productId: string): Promise<Product | undefined> {
        const db = this.databaseService.getDatabase();
        const result = await db.query.product.findFirst({
            where: (product, { eq, and, like }) => and(eq(product.recordId, productId)),
        });
        return result as Product | undefined;
    }

    public async countByAlias(hostId: number, alias: string): Promise<number> {
        const db = this.databaseService.getDatabase();
        const [result] = await db
            .select({ value: count() })
            .from(product)
            .where(and(eq(product.hostId, hostId), like(product.alias, `${alias}%`)));
        return result.value;
    }

    public async updateProduct(hostId: number, productId: number, data: Partial<Product>): Promise<void> {
        const db = this.databaseService.getDatabase();
        await db
            .update(product)
            .set(data)
            .where(and(eq(product.hostId, hostId), eq(product.id, productId)));
    }

    public async delete(hostId: number, productId: number): Promise<void> {
        const db = this.databaseService.getDatabase();
        await db.delete(product).where(and(eq(product.hostId, hostId), eq(product.id, productId)));
    }

    public async findByRecordIdWithTotalBookings(productId: string): Promise<ProductWithTotalBookings | undefined> {
        const db = this.databaseService.getDatabase();
        const receivedStatus = await this.statusRepository.findByName('RECEIVED');

        if (!receivedStatus) {
            return undefined;
        }

        const result = await db
            .select({
                id: product.id,
                hostId: product.hostId,
                name: product.name,
                alias: product.alias,
                productTypeId: product.productTypeId,
                recordId: product.recordId,
                totalBookings: sql<number>`COUNT(${booking.id})`,
            })
            .from(product)
            .leftJoin(booking, and(eq(booking.productId, product.id), eq(booking.bookingStatusId, receivedStatus.id)))
            .where(eq(product.recordId, productId))
            .groupBy(product.id)
            .limit(1);

        if (!result) return undefined;

        return { ...result[0], totalBookings: Number(result[0].totalBookings ?? 0) } as ProductWithTotalBookings;
    }
}
