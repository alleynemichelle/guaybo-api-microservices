import { Controller, Get, HttpStatus, Query, Post, Body, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';

import { ProductsService } from '../products.service';
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiSecurity,
    ApiTags,
} from '@nestjs/swagger';
import { ResponseDto } from 'apps/libs/api/response.entity';
import { ValidatedParam } from 'apps/libs/api/decorators/validated-param.decorator';
import { ContentMode } from 'apps/libs/common/enums/content-mode.enum';

import { GetPaymentMethodsResponse } from '../constants/get-payment-methods.response';
import { GetPublicProductResponse } from '../constants/get-product-public.response';
import { GetSessionAvailabilityDto } from '../dto/requests/get-session-availability.dto';
import { GetSessionAvailabilityResponse } from '../constants/get-session-availability.response';
import { ProductResourcesService } from '../product-resources.service';
import { FreeBookingResourcesAccessGuard } from 'apps/libs/api/guards/free-booking-resources-access.guard';
import { GetProductResourcesResponse } from '../dto/responses/get-product-resources.response';
import { GetProductResourceDto } from '../dto/requests/get-product-resource.dto';

@ApiSecurity('api-key')
@Controller('products')
export class ProductsController {
    constructor(
        private readonly productsService: ProductsService,
        private readonly productResourcesService: ProductResourcesService,
    ) {}

    @ApiTags('Free Products Access')
    @ApiOperation({ summary: 'Get product resources for a free product by booking (public endpoint)' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Product resources retrieved successfully',
        type: GetProductResourcesResponse,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiParam({
        name: 'bookingId',
        required: true,
        description: 'Id of the booking',
        example: 'b6f5a3a4-c3c9-4b3b-8c1a-5b9a8c7b6a5b',
    })
    @UseGuards(FreeBookingResourcesAccessGuard)
    @Get('bookings/:bookingId/resources')
    async getFreeProductResourcesByBooking(@Req() request: Request): Promise<ResponseDto> {
        const { booking } = request as unknown as { booking: { hostId: string; productId: string } };
        try {
            const data = await this.productResourcesService.getProductResources(booking.hostId, booking.productId);
            return new ResponseDto('success', 200, 'ProductResourcesSuccessfullyRetrieved', data);
        } catch (error: any) {
            console.error('Error retrieving product resources by booking: ', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Free Products Access')
    @ApiOperation({ summary: 'Get product resources for a free product by booking (public endpoint)' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Product resources retrieved successfully',
        type: GetProductResourcesResponse,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiParam({
        name: 'bookingId',
        required: true,
        description: 'Id of the booking',
        example: 'b6f5a3a4-c3c9-4b3b-8c1a-5b9a8c7b6a5b',
    })
    @ApiQuery({
        name: 'contentMode',
        required: false,
        description: 'Content mode for the resource',
        example: ContentMode.INLINE,
    })
    @UseGuards(FreeBookingResourcesAccessGuard)
    @Get('bookings/:bookingId/resources/:resourceId')
    async getFreeProductResourceByBooking(
        @Req() request: Request,
        @ValidatedParam('resourceId') resourceId: string,
        @Query() query: GetProductResourceDto,
    ): Promise<ResponseDto> {
        const { booking } = request as unknown as { booking: { hostId: string; productId: string } };
        try {
            const data = await this.productResourcesService.getProductResource(
                booking.hostId,
                booking.productId,
                resourceId,
                undefined,
                query.contentMode,
            );
            return new ResponseDto('success', 200, 'ProductResourcesSuccessfullyRetrieved', data);
        } catch (error: any) {
            console.error('Error retrieving product resources by booking: ', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Products')
    @ApiOperation({ summary: 'Get product (public endpoint)' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Product retrieved successfully',
        type: GetPublicProductResponse,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiParam({
        name: 'hostId',
        required: true,
        description: 'Id of the host',
        example: '2230439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @ApiParam({
        name: 'productId',
        required: true,
        description: 'Id of the product',
        example: '33d7b109-1d42-ac42-c27f-8d7ff89d5711',
    })
    @Get(':hostId/:productId')
    async getProduct(
        @ValidatedParam('hostId') hostId: string,
        @ValidatedParam('productId') productId: string,
    ): Promise<ResponseDto> {
        try {
            const data = await this.productsService.getProduct(hostId, productId, true);
            return new ResponseDto('success', 200, 'ProductSuccessfullyRetrieved', data);
        } catch (error: any) {
            console.error('Error retrieving product: ', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Products')
    @ApiOperation({ summary: 'Get product resources (public endpoint)' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Product resources retrieved successfully',
        type: GetPublicProductResponse,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiParam({
        name: 'hostId',
        required: true,
        description: 'Id of the host',
        example: '2230439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @ApiParam({
        name: 'productId',
        required: true,
        description: 'Id of the product',
        example: '33d7b109-1d42-ac42-c27f-8d7ff89d5711',
    })
    @Get(':hostId/:productId/resources')
    async getProductResources(
        @ValidatedParam('hostId') hostId: string,
        @ValidatedParam('productId') productId: string,
    ): Promise<ResponseDto> {
        try {
            const data = await this.productResourcesService.getPublicProductResources(hostId, productId);
            return new ResponseDto('success', 200, 'ProductResourcesSuccessfullyRetrieved', data);
        } catch (error: any) {
            console.error('Error retrieving product resources: ', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Products')
    @ApiOperation({ summary: 'Get product payment methods' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Product payment methods retrieved successfully',
        type: GetPaymentMethodsResponse,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiParam({
        name: 'hostId',
        required: true,
        description: 'Id of the host',
        example: '2230439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @ApiParam({
        name: 'productId',
        required: true,
        description: 'Id of the product',
        example: '33d7b109-1d42-ac42-c27f-8d7ff89d5711',
    })
    @ApiQuery({
        name: 'currency',
        required: false,
        description: 'ISO code of the payment method currency',
        example: 'VES',
    })
    @Get(':hostId/:productId/payment-methods')
    async getPaymentMethods(
        @ValidatedParam('hostId') hostId: string,
        @ValidatedParam('productId') productId: string,
        @Query('currency') currency?: string,
    ): Promise<ResponseDto> {
        try {
            const data = await this.productsService.getPaymentMethods(hostId, productId, { currency });
            return new ResponseDto('success', 200, 'PaymentMethodsSuccessfullyRetrieved', data);
        } catch (error: any) {
            console.error('Error retrieving payment methods: ', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Products')
    @ApiOperation({ summary: 'Get session product availability' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Session availability retrieved successfully',
        type: GetSessionAvailabilityResponse,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiParam({
        name: 'hostId',
        required: true,
        description: 'Id of the host',
        example: '2230439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @ApiParam({
        name: 'productId',
        required: true,
        description: 'Id of the product',
        example: '33d7b109-1d42-ac42-c27f-8d7ff89d5711',
    })
    @ApiBody({
        type: GetSessionAvailabilityDto,
        description: 'Period for session availability check',
        examples: {
            example1: {
                summary: 'Date range request example',
                value: {
                    startDate: '2023-01-01',
                    endDate: '2023-01-15',
                    timezone: 'America/Caracas',
                },
            },
        },
    })
    @Post(':hostId/:productId/sessions')
    async getSessionAvailability(
        @ValidatedParam('hostId') hostId: string,
        @ValidatedParam('productId') productId: string,
        @Body() body: GetSessionAvailabilityDto,
    ): Promise<ResponseDto> {
        try {
            const data = await this.productsService.getSessionAvailability(hostId, productId, body);
            return new ResponseDto('success', 200, 'SessionAvailabilitySuccessfullyRetrieved', data);
        } catch (error: any) {
            console.error('Error retrieving session availability: ', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }
}
