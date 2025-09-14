import { BadRequestException, Injectable } from '@nestjs/common';
import { ProductResourcesRepository } from 'apps/libs/database/drizzle/repositories/product-resources.repository';
import { ProductsRepository } from 'apps/libs/database/drizzle/repositories/products.repository';
import { MultimediaRepository } from 'apps/libs/database/drizzle/repositories/multimedia.repository';
import { DatabaseService } from 'apps/libs/database/drizzle/services/database.service';
import { ProductsErrorCodes } from 'apps/libs/common/constants/error-codes.constant';
import { ResourceStrategyFactory } from '../../resource-strategies/resource-strategy.factory';
import { MultimediaSource } from 'apps/libs/common/enums/multimedia-source.enum';

@Injectable()
export class DeleteAllProductResourcesHandler {
    constructor(
        private readonly productResourcesRepository: ProductResourcesRepository,
        private readonly productsRepository: ProductsRepository,
        private readonly multimediaRepository: MultimediaRepository,
        private readonly databaseService: DatabaseService,
        private readonly resourceStrategyFactory: ResourceStrategyFactory,
    ) {}

    async execute(hostId: string, productId: string): Promise<void> {
        return await this.databaseService.getDatabase().transaction(async (tx) => {
            // Validate product exists
            const product = await this.productsRepository.findByRecordId(productId);
            if (!product) throw new BadRequestException(ProductsErrorCodes.ProductNotFound);

            // Check if there are any resources to delete
            const existingResources = await this.productResourcesRepository.getByProductId(product.id!);
            if (existingResources.length === 0) {
                return; // No resources to delete
            }

            // Delete all resources and get multimedia IDs
            const multimediaIds = await this.productResourcesRepository.deleteAllByProductId(product.id!, tx);

            // Delete all multimedia files from CDN and database
            await this.deleteAllMultimediaFiles(multimediaIds, tx);

            // Reset product resource metrics
            await this.resetProductResourceMetrics(product.id!, tx);
        });
    }

    private async deleteAllMultimediaFiles(
        multimediaIds: Array<{ multimediaId?: number; thumbnailId?: number }>,
        tx?: any,
    ): Promise<void> {
        // Collect all unique multimedia IDs
        const allMultimediaIds = new Set<number>();

        multimediaIds.forEach(({ multimediaId, thumbnailId }) => {
            if (multimediaId) allMultimediaIds.add(multimediaId);
            if (thumbnailId) allMultimediaIds.add(thumbnailId);
        });

        // Delete all multimedia files in parallel
        const deletePromises = Array.from(allMultimediaIds).map((multimediaId) =>
            this.deleteMultimediaFile(multimediaId, tx),
        );

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

    private async resetProductResourceMetrics(productId: number, tx?: any): Promise<void> {
        // Reset all metrics to zero since all resources are deleted
        await this.productsRepository.updateProduct(productId, {
            totalDuration: 0,
            totalSize: 0,
            totalResources: 0,
            totalSections: 0,
        });
    }
}
