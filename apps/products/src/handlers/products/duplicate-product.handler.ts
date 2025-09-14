import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

import { BaseProduct } from 'apps/libs/domain/products/product.entity';
import { HostsRepository } from 'apps/libs/database/drizzle/repositories/hosts.repository';
import { ProductsErrorCodes } from 'apps/libs/common/constants/error-codes.constant';
import { Status } from 'apps/libs/common/enums/status.enum';
import { ProductType } from 'apps/libs/common/enums/product-type.enum';
import { cleanAlias } from 'apps/libs/common/utils/text-formatters';
import { ProductsRepository } from 'apps/libs/database/drizzle/repositories/products.repository';
import { setProduct } from 'apps/libs/domain/products/product-factory';
import { ProductStatus } from 'apps/libs/common/enums/product-status.enum';
import { generateId } from 'apps/libs/common/utils/generate-id';
import { ProductS3Service } from 'apps/libs/integrations/s3/product-s3.service';
import { TelegramRepository } from 'apps/libs/integrations/telegram/telegram.repository';
import { TelegramTemplate } from 'apps/libs/common/enums/telegram-template.enum';
import { ProductNotification } from 'apps/libs/domain/products/product-notification.entity';
import { ProductResource } from 'apps/libs/domain/products/product-resource.entity';
import { getUTCDate } from 'apps/libs/common/utils/date';
import { ProductsDynamoRepository } from 'apps/libs/database/dynamodb/repositories/products.repository';

import { mapProduct } from '../../utils/map-product';
import { processProductDates } from '../../utils/process-product-dates';
import { DuplicateProductDto } from '../../dto/requests/duplicate-product.dto';

@Injectable()
export class DuplicateProductHandler {
    private readonly cfDomain: string = this.configService.get('CLOUDFRONT_DOMAIN') as string;
    constructor(
        private readonly productsDynamoRepository: ProductsDynamoRepository,
        private readonly productsRepository: ProductsRepository,
        private readonly hostsRepository: HostsRepository,
        private readonly configService: ConfigService,
        private readonly productS3Service: ProductS3Service,
        private readonly telegramRepository: TelegramRepository,
    ) {}

    async execute(hostId: string, productId: string, duplicateProductDto: DuplicateProductDto): Promise<BaseProduct> {
        try {
            // Check if the original product exists
            const host = await this.hostsRepository.findByRecordId(hostId);
            if (!host) throw new BadRequestException(ProductsErrorCodes.HostNotFound);

            const originalProduct = await this.productsDynamoRepository.getProduct(hostId, productId);
            if (!originalProduct || originalProduct.recordStatus == Status.DELETED)
                throw new BadRequestException(ProductsErrorCodes.ProductNotFound);

            const hostAlias = host.alias;
            const { name, alias: rawAlias, dates } = duplicateProductDto;

            if (originalProduct.productType == ProductType.EVENT && !dates) {
                throw new BadRequestException(ProductsErrorCodes.DatesRequired);
            }

            // Process dates if provided
            const processedDates = dates ? processProductDates(dates) : undefined;

            // Set alias
            let alias = cleanAlias(rawAlias);
            const aliasNumber = (await this.productsRepository.countByAlias(host.id!, alias)) || 0;
            if (aliasNumber > 0) alias = `${alias}-${aliasNumber + 1}`;

            // Omit specific fields from the original product that should not be copied
            const {
                recordId,
                alias: originalAlias,
                createdAt,
                updatedAt,
                hostId: _,
                PK,
                SK,
                totalBookings,
                dates: originalDates,
                ...productData
            } = originalProduct;

            // Create new product with updated data
            const newProduct = setProduct({
                ...productData,
                name,
                alias,
                hostId,
                productStatus: ProductStatus.DRAFT,
                ...(processedDates && { dates: processedDates }),
                ...(originalProduct.productType == ProductType.ONE_TO_ONE_SESSION &&
                    originalProduct.dates && {
                        dates: originalProduct.dates.map((date) => {
                            return {
                                ...date,
                                recordId: generateId(),
                            };
                        }),
                    }),
                plans: originalProduct.plans?.map((plan) => {
                    return {
                        ...plan,
                        totalBookings: 0,
                        recordId: generateId(),
                    };
                }),
                discounts: originalProduct.discounts?.map((discount) => {
                    return {
                        ...discount,
                        totalBookings: 0,
                        recordId: generateId(),
                    };
                }),
                discountCodes: originalProduct.discountCodes?.map((code) => {
                    return {
                        ...code,
                        totalBookings: 0,
                        recordId: generateId(),
                    };
                }),
                totalBookings: 0,
            });

            await this.productsDynamoRepository.createProduct(newProduct);
            await this.productsRepository.create(
                {
                    recordId: newProduct.recordId,
                    name: newProduct.name,
                    alias: newProduct.alias!,
                    hostId: host.id!,
                    totalBookings: newProduct.totalBookings,
                },
                newProduct.productStatus,
                newProduct.productType,
            );

            // Copy notifications from the original product
            await this.copyNotifications(hostId, productId, newProduct.recordId!);

            // Copy product resources from the original product to the new product
            //    await this.copyProductResources(hostId, productId, newProduct.recordId!);

            // Prepare the new product to return
            const mappedProduct = mapProduct(newProduct, this.cfDomain);
            await this.productS3Service.addProductToS3(hostAlias ?? '', mappedProduct);

            // Send Telegram notification
            await this.telegramRepository.sendMessage({
                template: TelegramTemplate.PRODUCT_DUPLICATED,
                data: {
                    createdAt: new Date().toLocaleString('es-VE', { timeZone: 'America/Caracas' }),
                    productName: newProduct.name,
                    productAlias: newProduct.alias,
                    hostAlias: host.alias,
                    hostId: host.recordId,
                    productType: newProduct.productType,
                },
            });

            return mappedProduct;
        } catch (error) {
            console.error('Error duplicating product:', error);
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException(ProductsErrorCodes.ProductDuplicationFailed);
        }
    }

    private async copyNotifications(hostId: string, sourceProductId: string, targetProductId: string): Promise<void> {
        const notifications = await this.productsDynamoRepository.getNotifications(hostId, sourceProductId);

        // Only copy if there are notifications
        if (notifications && notifications.length > 0) {
            // Filter only editable notifications that are not system notifications
            const editableNotifications = notifications.filter(
                (notification) => notification.editable && !notification.system,
            );

            // Copy each notification to the new product
            for (const notification of editableNotifications) {
                const { recordId, createdAt, updatedAt, ...notificationData } = notification;
                const newNotification = new ProductNotification(notificationData);
                await this.productsDynamoRepository.createNotification(hostId, targetProductId, newNotification);
            }
        }
    }

    // /**
    //  * Copies all product resources from source product to target product
    //  * Maintains hierarchy by mapping parent IDs to new IDs
    //  */
    // private async copyProductResources(
    //     hostId: string,
    //     sourceProductId: string,
    //     targetProductId: string,
    // ): Promise<void> {
    //     // Get all resources from the source product
    //     const sourceResources = await this.productsRepository.getProductResources(hostId, sourceProductId);
    //     if (!sourceResources || sourceResources.length === 0) return;

    //     // Separate resources into levels based on their hierarchy
    //     const topLevelResources = sourceResources.filter((resource) => !resource.parentId);
    //     const childResources = sourceResources.filter((resource) => resource.parentId);

    //     // Map to track old recordId -> new recordId mapping for parentId updates
    //     const idMapping = new Map<string, string>();

    //     // Array to accumulate all resources for batch insert
    //     const resourcesToCreate: ProductResource[] = [];

    //     // Function to prepare a resource for creation
    //     const prepareResource = (resource: any, newParentId?: string): ProductResource => {
    //         const { recordId, productId, createdAt, updatedAt, PK, SK, parentId, ...resourceData } = resource;

    //         // Generate new ID for the resource
    //         const newResourceId = uuidv4();
    //         idMapping.set(recordId, newResourceId);

    //         // Create new resource with updated data
    //         return new ProductResource({
    //             ...resourceData,
    //             recordId: newResourceId,
    //             productId: targetProductId,
    //             parentId: newParentId,
    //             createdAt: getUTCDate().toISOString(),
    //             updatedAt: getUTCDate().toISOString(),
    //         });
    //     };

    //     // First, prepare all top-level resources (no parentId)
    //     for (const resource of topLevelResources.sort((a, b) => a.order - b.order)) {
    //         const newResource = prepareResource(resource);
    //         resourcesToCreate.push(newResource);
    //     }

    //     // Then prepare child resources in multiple passes until all are processed
    //     const remainingResources: ProductResource[] = [...childResources];

    //     while (remainingResources.length > 0) {
    //         const resourcesProcessedInThisPass: ProductResource[] = [];

    //         for (let i = remainingResources.length - 1; i >= 0; i--) {
    //             const resource = remainingResources[i];

    //             // Check if the parent has been mapped
    //             if (resource.parentId && idMapping.has(resource.parentId)) {
    //                 const newParentId = idMapping.get(resource.parentId);
    //                 if (newParentId) {
    //                     const newResource = prepareResource(resource, newParentId);
    //                     resourcesToCreate.push(newResource);
    //                     resourcesProcessedInThisPass.push(resource);
    //                     remainingResources.splice(i, 1);
    //                 }
    //             }
    //         }

    //         // If no resources were processed in this pass, we have orphaned resources
    //         if (resourcesProcessedInThisPass.length === 0 && remainingResources.length > 0) {
    //             console.warn(
    //                 `Found orphaned resources with invalid parentIds: ${remainingResources.map((r) => r.recordId).join(', ')}`,
    //             );
    //             // Process orphaned resources as top-level resources
    //             for (const orphanedResource of remainingResources) {
    //                 const newResource = prepareResource(orphanedResource);
    //                 resourcesToCreate.push(newResource);
    //             }
    //             break;
    //         }
    //     }

    //     // Batch create all resources at once
    //     if (resourcesToCreate.length > 0) {
    //         await this.productsRepository.batchCreateProductResources(hostId, targetProductId, resourcesToCreate);
    //     }
    // }
}
