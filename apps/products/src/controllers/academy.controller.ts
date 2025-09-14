import { Controller, Get, UseGuards, Put, Body, Param, Post, HttpStatus } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiSecurity,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { ResponseDto } from 'apps/libs/api/response.entity';
import { JwtAuthGuard } from 'apps/libs/api/guards/jwt-auth.guard';
import { UserId } from 'apps/libs/api/decorators';
import { ValidatedParam } from 'apps/libs/api/decorators/validated-param.decorator';
import { GUAYBO_HOST_ID } from 'apps/libs/common/constants/guaybo.constant';

import { ProductResourcesService } from '../product-resources.service';
import { ProductsService } from '../products.service';
import { UpdateProductResourceProgressDto } from '../dto/requests/update-product-resource-progress.dto';
import { UpdateTrackingMarkerDto } from '../dto/requests/update-tracking-marker.dto';
import { QuestionsService } from '../questions.service';
import { SubmitAnswersDto } from '../dto/requests/submit-answers.dto';

@ApiSecurity('api-key')
@ApiBearerAuth('token-id')
@ApiTags('Academy')
@Controller('academy')
@UseGuards(JwtAuthGuard)
export class AcademyController {
    constructor(
        private readonly productResourcesService: ProductResourcesService,
        private readonly productsService: ProductsService,
        private readonly questionsService: QuestionsService,
    ) {}

    @ApiOperation({ summary: "Get all Guaybo's academy published courses" })
    @ApiResponse({
        status: 200,
        description: 'Academy courses retrieved successfully',
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @Get('courses')
    async getAcademyCourses(): Promise<ResponseDto> {
        try {
            const data = await this.productsService.getPublishedProductsByHost(GUAYBO_HOST_ID);
            return new ResponseDto('success', 200, 'AcademyCoursesSuccessfullyRetrieved', data);
        } catch (error: any) {
            console.error('Error retrieving academy courses:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiOperation({ summary: "Get a specific Guaybo's academy course" })
    @ApiResponse({
        status: 200,
        description: 'Academy course retrieved successfully',
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiParam({
        name: 'productId',
        required: true,
        description: 'Id of the course (product)',
        example: '33d7b109-1d42-ac42-c27f-8d7ff89d5711',
    })
    @Get('courses/:productId')
    async getAcademyCourse(@ValidatedParam('productId') productId: string): Promise<ResponseDto> {
        try {
            const data = await this.productsService.getProduct(GUAYBO_HOST_ID, productId, true);
            return new ResponseDto('success', 200, 'AcademyCourseSuccessfullyRetrieved', data);
        } catch (error: any) {
            console.error('Error retrieving academy course:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiOperation({ summary: 'Get product resources for authenticated guests' })
    @ApiResponse({
        status: 200,
        description: 'Product resources retrieved successfully',
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiParam({
        name: 'productId',
        required: true,
        description: 'Id of the product',
        example: '33d7b109-1d42-ac42-c27f-8d7ff89d5711',
    })
    @Get('courses/:productId/resources')
    async getProductResources(
        @ValidatedParam('productId') productId: string,
        @UserId() userId: string,
    ): Promise<ResponseDto> {
        try {
            const data = await this.productResourcesService.getProductResources(GUAYBO_HOST_ID, productId, {}, userId);
            return new ResponseDto('success', 200, 'ProductResourcesSuccessfullyRetrieved', data);
        } catch (error: any) {
            console.error('Error retrieving product resources:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiOperation({ summary: 'Get specific product resource for authenticated guests' })
    @ApiResponse({
        status: 200,
        description: 'Product resource retrieved successfully',
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
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
    @Get('courses/:productId/resources/:resourceId')
    async getProductResourceDetail(
        @ValidatedParam('productId') productId: string,
        @ValidatedParam('resourceId') resourceId: string,
        @UserId() userId: string,
    ): Promise<ResponseDto> {
        try {
            const data = await this.productResourcesService.getProductResource(
                GUAYBO_HOST_ID,
                productId,
                resourceId,
                userId,
            );
            return new ResponseDto('success', 200, 'ProductResourceSuccessfullyRetrieved', data);
        } catch (error: any) {
            console.error('Error retrieving product resource:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiOperation({ summary: 'Submit answers for a quiz or survey in an academy course' })
    @ApiResponse({ status: 201, description: 'Answers submitted successfully' })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiParam({ name: 'productId', required: true })
    @ApiParam({ name: 'resourceId', required: true })
    @Post('courses/:productId/resources/:resourceId/answers')
    async submitAnswers(
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
            await this.productResourcesService.updateProductResourceProgress(
                userId,
                productId,
                GUAYBO_HOST_ID,
                resourceId,
                {
                    completed: true,
                },
            );

            return new ResponseDto('success', 201, 'AnswersSuccessfullySubmitted', data);
        } catch (error: any) {
            console.error('Error submitting answers:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiOperation({ summary: 'Update answers for a quiz or survey in an academy course' })
    @ApiResponse({ status: 200, description: 'Answers updated successfully' })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiParam({ name: 'productId', required: true })
    @ApiParam({ name: 'resourceId', required: true })
    @Put('courses/:productId/resources/:resourceId/answers')
    async updateAnswers(
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
            return new ResponseDto('success', 200, 'AnswersSuccessfullyUpdated', data);
        } catch (error: any) {
            console.error('Error updating answers:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiOperation({ summary: 'Increment the view count for a resource in an academy course' })
    @ApiResponse({ status: HttpStatus.OK, description: 'View count incremented successfully' })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiParam({ name: 'productId', required: true })
    @ApiParam({ name: 'resourceId', required: true })
    @Post('courses/:productId/resources/:resourceId/views')
    async incrementResourceViews(
        @ValidatedParam('productId') productId: string,
        @ValidatedParam('resourceId') resourceId: string,
    ): Promise<ResponseDto> {
        try {
            await this.productResourcesService.incrementResourceViews(GUAYBO_HOST_ID, productId, resourceId);
            return new ResponseDto('success', 200, 'ResourceViewsSuccessfullyIncremented', {});
        } catch (error: any) {
            console.error('Error incrementing resource views:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiOperation({ summary: 'Update product resource for authenticated guests' })
    @ApiResponse({
        status: 200,
        description: 'Product resource updated successfully',
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
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
    @Put('courses/:productId/resources/:resourceId/progress')
    async updateProductResource(
        @ValidatedParam('productId') productId: string,
        @ValidatedParam('resourceId') resourceId: string,
        @UserId() userId: string,
        @Body() updateProductResourceProgressDto: UpdateProductResourceProgressDto,
    ): Promise<ResponseDto> {
        try {
            const data = await this.productResourcesService.updateProductResourceProgress(
                userId,
                productId,
                GUAYBO_HOST_ID,
                resourceId,
                updateProductResourceProgressDto,
            );
            return new ResponseDto('success', 200, 'ProductResourceProgressSuccessfullyUpdated', data);
        } catch (error: any) {
            console.error('Error updating product resource:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiOperation({ summary: 'Update product last resource visited for the authenticated guests' })
    @ApiResponse({
        status: 200,
        description: 'Product progress updated successfully',
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiParam({
        name: 'productId',
        required: true,
        description: 'Id of the product',
        example: '33d7b109-1d42-ac42-c27f-8d7ff89d5711',
    })
    @Put('courses/:productId/tracking-markers')
    async putProductMarker(
        @ValidatedParam('productId') productId: string,
        @UserId() userId: string,
        @Body() updateTrackingMarkerDto: UpdateTrackingMarkerDto,
    ): Promise<ResponseDto> {
        try {
            const data = await this.productResourcesService.updateProductMarker(
                userId,
                productId,
                GUAYBO_HOST_ID,
                updateTrackingMarkerDto,
            );
            return new ResponseDto('success', 200, 'TrackingMarkerSuccessfullyUpdated', data);
        } catch (error: any) {
            console.error('Error updating tracking marker:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }
}
