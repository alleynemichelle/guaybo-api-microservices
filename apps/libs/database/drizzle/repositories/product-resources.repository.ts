import { eq, sql } from 'drizzle-orm';
import { Injectable } from '@nestjs/common';
import { TransactionalExecutor } from 'apps/libs/database/drizzle/services/database.service';
import { Timer } from 'apps/libs/common/api/decorators/timer.decorator';

import { NewProductResource, ProductResource as ProductResourceType, ProductResourceWithRelations } from '../types';
import { DatabaseService } from '../services/database.service';
import { productResource } from '../schemas';
import { ProductResourceMapper } from '../mappers/product-resource.mapper';
import { ProductResource } from 'apps/libs/domain/products/product-resource.entity';

@Injectable()
export class ProductResourcesRepository {
    constructor(private readonly databaseService: DatabaseService) {}

    private getExecutor(tx?: TransactionalExecutor) {
        return tx || this.databaseService.getDatabase();
    }

    @Timer('[PRODUCT_RESOURCES] create')
    public async create(
        newProductResource: NewProductResource,
        tx?: TransactionalExecutor,
    ): Promise<ProductResourceType> {
        const executor = this.getExecutor(tx);
        const [result] = await executor.insert(productResource).values(newProductResource).returning();
        return result;
    }

    @Timer('[PRODUCT_RESOURCES] getById')
    public async getById(id: number): Promise<ProductResource | null> {
        const db = this.getExecutor();
        const result = await db.query.productResource.findFirst({
            where: eq(productResource.id, id),
            with: {
                status: true,
                processingStatus: true,
                multimedia: true,
                thumbnail: true,
            },
        });
        return result ? ProductResourceMapper.toDomain(result as ProductResourceWithRelations) : null;
    }

    @Timer('[PRODUCT_RESOURCES] getByRecordId')
    public async getByRecordId(recordId: string): Promise<ProductResource | null> {
        const db = this.getExecutor();
        const result = await db.query.productResource.findFirst({
            where: eq(productResource.recordId, recordId),
            with: {
                status: true,
                processingStatus: true,
                multimedia: true,
                thumbnail: true,
            },
        });
        return result ? ProductResourceMapper.toDomain(result as ProductResourceWithRelations) : null;
    }

    @Timer('[PRODUCT_RESOURCES] getByProductId')
    public async getByProductId(productId: number): Promise<ProductResource[]> {
        const db = this.getExecutor();
        const results = await db.query.productResource.findMany({
            where: eq(productResource.productId, productId),
            with: {
                status: true,
                processingStatus: true,
                multimedia: true,
                thumbnail: true,
                parent: true,
            },
        });
        return results.map((result) => ProductResourceMapper.toDomain(result as ProductResourceWithRelations));
    }

    @Timer('[PRODUCT_RESOURCES] updateByRecordId')
    public async updateByRecordId(
        recordId: string,
        data: Partial<NewProductResource>,
    ): Promise<ProductResourceType | null> {
        const db = this.getExecutor();
        const [result] = await db
            .update(productResource)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(productResource.recordId, recordId))
            .returning();
        return result as ProductResourceType | null;
    }

    @Timer('[PRODUCT_RESOURCES] deleteByRecordId')
    public async deleteByRecordId(recordId: string): Promise<void> {
        const db = this.getExecutor();
        await db.delete(productResource).where(eq(productResource.recordId, recordId));
    }

    @Timer('[PRODUCT_RESOURCES] incrementViews')
    public async incrementViews(recordId: string): Promise<void> {
        const db = this.getExecutor();
        await db
            .update(productResource)
            .set({
                totalViews: sql`COALESCE(${productResource.totalViews}, 0) + 1`,
                updatedAt: new Date(),
            })
            .where(eq(productResource.recordId, recordId));
    }

    @Timer('[PRODUCT_RESOURCES] getByProductIdWithOrder')
    public async getByProductIdWithOrder(productId: number): Promise<ProductResource[]> {
        const db = this.getExecutor();
        const results = await db.query.productResource.findMany({
            where: eq(productResource.productId, productId),
            columns: {
                id: true,
                recordId: true,
                orderIndex: true,
                parentId: true,
            },
            orderBy: (productResource, { asc }) => [asc(productResource.orderIndex)],
        });
        return results.map((result) => ProductResourceMapper.toDomain(result as ProductResourceWithRelations));
    }

    @Timer('[PRODUCT_RESOURCES] batchUpdateOrder')
    public async batchUpdateOrder(
        updates: Array<{ recordId: string; orderIndex: number; parentId?: number }>,
        tx?: TransactionalExecutor,
    ): Promise<void> {
        const executor = this.getExecutor(tx);

        // Use Promise.all for parallel updates within transaction
        await Promise.all(
            updates.map(({ recordId, orderIndex, parentId }) =>
                executor
                    .update(productResource)
                    .set({
                        orderIndex,
                        parentId,
                        updatedAt: new Date(),
                    })
                    .where(eq(productResource.recordId, recordId)),
            ),
        );
    }

    @Timer('[PRODUCT_RESOURCES] getChildrenByParentId')
    public async getChildrenByParentId(parentRecordId: string): Promise<ProductResource[]> {
        const db = this.getExecutor();
        const results = await db.query.productResource.findMany({
            where: eq(productResource.parentId, parentRecordId),
            columns: {
                id: true,
                recordId: true,
                multimediaId: true,
                thumbnailId: true,
            },
        });
        return results.map((result) => ProductResourceMapper.toDomain(result as ProductResourceWithRelations));
    }

    @Timer('[PRODUCT_RESOURCES] deleteByRecordIdWithMultimedia')
    public async deleteByRecordIdWithMultimedia(
        recordId: string,
        tx?: TransactionalExecutor,
    ): Promise<{
        multimediaId?: number;
        thumbnailId?: number;
    }> {
        const executor = this.getExecutor(tx);

        // Get multimedia IDs before deletion
        const resource = await executor.query.productResource.findFirst({
            where: eq(productResource.recordId, recordId),
            columns: {
                multimediaId: true,
                thumbnailId: true,
            },
        });

        // Delete the resource
        await executor.delete(productResource).where(eq(productResource.recordId, recordId));

        return {
            multimediaId: resource?.multimediaId ?? undefined,
            thumbnailId: resource?.thumbnailId ?? undefined,
        };
    }

    @Timer('[PRODUCT_RESOURCES] deleteAllByProductId')
    public async deleteAllByProductId(
        productId: number,
        tx?: TransactionalExecutor,
    ): Promise<
        Array<{
            multimediaId?: number;
            thumbnailId?: number;
        }>
    > {
        const executor = this.getExecutor(tx);

        // Get all multimedia IDs before deletion
        const resources = await executor.query.productResource.findMany({
            where: eq(productResource.productId, productId),
            columns: {
                multimediaId: true,
                thumbnailId: true,
            },
        });

        // Delete all resources
        await executor.delete(productResource).where(eq(productResource.productId, productId));

        return resources.map((resource) => ({
            multimediaId: resource.multimediaId ?? undefined,
            thumbnailId: resource.thumbnailId ?? undefined,
        }));
    }
}
