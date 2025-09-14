import { BadRequestException, Injectable } from '@nestjs/common';
import { ProductResourcesRepository } from 'apps/libs/database/drizzle/repositories/product-resources.repository';
import { ProductsRepository } from 'apps/libs/database/drizzle/repositories/products.repository';
import { MultimediaRepository } from 'apps/libs/database/drizzle/repositories/multimedia.repository';
import { DatabaseService } from 'apps/libs/database/drizzle/services/database.service';
import { ProductsErrorCodes } from 'apps/libs/common/constants/error-codes.constant';
import { MultimediaSource } from 'apps/libs/common/enums/multimedia-source.enum';
import { ResourceStrategyFactory } from '../../resource-strategies/resource-strategy.factory';

@Injectable()
export class DeleteProductResourceHandler {
    constructor(
        private readonly productResourcesRepository: ProductResourcesRepository,
        private readonly productsRepository: ProductsRepository,
        private readonly multimediaRepository: MultimediaRepository,
        private readonly databaseService: DatabaseService,
        private readonly resourceStrategyFactory: ResourceStrategyFactory,
    ) {}

    async execute(hostId: string, productId: string, resourceId: string): Promise<void> {
        return await this.databaseService.getDatabase().transaction(async (tx) => {
            // Validate product exists
            const product = await this.productsRepository.findByRecordId(productId);
            if (!product) throw new BadRequestException(ProductsErrorCodes.ProductNotFound);

            // Validate resource exists
            const resource = await this.productResourcesRepository.getByRecordId(resourceId);
            if (!resource) throw new BadRequestException(ProductsErrorCodes.ProductResourceNotFound);

            // Get and delete all children resources first (recursive deletion)
            await this.deleteChildrenResources(resourceId, tx);

            // Delete the main resource and get multimedia IDs
            const { multimediaId, thumbnailId } = await this.productResourcesRepository.deleteByRecordIdWithMultimedia(
                resourceId,
                tx,
            );

            // Delete multimedia files from CDN and database
            await this.deleteMultimediaFiles(multimediaId, thumbnailId, tx);

            // Update product resource metrics
            await this.updateProductResourceMetrics(product.id!, tx);
        });
    }

    private async deleteChildrenResources(parentRecordId: string, tx: any): Promise<void> {
        // Get all children resources
        const children = await this.productResourcesRepository.getChildrenByParentId(parentRecordId);

        // Delete each child recursively
        for (const child of children) {
            // Recursively delete grandchildren
            await this.deleteChildrenResources(child.recordId!, tx);

            // Delete child resource and get multimedia IDs
            const { multimediaId, thumbnailId } = await this.productResourcesRepository.deleteByRecordIdWithMultimedia(
                child.recordId!,
                tx,
            );

            // Delete multimedia files
            await this.deleteMultimediaFiles(multimediaId, thumbnailId, tx);
        }
    }

    private async deleteMultimediaFiles(multimediaId?: number, thumbnailId?: number, tx?: any): Promise<void> {
        const deletePromises: Promise<void>[] = [];

        // Delete main multimedia file
        if (multimediaId) {
            deletePromises.push(this.deleteMultimediaFile(multimediaId, tx));
        }

        // Delete thumbnail file
        if (thumbnailId) {
            deletePromises.push(this.deleteMultimediaFile(thumbnailId, tx));
        }

        // Execute deletions in parallel
        await Promise.all(deletePromises);
    }

    private async deleteMultimediaFile(multimediaId: number, tx?: any): Promise<void> {
        try {
            // Get multimedia details for CDN deletion
            const multimedia = await this.multimediaRepository.findById(multimediaId);
            if (multimedia) {
                // Use strategy to delete from CDN
                if (multimedia.path && multimedia.source) {
                    const strategy = this.resourceStrategyFactory.getStrategy(multimedia.source as MultimediaSource);
                    if (strategy) {
                        await strategy.deleteResource({
                            path: multimedia.path,
                            source: multimedia.source as MultimediaSource,
                        });
                    }
                }

                // Delete from database
                await this.multimediaRepository.deleteById(multimediaId, tx);
            }
        } catch (error) {
            console.error(`Error deleting multimedia ${multimediaId}:`, error);
            // Continue with deletion even if CDN deletion fails
        }
    }

    private async updateProductResourceMetrics(productId: number, tx?: any): Promise<void> {
        // Get all remaining resources for the product
        const remainingResources = await this.productResourcesRepository.getByProductId(productId);

        // Calculate new metrics
        const totalDuration = remainingResources.reduce((sum, resource) => sum + (resource.duration || 0), 0);
        const totalSize = remainingResources.reduce((sum, resource) => sum + (resource.size || 0), 0);
        const totalResources = remainingResources.length;
        const totalSections = remainingResources.filter((r) => r.type === 'SECTION').length;

        // Update product metrics using individual fields
        await this.productsRepository.updateProduct(productId, {
            totalDuration,
            totalSize,
            totalResources,
            totalSections,
        });
    }
}
