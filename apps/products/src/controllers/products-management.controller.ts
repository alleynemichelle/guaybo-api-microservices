import { Body, Controller, Delete, Get, Patch, Post, Query, UseGuards } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiSecurity,
    ApiTags,
} from '@nestjs/swagger';
import { ResponseDto } from 'apps/libs/common/api/response.entity';

import { CreateProductDto } from '../dto/requests/create-product.dto';
import { UpdateProductDto } from '../dto/requests/update-product.dto';
import { GetProductResponse } from '../constants/get-product.response';
import { GetProductNotificationResponse } from '../constants/get-product-notification.response';
import { UpdateNotificationDto } from '../dto/requests/update-notification.dto';
import { CreateNotificationDto } from '../dto/requests/create-notification.dto';
import { UpdateProductStatusDto } from '../dto/requests/update-product-status.dto';
import { DuplicateProductDto } from '../dto/requests/duplicate-product.dto';
import { CreateProductResourceDto } from '../dto/requests/create-product-resource.dto';
import { UpdateProductResourceDto } from '../dto/requests/update-product-resource.dto';
import { GetProductResourcesResponse } from '../dto/responses/get-product-resources.response';
import { MultimediaSource } from 'apps/libs/common/enums/multimedia-source.enum';
import { UpdateProductResourcesOrderDto } from '../dto/requests/update-product-resources-order.dto';
import { ValidatedParam } from 'apps/libs/common/api/decorators/validated-param.decorator';
import { JwtAuthGuard } from 'apps/libs/common/api/guards/jwt-auth-v2.guard';
import { HostOwnerGuard } from 'apps/libs/common/api/guards/owner-access-v2.guard';
import { GetProductResourceDto } from '../dto/requests/get-product-resource.dto';
import { UpdateProductHandler } from '../handlers/products/update-product.handler';
import { DeleteProductHandlers } from '../handlers/products/delete-product.handler';
import { GetPaymentMethodsHandler } from '../handlers/products/get-payment-methods.handler';
import { CreateProductHandler } from '../handlers/products/create-product.handler';
import { GetProductHandler } from '../handlers/products/get-product.handler';
import { UpdateProductStatusHandler } from '../handlers/products/update-product-status.handler';
import { GetNotificationsHandler } from '../handlers/notifications/get-notifications.handler';
import { CreateNotificationHandler } from '../handlers/notifications/create-notification.handler';
import { UpdateNotificationHandler } from '../handlers/notifications/update-notification.handler';
import { DeleteNotificationHandler } from '../handlers/notifications/delete-notification.handler';
import { DuplicateProductHandler } from '../handlers/products/duplicate-product.handler';
import { GetProductResourcesHandler } from '../handlers/product-resources/get-product-resources.handler';
import { GetProductResourceHandler } from '../handlers/product-resources/get-product-resource.handler';
import { CreateProductResourceHandler } from '../handlers/product-resources/create-product-resource.handler';
import { DeleteAllProductResourcesHandler } from '../handlers/product-resources/delete-all-product-resources.handler';
import { DeleteProductResourceHandler } from '../handlers/product-resources/delete-product-resource.handler';
import { UpdateProductResourceHandler } from '../handlers/product-resources/update-product-resource.handler';
import { UpdateProductResourcesOrderHandler } from '../handlers/product-resources/update-product-resources-order.handler';
import { ProductResourceType } from 'apps/libs/common/enums/product-resource-type.enum';
import { ProductResourceFileType } from 'apps/libs/common/enums/product-resource-file-type.enum';

@ApiSecurity('api-key')
@UseGuards(JwtAuthGuard)
@Controller('management/products')
export class ProductsManagementController {
    constructor(
        private readonly createProductHandler: CreateProductHandler,
        private readonly getProductHandler: GetProductHandler,
        private readonly updateProductHandler: UpdateProductHandler,
        private readonly deleteProductHandler: DeleteProductHandlers,
        private readonly updateProductStatusHandler: UpdateProductStatusHandler,
        private readonly getNotificationsHandler: GetNotificationsHandler,
        private readonly createNotificationHandler: CreateNotificationHandler,
        private readonly updateNotificationHandler: UpdateNotificationHandler,
        private readonly deleteNotificationHandler: DeleteNotificationHandler,
        private readonly duplicateProductHandler: DuplicateProductHandler,
        private readonly getProductResourcesHandler: GetProductResourcesHandler,
        private readonly getProductResourceHandler: GetProductResourceHandler,
        private readonly createProductResourceHandler: CreateProductResourceHandler,
        private readonly deleteAllProductResourcesHandler: DeleteAllProductResourcesHandler,
        private readonly deleteProductResourceHandler: DeleteProductResourceHandler,
        private readonly updateProductResourceHandler: UpdateProductResourceHandler,
        private readonly updateProductResourcesOrderHandler: UpdateProductResourcesOrderHandler,
    ) {}

    @ApiTags('Products')
    @ApiOperation({ summary: 'Create product' })
    @ApiCreatedResponse({
        description: 'Product created successfully',
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiBody({ type: CreateProductDto })
    @Post()
    async createProduct(@Body() createProductDto: CreateProductDto): Promise<ResponseDto> {
        try {
            const data = await this.createProductHandler.execute(createProductDto);
            return new ResponseDto('success', 201, 'ProductSuccessfullyCreated', data);
        } catch (error: any) {
            console.error('Error creating product: ', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Products')
    @ApiOperation({ summary: 'Get a product by identifier' })
    @ApiOkResponse({
        description: 'Product retrieved successfully',
        type: GetProductResponse,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiParam({
        name: 'hostId',
        description: 'Host Identifier',
        type: 'string',
        example: '2230439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @ApiParam({
        name: 'productId',
        description: 'Product Identifier',
        type: 'string',
        example: '1230439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @Get(':hostId/:productId')
    async getProductById(
        @ValidatedParam('hostId') hostId: string,
        @ValidatedParam('productId') productId: string,
    ): Promise<ResponseDto> {
        try {
            const data = await this.getProductHandler.execute(hostId, productId);
            return new ResponseDto('success', 200, 'ProductSuccessfullyRetrieved', data);
        } catch (error: any) {
            console.error('Error retrieving product:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Products')
    @ApiOperation({ summary: 'Update a product' })
    @ApiOkResponse({
        description: 'Product updated successfully',
        type: ResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'Bad Request',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'error' },
                message: {
                    type: 'string',
                    example: 'ProductNotFound | AliasAlreadyExists | DateCannotBeDeleted',
                },
                data: { type: 'object', example: {} },
            },
        },
    })
    @ApiParam({
        name: 'hostId',
        description: 'Host Identifier',
        type: 'string',
        example: '2230439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @ApiParam({
        name: 'productId',
        description: 'Product Identifier',
        type: 'string',
        example: '1230439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @ApiBody({ type: UpdateProductDto })
    @Patch(':hostId/:productId')
    async patchProduct(
        @ValidatedParam('hostId') hostId: string,
        @ValidatedParam('productId') productId: string,
        @Body() updateProductDto: UpdateProductDto,
    ): Promise<ResponseDto> {
        try {
            const data = await this.updateProductHandler.execute(hostId, productId, updateProductDto);
            return new ResponseDto('success', 200, 'ProductSuccessfullyUpdated', data);
        } catch (error: any) {
            console.error('Error updating product:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Products')
    @ApiOperation({ summary: 'Delete a product' })
    @ApiOkResponse({
        description: 'Product deleted successfully',
        type: ResponseDto,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiParam({
        name: 'hostId',
        description: 'Host Identifier',
        type: 'string',
        example: '2230439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @ApiParam({
        name: 'productId',
        description: 'Product Identifier',
        type: 'string',
        example: '1230439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @Delete(':hostId/:productId')
    async deleteProduct(
        @ValidatedParam('hostId') hostId: string,
        @ValidatedParam('productId') productId: string,
    ): Promise<ResponseDto> {
        try {
            await this.deleteProductHandler.execute(hostId, productId);
            return new ResponseDto('success', 200, 'ProductSuccessfullyDeleted', {});
        } catch (error: any) {
            console.error('Error deleting product:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Product Status')
    @ApiOperation({ summary: 'Update a product status' })
    @ApiOkResponse({
        description: 'Product status updated successfully',
        type: ResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'Bad Request',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'error' },
                message: {
                    type: 'string',
                    example: 'ProductNotFound | ProductIsNotReadyToBePublished | DateCannotBeDeleted ',
                },
                data: { type: 'object', example: {} },
            },
        },
    })
    @ApiParam({
        name: 'hostId',
        description: 'Host Identifier',
        type: 'string',
        example: '2230439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @ApiParam({
        name: 'productId',
        description: 'Product Identifier',
        type: 'string',
        example: '1230439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @ApiBody({ type: UpdateProductStatusDto })
    @Patch(':hostId/:productId/status')
    async patchProductStatus(
        @ValidatedParam('hostId') hostId: string,
        @ValidatedParam('productId') productId: string,
        @Body() updateProductStatusDto: UpdateProductStatusDto,
    ): Promise<ResponseDto> {
        try {
            await this.updateProductStatusHandler.execute(hostId, productId, updateProductStatusDto);
            return new ResponseDto('success', 200, 'ProductStatusSuccessfullyUpdated', {});
        } catch (error: any) {
            console.error('Error updating product status:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {
                cause: error.cause,
            });
        }
    }

    @ApiTags('Notifications')
    @ApiOperation({ summary: 'Get product notifications' })
    @ApiOkResponse({
        description: 'Notification retrieved successfully',
        type: GetProductNotificationResponse,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiParam({
        name: 'hostId',
        description: 'Host Identifier',
        type: 'string',
        example: '2230439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @ApiParam({
        name: 'productId',
        description: 'Product Identifier',
        type: 'string',
        example: '1230439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @Get(':hostId/:productId/notifications')
    async getNotifications(
        @ValidatedParam('hostId') hostId: string,
        @ValidatedParam('productId') productId: string,
    ): Promise<ResponseDto> {
        try {
            const data = await this.getNotificationsHandler.execute(hostId, productId);
            return new ResponseDto('success', 200, 'NotificationsSuccessfullyRetrieved', data);
        } catch (error: any) {
            console.error('Error retrieving notifications:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Notifications')
    @ApiOperation({ summary: 'Create product notifications' })
    @ApiOkResponse({
        description: 'Notification created successfully',
        type: ResponseDto,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiParam({
        name: 'hostId',
        description: 'Host Identifier',
        type: 'string',
        example: '2230439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @ApiParam({
        name: 'productId',
        description: 'Product Identifier',
        type: 'string',
        example: '1230439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @ApiParam({
        name: 'notificationId',
        description: 'Notification Identifier',
        type: 'string',
        example: '2230439a-13ea-208b-c05a-1e2e5316325a',
    })
    @ApiBody({ type: CreateNotificationDto })
    @Post(':hostId/:productId/notifications')
    async createNotification(
        @ValidatedParam('hostId') hostId: string,
        @ValidatedParam('productId') productId: string,
        @Body() createNotificationDto: CreateNotificationDto,
    ): Promise<ResponseDto> {
        try {
            const data = await this.createNotificationHandler.execute(hostId, productId, createNotificationDto);
            return new ResponseDto('success', 201, 'NotificationsSuccessfullyCreated', data);
        } catch (error: any) {
            console.error('Error creating notification:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Notifications')
    @ApiOperation({ summary: 'Update product notification' })
    @ApiOkResponse({
        description: 'Notification retrieved successfully',
        type: GetProductNotificationResponse,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiParam({
        name: 'hostId',
        description: 'Host Identifier',
        type: 'string',
        example: '2230439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @ApiParam({
        name: 'productId',
        description: 'Product Identifier',
        type: 'string',
        example: '1230439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @ApiParam({
        name: 'notificationId',
        description: 'Notification Identifier',
        type: 'string',
        example: '2230439a-13ea-208b-c05a-1e2e5316325a',
    })
    @ApiBody({ type: UpdateNotificationDto })
    @Patch(':hostId/:productId/notifications/:notificationId')
    async updateNotifications(
        @ValidatedParam('hostId') hostId: string,
        @ValidatedParam('productId') productId: string,
        @ValidatedParam('notificationId') notificationId: string,
        @Body() updateNotificationDto: UpdateNotificationDto,
    ): Promise<ResponseDto> {
        try {
            const data = await this.updateNotificationHandler.execute(
                hostId,
                productId,
                notificationId,
                updateNotificationDto,
            );
            return new ResponseDto('success', 200, 'NotificationsSuccessfullyUpdated', data);
        } catch (error: any) {
            console.error('Error updating notification:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Notifications')
    @ApiOperation({ summary: 'Delete a product notification' })
    @ApiOkResponse({
        description: 'Notification deleted successfully',
        type: ResponseDto,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiParam({
        name: 'hostId',
        description: 'Host Identifier',
        type: 'string',
        example: '2230439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @ApiParam({
        name: 'productId',
        description: 'Product Identifier',
        type: 'string',
        example: '1230439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @ApiParam({
        name: 'notificationId',
        description: 'Notification Identifier',
        type: 'string',
        example: '2230439a-13ea-208b-c05a-1e2e5316325a',
    })
    @Delete(':hostId/:productId/notifications/:notificationId')
    async deleteNotification(
        @ValidatedParam('hostId') hostId: string,
        @ValidatedParam('productId') productId: string,
        @ValidatedParam('notificationId') notificationId: string,
    ): Promise<ResponseDto> {
        try {
            await this.deleteNotificationHandler.execute(hostId, productId, notificationId);
            return new ResponseDto('success', 200, 'NotificationSuccessfullyDeleted', {});
        } catch (error: any) {
            console.error('Error deleting notification:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Products')
    @ApiOperation({ summary: 'Duplicate a product' })
    @ApiCreatedResponse({
        description: 'Product duplicated successfully',
        type: ResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'BadRequest',
        schema: {
            example: {
                status: 'error',
                code: 400,
                message: 'ProductNotFound | ProductDuplicationFailed',
                data: {},
            },
        },
    })
    @ApiParam({
        name: 'hostId',
        description: 'Host Identifier',
        type: 'string',
        example: '2230439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @ApiParam({
        name: 'productId',
        description: 'Product Identifier to duplicate',
        type: 'string',
        example: '1230439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @ApiBody({ type: DuplicateProductDto })
    @Post(':hostId/:productId/duplicates')
    async duplicateProduct(
        @ValidatedParam('hostId') hostId: string,
        @ValidatedParam('productId') productId: string,
        @Body() duplicateProductDto: DuplicateProductDto,
    ): Promise<ResponseDto> {
        try {
            const data = await this.duplicateProductHandler.execute(hostId, productId, duplicateProductDto);
            return new ResponseDto('success', 201, 'ProductSuccessfullyDuplicated', data);
        } catch (error: any) {
            console.error('Error duplicating product:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Product Resources')
    @ApiOperation({ summary: 'Create product resource' })
    @ApiCreatedResponse({
        description: 'Product resource created successfully',
        type: ResponseDto,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiParam({
        name: 'hostId',
        description: 'Host Identifier',
        type: 'string',
        example: '2230439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @ApiParam({
        name: 'productId',
        description: 'Product Identifier',
        type: 'string',
        example: '1230439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @ApiBody({ type: CreateProductResourceDto })
    @Post(':hostId/:productId/resources')
    async createProductResource(
        @ValidatedParam('hostId') hostId: string,
        @ValidatedParam('productId') productId: string,
        @Body() createProductResourceDto: CreateProductResourceDto,
    ): Promise<ResponseDto> {
        try {
            const resource = await this.createProductResourceHandler.execute(productId, createProductResourceDto);
            return new ResponseDto('success', 201, 'ProductResourceSuccessfullyCreated', resource);
        } catch (error: any) {
            console.error('Error creating product resource:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Product Resources')
    @ApiOperation({ summary: 'Get product resources' })
    @ApiOkResponse({
        description: 'Product resources retrieved successfully',
        type: GetProductResourcesResponse,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiParam({
        name: 'hostId',
        description: 'Host Identifier',
        type: 'string',
        example: '2230439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @ApiParam({
        name: 'productId',
        description: 'Product Identifier',
        type: 'string',
        example: '1230439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @Get(':hostId/:productId/resources')
    async getProductResources(
        @ValidatedParam('hostId') hostId: string,
        @ValidatedParam('productId') productId: string,
    ): Promise<ResponseDto> {
        try {
            const resourcesData = await this.getProductResourcesHandler.execute(productId);
            return new GetProductResourcesResponse(
                'success',
                200,
                'ProductResourcesSuccessfullyRetrieved',
                resourcesData,
            );
        } catch (error: any) {
            console.error('Error retrieving product resources:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Product Resources')
    @ApiOperation({ summary: 'Delete all product resources' })
    @ApiOkResponse({
        description: 'All product resources deleted successfully',
        type: ResponseDto,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiParam({
        name: 'hostId',
        description: 'Host Identifier',
        type: 'string',
        example: '2230439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @ApiParam({
        name: 'productId',
        description: 'Product Identifier',
        type: 'string',
        example: '1230439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @Delete(':hostId/:productId/resources')
    async deleteAllProductResources(
        @ValidatedParam('hostId') hostId: string,
        @ValidatedParam('productId') productId: string,
    ): Promise<ResponseDto> {
        try {
            await this.deleteAllProductResourcesHandler.execute(hostId, productId);
            return new ResponseDto('success', 200, 'AllProductResourcesSuccessfullyDeleted', {});
        } catch (error: any) {
            console.error('Error deleting all product resources:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Product Resources')
    @ApiOperation({ summary: 'Update the order of multiple product resources' })
    @ApiOkResponse({
        description: 'Resources order successfully updated',
        type: ResponseDto,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiParam({
        name: 'hostId',
        description: 'Host Identifier',
        type: 'string',
        example: '2230439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @ApiParam({
        name: 'productId',
        description: 'Product Identifier',
        type: 'string',
        example: '1230439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @ApiBody({ type: UpdateProductResourcesOrderDto })
    @Patch(':hostId/:productId/resources/order')
    async updateProductResourcesOrder(
        @ValidatedParam('hostId') hostId: string,
        @ValidatedParam('productId') productId: string,
        @Body() updateResourcesOrderDto: UpdateProductResourcesOrderDto,
    ): Promise<ResponseDto> {
        try {
            await this.updateProductResourcesOrderHandler.execute(hostId, productId, updateResourcesOrderDto);
            return new ResponseDto('success', 200, 'ProductResourcesOrderSuccessfullyUpdated', {});
        } catch (error: any) {
            console.error('Error updating product resources order:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Product Resources')
    @ApiOperation({ summary: 'Get a product resource by identifier' })
    @ApiOkResponse({
        description: 'Product resource retrieved successfully',
        type: GetProductResourcesResponse,
        schema: {
            example: {
                status: 'success',
                statusCode: 200,
                message: 'ProductResourceSuccessfullyRetrieved',
                data: {
                    metrics: {
                        totalDuration: 10,
                        totalSections: 1,
                        totalResources: 1,
                        totalSize: 100,
                    },
                    resources: [
                        {
                            recordId: '12345678-abcd-efgh-ijkl-123456789012',
                            type: ProductResourceType.RESOURCE,
                            title: 'Video: Introducción',
                            description: 'Video introductorio al curso',
                            order: 1,
                            fileType: ProductResourceFileType.VIDEO,
                            url: 'https://example.com/video1.mp4',
                            size: 15.5,
                            duration: 10,
                            source: MultimediaSource.APP,
                            preview: true,
                        },
                    ],
                },
            },
        },
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiParam({
        name: 'hostId',
        description: 'Host Identifier',
        type: 'string',
        example: '2230439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @ApiParam({
        name: 'productId',
        description: 'Product Identifier',
        type: 'string',
        example: '1230439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @ApiParam({
        name: 'contentId',
        description: 'Content Identifier',
        type: 'string',
        example: '3230439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @Get(':hostId/:productId/resources/:resourceId')
    async getProductResource(
        @ValidatedParam('hostId') hostId: string,
        @ValidatedParam('productId') productId: string,
        @ValidatedParam('resourceId') resourceId: string,
        @Query() query: GetProductResourceDto,
    ): Promise<ResponseDto> {
        try {
            const resource = await this.getProductResourceHandler.execute(resourceId, undefined, query.contentMode);
            return new ResponseDto('success', 200, 'ProductResourceSuccessfullyRetrieved', resource);
        } catch (error: any) {
            console.error('Error retrieving product resource:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Product Resources')
    @ApiOperation({ summary: 'Update a product resource' })
    @ApiOkResponse({
        description: 'Product resource updated successfully',
        type: ResponseDto,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiParam({
        name: 'hostId',
        description: 'Host Identifier',
        type: 'string',
        example: '2230439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @ApiParam({
        name: 'productId',
        description: 'Product Identifier',
        type: 'string',
        example: '1230439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @ApiParam({
        name: 'contentId',
        description: 'Content Identifier',
        type: 'string',
        example: '3230439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @ApiBody({ type: UpdateProductResourceDto })
    @Patch(':hostId/:productId/resources/:resourceId')
    async updateProductResource(
        @ValidatedParam('hostId') hostId: string,
        @ValidatedParam('productId') productId: string,
        @ValidatedParam('resourceId') resourceId: string,
        @Body() updateResourceDto: UpdateProductResourceDto,
    ): Promise<ResponseDto> {
        try {
            await this.updateProductResourceHandler.execute(hostId, productId, resourceId, updateResourceDto);
            return new ResponseDto('success', 200, 'ProductResourceSuccessfullyUpdated', {});
        } catch (error: any) {
            console.error('Error updating product resource:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Product Resources')
    @ApiOperation({ summary: 'Delete a product resource' })
    @ApiOkResponse({
        description: 'Product resource deleted successfully',
        type: ResponseDto,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiParam({
        name: 'hostId',
        description: 'Host Identifier',
        type: 'string',
        example: '2230439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @ApiParam({
        name: 'productId',
        description: 'Product Identifier',
        type: 'string',
        example: '1230439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @ApiParam({
        name: 'resourceId',
        description: 'Resource Identifier',
        type: 'string',
        example: '3230439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @Delete(':hostId/:productId/resources/:resourceId')
    async deleteProductResource(
        @ValidatedParam('hostId') hostId: string,
        @ValidatedParam('productId') productId: string,
        @ValidatedParam('resourceId') resourceId: string,
    ): Promise<ResponseDto> {
        try {
            await this.deleteProductResourceHandler.execute(hostId, productId, resourceId);
            return new ResponseDto('success', 200, 'ProductResourceSuccessfullyDeleted', {});
        } catch (error: any) {
            console.error('Error deleting product resource:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }
}
