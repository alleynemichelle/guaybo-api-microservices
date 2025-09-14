import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { ResponseFormatterInterceptor } from 'apps/libs/common/api/interceptors/response.interceptor';
import { SQSService } from 'apps/libs/integrations/notifications/sqs.service';
import { JwtAuthGuard } from 'apps/libs/common/api/guards/jwt-auth-v2.guard';
import { TelegramRepository } from 'apps/libs/integrations/telegram/telegram.repository';

import { DatabaseModule } from 'apps/libs/database/database.module';
import { DrizzleRepositoriesModule } from 'apps/libs/database/drizzle/repositories/drizzle-repositories.module';
import { TemporalTokenGuard } from 'apps/libs/common/api/guards/temporal-token-v2.guard';

import { UsersController } from './controllers/users.controller';
import { TemporalTokensController } from './controllers/temporal-tokens.controller';
import { UsersCognitoService } from './services/users-cognito.service';
import { TemporalTokensService } from './services/temporal-tokens.service';
import { ConfirmationCodesRepository } from 'apps/libs/database/drizzle/repositories/confirmation-codes.repository';

import { UsersManagementController } from './controllers/management-users.controller';
import { CreateUserHandler } from './handlers/create-user.handler';
import { ConfirmAccountHandler } from './handlers/confirm-account.handler';
import { GetUserHandler } from './handlers/get-user.handler';
import { CreateFederatedSessionHandler } from './handlers/create-federated-session.handler';
import { CreateSessionHandler } from './handlers/create-session.handler';
import { CompleteRegistrationHandler } from './handlers/complete-registration.handler';
import { ChangePasswordHandler } from './handlers/change-password.handler';
import { ResetPasswordHandler } from './handlers/reset-password.handler';
import { RefreshTokenHandler } from './handlers/refresh-token.handler';
import { LogoutHandler } from './handlers/logout.handler';
import { SendConfirmationCodeHandler } from './handlers/send-confirmation-code.handler';
import { RecoverPasswordHandler } from './handlers/recover-password.handler';
import { CreateUserProfileHandler } from './handlers/create-user-profile.handler';
import { UpdateUserHandler } from './handlers/update-user.handler';
import { GetReferrerCodesHandler } from './handlers/get-referrer-codes.handler';
import { GetReferralsHandler } from './handlers/get-referrals.handler';
import { GetPaymentOptionsHandler } from './handlers/get-payment-options.handler';
import { PutPaymentOptionsHandler } from './handlers/put-payment-options.handler';
import { DeletePaymentOptionHandler } from './handlers/delete-payment-option.handler';
import { StatusLookup } from 'apps/libs/database/drizzle/lookups/status.lookup';

@Module({
    imports: [
        ConfigModule.forRoot(),
        JwtModule.register({
            global: true,
        }),
        HttpModule,
        DatabaseModule,
        DrizzleRepositoriesModule,
    ],
    controllers: [UsersController, TemporalTokensController, UsersManagementController],
    providers: [
        StatusLookup,
        CreateUserHandler,
        TemporalTokensService,
        SQSService,
        JwtAuthGuard,
        TemporalTokenGuard,
        TelegramRepository,
        ConfirmAccountHandler,
        GetUserHandler,
        CreateFederatedSessionHandler,
        CreateSessionHandler,
        CompleteRegistrationHandler,
        ChangePasswordHandler,
        ResetPasswordHandler,
        RefreshTokenHandler,
        LogoutHandler,
        SendConfirmationCodeHandler,
        RecoverPasswordHandler,
        CreateUserProfileHandler,
        UpdateUserHandler,
        GetReferrerCodesHandler,
        ConfirmationCodesRepository,
        GetReferralsHandler,
        GetPaymentOptionsHandler,
        PutPaymentOptionsHandler,
        DeletePaymentOptionHandler,

        { provide: 'AuthService', useClass: UsersCognitoService },
        {
            provide: APP_INTERCEPTOR,
            useClass: ResponseFormatterInterceptor,
        },
    ],
})
export class UsersModule {}
