import { Body, Controller, Delete, Get, HttpStatus, Post, Query } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiSecurity,
    ApiTags,
} from '@nestjs/swagger';
import { ResponseDto } from 'apps/libs/common/api/response.entity';

import { GetPaymentOptionsResponse } from '../dto/responses/get-payment-options.response';
import { GetPaymentOptionResponse } from '../dto/responses/get-payment-option.response';
import { GetWithdrawalMethodsResponse } from '../dto/responses/get-withdrawal-methods.response';
import { CreatePresignedUrlDto } from '../dto/requests/create-presigned-url.dto';
import { CreatePresignedUrlResponse } from '../dto/responses/create-presigned-url.response';
import { DeleteS3FileDto } from '../dto/requests/delete-s3-file.dto';
import { GetFiltersResponse } from '../dto/responses/get-filters.response';
import { GetFiltersHandler } from '../handlers/get-filters.handler';
import { GetPaymentOptionsHandler } from '../handlers/get-payment-options.handler';
import { GetPaymentOptionHandler } from '../handlers/get-payment-option.handler';
import { GetWithdrawalMethodsHandler } from '../handlers/get-withdrawal-methods.handler';
import { CreatePresignedUrlHandler } from '../handlers/create-presigned-url.handler';
import { DeleteFileResponse } from '../handlers/delete-file.handler';
import { ValidatedParam } from 'apps/libs/common/api/decorators/validated-param.decorator';

@ApiSecurity('api-key')
@Controller('v2/management/settings')
export class ManagementSettingsController {
    constructor(
        private readonly getFiltersHandler: GetFiltersHandler,
        private readonly getPaymentOptionsHandler: GetPaymentOptionsHandler,
        private readonly getPaymentOptionHandler: GetPaymentOptionHandler,
        private readonly getWithdrawalMethodsHandler: GetWithdrawalMethodsHandler,
        private readonly createPresignedUrlHandler: CreatePresignedUrlHandler,
        private readonly deleteFileResponse: DeleteFileResponse,
    ) {}
    @ApiTags('Filters')
    @Get('filters')
    @ApiOperation({ summary: 'Retrieve filters for a specific host and filter key' })
    @ApiOkResponse({
        description: 'Filters retrieved successfully',
        type: GetFiltersResponse,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiQuery({
        name: 'hostId',
        description: 'Host Identifier',
        type: 'string',
        example: '22b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a',
    })
    async getFilters(@Query('hostId') hostId: string): Promise<ResponseDto> {
        try {
            const data = await this.getFiltersHandler.execute(hostId);
            return new ResponseDto('success', 200, 'FiltersRetrievedSuccessfully', data);
        } catch (error: any) {
            console.error('Error retrieving filters:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Payment Options')
    @Get('payment-options')
    @ApiOperation({ summary: 'Retrieve app payment options' })
    @ApiOkResponse({
        description: 'Payment Options retrieved successfully',
        type: GetPaymentOptionsResponse,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    async getPaymentOptions(): Promise<ResponseDto> {
        try {
            const data = await this.getPaymentOptionsHandler.execute();
            return new ResponseDto('success', 200, 'PaymentOptionsRetrievedSuccessfully', data);
        } catch (error: any) {
            console.error('Error retrieving payment options:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Payment Options')
    @Get('payment-options/:paymentOption')
    @ApiOperation({ summary: 'Retrieve app payment option by key' })
    @ApiOkResponse({
        description: 'Payment Option retrieved successfully',
        type: GetPaymentOptionResponse,
    })
    @ApiParam({
        name: 'paymentOption',
        description: 'Payment Option Id',
        type: 'string',
        example: '28d23974-191e-4c1f-9455-05c7fa2576fd',
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    async getPaymentOption(@ValidatedParam('paymentOption') paymentOptionId: string): Promise<ResponseDto> {
        try {
            const data = await this.getPaymentOptionHandler.execute(paymentOptionId);
            return new ResponseDto('success', 200, 'PaymentOptionRetrievedSuccessfully', data || {});
        } catch (error: any) {
            console.error('Error retrieving payment option:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Withdrawal Methods')
    @Get('withdrawal-methods')
    @ApiOperation({ summary: 'Retrieve available withdrawal methods' })
    @ApiOkResponse({
        description: 'Withdrawal methods retrieved successfully',
        type: GetWithdrawalMethodsResponse,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    async getWithdrawalMethods(): Promise<ResponseDto> {
        try {
            const data = await this.getWithdrawalMethodsHandler.execute();
            return new ResponseDto('success', 200, 'WithdrawalMethodsRetrievedSuccessfully', data);
        } catch (error: any) {
            console.error('Error retrieving withdrawal methods:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Files')
    @ApiOperation({ summary: 'Create a presigned url to upload files to Amazon S3' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Presigned file created successfully',
        type: CreatePresignedUrlResponse,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiBody({ type: CreatePresignedUrlDto })
    @Post('files')
    async createPresignedUrl(@Body() createPresignedUrl: CreatePresignedUrlDto): Promise<ResponseDto> {
        try {
            console.log('calling create presigned url', createPresignedUrl);
            const data = await this.createPresignedUrlHandler.execute(createPresignedUrl);
            return new ResponseDto('success', 201, 'PresignedUrlCreatedSuccessfully', data);
        } catch (error: any) {
            console.error('Error creating presigned url:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Files')
    @ApiOperation({ summary: 'Delete file from Amazon S3' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'File deleted successfully',
        type: ResponseDto,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiBody({ type: DeleteS3FileDto })
    @Delete('files')
    async deleteS3File(@Body() deleteS3FileDto: DeleteS3FileDto): Promise<ResponseDto> {
        try {
            console.log('calling delete S3 file', deleteS3FileDto);
            await this.deleteFileResponse.execute(deleteS3FileDto);
            return new ResponseDto('success', 200, 'FileDeletedSuccessfully', {});
        } catch (error: any) {
            console.error('Error deleting file:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }
}
