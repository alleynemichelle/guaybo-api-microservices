import { Controller, Get, HttpStatus, UseGuards, Put, Body, Res, Post, Query } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiSecurity,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Response } from 'express';

import { ResponseDto } from 'apps/libs/api/response.entity';
import { JwtAuthGuard } from 'apps/libs/api/guards/jwt-auth.guard';
import { UserId } from 'apps/libs/api/decorators';
import { RequireProductAccess } from 'apps/libs/api/decorators/guest-product-access.decorator';
import { ProductResource } from 'apps/libs/entities/products/product-resource.entity';
import { ProductProgress } from 'apps/libs/entities/products/product-progress.entity';
import { GuestResourcesAccessGuard } from 'apps/libs/api/guards/guest-resources-access.guard';
import { ValidatedParam } from 'apps/libs/api/decorators/validated-param.decorator';

//import { ProductResourcesService } from '../product-resources.service';
import { GetProductResourcesResponse } from '../dto/responses/get-product-resources.response';
//import { ProductsService } from '../products.service';
import { GetProductResponse } from '../constants/get-product.response';
import { UpdateProductResourceProgressDto } from '../dto/requests/update-product-resource-progress.dto';
import { UpdateTrackingMarkerDto } from '../dto/requests/update-tracking-marker.dto';
import { ProductAccessResponseDto } from '../dto/responses/product-access-response.dto';
//import { QuestionsService } from '../questions.service';
import { SubmitAnswersDto } from '../dto/requests/submit-answers.dto';
//import { UserAnswer } from 'apps/libs/entities/products/user-answer.entity';
import { GetProductResourceDto } from '../dto/requests/get-product-resource.dto';
import { ContentMode } from 'apps/libs/common/enums/content-mode.enum';

@ApiSecurity('api-key')
@ApiBearerAuth('token-id')
@Controller('guests/products')
@UseGuards(JwtAuthGuard)
export class GuestsProductsController {
    constructor(
        private readonly productResourcesService: ProductResourcesService,
        private readonly productsService: ProductsService,
        private readonly questionsService: QuestionsService,
    ) {}

    @ApiTags('Products')
    @ApiOperation({ summary: 'Get product details for authenticated guests' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Product details retrieved successfully',
        type: GetProductResponse,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
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
    @RequireProductAccess()
    @Get(':hostId/:productId')
    async getProduct(
        @ValidatedParam('hostId') hostId: string,
        @ValidatedParam('productId') productId: string,
        @UserId() userId: string,
    ): Promise<ResponseDto> {
        try {
            const data = await this.productsService.getProduct(hostId, productId, true);
            return new ResponseDto('success', 200, 'ProductSuccessfullyRetrieved', data);
        } catch (error: any) {
            console.error('Error retrieving product details:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Product Resources')
    @ApiOperation({ summary: 'Update product last resource visited for the authenticated guests' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Product progress updated successfully',
        type: ProductProgress,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
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
    @UseGuards(GuestResourcesAccessGuard)
    @Put(':hostId/:productId/tracking-markers')
    async putProductMarker(
        @ValidatedParam('hostId') hostId: string,
        @ValidatedParam('productId') productId: string,
        @UserId() userId: string,
        @Body() updateTrackingMarkerDto: UpdateTrackingMarkerDto,
    ): Promise<ResponseDto> {
        try {
            const data = await this.productResourcesService.updateProductMarker(
                userId,
                productId,
                hostId,
                updateTrackingMarkerDto,
            );
            return new ResponseDto('success', 200, 'TrackingMarkerSuccessfullyUpdated', data);
        } catch (error: any) {
            console.error('Error updating tracking marker:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Product Resources')
    @ApiOperation({ summary: 'Get product resources for authenticated guests' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Product resources retrieved successfully',
        type: GetProductResourcesResponse,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
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
    @UseGuards(GuestResourcesAccessGuard)
    @Get(':hostId/:productId/resources')
    async getProductResources(
        @ValidatedParam('hostId') hostId: string,
        @ValidatedParam('productId') productId: string,
        @UserId() userId: string,
    ): Promise<ResponseDto> {
        try {
            const data = await this.productResourcesService.getProductResources(hostId, productId, {}, userId);
            return new ResponseDto('success', 200, 'ProductResourcesSuccessfullyRetrieved', data);
        } catch (error: any) {
            console.error('Error retrieving product resources:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Product Resources')
    @ApiOperation({ summary: 'Get specific product resource for authenticated guests' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Product resource retrieved successfully',
        type: ProductResource,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
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
    @ApiParam({
        name: 'resourceId',
        required: true,
        description: 'Id of the resource',
        example: '45d7b109-1d42-ac42-c27f-8d7ff89d5722',
    })
    @ApiQuery({
        name: 'contentMode',
        required: false,
        description: 'Content mode for the resource',
        example: ContentMode.INLINE,
    })
    @UseGuards(GuestResourcesAccessGuard)
    @Get(':hostId/:productId/resources/:resourceId')
    async getProductResourceDetail(
        @ValidatedParam('hostId') hostId: string,
        @ValidatedParam('productId') productId: string,
        @ValidatedParam('resourceId') resourceId: string,
        @UserId() userId: string,
        @Query() query: GetProductResourceDto,
    ): Promise<ResponseDto> {
        try {
            const data = await this.productResourcesService.getProductResource(
                hostId,
                productId,
                resourceId,
                userId,
                query.contentMode,
            );
            return new ResponseDto('success', 200, 'ProductResourceSuccessfullyRetrieved', data);
        } catch (error: any) {
            console.error('Error retrieving product resource:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Product Resources')
    @ApiOperation({ summary: 'Update product resource for authenticated guests' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Product resource updated successfully',
        type: ProductResource,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
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
    @ApiParam({
        name: 'resourceId',
        required: true,
        description: 'Id of the resource',
        example: '45d7b109-1d42-ac42-c27f-8d7ff89d5722',
    })
    @UseGuards(GuestResourcesAccessGuard)
    @Put(':hostId/:productId/resources/:resourceId/progress')
    async updateProductResource(
        @ValidatedParam('hostId') hostId: string,
        @ValidatedParam('productId') productId: string,
        @ValidatedParam('resourceId') resourceId: string,
        @UserId() userId: string,
        @Body() updateProductResourceProgressDto: UpdateProductResourceProgressDto,
    ): Promise<ResponseDto> {
        try {
            const data = await this.productResourcesService.updateProductResourceProgress(
                userId,
                productId,
                hostId,
                resourceId,
                updateProductResourceProgressDto,
            );
            return new ResponseDto('success', 200, 'ProductResourceProgressSuccessfullyUpdated', data);
        } catch (error: any) {
            console.error('Error updating product resource:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Product Resources')
    @ApiOperation({ summary: 'Submit answers for a quiz or survey' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Answers submitted successfully',
        type: [UserAnswer],
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiParam({ name: 'hostId', required: true })
    @ApiParam({ name: 'productId', required: true })
    @ApiParam({ name: 'resourceId', required: true })
    @UseGuards(GuestResourcesAccessGuard)
    @Post(':hostId/:productId/resources/:resourceId/answers')
    async submitAnswers(
        @ValidatedParam('hostId') hostId: string,
        @ValidatedParam('productId') productId: string,
        @ValidatedParam('resourceId') resourceId: string,
        @UserId() userId: string,
        @Body() submitAnswersDto: SubmitAnswersDto,
    ): Promise<ResponseDto> {
        try {
            const data = await this.questionsService.saveUserAnswers(
                userId,
                productId,
                resourceId,
                submitAnswersDto.answers,
            );

            // Mark the resource as completed
            await this.productResourcesService.updateProductResourceProgress(userId, productId, hostId, resourceId, {
                completed: true,
            });

            return new ResponseDto('success', HttpStatus.CREATED, 'AnswersSuccessfullySubmitted', data);
        } catch (error: any) {
            console.error('Error submitting answers:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Product Resources')
    @ApiOperation({ summary: 'Update answers for a quiz or survey' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Answers updated successfully',
        type: [UserAnswer],
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiParam({ name: 'hostId', required: true })
    @ApiParam({ name: 'productId', required: true })
    @ApiParam({ name: 'resourceId', required: true })
    @UseGuards(GuestResourcesAccessGuard)
    @Put(':hostId/:productId/resources/:resourceId/answers')
    async updateAnswers(
        @ValidatedParam('hostId') hostId: string,
        @ValidatedParam('productId') productId: string,
        @ValidatedParam('resourceId') resourceId: string,
        @UserId() userId: string,
        @Body() submitAnswersDto: SubmitAnswersDto,
    ): Promise<ResponseDto> {
        try {
            const data = await this.questionsService.saveUserAnswers(
                userId,
                productId,
                resourceId,
                submitAnswersDto.answers,
            );
            return new ResponseDto('success', HttpStatus.OK, 'AnswersSuccessfullyUpdated', data);
        } catch (error: any) {
            console.error('Error updating answers:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Product Resources')
    @ApiOperation({ summary: 'Increment the view count for a resource' })
    @ApiResponse({ status: HttpStatus.OK, description: 'View count incremented successfully' })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiParam({ name: 'hostId', required: true })
    @ApiParam({ name: 'productId', required: true })
    @ApiParam({ name: 'resourceId', required: true })
    @UseGuards(GuestResourcesAccessGuard)
    @Post(':hostId/:productId/resources/:resourceId/views')
    async incrementResourceViews(
        @ValidatedParam('hostId') hostId: string,
        @ValidatedParam('productId') productId: string,
        @ValidatedParam('resourceId') resourceId: string,
    ): Promise<void> {
        await this.productResourcesService.incrementResourceViews(hostId, productId, resourceId);
    }

    /**
     * Generate access to product resources using CloudFront signed cookies
     */
    @ApiTags('Products')
    @ApiOperation({
        summary: 'Generate product access with signed cookies',
        description:
            'Generates CloudFront signed cookies for accessing APP resources of a product. Cookies are set with HttpOnly, Secure, and SameSite=None for cross-origin support.',
    })
    @ApiOkResponse({
        description: 'Product access granted successfully',
        type: ProductAccessResponseDto,
    })
    @ApiBadRequestResponse({ description: 'Product not found or no APP resources available' })
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
    @UseGuards(GuestResourcesAccessGuard)
    @Post(':hostId/:productId/access')
    async generateProductAccess(
        @ValidatedParam('hostId') hostId: string,
        @ValidatedParam('productId') productId: string,
        @Res({ passthrough: true }) response: Response,
    ): Promise<ResponseDto> {
        try {
            const { cookies, response: accessResponse } = await this.productResourcesService.generateProductAccess(
                hostId,
                productId,
                60, // 60 minutes expiration
            );

            // Set CloudFront signed cookies
            Object.entries(cookies).forEach(([name, value]) => {
                response.cookie(name, value, {
                    domain: '.guaybo.com',
                    path: '/',
                    secure: true,
                    httpOnly: true,
                    sameSite: 'strict',
                    maxAge: 60 * 60 * 1000, // 60 minutes in milliseconds
                });
            });

            return new ResponseDto('success', 200, 'ProductAccessSuccessfullyGranted', accessResponse);
        } catch (error: any) {
            console.error('Error generating product access:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }
}
