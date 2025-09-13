import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { ResponseFormatterInterceptor } from 'apps/libs/common/api/interceptors/response.interceptor';
import { DolarAPIService } from 'apps/libs/integrations/exchanges/dolarapi.service';
import { ExchangeRateService } from 'apps/libs/integrations/exchanges/exchange-rate.service';
import { DrizzleRepositoriesModule } from 'apps/libs/database/drizzle/repositories/drizzle-repositories.module';

import { OpenSearchService } from 'apps/libs/integrations/opensearch/opensearch.service';
import { DatabaseModule } from 'apps/libs/database/database.module';
import { S3Service } from 'apps/libs/integrations/s3/s3.service';
import { ManagementSettingsController } from './controllers/management-settings.controller';
import { SettingsController } from './controllers/settings.controller';
import { GetExchangeRatesHandler } from './handlers/get-exchange-rates.handler';
import { GetFiltersHandler } from './handlers/get-filters.handler';
import { GetPaymentOptionsHandler } from './handlers/get-payment-options.handler';
import { GetWithdrawalMethodsHandler } from './handlers/get-withdrawal-methods.handler';
import { CreatePresignedUrlHandler } from './handlers/create-presigned-url.handler';
import { DeleteFileResponse } from './handlers/delete-file.handler';
import { GetPaymentOptionHandler } from './handlers/get-payment-option.handler';

@Module({
    imports: [ConfigModule.forRoot(), DatabaseModule, DrizzleRepositoriesModule],
    controllers: [SettingsController, ManagementSettingsController],
    providers: [
        ExchangeRateService,
        S3Service,
        DolarAPIService,
        OpenSearchService,
        GetExchangeRatesHandler,
        GetFiltersHandler,
        GetPaymentOptionsHandler,
        GetPaymentOptionHandler,
        GetWithdrawalMethodsHandler,
        CreatePresignedUrlHandler,
        DeleteFileResponse,
        {
            provide: APP_INTERCEPTOR,
            useClass: ResponseFormatterInterceptor,
        },
    ],
})
export class SettingsModule {}
