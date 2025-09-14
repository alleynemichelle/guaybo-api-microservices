import { BadRequestException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { UsersRepository } from 'apps/libs/database/drizzle/repositories/users.repository';
import { UserData } from 'apps/libs/common/api/decorators/user.decorator';

import { UsersErrorCodes } from 'apps/libs/common/constants/error-codes.constant';
import { ConfirmationCodesRepository } from 'apps/libs/database/drizzle/repositories/confirmation-codes.repository';
import { CodeEnum } from 'apps/libs/common/enums/auth.enum';
import { ConfirmationCodeStatus } from 'apps/libs/common/enums/confirmation-code-status.enum';
import { StatusRepository } from 'apps/libs/database/drizzle/repositories/status.repository';
import { StatusLookup } from 'apps/libs/database/drizzle/lookups/status.lookup';

import { IUsersAuth } from '../interfaces/users-auth.interface';
import { ConfirmAccountDto } from '../dto/requests/confirm-acount.dto';

@Injectable()
export class ConfirmAccountHandler {
    constructor(
        @Inject('AuthService') private readonly authService: IUsersAuth,
        private readonly usersRepository: UsersRepository,
        private readonly confirmationCodesRepository: ConfirmationCodesRepository,
        private readonly statusLookup: StatusLookup,
    ) {}

    async execute(
        currentUser: UserData,
        data: ConfirmAccountDto,
    ): Promise<{ userId: string; email: string; verifiedEmail: boolean }> {
        const user = await this.usersRepository.findByRecordId(currentUser.id);
        if (!user) throw new BadRequestException(UsersErrorCodes.UserNotFoundException);

        const confirmationCode = await this.confirmationCodesRepository.find(
            user.id!,
            data.code,
            CodeEnum.CONFIRM_ACCOUNT,
        );
        if (!confirmationCode) throw new BadRequestException(UsersErrorCodes.CodeMismatchException);

        const currentTimestamp = Math.floor(Date.now() / 1000);
        if (currentTimestamp > confirmationCode.ttl)
            throw new BadRequestException(UsersErrorCodes.ExpiredCodeException);

        const statusId = await this.statusLookup.toId(ConfirmationCodeStatus.USED);
        if (!statusId) throw new InternalServerErrorException('Status not found');

        await this.usersRepository.updateById(user.id!, { verifiedEmail: true });
        await this.authService.addUserCustomAttributes(user.email, [{ Name: 'email_verified', Value: 'true' }]);
        await this.confirmationCodesRepository.update(confirmationCode.id!, { statusId });

        return { userId: user.recordId!, email: user.email!, verifiedEmail: true };
    }
}
