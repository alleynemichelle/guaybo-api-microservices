import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { DrizzleRepositoriesModule } from 'apps/libs/database/drizzle/repositories/drizzle-repositories.module';
import { CdnModule } from 'apps/libs/integrations/cdn/cdn.module';
import { ResponseFormatterInterceptor } from 'apps/libs/common/api/interceptors/response.interceptor';

import { HostsController } from './controllers/hosts.controller';
import { HostsManagementController } from './controllers/hosts-management.controller';
import { CreateHostHandler } from './handlers/create-host.handler';
import { GetHostHandler } from './handlers/get-host.handler';
import { UpdateHostHandler } from './handlers/update-host.handler';
import { GetCustomerHandler } from './handlers/get-customer.handler';
import { UpdateCustomerHandler } from './handlers/update-customer.handler';
import { ApplyCouponHandler } from './handlers/apply-coupon.handler';
import { GetHostAnalyticsHandler } from './handlers/get-host-analytics.handler';
import { CreateHostAnalyticsHandler } from './handlers/create-host-analytics.handler';
import { UpdateHostAnalyticsHandler } from './handlers/update-host-analytics.handler';
import { DeleteHostAnalyticsHandler } from './handlers/delete-host-analytics.handler';

@Module({
    imports: [
        ConfigModule.forRoot(),
        JwtModule.register({
            global: true,
        }),
        DrizzleRepositoriesModule,
        HttpModule,
        CdnModule,
    ],
    controllers: [HostsController, HostsManagementController],
    providers: [
        CreateHostHandler,
        GetHostHandler,
        UpdateHostHandler,
        GetCustomerHandler,
        UpdateCustomerHandler,
        ApplyCouponHandler,
        GetHostAnalyticsHandler,
        CreateHostAnalyticsHandler,
        UpdateHostAnalyticsHandler,
        DeleteHostAnalyticsHandler,
        {
            provide: APP_INTERCEPTOR,
            useClass: ResponseFormatterInterceptor,
        },
    ],
})
export class HostsModule {}
