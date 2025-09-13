import { Controller, Get } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseDto } from 'apps/libs/common/api/response.entity';

import { GetConversionRateResponse } from '../dto/responses/get-conversion-rate-response.dto';
import { GetExchangeRatesHandler } from '../handlers/get-exchange-rates.handler';

@Controller('settings')
export class SettingsController {
    constructor(private readonly getExchangeRatesHandler: GetExchangeRatesHandler) {}

    @ApiTags('Currencies')
    @ApiOperation({ summary: 'Get currencies conversion' })
    @ApiOkResponse({
        description: 'Exchange rates retrieved successfully',
        type: GetConversionRateResponse,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @Get('exchange-rates')
    async getExchangeRates(): Promise<ResponseDto> {
        try {
            const data = await this.getExchangeRatesHandler.execute();
            return new ResponseDto('success', 200, 'ExchangeRatesRetrievedSuccessfully', data);
        } catch (error: any) {
            console.error('Error retrieving exchange rates:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }
}
