import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { UsersRepository } from 'apps/libs/database/drizzle/repositories/users.repository';
import { UsersErrorCodes } from 'apps/libs/common/constants/error-codes.constant';
import { Status } from 'apps/libs/common/enums/status.enum';
import { Role } from 'apps/libs/common/enums/role.enum';
import { TemporalTokensRepository } from 'apps/libs/database/drizzle/repositories/temporal-tokens.repository';
import { User } from 'apps/libs/domain/users/user.entity';

import { IUsersAuth } from '../interfaces/users-auth.interface';
import { UserResponseDataDto } from '../dto/responses/user-response.dto';
import { AuthSessionResponseDto } from '../dto/responses/session-response.dto';

type CompleteRegistrationHandlerResponse = {
    user: UserResponseDataDto;
    session: AuthSessionResponseDto;
};

@Injectable()
export class CompleteRegistrationHandler {
    constructor(
        @Inject('AuthService') private readonly authService: IUsersAuth,
        private readonly usersRepository: UsersRepository,
        private readonly temporalTokensRepository: TemporalTokensRepository,
    ) {}

    async execute(userId: string, password: string, tokenId: number): Promise<CompleteRegistrationHandlerResponse> {
        const existingUser = await this.usersRepository.findWithHostsByRecordId(userId);
        if (!existingUser) throw new BadRequestException(UsersErrorCodes.UserNotFoundException);

        await this.authService.createUser({
            email: existingUser.email,
            password,
            recordId: existingUser.recordId!,
            status: Status.ACTIVE,
            defaultLanguage: existingUser.defaultLanguage!,
            verifiedEmail: true,
        });

        await this.usersRepository.updateById(existingUser.id!, {
            registered: true,
            federated: false,
            verifiedEmail: true,
        });

        // 5. Authenticate user and create session
        const session = await this.authService.authenticate({ email: existingUser.email, password });
        if (!session.tokenId) throw new BadRequestException(UsersErrorCodes.AuthException);

        // 6. Mark temporal token as used to prevent reuse
        try {
            await this.temporalTokensRepository.update(tokenId, { used: true });
            console.log(`Temporal token marked as used for user: ${existingUser.email}`);
        } catch (tokenError) {
            console.error('Warning: Failed to mark temporal token as used:', tokenError);
        }

        return { user: this.mapUserToResponseDto(existingUser), session };
    }

    /**
     * Maps a User entity to an AuthUserResponseDto.
     * @param {User} user The user entity.
     * @returns {AuthUserResponseDto} The user response DTO.
     */
    private mapUserToResponseDto(user: User): UserResponseDataDto {
        return {
            recordId: user.recordId!,
            firstName: user.firstName!,
            lastName: user.lastName!,
            fullName: user.fullName!,
            email: user.email,
            timezone: user.timezone!,
            status: user.status!,
            defaultLanguage: user.defaultLanguage!,
            registered: user.registered!,
            federated: user.federated!,
            verifiedEmail: user.verifiedEmail!,
            createdAt: user.createdAt!,
            lastAccess: user.lastAccess!,
            instagramAccount: user.instagramAccount!,
            isReferrer: user.isReferrer!,
            ...(user.phoneNumber && { phoneNumber: user.phoneNumber }),
            ...(user.hosts && {
                hosts: user.hosts.map((host) => ({
                    createdAt: host.createdAt!,
                    hostId: host.recordId!,
                    role: host.role! as Role,
                    status: host.status! as Status,
                    alias: host.alias!,
                    name: host.name!,
                    collectionId: host.collectionId!,
                })),
            }),
        };
    }
}
