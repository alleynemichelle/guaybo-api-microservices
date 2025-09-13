import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

import { ExchangeRateService } from 'apps/libs/integrations/exchanges/exchange-rate.service';
import { ConversionRateResponseDto } from '../dto/responses/get-conversion-rate-response.dto';

@Injectable()
export class GetExchangeRatesHandler {
    private readonly exchangeRateSource: string;
    constructor(
        private readonly exchangeRate: ExchangeRateService,
        private readonly configService: ConfigService,
    ) {
        this.exchangeRateSource = this.configService.get<string>('DEFAULT_EXCHANGE_SOURCE') as string;
    }

    async execute(): Promise<ConversionRateResponseDto[]> {
        const data = await this.exchangeRate.getRateFromAPI(this.exchangeRateSource);

        const exchangeRates = [
            {
                amount: data.official?.average,
                currency: data.currency,
                updatedAt: data.date,
            },
        ];

        return exchangeRates;
    }
}
