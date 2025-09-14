import { Body, Controller, Delete, Get, Put, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ResponseDto } from 'apps/libs/common/api/response.entity';
import { ValidatedParam } from 'apps/libs/common/api/decorators/validated-param.decorator';
import { JwtAuthGuard } from 'apps/libs/common/api/guards/jwt-auth-v2.guard';
import { GetReferralsHandler } from '../handlers/get-referrals.handler';
import { GetReferrerCodesHandler } from '../handlers/get-referrer-codes.handler';
import { GetReferralsResponseDto } from '../dto/responses/get-referrals.response.dto';
import { GetReferrerCodesResponseDto } from '../dto/responses/get-referrer-codes-response.dto';
import { GetPaymentOptionsHandler } from '../handlers/get-payment-options.handler';
import { PutPaymentOptionsHandler } from '../handlers/put-payment-options.handler';
import { DeletePaymentOptionHandler } from '../handlers/delete-payment-option.handler';
import { PutPaymentMethodDto } from '../dto/requests/put-payment-method.dto';

@ApiSecurity('api-key')
@UseGuards(JwtAuthGuard)
@Controller('v2/management/users')
export class UsersManagementController {
    constructor(
        private readonly getReferralsHandler: GetReferralsHandler,
        private readonly getReferrerCodesHandler: GetReferrerCodesHandler,
        private readonly getPaymentOptionsHandler: GetPaymentOptionsHandler,
        private readonly putPaymentOptionsHandler: PutPaymentOptionsHandler,
        private readonly deletePaymentOptionHandler: DeletePaymentOptionHandler,
    ) {}

    @ApiTags('Referrals')
    @ApiOperation({ summary: 'Get users referred by a specific user with metrics' })
    @ApiOkResponse({
        description: 'User referral data with metrics retrieved successfully',
        type: GetReferralsResponseDto,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiParam({
        name: 'userId',
        description: 'User Identifier (referrer)',
        type: 'string',
        example: '0220439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @Get(':userId/referrals')
    async getUserReferrals(@ValidatedParam('userId') userId: string): Promise<ResponseDto> {
        try {
            const data = await this.getReferralsHandler.execute(userId);
            return new ResponseDto('success', 200, 'UserReferralsSuccessfullyRetrieved', data);
        } catch (error: any) {
            console.error('Error retrieving user referrals:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Referrals')
    @ApiOperation({ summary: 'Get active referral codes for a specific user' })
    @ApiOkResponse({
        description: 'User referral codes retrieved successfully',
        type: GetReferrerCodesResponseDto,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiParam({
        name: 'userId',
        description: 'User Identifier (referrer)',
        type: 'string',
        example: '0220439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @Get(':userId/referral-codes')
    async getUserReferralCodes(@ValidatedParam('userId') userId: string): Promise<ResponseDto> {
        try {
            const data = await this.getReferrerCodesHandler.execute(userId);
            return new ResponseDto('success', 200, 'UserReferralCodesSuccessfullyRetrieved', data);
        } catch (error: any) {
            console.error('Error retrieving user referral codes:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Payment Methods')
    @ApiOperation({ summary: "Get a user's payment options" })
    @ApiOkResponse({
        description: 'User payment options retrieved successfully',
        type: ResponseDto,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiParam({
        name: 'userId',
        description: 'User Identifier',
        type: 'string',
        example: '0220439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @Get(':userId/payment-options')
    async getPaymentOptions(@ValidatedParam('userId') userId: string): Promise<ResponseDto> {
        try {
            const data = await this.getPaymentOptionsHandler.execute(userId);
            return new ResponseDto('success', 200, 'UserPaymentOptionsSuccessfullyRetrieved', data);
        } catch (error: any) {
            console.error('Error retrieving user payment options:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Payment Methods')
    @ApiOperation({ summary: "Create/Update a user's payment options" })
    @ApiOkResponse({
        description: 'User payment options created/updated successfully',
        type: ResponseDto,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiParam({
        name: 'userId',
        description: 'User Identifier',
        type: 'string',
        example: '0220439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @Put(':userId/payment-options')
    async putPaymentOptions(
        @ValidatedParam('userId') userId: string,
        @Body() paymentOptionsDto: PutPaymentMethodDto[],
    ): Promise<ResponseDto> {
        try {
            const data = await this.putPaymentOptionsHandler.execute(userId, paymentOptionsDto);
            return new ResponseDto('success', 200, 'UserPaymentOptionsSuccessfullyUpdated', data);
        } catch (error: any) {
            console.error('Error creating/updating user payment options:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Payment Methods')
    @ApiOperation({ summary: "Delete a user's payment option" })
    @ApiOkResponse({
        description: 'User payment option deleted successfully',
        type: ResponseDto,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiParam({
        name: 'userId',
        description: 'User Identifier',
        type: 'string',
        example: '0220439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @ApiParam({
        name: 'paymentOptionId',
        description: 'Payment Option Identifier',
        type: 'string',
        example: '3bd0ca53-488c-4fee-a90b-b1b864408c92',
    })
    @Delete(':userId/payment-options/:paymentOptionId')
    async deletePaymentOption(
        @ValidatedParam('userId') userId: string,
        @ValidatedParam('paymentOptionId') paymentOptionId: string,
    ): Promise<ResponseDto> {
        try {
            await this.deletePaymentOptionHandler.execute(userId, paymentOptionId);
            return new ResponseDto('success', 200, 'UserPaymentOptionSuccessfullyDeleted', {});
        } catch (error: any) {
            console.error('Error deleting user payment option:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }
}
