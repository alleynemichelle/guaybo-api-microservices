import { BadRequestException } from '@nestjs/common';
import { UsersErrorCodes } from 'apps/libs/common/constants/error-codes.constant';
import { UsersRepository } from 'apps/libs/database/drizzle/repositories/users.repository';
import { Role } from 'apps/libs/common/enums/role.enum';
import { Status } from 'apps/libs/common/enums/status.enum';
import { User } from 'apps/libs/domain/users/user.entity';
import { UserResponseDataDto } from '../dto/responses/user-response.dto';

export class GetUserHandler {
    constructor(private readonly usersRepository: UsersRepository) {}

    async execute(userRecordId: string): Promise<UserResponseDataDto> {
        const user = await this.usersRepository.findWithHostsByRecordId(userRecordId);
        if (!user) throw new BadRequestException(UsersErrorCodes.UserNotFoundException);

        return this.mapUserToResponseDto(user);
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
