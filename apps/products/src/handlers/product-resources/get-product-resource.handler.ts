import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ProductsErrorCodes } from 'apps/libs/common/constants/error-codes.constant';
import { ProductResourcesRepository } from 'apps/libs/database/drizzle/repositories/product-resources.repository';
import { MultimediaSource } from 'apps/libs/common/enums/multimedia-source.enum';
import { ContentMode } from 'apps/libs/common/enums/content-mode.enum';
import { ProductResource } from 'apps/libs/domain/products/product-resource.entity';

import { ResourceStrategyFactory } from '../../resource-strategies/resource-strategy.factory';

@Injectable()
export class GetProductResourceHandler {
    private readonly cfDomain: string = this.configService.get('CLOUDFRONT_DOMAIN') as string;

    constructor(
        private readonly productResourcesRepository: ProductResourcesRepository,
        private readonly resourceStrategyFactory: ResourceStrategyFactory,
        private readonly configService: ConfigService,
    ) {}

    async execute(resourceId: string, userId?: string, contentMode?: ContentMode): Promise<any> {
        // Get all resources
        const resource = await this.productResourcesRepository.getByRecordId(resourceId);
        if (!resource) throw new BadRequestException(ProductsErrorCodes.ProductResourceNotFound);

        // add user progress
        // Generate signed URL
        if (resource.url) {
            resource.publicUrl = resource.url;
            const strategy = this.resourceStrategyFactory.getStrategy(resource.source as MultimediaSource);
            if (strategy)
                resource.publicUrl = await strategy.getPublicUrl(
                    {
                        url: resource.url,
                        source: resource.source as MultimediaSource,
                    },
                    contentMode,
                );
        }

        resource.downloadable = resource.downloadable || false;

        return this.mapResponse(resource);
    }

    private mapResponse(resource: ProductResource) {
        return {
            size: resource.size,
            createdAt: resource.createdAt,
            source: resource.source,
            order: resource.order,
            url: resource.url,
            recordId: resource.recordId,
            preview: resource.preview,
            updatedAt: resource.updatedAt,
            fileType: resource.fileType,
            ...(resource.thumbnail && {
                thumbnail: {
                    type: resource.thumbnail.type,
                    path: `${this.cfDomain}/${resource.thumbnail.path}`,
                    source: resource.thumbnail.source,
                },
            }),
            description: resource.description,
            duration: resource.duration,
            title: resource.title,
            type: resource.type,
            publicUrl: resource.publicUrl,
        };
    }
}
