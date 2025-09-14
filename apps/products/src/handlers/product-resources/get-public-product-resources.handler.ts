import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ProductsErrorCodes } from 'apps/libs/common/constants/error-codes.constant';
import { ProductStatus } from 'apps/libs/common/enums/product-status.enum';
import { Status } from 'apps/libs/common/enums/status.enum';
import { ProductResourcesRepository } from 'apps/libs/database/drizzle/repositories/product-resources.repository';
import { ProductsRepository } from 'apps/libs/database/drizzle/repositories/products.repository';
import { ProductResourceType } from 'apps/libs/common/enums/product-resource-type.enum';
import {
    ProductResourcesWithMetricsResponse,
    ProductResourceMetrics,
} from '../../dto/responses/get-product-resources.response';
import { buildHierarchicalResourceResponse, calculateTotalDuration, countResourcesByType } from '../../utils/resources';

export class GetPublicProductResourcesHandler {
    private readonly cfDomain: string = this.configService.get('CLOUDFRONT_DOMAIN') as string;
    constructor(
        private readonly productsRepository: ProductsRepository,
        private readonly productResourcesRepository: ProductResourcesRepository,
        private readonly configService: ConfigService,
    ) {}

    async execute(productId: string): Promise<ProductResourcesWithMetricsResponse> {
        // Verify product exists and is public
        const product = await this.productsRepository.findByRecordId(productId);
        if (!product || product.recordStatus == Status.DELETED || product.productStatus !== ProductStatus.PUBLISHED) {
            throw new BadRequestException(ProductsErrorCodes.ProductNotFound);
        }

        // Get all resources
        const allResources = await this.productResourcesRepository.getByProductId(product.id!);

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
            };
        }

        // Sort all resources by the "order" attribute
        allResources.sort((a, b) => a.order - b.order);

        // Identify top-level resources (without parentId)
        const topLevelResources = allResources.filter((resource) => !resource.parentId);

        // Calculate resource statistics
        const metrics: ProductResourceMetrics = {
            totalDuration: calculateTotalDuration(allResources) || 0,
            totalSections: countResourcesByType(allResources, ProductResourceType.SECTION),
            totalResources: countResourcesByType(allResources, ProductResourceType.RESOURCE),
            totalSize: Math.round(allResources.reduce((sum, res) => sum + (res.size || 0), 0)),
        };

        // Now build the response hierarchy with the presigned URLs
        const resources = await buildHierarchicalResourceResponse(this.cfDomain, topLevelResources, allResources, {
            isPublic: true,
        });

        // Return the new response format
        return {
            metrics,
            resources,
        };
    }
}
