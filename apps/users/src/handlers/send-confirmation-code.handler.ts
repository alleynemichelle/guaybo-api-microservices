import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AuthRedirectType, CodeEnum } from 'apps/libs/common/enums/auth.enum';
import { UsersRepository } from 'apps/libs/database/drizzle/repositories/users.repository';
import { UsersErrorCodes } from 'apps/libs/common/constants/error-codes.constant';
import { ConfirmationCodeStatus } from 'apps/libs/common/enums/confirmation-code-status.enum';
import { ConfirmationCodesRepository } from 'apps/libs/database/drizzle/repositories/confirmation-codes.repository';
import { StatusRepository } from 'apps/libs/database/drizzle/repositories/status.repository';
import { FrontendRoutes } from 'apps/libs/common/enums/frontend-routes.enum';
import { AppEvent } from 'apps/libs/common/enums/app-event.enum';
import { SQSService } from 'apps/libs/integrations/notifications/sqs.service';

@Injectable()
export class SendConfirmationCodeHandler {
    private readonly adminHost = this.configService.get('ADMIN_FRONTEND_APP_HOST') as string;
    private readonly clientHost = this.configService.get('FRONTEND_APP_HOST') as string;
    private readonly notificationsSQS = this.configService.get('NOTIFICATIONS_SQS_URL') as string;

    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly confirmationCodesRepository: ConfirmationCodesRepository,
        private readonly statusRepository: StatusRepository,
        private readonly configService: ConfigService,
        private readonly sqsService: SQSService,
    ) {}

    async execute(email: string, redirectType: AuthRedirectType): Promise<void> {
        const user = await this.usersRepository.findByEmail(email);
        if (!user) throw new BadRequestException(UsersErrorCodes.UserNotFoundException);
        if (user.verifiedEmail) throw new BadRequestException(UsersErrorCodes.UserIsAlreadyConfirmed);

        const code = Math.floor(100000 + Math.random() * 900000).toString();

        const statusId = (await this.statusRepository.findByName(ConfirmationCodeStatus.ACTIVE))?.id;
        if (!statusId) throw new InternalServerErrorException('Status not found');

        await this.confirmationCodesRepository.create({
            code,
            statusId,
            userId: user.id!,
            ttl: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
            codeType: CodeEnum.CONFIRM_ACCOUNT,
            redirectType,
        });

        // send confirmation code email
        const url =
            redirectType == AuthRedirectType.ADMIN_REDIRECT
                ? `${this.adminHost}/${FrontendRoutes.ADMIN_CONFIRM_ACCOUNT}?code=${code}`
                : `${this.clientHost}/${FrontendRoutes.CLIENT_CONFIRM_ACCOUNT}?code=${code}`;

        const appNotification = JSON.stringify({
            templateKey: 'signup-account-confirmation',
            to: email,
            type: 'email',
            event: AppEvent.APP_NOTIFICATION,
            dynamicTemplateData: {
                email,
                code,
                url,
            },
        });

        console.log('Sending confirmation code email to ', email);
        await this.sqsService.sendMessage(this.notificationsSQS, appNotification);
    }
}
