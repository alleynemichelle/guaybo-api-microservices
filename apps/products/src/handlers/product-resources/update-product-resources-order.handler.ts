import { BadRequestException, Injectable } from '@nestjs/common';
import { ProductResourcesRepository } from 'apps/libs/database/drizzle/repositories/product-resources.repository';
import { ProductsRepository } from 'apps/libs/database/drizzle/repositories/products.repository';
import { DatabaseService } from 'apps/libs/database/drizzle/services/database.service';
import { ProductsErrorCodes } from 'apps/libs/common/constants/error-codes.constant';
import {
    UpdateProductResourcesOrderDto,
    ResourceOrderItem,
} from '../../dto/requests/update-product-resources-order.dto';

@Injectable()
export class UpdateProductResourcesOrderHandler {
    constructor(
        private readonly productResourcesRepository: ProductResourcesRepository,
        private readonly productsRepository: ProductsRepository,
        private readonly databaseService: DatabaseService,
    ) {}

    async execute(hostId: string, productId: string, updateData: UpdateProductResourcesOrderDto): Promise<void> {
        return await this.databaseService.getDatabase().transaction(async (tx) => {
            // Validate product exists
            const product = await this.productsRepository.findByRecordId(productId);
            if (!product) throw new BadRequestException(ProductsErrorCodes.ProductNotFound);

            // Get existing resources with current order
            const existingResources = await this.productResourcesRepository.getByProductIdWithOrder(product.id!);

            // Validate all resources exist and prepare updates
            const { validUpdates, errors } = this.validateAndPrepareUpdates(updateData.resources, existingResources);

            if (errors.length > 0) {
                throw new BadRequestException(`Validation errors: ${errors.join(', ')}`);
            }

            // Only update if there are actual changes
            if (validUpdates.length > 0) {
                await this.productResourcesRepository.batchUpdateOrder(validUpdates, tx);
            }
        });
    }

    private validateAndPrepareUpdates(
        resourceOrders: ResourceOrderItem[],
        existingResources: any[],
    ): { validUpdates: Array<{ recordId: string; orderIndex: number; parentId?: number }>; errors: string[] } {
        const errors: string[] = [];
        const validUpdates: Array<{ recordId: string; orderIndex: number; parentId?: number }> = [];

        // Create lookup maps for efficient validation
        const existingResourcesMap = new Map(existingResources.map((resource) => [resource.recordId, resource]));

        const recordIdToIdMap = new Map(existingResources.map((resource) => [resource.recordId, resource.id]));

        // Validate each resource order
        for (const resourceOrder of resourceOrders) {
            const existingResource = existingResourcesMap.get(resourceOrder.recordId);

            if (!existingResource) {
                errors.push(`Resource with ID ${resourceOrder.recordId} not found`);
                continue;
            }

            // Validate parentId if provided
            let parentId: number | undefined;
            if (resourceOrder.parentId !== undefined) {
                if (resourceOrder.parentId === null || resourceOrder.parentId === '') {
                    parentId = undefined; // Remove parent
                } else {
                    const parentResourceId = recordIdToIdMap.get(resourceOrder.parentId);
                    if (!parentResourceId) {
                        errors.push(`Parent resource with ID ${resourceOrder.parentId} not found`);
                        continue;
                    }
                    parentId = parentResourceId;
                }
            } else {
                // Keep current parent
                parentId = existingResource.parentId;
            }

            // Check if there are actual changes
            const orderChanged = existingResource.order !== resourceOrder.order;
            const parentChanged = resourceOrder.parentId !== undefined && existingResource.parentId !== parentId;

            if (orderChanged || parentChanged) {
                validUpdates.push({
                    recordId: resourceOrder.recordId,
                    orderIndex: resourceOrder.order,
                    parentId,
                });
            }
        }

        // Validate order uniqueness
        const orderValues = validUpdates.map((update) => update.orderIndex);
        const uniqueOrderValues = new Set(orderValues);
        if (orderValues.length !== uniqueOrderValues.size) {
            errors.push('Order values must be unique');
        }

        return { validUpdates, errors };
    }
}
