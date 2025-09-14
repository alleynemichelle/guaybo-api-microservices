import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersRepository } from 'apps/libs/database/drizzle/repositories/users.repository';
import { UsersErrorCodes } from 'apps/libs/common/constants/error-codes.constant';
import { Status } from 'apps/libs/common/enums/status.enum';
import { StatusRepository } from 'apps/libs/database/drizzle/repositories/status.repository';
import { TelegramTemplate } from 'apps/libs/common/enums/telegram-template.enum';

import { TelegramRepository } from 'apps/libs/integrations/telegram/telegram.repository';
import { User } from 'apps/libs/domain/users/user.entity';
import { StatusLookup } from 'apps/libs/database/drizzle/lookups/status.lookup';
import { Role } from 'apps/libs/common/enums/role.enum';

import { transformFullName } from '../utils/transforms';
import { IUsersAuth } from '../interfaces/users-auth.interface';
import { CreateFederatedSessionDto } from '../dto/requests/create-federated-session.dto';
import { AuthSessionResponseDto } from '../dto/responses/session-response.dto';
import { UserResponseDataDto } from '../dto/responses/user-response.dto';

type CreateFederatedSessionHandlerResponse = {
    user: UserResponseDataDto;
    session: AuthSessionResponseDto;
};

@Injectable()
export class CreateFederatedSessionHandler {
    constructor(
        @Inject('AuthService') private readonly authService: IUsersAuth,
        private readonly usersRepository: UsersRepository,
        private readonly statusRepository: StatusRepository,
        private readonly telegramRepository: TelegramRepository,
        private readonly jwtService: JwtService,
        private readonly statusLookup: StatusLookup,
    ) {}

    async execute(data: CreateFederatedSessionDto): Promise<CreateFederatedSessionHandlerResponse> {
        const session = await this.authService.authenticateFederatedUser(data.code, data.redirectUrl);
        /* Decode token id, extract user data and get user id */

        if (!session.tokenId) throw new BadRequestException(UsersErrorCodes.AuthException);
        const userData = this.jwtService.decode(session?.tokenId);

        let user: User | null = await this.usersRepository.findWithHostsByEmail(userData.email);

        // TODO: Check if this line is needed
        // const authRegistered = await this.authService.userExists(userData.email);

        if (!user) {
            const statusId = await this.statusLookup.toId(Status.ACTIVE);
            user = await this.usersRepository.create({
                email: userData.email,
                firstName: userData.given_name || '',
                lastName: userData.family_name || '',
                fullName: transformFullName(userData.given_name, userData.family_name),
                federated: true,
                verifiedEmail: true,
                registered: true,
                statusId: statusId,
            });
            user.status = (await this.statusLookup.toEnum(statusId)) as Status;

            await this.authService.addUserCustomAttributes(userData.sub, [
                {
                    Name: 'email_verified',
                    Value: 'true',
                },
                {
                    Name: 'custom:userId',
                    Value: user?.recordId,
                },
            ]);

            // Send Telegram notification
            await this.telegramRepository.sendMessage({
                template: TelegramTemplate.USER_CREATED,
                data: {
                    createdAt: new Date().toLocaleString('es-VE', { timeZone: 'America/Caracas' }),
                    firstName: user?.firstName || '',
                    lastName: user?.lastName || '',
                    email: user?.email || '',
                    federated: true,
                },
            });
        }

        return {
            user: this.mapUserToResponseDto(user),
            session,
        };
    }

    /**
     * Maps a User entity to an UserResponseDto.
     * @param {User} user The user entity.
     * @returns {UserResponseDto} The user response DTO.
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
