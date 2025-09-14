import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AuthRedirectType } from 'apps/libs/common/enums/auth.enum';
import { UsersRepository } from 'apps/libs/database/drizzle/repositories/users.repository';
import { UsersErrorCodes } from 'apps/libs/common/constants/error-codes.constant';
import { TemporalTokenType } from 'apps/libs/common/enums/temporal-token-type.enum';

import { IUsersAuth } from '../interfaces/users-auth.interface';
import { TemporalTokensService } from '../services/temporal-tokens.service';

@Injectable()
export class RecoverPasswordHandler {
    constructor(
        @Inject('AuthService') private readonly authService: IUsersAuth,
        private readonly usersRepository: UsersRepository,
        private readonly temporalTokensService: TemporalTokensService,
    ) {}

    async execute(email: string, redirectType: AuthRedirectType): Promise<void> {
        const user = await this.usersRepository.findByEmail(email);
        if (!user) throw new BadRequestException(UsersErrorCodes.UserNotFoundException);

        const authRegistered = await this.authService.userExists(email);
        if (!authRegistered) {
            // If not registered in cognito, send temporal token to complete registration
            await this.temporalTokensService.sendTemporalToken({
                userId: user.recordId!,
                email: email,
                tokenType: TemporalTokenType.COMPLETE_REGISTRATION,
            });

            return;
        }

        if (!user?.verifiedEmail) throw new BadRequestException(UsersErrorCodes.UserIsNotConfirmed);

        await this.authService.recoverPassword(email, redirectType);
    }
}
