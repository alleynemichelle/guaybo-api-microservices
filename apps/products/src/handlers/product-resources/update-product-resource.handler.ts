import { BadRequestException } from '@nestjs/common';

import { ProductResourcesRepository } from 'apps/libs/database/drizzle/repositories/product-resources.repository';
import { ProductsRepository } from 'apps/libs/database/drizzle/repositories/products.repository';
import { MultimediaRepository } from 'apps/libs/database/drizzle/repositories/multimedia.repository';
import { ProductsErrorCodes } from 'apps/libs/common/constants/error-codes.constant';
import { MultimediaSource } from 'apps/libs/common/enums/multimedia-source.enum';
import { MultimediaUsageType } from 'apps/libs/common/enums/multimedia-usage-type.enum';
import { ProductResource } from 'apps/libs/domain/products/product-resource.entity';
import { getUTCDate } from 'apps/libs/common/utils/date';
import { getYouTubeDuration } from '../../utils/get-youtube-duration';
import { YouTubeService } from 'apps/libs/integrations/youtube/youtube.service';
import { UpdateProductResourceDto } from '../../dto/requests/update-product-resource.dto';
import { DatabaseService } from 'apps/libs/database/drizzle/services/database.service';

export class UpdateProductResourceHandler {
    constructor(
        private readonly productResourcesRepository: ProductResourcesRepository,
        private readonly productsRepository: ProductsRepository,
        private readonly multimediaRepository: MultimediaRepository,
        private readonly youtubeService: YouTubeService,
        private readonly databaseService: DatabaseService,
    ) {}

    async execute(
        hostId: string,
        productId: string,
        resourceId: string,
        updateData: Partial<UpdateProductResourceDto>,
    ): Promise<ProductResource> {
        return await this.databaseService.getDatabase().transaction(async (tx) => {
            // Validate entities exist
            const { product, resource } = await this.validateEntities(productId, resourceId);

            // Handle parent relationship
            const parentResourceId = await this.handleParentRelationship(updateData.parentId, resource, tx);

            // Get YouTube duration if needed
            const duration = await this.getYouTubeDuration(updateData);

            // Update multimedia
            const multimediaId = await this.updateMultimedia(updateData, resource, product, tx);

            // Update thumbnail
            const thumbnailId = await this.updateThumbnail(updateData.thumbnail, resource, product, tx);

            // Create updated resource entity
            const updatedResource = this.createUpdatedResource(
                resource,
                updateData,
                duration,
                multimediaId,
                thumbnailId,
            );

            // Persist changes to database
            await this.persistResourceChanges(resourceId, updatedResource, parentResourceId, multimediaId, thumbnailId);

            return updatedResource;
        });
    }

    private async validateEntities(productId: string, resourceId: string) {
        const product = await this.productsRepository.findByRecordId(productId);
        if (!product) throw new BadRequestException(ProductsErrorCodes.ProductNotFound);

        const resource = await this.productResourcesRepository.getByRecordId(resourceId);
        if (!resource) throw new BadRequestException(ProductsErrorCodes.ProductResourceNotFound);

        return { product, resource };
    }

    private async handleParentRelationship(
        parentId: string | null | undefined,
        resource: ProductResource,
        tx: any,
    ): Promise<number | undefined> {
        if (parentId === undefined) {
            // No parentId provided, keep current
            return resource.parentId ? resource.parent?.id : undefined;
        }

        if (parentId === null || parentId === '') {
            // Remove parent (set to null)
            return undefined;
        }

        if (parentId !== resource.parentId) {
            // Set new parent
            const parentResource = await this.productResourcesRepository.getByRecordId(parentId);
            if (!parentResource) throw new BadRequestException(ProductsErrorCodes.ProductResourceNotFound);
            return parentResource.id;
        }

        // Keep current parent
        return resource.parentId ? parseInt(resource.parentId) : undefined;
    }

    private async getYouTubeDuration(updateData: Partial<UpdateProductResourceDto>): Promise<number | undefined> {
        if (updateData.source === MultimediaSource.YOUTUBE && updateData.url) {
            return (await getYouTubeDuration(updateData.url, this.youtubeService)) ?? updateData.duration;
        }
        return updateData.duration;
    }

    private async updateMultimedia(
        updateData: Partial<UpdateProductResourceDto>,
        resource: ProductResource,
        product: any,
        tx: any,
    ): Promise<number | undefined> {
        const hasMultimediaFields =
            updateData.duration || updateData.size || updateData.url || updateData.source || updateData.fileType;

        if (!hasMultimediaFields) {
            return resource.multimediaId;
        }

        if (resource.multimediaId) {
            // Update existing multimedia
            await this.multimediaRepository.updateById(
                resource.multimediaId,
                {
                    type: updateData.fileType,
                    source: updateData.source,
                    path: updateData.url,
                    filename: updateData.url ? updateData.url.split('/').pop() : undefined,
                    size: updateData.size?.toString(),
                    duration: updateData.duration?.toString(),
                },
                tx,
            );
            return resource.multimediaId;
        }

        if (updateData.url) {
            // Create new multimedia
            const newMultimedia = await this.multimediaRepository.create(
                {
                    hostId: product.host.id,
                    usageType: MultimediaUsageType.RESOURCE,
                    type: updateData.fileType,
                    source: updateData.source || MultimediaSource.APP,
                    path: updateData.url,
                    filename: updateData.url.split('/').pop(),
                    size: updateData.size?.toString(),
                    duration: updateData.duration?.toString(),
                },
                tx,
            );
            return newMultimedia.id;
        }

        return resource.multimediaId;
    }

    private async updateThumbnail(
        thumbnail: any,
        resource: ProductResource,
        product: any,
        tx: any,
    ): Promise<number | undefined> {
        if (!thumbnail) {
            return resource.thumbnailId;
        }

        if (resource.thumbnailId) {
            // Update existing thumbnail
            await this.multimediaRepository.updateById(
                resource.thumbnailId,
                {
                    type: thumbnail.type,
                    source: thumbnail.source,
                    path: thumbnail.path,
                    filename: thumbnail.filename,
                },
                tx,
            );
            return resource.thumbnailId;
        }

        // Create new thumbnail
        const newThumbnail = await this.multimediaRepository.create(
            {
                hostId: product.host.id,
                usageType: MultimediaUsageType.THUMBNAIL,
                type: thumbnail.type,
                source: thumbnail.source,
                path: thumbnail.path,
                filename: thumbnail.filename,
            },
            tx,
        );
        return newThumbnail.id;
    }

    private createUpdatedResource(
        resource: ProductResource,
        updateData: Partial<UpdateProductResourceDto>,
        duration: number | undefined,
        multimediaId: number | undefined,
        thumbnailId: number | undefined,
    ): ProductResource {
        return new ProductResource({
            ...resource,
            ...updateData,
            parentId: updateData.parentId ?? resource.parentId,
            ...(duration !== undefined && { duration }),
            multimediaId,
            thumbnailId,
            updatedAt: getUTCDate().toISOString(),
        });
    }

    private async persistResourceChanges(
        resourceId: string,
        updatedResource: ProductResource,
        parentResourceId: number | undefined,
        multimediaId: number | undefined,
        thumbnailId: number | undefined,
    ): Promise<void> {
        await this.productResourcesRepository.updateByRecordId(resourceId, {
            title: updatedResource.title,
            description: updatedResource.description,
            longDescription: updatedResource.longDescription,
            type: updatedResource.type,
            preview: updatedResource.preview,
            orderIndex: updatedResource.order,
            downloadable: updatedResource.downloadable,
            totalViews: updatedResource.totalViews,
            parentId: parentResourceId,
            multimediaId: multimediaId,
            thumbnailId: thumbnailId,
        });
    }
}
