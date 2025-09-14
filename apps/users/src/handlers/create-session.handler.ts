import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { UsersErrorCodes } from 'apps/libs/common/constants/error-codes.constant';
import { Role } from 'apps/libs/common/enums/role.enum';
import { Status } from 'apps/libs/common/enums/status.enum';
import { TemporalTokenType } from 'apps/libs/common/enums/temporal-token-type.enum';
import { UsersRepository } from 'apps/libs/database/drizzle/repositories/users.repository';
import { User } from 'apps/libs/domain/users/user.entity';
import { CreateSessionDto } from '../dto/requests/create-session.dto';
import { AuthSessionResponseDto } from '../dto/responses/session-response.dto';
import { UserResponseDataDto } from '../dto/responses/user-response.dto';
import { IUsersAuth } from '../interfaces/users-auth.interface';
import { TemporalTokensService } from '../services/temporal-tokens.service';

@Injectable()
export class CreateSessionHandler {
    constructor(
        @Inject('AuthService') private readonly authService: IUsersAuth,
        private readonly usersRepository: UsersRepository,
        private readonly temporalTokensService: TemporalTokensService,
    ) {}

    async execute(data: CreateSessionDto): Promise<{
        user?: UserResponseDataDto;
        session: AuthSessionResponseDto;
        requiredAction?: boolean;
    }> {
        const { email, password } = data;

        const user = await this.usersRepository.findWithHostsByEmail(data.email);
        if (!user) throw new BadRequestException(UsersErrorCodes.UserNotFoundException);

        // authenticate user
        try {
            const session = await this.authService.authenticate({ email, password });
            if (!session.tokenId) return { session: session, requiredAction: true };
            return { user: this.mapUserToResponseDto(user), session };
        } catch (error: any) {
            if (error?.response?.message === UsersErrorCodes.UserNotFoundException) {
                await this.temporalTokensService.sendTemporalToken({
                    userId: user.recordId!,
                    email: email,
                    tokenType: TemporalTokenType.COMPLETE_REGISTRATION,
                });

                throw new BadRequestException(UsersErrorCodes.RegistrationIsNotCompleted);
            }
            throw error;
        }
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
            isReferrer: user.isReferrer!,
            instagramAccount: user.instagramAccount!,
            ...(user.phoneNumber && { phoneNumber: user.phoneNumber }),
            hosts: user.hosts?.map((hostUser) => ({
                createdAt: hostUser.createdAt!,
                hostId: hostUser.recordId!,
                role: hostUser.role as Role,
                status: hostUser.status! as Status,
                alias: hostUser.alias!,
                name: hostUser.name!,
                collectionId: hostUser.collectionId!,
            })),
        };
    }
}
