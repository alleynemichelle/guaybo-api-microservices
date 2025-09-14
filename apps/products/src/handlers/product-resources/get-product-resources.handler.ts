import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ProductsErrorCodes } from 'apps/libs/common/constants/error-codes.constant';
import { ProductResourcesRepository } from 'apps/libs/database/drizzle/repositories/product-resources.repository';
import { ProductsRepository } from 'apps/libs/database/drizzle/repositories/products.repository';
import { MultimediaSource } from 'apps/libs/common/enums/multimedia-source.enum';
import { ContentMode } from 'apps/libs/common/enums/content-mode.enum';
import { ProductResource } from 'apps/libs/domain/products/product-resource.entity';
import { ProductResourceType } from 'apps/libs/common/enums/product-resource-type.enum';

import { ResourceStrategyFactory } from '../../resource-strategies/resource-strategy.factory';
import { ProductProgressStatus } from 'apps/libs/domain/products/product-progress.entity';
import { buildHierarchicalResourceResponse, calculateTotalDuration, countResourcesByType } from '../../utils/resources';
import { ProductResourceMetrics } from 'apps/libs/domain/products/product.entity';
import { ProductResourceResponse } from '../../dto/responses/get-product-resources.response';

@Injectable()
export class GetProductResourcesHandler {
    private readonly cfDomain: string = this.configService.get('CLOUDFRONT_DOMAIN') as string;

    constructor(
        private readonly productsRepository: ProductsRepository,
        private readonly productResourcesRepository: ProductResourcesRepository,
        private readonly resourceStrategyFactory: ResourceStrategyFactory,
        private readonly configService: ConfigService,
    ) {}

    async execute(productId: string): Promise<any> {
        const product = await this.productResourcesRepository.getByRecordId(productId);
        if (!product) throw new BadRequestException(ProductsErrorCodes.ProductNotFound);

        const allResources = await this.productResourcesRepository.getByProductId(product.id!);

        // Get user progress if userId is provided
        // let userProgress: ProductProgress | null = null;
        // if (userId) userProgress = await this.productsRepository.getProductProgress(userId, productId);

        // Create a map of completed resources for quick lookup
        // const completedResourcesMap = new Map<string, boolean>();
        // if (userProgress?.completedResources) {
        //     userProgress.completedResources.forEach((resource) => {
        //         completedResourcesMap.set(resource.resourceId, resource.completed);
        //     });
        // }

        // If there are no resources, return empty result
        if (allResources.length === 0) {
            return {
                metrics: {
                    totalDuration: 0,
                    totalSections: 0,
                    totalResources: 0,
                    totalSize: 0,
                },
                resources: [],
                progress: {
                    status: ProductProgressStatus.NOT_STARTED,
                    total: 0,
                },
            };
        }

        // Sort all resources by the "order" attribute
        allResources.sort((a, b) => a.order - b.order);

        // Identify top-level resources (without parentId)
        const topLevelResources = allResources.filter((resource) => !resource.parent);

        // Calculate resource statistics
        const metrics: ProductResourceMetrics = {
            totalDuration: calculateTotalDuration(allResources),
            totalSections: countResourcesByType(allResources, ProductResourceType.SECTION),
            totalResources: countResourcesByType(allResources, ProductResourceType.RESOURCE),
            totalSize: Math.round(allResources.reduce((sum, res) => sum + (res.size || 0), 0)),
        };

        // Build the hierarchy with the presigned URLs and completion status
        const resources = await buildHierarchicalResourceResponse(this.cfDomain, topLevelResources, allResources, {
            isPublic: false,
            //  completedResourcesMap,
        });

        // Return the new response format
        return {
            metrics,
            resources,
            // progress: {
            //     total: userProgress?.progress || 0,
            //     status: userProgress?.progressStatus || ProductProgressStatus.NOT_STARTED,
            //     trackingMarker: userProgress?.trackingMarker,
            // },
        };
    }
}
