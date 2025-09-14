import { Body, Controller, Get, HttpStatus, Patch, Post, UseGuards, Put, Delete } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiSecurity,
    ApiTags,
} from '@nestjs/swagger';
import { ResponseDto } from 'apps/libs/common/api/response.entity';
import { ValidatedParam } from 'apps/libs/common/api/decorators/validated-param.decorator';
import { User } from 'apps/libs/common/api/decorators/user-id.decorator';
import { HostOwnerGuard } from 'apps/libs/common/api/guards/owner-access-v2.guard';
import { JwtAuthGuard, RequestUser } from 'apps/libs/common/api/guards/jwt-auth-v2.guard';

import { CreateHostResponseDto } from '../dto/responses/create-host-response.dto';
import { CreateHostDto } from '../dto/requests/create-host.dto';
import { CreateHostHandler } from '../handlers/create-host.handler';
import { GetHostHandler } from '../handlers/get-host.handler';
import { UpdateHostDto } from '../dto/requests/update-host.dto';
import { UpdateHostHandler } from '../handlers/update-host.handler';
import { GetCustomerResponseDto } from '../dto/responses/get-customer-response.dto';
import { GetCustomerHandler } from '../handlers/get-customer.handler';
import { UpdateCustomerDto } from '../dto/requests/update-customer.dto';
import { UpdateCustomerHandler } from '../handlers/update-customer.handler';
import { ApplyCouponDto } from '../dto/requests/apply-coupon.dto';
import { ApplyCouponResponseDto } from '../dto/responses/apply-coupon-response.dto';
import { ApplyCouponHandler } from '../handlers/apply-coupon.handler';
import { GetHostAnalyticsHandler } from '../handlers/get-host-analytics.handler';
import { GetHostAnalyticsResponseDto } from '../dto/responses/get-host-analytics-response.dto';
import { UpdateHostAnalyticsDto } from '../dto/requests/update-host-analytics.dto';
import { UpdateHostAnalyticsHandler } from '../handlers/update-host-analytics.handler';
import { DeleteHostAnalyticsHandler } from '../handlers/delete-host-analytics.handler';

import { CreateHostAnalyticsHandler } from '../handlers/create-host-analytics.handler';
import { CreateHostAnalyticsResponseDto } from '../dto/responses/create-host-analytics-response.dto';
import { CreateHostAnalyticsDto } from '../dto/requests/create-host-analytics.dto';

@ApiSecurity('api-key')
@UseGuards(JwtAuthGuard)
@Controller('v2/management/hosts')
export class HostsManagementController {
    constructor(
        private readonly createHostHandler: CreateHostHandler,
        private readonly getHostHandler: GetHostHandler,
        private readonly updateHostHandler: UpdateHostHandler,
        private readonly getCustomerHandler: GetCustomerHandler,
        private readonly updateCustomerHandler: UpdateCustomerHandler,
        private readonly applyCouponHandler: ApplyCouponHandler,
        private readonly getHostAnalyticsHandler: GetHostAnalyticsHandler,
        private readonly createHostAnalyticsHandler: CreateHostAnalyticsHandler,
        private readonly updateHostAnalyticsHandler: UpdateHostAnalyticsHandler,
        private readonly deleteHostAnalyticsHandler: DeleteHostAnalyticsHandler,
    ) {}

    @ApiTags('Hosts')
    @ApiOperation({ summary: 'Create a host' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Hosts created successfully',
        type: CreateHostResponseDto,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiBody({ type: CreateHostDto })
    @Post()
    async createHost(@Body() createHostDto: CreateHostDto, @User() user: RequestUser): Promise<ResponseDto> {
        try {
            const data = await this.createHostHandler.execute(user.id, createHostDto);
            return new ResponseDto('success', 201, 'HostCreatedSuccessfully', data);
        } catch (error: any) {
            console.error('Error creating hosts: ', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Hosts')
    @ApiOperation({ summary: 'Get a host by identifier' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Host retrieved successfully',
        type: ResponseDto,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiParam({
        name: 'hostId',
        description: 'Host Identifier',
        type: 'string',
        example: '0220439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @UseGuards(HostOwnerGuard)
    @Get(':hostId')
    async getHost(@ValidatedParam('hostId') hostId: string): Promise<ResponseDto> {
        try {
            const data = await this.getHostHandler.execute(hostId);
            return new ResponseDto('success', 200, 'HostSuccessfullyRetrieved', data);
        } catch (error: any) {
            console.error('Error retrieving host:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Hosts')
    @ApiOperation({ summary: 'Update a host' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Host updated successfully',
        type: ResponseDto,
        schema: { example: UpdateHostDto },
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiBody({ type: UpdateHostDto })
    @ApiParam({
        name: 'hostId',
        description: 'Host Identifier',
        type: 'string',
        example: '0220439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @UseGuards(HostOwnerGuard)
    @Patch(':hostId')
    async updateHost(
        @ValidatedParam('hostId') hostId: string,
        @Body() updateHostDto: UpdateHostDto,
    ): Promise<ResponseDto> {
        try {
            await this.updateHostHandler.execute(hostId, updateHostDto);
            return new ResponseDto('success', 200, 'HostSuccessfullyUpdated', {});
        } catch (error: any) {
            console.error('Error updating host:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Customers')
    @ApiOperation({ summary: 'Get a customer' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Host customer retrieved successfully',
        type: GetCustomerResponseDto,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiParam({
        name: 'hostId',
        description: 'Host Identifier',
        type: 'string',
        example: '0220439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @ApiParam({
        name: 'userId',
        description: 'User Identifier',
        type: 'string',
        example: '111a219a-d3ea-408b-b05a-5e2e5316325a',
    })
    @UseGuards(HostOwnerGuard)
    @Get(':hostId/customers/:userId')
    async getCustomer(
        @ValidatedParam('hostId') hostId: string,
        @ValidatedParam('userId') userId: string,
    ): Promise<ResponseDto> {
        try {
            const data = await this.getCustomerHandler.execute(hostId, userId);
            return new ResponseDto('success', 200, 'HostCustomerSuccessfullyRetrieved', data);
        } catch (error: any) {
            console.error('Error retrieving host customer: ', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Customers')
    @ApiOperation({ summary: 'Update a customer' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Host customer updated successfully',
        type: ResponseDto,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiParam({
        name: 'hostId',
        description: 'Host Identifier',
        type: 'string',
        example: '0220439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @ApiParam({
        name: 'userId',
        description: 'User Identifier',
        type: 'string',
        example: '111a219a-d3ea-408b-b05a-5e2e5316325a',
    })
    @UseGuards(HostOwnerGuard)
    @Patch(':hostId/customers/:userId')
    async updateCustomer(
        @ValidatedParam('hostId') hostId: string,
        @ValidatedParam('userId') userId: string,
        @Body() updateCustomerDto: UpdateCustomerDto,
    ): Promise<ResponseDto> {
        try {
            await this.updateCustomerHandler.execute(hostId, userId, updateCustomerDto);
            return new ResponseDto('success', 200, 'HostCustomerSuccessfullyUpdated', {});
        } catch (error: any) {
            console.error('Error updating host customer: ', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Hosts')
    @ApiOperation({ summary: 'Apply a coupon to a host' })
    @ApiOkResponse({ description: 'Coupon applied successfully', type: ApplyCouponResponseDto })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiParam({
        name: 'hostId',
        description: 'Host Identifier',
        type: 'string',
        example: '0220439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @ApiBody({ type: ApplyCouponDto })
    @UseGuards(HostOwnerGuard)
    @Post(':hostId/coupons')
    async applyCoupon(@ValidatedParam('hostId') hostId: string, @Body() body: ApplyCouponDto): Promise<ResponseDto> {
        try {
            const data = await this.applyCouponHandler.execute(hostId, body);
            return new ResponseDto('success', 200, 'CouponAppliedSuccessfully', data);
        } catch (error: any) {
            console.error('Error applying coupon:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Analytics')
    @ApiOperation({ summary: 'Get host analytics' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Host analytics retrieved successfully',
        type: GetHostAnalyticsResponseDto,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiParam({
        name: 'hostId',
        description: 'Host Identifier',
        type: 'string',
        example: '0220439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @UseGuards(HostOwnerGuard)
    @Get(':hostId/analytics')
    async getHostAnalytics(@ValidatedParam('hostId') hostId: string): Promise<ResponseDto> {
        try {
            const data = await this.getHostAnalyticsHandler.execute(hostId);
            return new ResponseDto('success', 200, 'HostAnalyticsSuccessfullyRetrieved', data);
        } catch (error: any) {
            console.error('Error retrieving host analytics:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Analytics')
    @ApiOperation({ summary: 'Create host analytics' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Host analytics created successfully',
        type: CreateHostAnalyticsResponseDto,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiBody({ type: CreateHostAnalyticsDto })
    @ApiParam({
        name: 'hostId',
        description: 'Host Identifier',
        type: 'string',
        example: '0220439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @UseGuards(HostOwnerGuard)
    @Post(':hostId/analytics')
    async createHostAnalytics(
        @ValidatedParam('hostId') hostId: string,
        @Body() createHostAnalyticsDto: CreateHostAnalyticsDto,
    ): Promise<ResponseDto> {
        try {
            const data = await this.createHostAnalyticsHandler.execute(hostId, createHostAnalyticsDto);
            return new ResponseDto('success', 201, 'HostAnalyticsSuccessfullyCreated', data);
        } catch (error: any) {
            console.error('Error creating host analytics:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Analytics')
    @ApiOperation({ summary: 'Update host analytics' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Host analytics updated successfully',
        type: ResponseDto,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiBody({ type: UpdateHostAnalyticsDto })
    @ApiParam({
        name: 'hostId',
        description: 'Host Identifier',
        type: 'string',
        example: '0220439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @UseGuards(HostOwnerGuard)
    @Patch(':hostId/analytics')
    async updateHostAnalytics(
        @ValidatedParam('hostId') hostId: string,
        @Body() updateHostAnalyticsDto: UpdateHostAnalyticsDto,
    ): Promise<ResponseDto> {
        try {
            await this.updateHostAnalyticsHandler.execute(hostId, updateHostAnalyticsDto);
            return new ResponseDto('success', 200, 'HostAnalyticsSuccessfullyUpdated', {});
        } catch (error: any) {
            console.error('Error updating host analytics:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Analytics')
    @ApiOperation({ summary: 'Delete host analytics' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Host analytics deleted successfully',
        type: ResponseDto,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiParam({
        name: 'hostId',
        description: 'Host Identifier',
        type: 'string',
        example: '0220439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @UseGuards(HostOwnerGuard)
    @Delete(':hostId/analytics')
    async deleteHostAnalytics(@ValidatedParam('hostId') hostId: string): Promise<ResponseDto> {
        try {
            await this.deleteHostAnalyticsHandler.execute(hostId);
            return new ResponseDto('success', 200, 'HostAnalyticsSuccessfullyDeleted', {});
        } catch (error: any) {
            console.error('Error deleting host analytics:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }
}
