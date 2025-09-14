import { Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';

import { UsersRepository } from 'apps/libs/database/drizzle/repositories/users.repository';
import { ReferralsRepository } from 'apps/libs/database/drizzle/repositories/referrals.repository';
import { User } from 'apps/libs/domain/users/user.entity';
import { Status } from 'apps/libs/common/enums/status.enum';
import { CreateUserDto } from '../dto/requests/create-user.dto';
import { AuthSessionResponseDto } from '../dto/responses/session-response.dto';
import { UserResponseDataDto } from '../dto/responses/user-response.dto';
import { IUsersAuth } from '../interfaces/users-auth.interface';

type CreateUserHandlerResponse = {
    user: UserResponseDataDto;
    session: AuthSessionResponseDto;
    requiredAction?: boolean;
};

@Injectable()
export class CreateUserHandler {
    private readonly logger = new Logger(CreateUserHandler.name);

    constructor(
        @Inject('AuthService') private readonly authService: IUsersAuth,
        private readonly usersRepository: UsersRepository,
        private readonly referralsRepository: ReferralsRepository,
    ) {}

    /**
     * Executes the create user flow.
     * @param {CreateUserDto} createUserDto The data for creating the user.
     * @returns {Promise<CreateUserHandlerResponse>} The result of the user creation process.
     */
    async execute(createUserDto: CreateUserDto): Promise<CreateUserHandlerResponse> {
        const { password, email } = createUserDto;
        const userEntity = new User({ ...createUserDto, registered: true, federated: false });

        await this.authService.createUser({
            email: userEntity.email,
            password,
            status: Status.ACTIVE,
            defaultLanguage: userEntity.defaultLanguage!,
            verifiedEmail: userEntity.verifiedEmail!,
            recordId: userEntity.recordId!,
        });

        await this.findOrCreateUserInDb(userEntity);

        if (createUserDto.referralCode)
            await this.assignReferralToUser(userEntity, createUserDto.referralCode, createUserDto.utmSource);

        const session = await this.authService.authenticate({ email, password });
        const userResponse = this.mapUserToResponseDto(userEntity);

        const response: CreateUserHandlerResponse = {
            user: userResponse,
            session: {
                tokenId: session.tokenId,
                accessToken: session.accessToken,
                refreshToken: session.refreshToken,
                expiresIn: session.expiresIn,
            },
        };

        if (!session.tokenId) {
            response.requiredAction = true;
        }

        return response;
    }

    /**
     * Creates the user in the local database.
     * @param {User} user The user entity to save.
     * @returns {Promise<AppUser>} The newly created user.
     */
    private async findOrCreateUserInDb(user: User): Promise<User> {
        try {
            const newUser = await this.usersRepository.create({
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                timezone: user.timezone,
                federated: user.federated,
                fullName: user.fullName,
                registered: user.registered,
                verifiedEmail: user.verifiedEmail,
            });
            return newUser;
        } catch (error: any) {
            this.logger.error(`Failed to create user in DB: ${error}`);
            throw new InternalServerErrorException('Failed to create user.', error);
        }
    }

    /**
     * Assigns a referral code to the newly created user.
     * Logs an error if the assignment fails but does not interrupt the flow.
     * @param {User} user The user to assign the referral to.
     * @param {string} code The referral code.
     * @param {string} [utmSource] The UTM source.
     */
    private async assignReferralToUser(user: User, code: string, utmSource?: string): Promise<void> {
        try {
            const referralCode = await this.referralsRepository.findReferralCodeByCode(code);
            if (!referralCode) {
                this.logger.warn(`Referral code "${code}" not found or inactive.`);
                return;
            }

            if (!user.id) {
                this.logger.error(`User ID is missing for referral assignment. Email: ${user.email}`);
                return;
            }

            await this.referralsRepository.assignReferralToUser({
                referredId: user.id!,
                codeId: referralCode.id!,
                referrerId: referralCode.referrer?.id!,
                utmSource: utmSource,
            });
        } catch (error) {
            // this error should not stop the user creation process
            this.logger.error(`Error associating user ${user.email} to referrer: ${error}`);
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
            instagramAccount: user.instagramAccount!,
            isReferrer: user.isReferrer!,
            phoneNumber: user.phoneNumber,
        };
    }
}
