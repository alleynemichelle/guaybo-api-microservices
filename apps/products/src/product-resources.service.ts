import { v4 as uuidv4 } from 'uuid';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { MultimediaSource } from 'apps/libs/common/enums/multimedia-source.enum';
import { ProductResource, ProductResourceType } from 'apps/libs/entities/products/product-resource.entity';
import { DatabaseKeys } from 'apps/libs/common/enums/database-keys.enum';
import { getUTCDate } from 'apps/libs/common/utils/date';
import { IProductsRepository } from 'apps/libs/repositories/products/products-repository.interface';
import {
    ProductResourceResponse,
    ProductResourcesWithMetricsResponse,
    ProductResourceMetrics,
} from './constants/get-product-resources.response';
import { Status } from 'apps/libs/common/enums/status.enum';
import { ProductStatus } from 'apps/libs/common/enums/product-status.enum';
import { IHostsRepository } from 'apps/libs/repositories/hosts/hosts-repository.interface';
import { Timer } from 'apps/libs/api/decorators';
import { ProductResourceMetrics as ProductResourceMetricsEntity } from 'apps/libs/entities/products/product.entity';
import { ProductProgress, ProductProgressStatus } from 'apps/libs/entities/products/product-progress.entity';
import { IYouTubeRepository } from 'apps/libs/repositories/youtube/youtube.interface';
import { CloudFrontCdnService } from 'apps/libs/repositories/cdn/cloudfront-cdn.service';
import { ProductsErrorCodes } from 'apps/libs/common/constants/error-codes.constant';
import { QuestionResponseDto } from 'apps/libs/common/dto/question-response.dto';
import { ContentMode } from 'apps/libs/common/enums/content-mode.enum';

import { UpdateProductResourceProgressDto } from './dto/update-product-resource-progress.dto';
import { ResourceOrderItem } from './dto/update-product-resources-order.dto';
import { CreateProductResourceDto } from './dto/create-product-resource.dto';
import { ResourceStrategyFactory } from './resource-strategies/resource-strategy.factory';
import { UpdateTrackingMarkerDto } from './dto/update-tracking-marker.dto';
import { ProductAccessResponseDto } from './dto/product-access-response.dto';
import { QuestionsService } from './questions.service';
import { UpdateProductResourceDto } from './dto/update-product-resource.dto';

@Injectable()
export class ProductResourcesService {
    private readonly cfDomain: string = this.configService.get('CLOUDFRONT_DOMAIN') as string;

    constructor(
        @Inject('ProductsRepository') private readonly productsRepository: IProductsRepository,
        @Inject('HostsRepository') private readonly hostsRepository: IHostsRepository,
        @Inject('YouTubeRepository') private readonly youtubeRepository: IYouTubeRepository,
        private readonly configService: ConfigService,
        private readonly resourceStrategyFactory: ResourceStrategyFactory,
        private readonly cloudFrontCdnService: CloudFrontCdnService,
        private readonly questionsService: QuestionsService,
    ) {}

    /**
     * Calculates resource metrics for a product based on all its resources
     */
    @Timer('calculateProductResourceMetrics')
    private async calculateProductResourceMetrics(
        hostId: string,
        productId: string,
    ): Promise<ProductResourceMetricsEntity> {
        // Get all resources for the product
        const allResources = await this.productsRepository.getProductResources(
            hostId,
            productId,
            {},
            'duration,size,type',
        );

        // If no resources, return zeros
        if (allResources.length === 0) {
            return {
                totalResources: 0,
                totalDuration: 0,
                totalSize: 0,
                totalSections: 0,
            };
        }

        // Calculate metrics
        const totalResources = allResources.filter((res) => res.type === ProductResourceType.RESOURCE).length;
        const totalDuration = Math.round(allResources.reduce((sum, res) => sum + (res.duration || 0), 0));
        const totalSize = Math.round(allResources.reduce((sum, res) => sum + (res.size || 0), 0));
        const totalSections = allResources.filter((res) => res.type === ProductResourceType.SECTION).length;

        return {
            totalResources,
            totalDuration,
            totalSize,
            totalSections,
        };
    }

    /**
     * Updates resource metrics in product
     */
    @Timer('updateProductResourceMetrics')
    private async updateProductResourceMetrics(hostId: string, productId: string): Promise<void> {
        const metrics = await this.calculateProductResourceMetrics(hostId, productId);

        // Update product with new metrics
        await this.productsRepository.patchProduct(hostId, productId, {
            resourceMetrics: metrics,
            updatedAt: getUTCDate().toISOString(),
        });
    }

    /**
     * Get YouTube video duration from URL
     * @param url YouTube video URL
     * @returns Duration in minutes or null if not found
     */
    private async getYouTubeDuration(url: string): Promise<number | null> {
        try {
            // Extract video ID from YouTube URL
            const videoId = this.youtubeRepository.extractVideoId(url);

            if (!videoId) {
                console.warn(`Could not extract video ID from YouTube URL: ${url}`);
                return null;
            }

            // Get video information from YouTube API
            const youtubeVideo = await this.youtubeRepository.getVideo(videoId);

            if (youtubeVideo?.duration) {
                console.log(`YouTube video duration obtained: ${youtubeVideo.duration} minutes`);
                return youtubeVideo.duration;
            }

            return null;
        } catch (error) {
            console.error('Error getting YouTube video duration:', error);
            return null;
        }
    }

    async createProductResource(
        hostId: string,
        productId: string,
        createProductResourceDto: CreateProductResourceDto,
    ): Promise<ProductResource> {
        // Verify product exists
        const host = await this.hostsRepository.getHost(hostId);
        if (!host) throw new BadRequestException(ProductsErrorCodes.HostNotFound);

        const product = await this.productsRepository.getProduct(hostId, productId);
        if (!product) {
            throw new BadRequestException(ProductsErrorCodes.ProductNotFound);
        }

        // Get duration from YouTube if source is YOUTUBE and duration is not provided
        let duration = createProductResourceDto.duration;
        if (createProductResourceDto.source === MultimediaSource.YOUTUBE && createProductResourceDto.url)
            duration = (await this.getYouTubeDuration(createProductResourceDto.url)) ?? duration;

        const resourceData = {
            productId,
            hostId,
            parentId: createProductResourceDto.parentId,
            title: createProductResourceDto.title,
            description: createProductResourceDto.description,
            type: createProductResourceDto.type,
            quiz: createProductResourceDto.quiz,
            survey: createProductResourceDto.survey,
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
            recordId: uuidv4(),
            recordType: DatabaseKeys.PRODUCT_RESOURCE,
            createdAt: getUTCDate().toISOString(),
            updatedAt: getUTCDate().toISOString(),
            recordStatus: Status.ACTIVE,
            longDescription: createProductResourceDto.longDescription,
            ...(createProductResourceDto.thumbnail?.path && {
                thumbnail: createProductResourceDto.thumbnail,
            }),
            downloadable: createProductResourceDto.downloadable,
        };

        // Create new resource with generated ID
        const resource = new ProductResource(resourceData);

        // Save resource
        const createdResource = await this.productsRepository.createProductResource(hostId, productId, resource);

        // Generate signed URL if source is APP
        if (createdResource.url) {
            const strategy = this.resourceStrategyFactory.getStrategy(createdResource.source as MultimediaSource);
            if (strategy)
                createdResource.publicUrl = await strategy.getPublicUrl(
                    {
                        url: createdResource.url,
                        source: createdResource.source as MultimediaSource,
                    },
                    ContentMode.INLINE,
                );
        }

        // Update product resource metrics
        await this.updateProductResourceMetrics(hostId, productId);

        return createdResource;
    }

    async getProductResources(
        hostId: string,
        productId: string,
        filters?: Record<string, any>,
        userId?: string,
    ): Promise<ProductResourcesWithMetricsResponse> {
        // Verify product exists
        const product = await this.productsRepository.getProduct(hostId, productId, 'recordId,productType');
        if (!product) throw new BadRequestException(ProductsErrorCodes.ProductNotFound);

        // Get all resources
        const allResources = await this.productsRepository.getProductResources(hostId, productId, filters);

        // Get user progress if userId is provided
        let userProgress: ProductProgress | null = null;
        if (userId) userProgress = await this.productsRepository.getProductProgress(userId, productId);

        // Create a map of completed resources for quick lookup
        const completedResourcesMap = new Map<string, boolean>();
        if (userProgress?.completedResources) {
            userProgress.completedResources.forEach((resource) => {
                completedResourcesMap.set(resource.resourceId, resource.completed);
            });
        }

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
        const topLevelResources = allResources.filter((resource) => !resource.parentId);

        // Calculate resource statistics
        const metrics: ProductResourceMetrics = {
            totalDuration: this.calculateTotalDuration(allResources),
            totalSections: this.countResourcesByType(allResources, ProductResourceType.SECTION),
            totalResources: this.countResourcesByType(allResources, ProductResourceType.RESOURCE),
            totalSize: Math.round(allResources.reduce((sum, res) => sum + (res.size || 0), 0)),
        };

        // Build the hierarchy with the presigned URLs and completion status
        const resources = await this.buildHierarchicalResourceResponse(topLevelResources, allResources, {
            isPublic: false,
            completedResourcesMap,
        });

        // Return the new response format
        return {
            metrics,
            resources,
            progress: {
                total: userProgress?.progress || 0,
                status: userProgress?.progressStatus || ProductProgressStatus.NOT_STARTED,
                trackingMarker: userProgress?.trackingMarker,
            },
        };
    }

    /**
     * Gets public resources (preview = true) of a product
     */
    async getPublicProductResources(hostId: string, productId: string): Promise<ProductResourcesWithMetricsResponse> {
        // Verify product exists and is public
        const product = await this.productsRepository.getProduct(hostId, productId);
        if (!product || product.recordStatus == Status.DELETED || product.productStatus !== ProductStatus.PUBLISHED) {
            throw new BadRequestException(ProductsErrorCodes.ProductNotFound);
        }

        // Get all resources
        const allResources = await this.productsRepository.getProductResources(hostId, productId);

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
            totalDuration: this.calculateTotalDuration(allResources),
            totalSections: this.countResourcesByType(allResources, ProductResourceType.SECTION),
            totalResources: this.countResourcesByType(allResources, ProductResourceType.RESOURCE),
            totalSize: Math.round(allResources.reduce((sum, res) => sum + (res.size || 0), 0)),
        };

        // Now build the response hierarchy with the presigned URLs
        const resources = await this.buildHierarchicalResourceResponse(topLevelResources, allResources, {
            isPublic: true,
        });

        // Return the new response format
        return {
            metrics,
            resources,
        };
    }

    async getProductResource(
        hostId: string,
        productId: string,
        resourceId: string,
        userId?: string,
        contentMode?: ContentMode,
    ): Promise<ProductResource> {
        // Get resource
        const resource = await this.productsRepository.getProductResource(hostId, productId, resourceId);
        if (!resource) throw new BadRequestException(ProductsErrorCodes.ProductResourceNotFound);

        // If the resource is a quiz or survey, get the questions and user's answers
        if (userId && (resource.type === ProductResourceType.QUIZ || resource.type === ProductResourceType.SURVEY)) {
            const questions = await this.questionsService.getQuestions(productId, resourceId);
            const userAnswers = await this.questionsService.getUserAnswers(userId, resourceId);
            const answersMap = new Map(userAnswers.map((answer) => [answer.questionId, answer]));

            resource.questions = questions.map((question) => {
                const userAnswer = answersMap.get(question.recordId);
                const questionResponse: QuestionResponseDto = {
                    recordId: question.recordId,
                    text: question.text,
                    questionType: question.questionType,
                    order: question.order,
                    options: question.options?.map((opt) => ({
                        recordId: opt.recordId,
                        text: opt.text,
                    })),
                    explanation: question.explanation,
                    ratingScale: question.ratingScale,
                    minRatingLabel: question.minRatingLabel,
                    maxRatingLabel: question.maxRatingLabel,
                    required: question.required,
                    userAnswer: userAnswer
                        ? {
                              selectedOptionIds: userAnswer.selectedOptionIds,
                              answerText: userAnswer.answerText,
                              ratingValue: userAnswer.ratingValue,
                          }
                        : undefined,
                };
                return questionResponse;
            });
        }

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

        return resource;
    }

    async incrementResourceViews(hostId: string, productId: string, resourceId: string): Promise<void> {
        const resource = await this.productsRepository.getProductResource(hostId, productId, resourceId);
        if (!resource) throw new BadRequestException(ProductsErrorCodes.ProductResourceNotFound);

        await this.productsRepository.incrementResourceViews(hostId, productId, resourceId);
    }

    async updateProductResource(
        hostId: string,
        productId: string,
        resourceId: string,
        updateData: Partial<UpdateProductResourceDto>,
    ): Promise<void> {
        // Verify product exists
        const product = await this.productsRepository.getProduct(hostId, productId);
        if (!product) throw new BadRequestException(ProductsErrorCodes.ProductNotFound);

        // Verify resource exists
        const resource = await this.productsRepository.getProductResource(hostId, productId, resourceId);
        if (!resource) {
            throw new BadRequestException(ProductsErrorCodes.ProductResourceNotFound);
        }

        // Get duration from YouTube if source is YOUTUBE and duration is not provided
        let duration = updateData.duration;
        if (updateData.source === MultimediaSource.YOUTUBE && updateData.url)
            duration = (await this.getYouTubeDuration(updateData.url)) ?? duration;

        // Update resource
        const updatedResource = new ProductResource({
            ...resource,
            ...updateData,
            ...(duration !== undefined && { duration }),
            updatedAt: getUTCDate().toISOString(),
        });

        await this.productsRepository.updateProductResource(hostId, productId, resourceId, updatedResource);

        // Update product resource metrics if relevant attributes changed
        const relevantFieldsChanged = ['duration', 'size', 'type'].some((field) => field in updateData);
        if (relevantFieldsChanged) {
            await this.updateProductResourceMetrics(hostId, productId);
        }
    }

    async deleteAllProductResources(hostId: string, productId: string): Promise<void> {
        const resources = await this.productsRepository.getProductResources(hostId, productId);
        const resourceIds = resources.map((resource) => resource.recordId);

        if (resourceIds.length === 0) return;

        await this.productsRepository.batchDeleteProductResources(hostId, productId, resourceIds);

        // delete all resources from cdn
        for (const resource of resources) {
            await this.deleteResource(resource);
            if (resource.thumbnail) await this.deleteResource(resource.thumbnail);
        }

        // update product resource metrics
        await this.productsRepository.patchProduct(hostId, productId, {
            resourceMetrics: {
                totalDuration: 0,
                totalSections: 0,
                totalResources: 0,
                totalSize: 0,
            },
            updatedAt: getUTCDate().toISOString(),
        });
    }

    async deleteProductResource(hostId: string, productId: string, resourceId: string): Promise<void> {
        // Get all resources to find children
        const resource = await this.productsRepository.getProductResource(hostId, productId, resourceId);
        if (!resource) {
            throw new BadRequestException(ProductsErrorCodes.ProductResourceNotFound);
        }

        const allResources = await this.productsRepository.getProductResources(hostId, productId, {
            parentId: resourceId,
        });

        // Delete all children resources first
        for (const child of allResources || []) {
            await this.deleteResource(child);
            if (child.thumbnail) await this.deleteResource(child.thumbnail);

            // Delete child resource from database
            await this.productsRepository.deleteProductResource(hostId, productId, child.recordId);
            console.log(`Deleted child resource: ${child.recordId}`);
        }

        // Delete the main resource file if needed
        await this.deleteResource(resource);
        if (resource.thumbnail) await this.deleteResource(resource.thumbnail);

        // Finally delete the main resource from database
        await this.productsRepository.deleteProductResource(hostId, productId, resource.recordId);
        console.log(`Deleted main resource: ${resourceId}`);

        // Update product resource metrics
        await this.updateProductResourceMetrics(hostId, productId);
    }

    private async deleteResource(data: { path?: string; url?: string; source?: MultimediaSource }): Promise<void> {
        if (data.url && data.source) {
            const strategy = this.resourceStrategyFactory.getStrategy(data.source);
            if (strategy) {
                await strategy.deleteResource(data);
            }
        }

        if (data.path && data.source) {
            const strategy = this.resourceStrategyFactory.getStrategy(data.source);
            if (strategy) {
                await strategy.deleteResource(data);
            }
        }
    }

    /**
     * Recursively find all children IDs of a resource
     */
    private findAllChildrenIds(parentId: string, allResources: ProductResource[]): string[] {
        const directChildren = allResources.filter((resource) => resource.parentId === parentId);

        if (directChildren.length === 0) {
            return [];
        }

        // Get direct children IDs
        const directChildrenIds = directChildren.map((child) => child.recordId);

        // Get indirect children IDs (children of children)
        const indirectChildrenIds = directChildrenIds.flatMap((childId) =>
            this.findAllChildrenIds(childId, allResources),
        );

        // Combine all children IDs
        return [...directChildrenIds, ...indirectChildrenIds];
    }

    /**
     * Calculate the total duration from all resources
     */
    private calculateTotalDuration(resources: ProductResource[]): number {
        return Math.round(
            resources.reduce((total, resource) => {
                return total + (resource.duration || 0);
            }, 0),
        );
    }

    /**
     * Count resources by their type
     */
    private countResourcesByType(resources: ProductResource[], type: ProductResourceType): number {
        return resources.filter((resource) => resource.type === type).length;
    }

    /**
     * Updates the last resource visited by the user in the product progress
     */
    async updateProductMarker(
        userId: string,
        productId: string,
        hostId: string,
        updateTrackingMarkerDto: UpdateTrackingMarkerDto,
    ): Promise<ProductProgress> {
        const { resourceId, seconds } = updateTrackingMarkerDto;
        if (!resourceId) throw new BadRequestException(ProductsErrorCodes.LastResourceIdIsRequired);

        const currentProgress = await this.productsRepository.getProductProgress(userId, productId);

        // if not progress, create new one
        const progressData = new ProductProgress({
            ...(currentProgress || {}),
            hostId,
            productId,
            userId,
            trackingMarker: {
                resourceId,
                seconds,
            },
            progress: currentProgress?.progress || 0,
            completedResources: currentProgress?.completedResources || [],
            progressStatus: currentProgress?.progressStatus || ProductProgressStatus.IN_PROGRESS,
        });

        this.productsRepository.updateProductProgress(userId, productId, progressData);

        return progressData;
    }

    /**
     * Updates the order of multiple product resources in a batch operation
     */
    @Timer('updateProductResourcesOrder')
    async updateProductResourcesOrder(
        hostId: string,
        productId: string,
        resourceOrders: ResourceOrderItem[],
    ): Promise<void> {
        // Get all resources that will be updated
        const resourceIds = resourceOrders.map((item) => item.recordId);
        const existingResources = await this.productsRepository.getProductResources(
            hostId,
            productId,
            {},
            'recordId,order,parentId',
        );

        // Verify that all resources exist
        const existingResourceIds = existingResources.map((resource) => resource.recordId);
        const nonExistentResourceIds = resourceIds.filter((id) => !existingResourceIds.includes(id));

        if (nonExistentResourceIds.length > 0) {
            throw new BadRequestException(`Resources with IDs ${nonExistentResourceIds.join(', ')} not found`);
        }

        // Create a map for quick lookup of existing resources by ID
        const existingResourcesMap = existingResources.reduce(
            (map, resource) => {
                map[resource.recordId] = resource;
                return map;
            },
            {} as Record<string, ProductResource>,
        );

        // Prepare batch update only for resources whose order has changed
        const timestamp = getUTCDate().toISOString();
        const updates = resourceOrders
            .filter((resourceOrder) => {
                const existingResource = existingResourcesMap[resourceOrder.recordId];
                const orderChanged = existingResource.order !== resourceOrder.order;
                const parentIdChanged =
                    resourceOrder.parentId !== undefined && existingResource.parentId !== resourceOrder.parentId;

                return orderChanged || parentIdChanged;
            })
            .map((resourceOrder) => ({
                resourceId: resourceOrder.recordId,
                data: {
                    order: resourceOrder.order,
                    updatedAt: timestamp,
                    ...(resourceOrder.parentId !== undefined ? { parentId: resourceOrder.parentId } : {}),
                },
            }));

        // Only execute batch update if there are changes
        if (updates.length > 0) {
            await this.productsRepository.batchUpdateProductResources(hostId, productId, updates);
        }
    }

    @Timer('updateProductProgress')
    async updateProductResourceProgress(
        userId: string,
        productId: string,
        hostId: string,
        resourceId: string,
        updateProductResourceProgressDto: UpdateProductResourceProgressDto,
    ): Promise<ProductProgress> {
        // Get all resources that count towards progress (RESOURCE, QUIZ, SURVEY)
        const allProductResources = await this.productsRepository.getProductResources(
            hostId,
            productId,
            {},
            'recordId,type',
        );

        const progressableResourceIds = allProductResources
            .filter(
                (r) =>
                    r.type === ProductResourceType.RESOURCE ||
                    r.type === ProductResourceType.QUIZ ||
                    r.type === ProductResourceType.SURVEY,
            )
            .map((r) => r.recordId);

        if (!progressableResourceIds.includes(resourceId)) {
            throw new BadRequestException(ProductsErrorCodes.ProductResourceNotFound);
        }

        // get current progress if exists
        const currentProgress = await this.productsRepository.getProductProgress(userId, productId);

        // get completed resources from current progress and ensure they are in the product resources
        let completedResources = currentProgress?.completedResources || [];
        completedResources = completedResources.filter((r) => progressableResourceIds.includes(r.resourceId));

        let date = getUTCDate().toISOString();
        const existingResourceIndex = completedResources.findIndex((r) => r.resourceId === resourceId);

        // if resource is already completed, update it
        if (existingResourceIndex !== -1) {
            completedResources[existingResourceIndex] = {
                resourceId,
                completed: updateProductResourceProgressDto.completed,
                ...(updateProductResourceProgressDto.completed ? { completedAt: date } : {}),
            };
        } else {
            completedResources.push({
                resourceId,
                completed: updateProductResourceProgressDto.completed,
                ...(updateProductResourceProgressDto.completed ? { completedAt: date } : {}),
            });
        }

        const totalResources = progressableResourceIds.length;
        const completedCount = completedResources.filter((r) => r.completed).length;
        const completedResourcesCount = completedCount > totalResources ? totalResources : completedCount;
        const progress = totalResources > 0 ? Math.round((completedResourcesCount / totalResources) * 100) : 0;

        const progressStatus =
            progress === 100
                ? ProductProgressStatus.COMPLETED
                : progress > 0
                  ? ProductProgressStatus.IN_PROGRESS
                  : ProductProgressStatus.NOT_STARTED;

        const progressData = new ProductProgress({
            ...(currentProgress || {}),
            hostId,
            productId,
            userId,
            progress,
            progressStatus,
            completedResources,
        });

        this.productsRepository.updateProductProgress(userId, productId, progressData);

        return progressData;
    }

    /**
     * Builds the hierarchical response of resources for both public and private endpoints
     * @param parentResources Parent resources to process
     * @param allResources All resources for hierarchy
     * @param options Options to control public/private response and completed map
     */
    private async buildHierarchicalResourceResponse(
        parentResources: ProductResource[],
        allResources: ProductResource[],
        options: {
            isPublic: boolean;
            completedResourcesMap?: Map<string, boolean>;
        },
    ): Promise<ProductResourceResponse[]> {
        return Promise.all(
            parentResources
                .sort((a, b) => a.order - b.order)
                .map(async (parent) => {
                    const children = allResources.filter((c) => c.parentId === parent.recordId);

                    // Create the base response object
                    const resourceResponse: ProductResourceResponse = {
                        recordId: parent.recordId,
                        type: parent.type,
                        title: parent.title,
                        order: parent.order,
                    };

                    // Add optional attributes if they exist

                    if (parent.preview !== undefined) resourceResponse.preview = parent.preview;
                    if (parent.fileName) resourceResponse.fileName = parent.fileName;
                    if (parent.size) resourceResponse.size = parent.size;
                    if (parent.duration) resourceResponse.duration = parent.duration;
                    if (parent.source) resourceResponse.source = parent.source;
                    if (parent.processingStatus) resourceResponse.processingStatus = parent.processingStatus;
                    if (parent.description) resourceResponse.description = parent.description;
                    if (parent.fileType) resourceResponse.fileType = parent.fileType;
                    if (!options.isPublic && parent.fileId) resourceResponse.fileId = parent.fileId;
                    if (!options.isPublic && parent.encodeProgress)
                        resourceResponse.encodeProgress = parent.encodeProgress;

                    if (!options.isPublic && parent.url) resourceResponse.url = parent.url;
                    if (!options.isPublic && parent.longDescription)
                        resourceResponse.longDescription = parent.longDescription;

                    if (!options.isPublic && options.completedResourcesMap)
                        resourceResponse.completed = options.completedResourcesMap.get(parent.recordId) || false;

                    resourceResponse.downloadable = parent.downloadable || false;

                    if (parent.thumbnail?.path) {
                        resourceResponse.thumbnail = {
                            ...parent.thumbnail,
                            path:
                                parent.thumbnail.source === MultimediaSource.APP
                                    ? `https://${this.cfDomain}/${parent.thumbnail.path}`
                                    : parent.thumbnail.path,
                        };
                    }

                    // Add children recursively if they exist
                    if (children.length > 0) {
                        resourceResponse.children = await this.buildHierarchicalResourceResponse(
                            children,
                            allResources,
                            options,
                        );
                    }

                    return resourceResponse;
                }),
        );
    }

    /**
     * Generates signed cookies for accessing all APP resources of a product
     * @param hostId Host identifier
     * @param productId Product identifier
     * @param expirationMinutes Cookie expiration time in minutes (default: 60)
     * @returns Product access response with cookie information
     */
    async generateProductAccess(
        hostId: string,
        productId: string,
        expirationMinutes: number = 60,
    ): Promise<{ cookies: Record<string, string>; response: ProductAccessResponseDto }> {
        // Generate signed cookies for the product
        const url = `https://${this.cfDomain}/private/hosts/${hostId}/products/contents/*`;

        const cookies = this.cloudFrontCdnService.generateSignedCookies(url, expirationMinutes);
        const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000).toISOString();

        const response: ProductAccessResponseDto = {
            success: true,
            expiresInMinutes: expirationMinutes,
            message: `Access granted to product resources for ${expirationMinutes} minutes`,
            expiresAt,
        };

        return { cookies, response };
    }
}
