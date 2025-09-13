import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { DolarAPIService } from './dolarapi.service';
import { IExchangeRateSource } from './exchange-rate.interface';

@Injectable()
class DolarAPIExchangeRateSource implements IExchangeRateSource {
    constructor(private readonly dolarAPIService: DolarAPIService) {}

    async getLatestExchangeRate(): Promise<any> {
        return this.dolarAPIService.fetchExchangeRate();
    }
}

@Injectable()
export class ExchangeRateService {
    private sources: Record<string, IExchangeRateSource>;
    private tableName = this.configService.get('TABLE_NAME') as string;

    constructor(
        @Inject(DolarAPIService) private readonly dolarAPIService: DolarAPIService,
        private configService: ConfigService,
    ) {
        this.sources = {
            dolarAPI: new DolarAPIExchangeRateSource(dolarAPIService),
        };
    }

    async getRateFromAPI(source: string): Promise<any> {
        try {
            const sourceService = this.sources[source];

            if (!sourceService) {
                throw new BadRequestException('ExchangeRateSourceNotFound');
            }
            return await sourceService.getLatestExchangeRate();
        } catch (error) {
            console.error('Error fetching exchange rate from API:', error);
        }
    }
}
