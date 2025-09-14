import { BadRequestException } from '@nestjs/common';

import { HostsRepository } from 'apps/libs/database/drizzle/repositories/hosts.repository';
import { ProductsRepository } from 'apps/libs/database/drizzle/repositories/products.repository';
import { ProductsErrorCodes } from 'apps/libs/common/constants/error-codes.constant';
import { MultimediaSource } from 'apps/libs/common/enums/multimedia-source.enum';
import { ProductResource } from 'apps/libs/domain/products/product-resource.entity';
import { DatabaseKeys } from 'apps/libs/common/enums/database-keys.enum';
import { Status } from 'apps/libs/common/enums/status.enum';
import { ContentMode } from 'apps/libs/common/enums/content-mode.enum';
import { YouTubeService } from 'apps/libs/integrations/youtube/youtube.service';

import { ProductResourcesRepository } from 'apps/libs/database/drizzle/repositories/product-resources.repository';
import { StatusRepository } from 'apps/libs/database/drizzle/repositories/status.repository';
import { MultimediaUsageType } from 'apps/libs/common/enums/multimedia-usage-type.enum';
import { DatabaseService } from 'apps/libs/database/drizzle/services/database.service';
import { MultimediaRepository } from 'apps/libs/database/drizzle/repositories/multimedia.repository';
import { NewMultimedia } from 'apps/libs/database/drizzle/types';

import { getYouTubeDuration } from '../../utils/get-youtube-duration';
import { CreateProductResourceDto } from '../../dto/requests/create-product-resource.dto';
import { ResourceStrategyFactory } from '../../resource-strategies/resource-strategy.factory';

export class CreateProductResourceHandler {
    constructor(
        private readonly productResourcesRepository: ProductResourcesRepository,
        private readonly productsRepository: ProductsRepository,
        private readonly hostsRepository: HostsRepository,
        private readonly youtubeRepository: YouTubeService,
        private readonly statusRepository: StatusRepository,
        private readonly resourceStrategyFactory: ResourceStrategyFactory,
        private readonly multimediaRepository: MultimediaRepository,
        private readonly databaseService: DatabaseService,
    ) {}

    async execute(
        productRecordId: string,
        createProductResourceDto: CreateProductResourceDto,
    ): Promise<ProductResource> {
        return await this.databaseService.getDatabase().transaction(async (tx) => {
            const product = await this.productsRepository.findByRecordId(productRecordId);
            if (!product) throw new BadRequestException(ProductsErrorCodes.ProductNotFound);

            // Get duration from YouTube if source is YOUTUBE and duration is not provided
            let duration = createProductResourceDto.duration;
            if (createProductResourceDto.source === MultimediaSource.YOUTUBE && createProductResourceDto.url)
                duration = (await getYouTubeDuration(createProductResourceDto.url, this.youtubeRepository)) ?? duration;

            let parentResourceId: number | undefined;
            if (createProductResourceDto.parentId) {
                parentResourceId = (
                    await this.productResourcesRepository.getByRecordId(createProductResourceDto.parentId)
                )?.id;
                if (!parentResourceId) throw new BadRequestException(ProductsErrorCodes.ProductResourceNotFound);
            }

            const resourceData = {
                productId: productRecordId,
                parentResourceId: createProductResourceDto.parentId,
                title: createProductResourceDto.title,
                description: createProductResourceDto.description,
                type: createProductResourceDto.type,
                //   quiz: createProductResourceDto.quiz,
                //   survey: createProductResourceDto.survey,
                fileType: createProductResourceDto.fileType,
                source: createProductResourceDto.source,
                fileName: createProductResourceDto.fileName,
                url: createProductResourceDto.url,
                alias: createProductResourceDto.fileId,
                fileId: createProductResourceDto.fileId,
                duration: duration,
                size: createProductResourceDto.size,
                preview: createProductResourceDto.preview,
                order: createProductResourceDto.order,
                recordStatus: Status.ACTIVE,
                longDescription: createProductResourceDto.longDescription,
                ...(createProductResourceDto.thumbnail?.path && {
                    thumbnail: createProductResourceDto.thumbnail,
                }),
                downloadable: createProductResourceDto.downloadable,
            };

            // Create new resource with generated ID
            const resource = new ProductResource(resourceData);
            const multimediaToCreate: NewMultimedia[] = [];
            if (resource.thumbnail) {
                multimediaToCreate.push({
                    hostId: product.host.id,
                    usageType: MultimediaUsageType.THUMBNAIL,
                    type: resource.thumbnail.type,
                    source: resource.thumbnail.source,
                    path: resource.thumbnail.path,
                    filename: resource.thumbnail.filename,
                    description: resource.thumbnail.description,
                    orderIndex: resource.thumbnail.order,
                });
            }

            if (resourceData.url) {
                multimediaToCreate.push({
                    hostId: product.host.id,
                    usageType: MultimediaUsageType.RESOURCE,
                    type: resource.type,
                    source: resource.source || MultimediaSource.APP,
                    path: resource.url,
                    filename: resource.fileName,
                    description: resource.description,
                    orderIndex: resource.order,
                });
            }

            if (multimediaToCreate.length > 0) {
                const createdMultimedia = await this.multimediaRepository.createMany(multimediaToCreate, tx);

                resource.thumbnailId = createdMultimedia.find(
                    (multimedia) => multimedia.usageType === MultimediaUsageType.THUMBNAIL,
                )?.id;
                resource.multimediaId = createdMultimedia.find(
                    (multimedia) => multimedia.usageType === MultimediaUsageType.RESOURCE,
                )?.id;
            }

            // Save resource
            const statusId = (await this.statusRepository.findByName(Status.ACTIVE))?.id;
            const createdResource = await this.productResourcesRepository.create(
                {
                    statusId: statusId!,
                    productId: product.id!,
                    orderIndex: resource.order,
                    title: resource.title,
                    type: resource.type,
                    duration: resource.duration?.toPrecision(2),
                    description: resource.description,
                    longDescription: resource.longDescription,
                    downloadable: resource.downloadable,
                    parentId: parentResourceId,
                    fileId: resource.fileId,
                    size: resource.size?.toPrecision(2),
                    preview: resource.preview,
                    totalViews: 0,
                    thumbnailId: resource.thumbnailId,
                    multimediaId: resource.multimediaId,
                },
                tx,
            );

            // Generate signed URL if source is APP
            if (resource.url) {
                const strategy = this.resourceStrategyFactory.getStrategy(resource.source as MultimediaSource);
                if (strategy)
                    resource.publicUrl = await strategy.getPublicUrl(
                        {
                            url: resource.url,
                            source: resource.source as MultimediaSource,
                        },
                        ContentMode.INLINE,
                    );
            }

            // // Update product resource metrics
            // await this.updateProductResourceMetrics(hostId, productId);

            // Return the created resource with all its data
            return resource;
        });
    }
}
